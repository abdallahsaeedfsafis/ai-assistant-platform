import chromadb
from app.services.embeddings import embed_texts, embed_query

_client = None
_collection = None
COLLECTION_NAME = "documents"

# Adjust this after checking real distance values printed below
RELEVANCE_THRESHOLD = 0.72

def _get_collection():
    global _client, _collection
    if _collection is None:
        _client = chromadb.PersistentClient(path="./chroma_data")
        _collection = _client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def add_document_chunks(doc_id: str, chunks: list[str]) -> int:
    if not chunks:
        return 0
    collection = _get_collection()
    embeddings = embed_texts(chunks)
    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"doc_id": doc_id, "chunk_index": i} for i in range(len(chunks))]
    collection.add(ids=ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)
    return len(chunks)


def search_relevant_chunks(query: str, top_k: int = 4) -> list[str]:
    collection = _get_collection()
    if collection.count() == 0:
        return []

    query_embedding = embed_query(query)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
    )

    documents = results["documents"][0] if results["documents"] else []
    distances = results["distances"][0] if results["distances"] else []

    relevant = [doc for doc, dist in zip(documents, distances) if dist <= RELEVANCE_THRESHOLD]
    return relevant


def get_document_count() -> int:
    return _get_collection().count()