from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat, rag, playground

app = FastAPI(title="AI Assistant Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-assistant-platform-web.onrender.com",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(rag.router)
app.include_router(playground.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}