import glob
import hashlib
import json
from pathlib import Path
from typing import Annotated, Optional, Union
import uuid
import os
import json

import openai

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from dotenv import dotenv_values
import requests

from src.chatgpt_extend import ChatGPT, ChatGPTExtend

config = dotenv_values(".env") 

openai_key = config.get("OPENAI_KEY")
eth_scan_key = config.get("ETHERSCAN_API_KEY")

openai.api_key = openai_key

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



FOLDER_DATA = "./data/"


def sha256sum(file_path):
    h = hashlib.sha256()

    with open(file_path, 'rb') as file:
        while True:
            # Reading is buffered, so we can read smaller chunks.
            chunk = file.read(h.block_size)
            if not chunk:
                break
            h.update(chunk)

    return h.hexdigest()

def write_on_disk(path: str, upload_file: UploadFile):
    with open(path, 'wb') as out_file:
        content = upload_file.file.read() 
        out_file.write(content)

def store_user_data(user_address, key, data_hash):
    
    with open('data.json', 'r') as fp:
        data = json.load(fp)

    current_user_data = data.get(user_address)
    if current_user_data is None:
        data[user_address] = {}
        current_user_data = {}

    key_value = current_user_data.get(key, [])
    key_value.append(data_hash)

    current_user_data[key] = key_value
    data[user_address] = current_user_data

    with open('data.json', 'w') as fp:
        json.dump(data, fp)


@app.get("/audit/list")
def read_all_user_data():
    with open('data.json', 'r') as fp:
        data = json.load(fp)
    return data

@app.post("/audit/upload/address")
async def create_upoad_file_from_address(
        audit: Annotated[bytes, File()], 
        contract_address: Annotated[str, Form()],
        user_address: Annotated[str, Form()],
    ):

    # Fetch the data from eth scan
        
    eth_scan_api = "https://api.etherscan.io/api"

    response = requests.get(
        eth_scan_api, 
        params={
            "module": "contract",
            "action": "getsourcecode",
            "address": contract_address,
            "apikey": eth_scan_key
        }
    )

    content = response.json()
    
    try:
        source_code = content.get("result", {})[0].get("SourceCode")
    except Exception as exc:
        # An invalid address have been provided
        raise HTTPException(status_code=404, detail=content.get("result", ""))

    if source_code is None:
        return "Can't load the source code. Please check if it is available. Else try again later..."


    # Store the smart contract source code
    filename = str(uuid.uuid4())
    folder = FOLDER_DATA + filename

    # Write the smart contract source code
    source_code_path = folder + ".sol"
    with open(source_code_path, "w") as file:
        file.write(source_code)

    # Write the audit on disk
    audit_path = folder + "_audit.txt"
    with open(audit_path, "w") as file:
        file.write(audit.decode())

    audit_hash = sha256sum(audit_path)
    contract_hash = sha256sum(source_code_path)
    hash_data = hashlib.sha256(audit_hash.encode() + contract_hash.encode())

    store_user_data(user_address, "pending", hash_data.hexdigest())

    return {
        "contract": source_code_path,
        "audit": audit_path
    }

        


@app.post("/audit/upload/files")
async def create_upload_file(
    audit: Annotated[bytes, File()], 
    contract: Annotated[bytes, File()],
    user_address: Annotated[str, Form()],
    ):

    audit = audit.decode()
    contract = contract.decode()

    audit_ext = ".txt"
    contract_ext = ".sol"

    filename = str(uuid.uuid4())

    folder = FOLDER_DATA + filename

    # Read and write the input contract on disk
    contract_path = folder + "_contract" + contract_ext
    with open(contract_path, "w") as file:
        file.write(contract)

    # Write the audit on disk
    audit_path = folder + "_audit" + audit_ext
    with open(audit_path, "w") as file:
        file.write(audit)
    

    audit_hash = sha256sum(audit_path)
    contract_hash = sha256sum(contract_path)
    hash_data = hashlib.sha256(audit_hash.encode() + contract_hash.encode())

    store_user_data(user_address, "pending", hash_data.hexdigest())

    return {
        "contract": contract_path,
        "audit": audit_path
    }


@app.post("/audit/analyse")
async def analyse_smartcontract(contract: UploadFile, use_database: bool = False):

    if openai_key is None:
        return "Please define api key for LLM model..."

    print("Use of the database:", use_database)

    _, ext = os.path.splitext(contract.filename)

    # Write the contract on disk
    contract_path = "/tmp/" + str(uuid.uuid4()) + ext
    with open(contract_path, 'wb') as out_file:
        content = contract.file.read() 
        out_file.write(content)

    # Create the prompt
    prompt = (
        "You are a security analysis, specialize in blockchain vulnerabilites."
        "You are in charge of analisis smartcontract and you need to analyse this one: "
    )
    
    prompt += content.decode()

    if not use_database:
        chatgpt = ChatGPT()
    else:
        chatgpt = ChatGPTExtend()

    result = chatgpt.run(prompt)

    return {"result": result}



@app.get("/vulnerabilities")
def fetch_vulnerabilities():

    data = {}

    smartcontracts = glob.glob("./data/*.sol")

    for smartcontract in smartcontracts:
        filename_id = Path(smartcontract).stem

        # Read smart contract
        with open(smartcontract, 'r') as file:
            smartcontract_content = file.read() 

        # Read audit
        with open("./data/" + filename_id + ".txt", 'r') as file:
            audit_content = file.read() 

        data[filename_id] = {
            "smartcontract": smartcontract_content,
            "audit": audit_content
        }

    return data

