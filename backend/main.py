
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
from ollama import Message
import boto3
session = boto3.Session(
    aws_access_key_id="XXX",
    aws_secret_access_key="XXXXXXXXXXXXXXX",
    region_name="us-east-1"
)
client = session.client('bedrock-runtime')

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
    model_id = "anthropic.claude-3-5-sonnet-20240620-v1:0"
    conversation = [
        {
            "role": "user",
            "content": [{"text": promptRequest.prompt}],
        }
    ]
    response = client.converse(
        modelId=model_id,
        messages=conversation,
        inferenceConfig={"maxTokens": 512, "temperature": 0.5, "topP": 0.9},
    )
    response_text = response["output"]["message"]["content"][0]["text"]
    print(response_text)

    return PromptResponse(answer=response_text)


