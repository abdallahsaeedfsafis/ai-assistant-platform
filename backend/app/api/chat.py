from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.agent import generate_agent_response
from app.db.database import get_db
from app.db.models import User, Conversation, Message
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    conversation_id: int
    message: str


class ChatResponse(BaseModel):
    reply: str
    tools_used: list[str] = []


async def _get_owned_conversation(conversation_id: int, user: User, db: AsyncSession) -> Conversation:
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id,
        )
    )
    conversation = result.scalar_one_or_none()
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return conversation


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    conversation = await _get_owned_conversation(request.conversation_id, current_user, db)

    await db.refresh(conversation, attribute_names=["messages"])
    history = [{"role": m.role, "content": m.content} for m in conversation.messages]

    try:
        result = await generate_agent_response(request.message, history)
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if "api key" in error_msg or "api_key" in error_msg:
            raise HTTPException(status_code=401, detail="There's a problem with the API key. Please check it.")
        if "quota" in error_msg or "rate" in error_msg:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again shortly.")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")

    db.add(Message(conversation_id=conversation.id, role="user", content=request.message))
    db.add(Message(conversation_id=conversation.id, role="assistant", content=result["answer"]))

    if conversation.title == "New conversation":
        conversation.title = request.message[:60]

    await db.commit()

    return ChatResponse(reply=result["answer"], tools_used=result["tools_used"])