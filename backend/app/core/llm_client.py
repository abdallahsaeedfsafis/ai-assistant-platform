"""
Wrapper موحّد للتعامل مع مزودي LLM المختلفين (Gemini، Grok، أو Groq).
التبديل بينهم يصير من متغير LLM_PROVIDER بملف .env، بدون أي تعديل هون.
"""
from app.core.config import settings

settings.validate()


# ---------------------------------------------------------------------------
# Groq (شركة تسريع الأجهزة — LPU) — متوافقة مع OpenAI SDK
# ---------------------------------------------------------------------------
async def _generate_groq_response(message: str, history: list[dict]) -> str:
    from openai import OpenAI

    client = OpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )

    messages = [{"role": h["role"], "content": h["content"]} for h in history]
    messages.append({"role": "user", "content": message})

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
    )
    return completion.choices[0].message.content


# ---------------------------------------------------------------------------
# Grok (xAI) — متوافقة مع OpenAI SDK
# ---------------------------------------------------------------------------
async def _generate_grok_response(message: str, history: list[dict]) -> str:
    from openai import OpenAI

    client = OpenAI(
        api_key=settings.GROK_API_KEY,
        base_url="https://api.x.ai/v1",
    )

    messages = [{"role": h["role"], "content": h["content"]} for h in history]
    messages.append({"role": "user", "content": message})

    completion = client.chat.completions.create(
        model="grok-4-fast",
        messages=messages,
    )
    return completion.choices[0].message.content


# ---------------------------------------------------------------------------
# Gemini (Google) — عبر مكتبة google-genai
# ---------------------------------------------------------------------------
async def _generate_gemini_response(message: str, history: list[dict]) -> str:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    formatted_history = [
        types.Content(
            role="model" if msg["role"] == "assistant" else "user",
            parts=[types.Part(text=msg["content"])],
        )
        for msg in history
    ]

    chat = client.chats.create(model="gemini-2.5-flash", history=formatted_history)
    result = chat.send_message(message)
    return result.text


# ---------------------------------------------------------------------------
# نقطة الدخول الموحدة — هاي بس اللي بيستدعيها باقي الكود
# ---------------------------------------------------------------------------
_PROVIDERS = {
    "groq": _generate_groq_response,
    "grok": _generate_grok_response,
    "gemini": _generate_gemini_response,
}


async def generate_chat_response(message: str, history: list[dict]) -> str:
    handler = _PROVIDERS.get(settings.LLM_PROVIDER)
    if handler is None:
        raise RuntimeError(f"مزود غير مدعوم: {settings.LLM_PROVIDER}")
    return await handler(message, history)