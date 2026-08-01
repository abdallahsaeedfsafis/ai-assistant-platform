from app.services.vector_store import search_relevant_chunks
from app.core.llm_client import generate_chat_response


async def generate_hybrid_response(message: str, history: list[dict]) -> str:
    """
    Searches uploaded documents first. If relevant content is found, uses it.
    If nothing relevant is found, falls back to general knowledge — but stays
    honest if the question specifically asks about "this project" or "this document".
    """
    relevant_chunks = search_relevant_chunks(message, top_k=4)

    if not relevant_chunks:
        safe_message = f"""{message}

If this question asks about specific details of "this project", "this document", or similar, and you don't actually have that information, say clearly that you don't have that specific information instead of guessing or making up an answer. Otherwise, answer normally using your own general knowledge."""
        return await generate_chat_response(safe_message, history)

    context_text = "\n\n---\n\n".join(relevant_chunks)

    augmented_message = f"""Context from uploaded documents (use only if relevant to the question below):
{context_text}

Question: {message}

Instructions: If the context above is relevant to the question, use it to answer accurately.
If the context is not relevant, ignore it completely and answer the question normally using your own knowledge."""

    return await generate_chat_response(augmented_message, history)