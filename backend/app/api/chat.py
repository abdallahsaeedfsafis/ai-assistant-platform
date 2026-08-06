from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.agent import generate_agent_response

router = APIRouter(prefix="/api/chat", tags=["chat"])


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []


class ChatResponse(BaseModel):
    reply: str
    tools_used: list[str] = []


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        history_dicts = [msg.model_dump() for msg in request.history]
        result = await generate_agent_response(request.message, history_dicts)
        return ChatResponse(reply=result["answer"], tools_used=result["tools_used"])

    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if "api key" in error_msg or "api_key" in error_msg:
            raise HTTPException(status_code=401, detail="There's a problem with the API key. Please check it.")
        if "quota" in error_msg or "rate" in error_msg:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again shortly.")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")