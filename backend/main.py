from typing import Union
import uuid
import os

import openai

from fastapi import FastAPI, UploadFile

from dotenv import dotenv_values

from src.chatgpt_extend import ChatGPT, ChatGPTExtend

config = dotenv_values(".env") 

openai_key = config.get("OPENAI_KEY")
openai.api_key = openai_key



app = FastAPI()


FOLDER_DATA = "./data/"


def write_on_disk(path: str, upload_file: UploadFile):
    with open(path, 'wb') as out_file:
        content = upload_file.file.read() 
        out_file.write(content)


@app.post("/audit/upload")
async def create_upload_file(contract: UploadFile, audit: UploadFile):

    _, ext = os.path.splitext(contract.filename)

    filename = str(uuid.uuid4())

    folder = FOLDER_DATA + filename

    # Write the contract on disk
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


