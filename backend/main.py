
from fastapi import FastAPI
from pydantic import BaseModel
import ollama

class GenerateResponse(BaseModel):
    model: str
    prompt: str

class GenerateChat(BaseModel):
    model: str
    messages: list

app = FastAPI()

@app.post("/generate")
def generate(generateResponse: GenerateResponse):
    response = ollama.generate(model=generateResponse.model, prompt=generateResponse.prompt)
    return {"response": response['response']}

@app.post("/chat")
def chat(generateChat: GenerateChat):
    response = ollama.chat(model=generateChat.model, messages=generateChat.messages)
    return {"response": response['message']['content']}