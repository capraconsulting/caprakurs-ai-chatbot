
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
from ollama import Message
# import boto3
# client = boto3.client('bedrock')

class PromptRequest(BaseModel):
    prompt: str

class PromptResponse(BaseModel):
    answer: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
def chat(promptRequest: PromptRequest) -> PromptResponse:
    message: Message = {
        "role": "user",
        "content": promptRequest.prompt,
    }

    response = ollama.chat(model='llama3.2', messages=[message])
    return PromptResponse(answer=response['message']['content'])

@app.post("/bedrock")
def chat(promptRequest: PromptRequest) -> PromptResponse:
    response = client.get_imported_model(modelIdentifier=promptRequest.model)
    return PromptResponse(answer=response)


