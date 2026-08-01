from app.services.vector_store import search_relevant_chunks
from app.core.llm_client import generate_chat_response


async def generate_hybrid_response(message: str, history: list[dict]) -> str:
    """
    يدور بالملفات المرفوعة أولاً. لو لقى معلومة مرتبطة فعلاً بالسؤال، يستخدمها.
    لو ما لقى شي مرتبط، يتجاهل الملفات تماماً ويجاوب من معرفته العامة (زي أي شات عادي).
    """
    relevant_chunks = search_relevant_chunks(message, top_k=4)

    if not relevant_chunks:
        # ما في معلومة مرتبطة بالملفات — رد عادي زي أي مساعد
        return await generate_chat_response(message, history)

    context_text = "\n\n---\n\n".join(relevant_chunks)

    augmented_message = f"""Context from uploaded documents (use only if relevant to the question below):
{context_text}

Question: {message}

Instructions: If the context above is relevant to the question, use it to answer accurately.
If the context is not relevant, ignore it completely and answer the question normally using your own knowledge."""

    return await generate_chat_response(augmented_message, history)