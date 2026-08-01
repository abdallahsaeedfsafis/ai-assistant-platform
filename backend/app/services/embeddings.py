import requests
from app.core.config import settings

JINA_API_URL = "https://api.jina.ai/v1/embeddings"
JINA_MODEL = "jina-embeddings-v3"


def _call_jina_api(texts: list[str], task: str) -> list[list[float]]:
    if not settings.JINA_API_KEY:
        raise RuntimeError("JINA_API_KEY is not set in the .env file")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.JINA_API_KEY}",
    }
    payload = {
        "input": texts,
        "model": JINA_MODEL,
        "task": task,
        "normalized": True,
    }

    response = requests.post(JINA_API_URL, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    data = response.json()

    return [item["embedding"] for item in data["data"]]


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embeds document chunks before storing them."""
    return _call_jina_api(texts, task="retrieval.passage")


def embed_query(query: str) -> list[float]:
    """Embeds a user question at search time."""
    return _call_jina_api([query], task="retrieval.query")[0]