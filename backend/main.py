import json
from typing import Annotated, Optional, Union
import uuid
import os

import openai

from fastapi import FastAPI, File, Form, UploadFile

from dotenv import dotenv_values
import requests

from src.chatgpt_extend import ChatGPT, ChatGPTExtend

config = dotenv_values(".env") 

openai_key = config.get("OPENAI_KEY")
openai.api_key = openai_key

eth_scan_key = config.get("ETHERSCAN_API_KEY")


app = FastAPI()


FOLDER_DATA = "./data/"


def write_on_disk(path: str, upload_file: UploadFile):
    with open(path, 'wb') as out_file:
        content = upload_file.file.read() 
        out_file.write(content)


@app.post("/audit/upload")
async def create_upoad_file_from_address(
        audit: Annotated[bytes, File()], 
        contract_address: Annotated[str, Form()],
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
    
    source_code = content.get("result", {})[0].get("SourceCode")

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

    return {
        "contract": source_code_path,
        "audit": audit_path
    }

        


@app.post("/audit/upload")
async def create_upload_file(
    audit: UploadFile, 
    contract: UploadFile):

    _, ext = os.path.splitext(contract.filename)

    filename = str(uuid.uuid4())

    folder = FOLDER_DATA + filename

    # Read and write the input contract on disk
    contract_path = folder + "_contract" + ext
    write_on_disk(contract_path, contract)

    _, ext = os.path.splitext(audit.filename)

    # Write the audit on disk
    audit_path = folder + "_audit" + ext
    write_on_disk(audit_path, audit)
    
    return {
        "contract": contract.filename,
        "audit": audit.filename
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

    return {"text": result}


