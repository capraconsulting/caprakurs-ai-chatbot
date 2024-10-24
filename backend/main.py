
from fastapi import FastAPI
from pydantic import BaseModel

from huggingface_hub import snapshot_download
from pathlib import Path

"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"

mistral_models_path = Path.home().joinpath('mistral_models', '7B-Instruct-v0.3')
mistral_models_path.mkdir(parents=True, exist_ok=True)

snapshot_download(repo_id="mistralai/Mistral-7B-Instruct-v0.3", allow_patterns=["params.json", "consolidated.safetensors", "tokenizer.model.v3"], local_dir=mistral_models_path)
app = FastAPI()

class Query(BaseModel):
    text: str
@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/prompt")
def post_prompt(query: Query):
    return {"answer": "Hello world"}
