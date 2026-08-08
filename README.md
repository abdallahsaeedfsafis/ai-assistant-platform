# AI Assistant Platform

A full-stack AI assistant platform built incrementally across a multi-task
training program, combining conversational chat, retrieval-augmented
generation (RAG) over uploaded documents, tool-calling agents, and a
prompt-engineering playground — all in one unified application.

**Live demo:** https://ai-assistant-platform-web.onrender.com
**Backend API docs:** https://ai-assistant-platform.onrender.com/docs

> Note: both services run on Render's free tier. The backend may take
> 30–50 seconds to wake up after a period of inactivity, and uploaded
> documents are cleared on redeploy (see [Known Limitations](#known-limitations)).

---

## Table of Contents

- [Overview](#overview)
- [Features by Task](#features-by-task)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [How the System Works](#how-the-system-works)
- [Known Limitations](#known-limitations)
- [Documentation](#documentation)

---

## Overview

This project was built as a series of connected tasks, each adding a new
capability on top of the same codebase rather than as separate throwaway
exercises. The result is a single platform that supports:

- A conversational chatbot with memory and error handling
- Document upload (PDF) with retrieval-augmented answers, in Arabic and English
- An AI agent that autonomously decides when to use external tools
  (calculator, weather, web search, document search)
- A prompt-engineering playground comparing four prompting strategies

## Features by Task

### Task 1 — Conversational Chatbot
- LLM integration via the Groq API (OpenAI-compatible)
- Full conversation history sent with every request
- Graceful error handling (invalid key, rate limits, network failures)
- Typing indicator while a response is generating
- Bilingual UI support (auto text direction per message)

### Task 2 — Retrieval-Augmented Generation (RAG)
- PDF text extraction and chunking (`pypdf`)
- Multilingual embeddings via the Jina AI API (Arabic + English)
- Local vector storage and similarity search with ChromaDB
- **Automatic** document lookup on every message — the system checks
  uploaded documents first, then falls back to the model's general
  knowledge if nothing relevant is found (no reliance on the model
  "deciding" to search)
- Password-protected Admin page for uploading documents; regular users
  can only ask questions, not upload
- Tested against a real 25-page, 141-article official legal document
  (Palestinian Labor Law No. 7 of 2000) in addition to shorter test files

### Task 3 — AI Agent with Tool Calling
- Native OpenAI-style function calling via Groq (`openai/gpt-oss-20b`)
- Four tools:
  - **Calculator** — safe local expression evaluation
  - **Weather** — live data from Open-Meteo (no API key required)
  - **Web Search** — real-time results via Tavily, built for AI agents
  - **Document Search** — the same retrieval pipeline from Task 2
- Automatic retry + graceful fallback if tool-call generation fails
- Visual badges in the chat UI showing which tool (if any) was used
  for each response

### Task 4 — Prompt Engineering Playground
- Dedicated `/playground` page comparing four prompting strategies side
  by side on the same input:
  - Zero-shot
  - One-shot
  - Few-shot
  - Chain-of-Thought
- Five ready-made task categories (three general, two domain-specific
  to labor law) with built-in example sets for one-shot/few-shot prompts
- Response time shown per strategy; full prompt text viewable for each
- Full findings documented in [`PROMPTING_REPORT.md`](./PROMPTING_REPORT.md)

## Architecture

```
┌─────────────┐        ┌──────────────┐        ┌───────────────────┐
│    User      │ ─────▶ │   Frontend    │ ─────▶ │      Backend       │
│  (browser)   │ ◀───── │   (React)     │ ◀───── │    (FastAPI)       │
└─────────────┘        └──────────────┘        └─────────┬──────────┘
                                                            │
                        ┌───────────────┬───────────────────┼───────────────────┐
                        ▼               ▼                   ▼                   ▼
                  ┌──────────┐   ┌────────────┐      ┌────────────┐     ┌──────────────┐
                  │   Groq    │   │  ChromaDB   │      │   Jina AI   │     │ Tavily /      │
                  │  (LLM +   │   │ (vector DB, │      │(embeddings) │     │ Open-Meteo    │
                  │  tools)   │   │   local)    │      │             │     │ (tools)       │
                  └──────────┘   └────────────┘      └────────────┘     └──────────────┘
```

All secret API keys live only on the backend. The frontend never talks
to any third-party AI service directly — every request goes through the
FastAPI backend first.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Frontend | React + Vite + Tailwind CSS |
| LLM inference | Groq API (`openai/gpt-oss-20b`) |
| Embeddings | Jina AI (`jina-embeddings-v3`) |
| Vector database | ChromaDB (local, persistent) |
| Web search | Tavily API |
| Weather data | Open-Meteo API |
| PDF parsing | pypdf |
| Markdown/math rendering | react-markdown, remark-gfm, remark-math, KaTeX |
| Routing | react-router-dom |
| Deployment | Render (backend Web Service + frontend Static Site) |

## Project Structure

```
ai-assistant-platform/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entrypoint, router registration
│   │   ├── api/
│   │   │   ├── chat.py              # POST /api/chat
│   │   │   ├── rag.py               # PDF upload + admin auth
│   │   │   └── playground.py        # Prompt strategy comparison endpoint
│   │   ├── core/
│   │   │   └── config.py            # Environment variable settings
│   │   └── services/
│   │       ├── agent.py             # Tool-calling agent logic
│   │       ├── pdf_processor.py     # PDF text extraction + chunking
│   │       ├── embeddings.py        # Jina AI embedding calls
│   │       ├── vector_store.py      # ChromaDB storage + retrieval
│   │       ├── prompt_library.py    # Task4 example sets
│   │       ├── prompt_playground.py # Task4 strategy builder + runner
│   │       └── tools/
│   │           ├── calculator.py
│   │           ├── weather.py
│   │           └── search.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Route definitions
│   │   ├── pages/
│   │   │   ├── ChatPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   └── PlaygroundPage.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ErrorBanner.jsx
│   │   └── lib/
│   │       ├── api.js               # Backend API client
│   │       └── sanitizeMath.js      # LaTeX cleanup for chat rendering
│   └── .env.example
├── PROMPTING_REPORT.md              # Task 4 findings
└── README.md
```

## Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- API keys: [Groq](https://console.groq.com), [Jina AI](https://jina.ai/embeddings), [Tavily](https://tavily.com)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # then fill in your API keys
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App available at `http://localhost:5173`. Make sure the backend is
running in parallel.

## Environment Variables

**`backend/.env`**

| Variable | Description |
|---|---|
| `LLM_PROVIDER` | `groq` (default provider used throughout the project) |
| `GROQ_API_KEY` | Groq API key |
| `JINA_API_KEY` | Jina AI API key (embeddings) |
| `TAVILY_API_KEY` | Tavily API key (web search tool) |
| `ADMIN_PASSWORD` | Password required to upload documents via `/admin` |

**`frontend/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (`http://localhost:8000` locally) |

## How the System Works

Example: a user asks *"How many vacation days am I entitled to?"*

1. The frontend sends the message to `POST /api/chat`.
2. Before the model sees anything, the backend automatically searches
   uploaded documents (embeddings + ChromaDB similarity search).
3. If relevant content is found above the similarity threshold, it's
   injected as context ahead of the user's question.
4. The full message (context + question + history + tool definitions)
   is sent to Groq.
5. The model either answers directly using the injected context, or —
   for things like "what's the weather" — decides to call a real tool
   (e.g. `get_weather`), which the backend executes and feeds the result
   back to the model for a final natural-language answer.
6. The response, along with which tool (if any) was used, is returned
   to the frontend and rendered with full Markdown/table/math support.

## Known Limitations

- **Ephemeral storage on Render free tier:** uploaded documents (stored
  in ChromaDB on local disk) are lost on redeploy or server restart.
  Re-upload via `/admin` after any new deployment.
- **Cold starts:** the free backend instance sleeps after ~15 minutes of
  inactivity; the first request afterward can take 30–50 seconds.
- **Tool-call reliability:** occasional malformed tool-call generation
  from the LLM is handled with automatic retries and a safe fallback to
  a tool-free answer, but is not 100% eliminated.

## Documentation

- [`PROMPTING_REPORT.md`](./PROMPTING_REPORT.md) — Task 4 prompt engineering findings and recommendations