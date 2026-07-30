from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.llm_client import generate_chat_response

router = APIRouter(prefix="/api/chat", tags=["chat"])


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []


class ChatResponse(BaseModel):
    reply: str


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="الرسالة ما تنلحقش تكون فاضية.")

    try:
        history_dicts = [msg.model_dump() for msg in request.history]
        reply = await generate_chat_response(request.message, history_dicts)
        return ChatResponse(reply=reply)

    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()

        if "api key" in error_msg or "api_key" in error_msg:
            raise HTTPException(status_code=401, detail="مشكلة بالـ API key، تأكد إنه صحيح.")
        if "quota" in error_msg or "rate" in error_msg:
            raise HTTPException(status_code=429, detail="تجاوزت الحد المسموح، جرب بعد شوي.")

        raise HTTPException(status_code=500, detail="صار في مشكلة، حاول مرة تانية.")
