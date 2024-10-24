from typing import Union

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Query(BaseModel):
    text: str
@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/prompt")
def post_prompt(query: Query):
    return {"answer": "Hello world"}
