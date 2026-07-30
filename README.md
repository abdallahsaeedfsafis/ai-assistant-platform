# AI Assistant Platform

مشروع متكامل يبنى تدريجياً عبر عدة مراحل: chatbot بسيط → RAG على مستندات PDF → AI agent مع أدوات خارجية → مقارنة استراتيجيات prompting → منصة موحدة منشورة على الإنترنت.

## نظرة عامة

هذا المشروع جزء من portfolio تعلّم بناء تطبيقات AI حقيقية، ويغطي:

- **Task 1:** Chatbot بسيط بواجهة محادثة
- **Task 2:** Retrieval-Augmented Generation (RAG) على ملفات PDF
- **Task 3:** AI Agent يستخدم أدوات خارجية (calculator, weather, search)
- **Task 4:** مقارنة تقنيات Prompt Engineering المختلفة
- **Task 5:** دمج كل شي بمنصة واحدة منشورة (deployed)

## التقنيات المستخدمة

- **Backend:** FastAPI (Python)
- **Frontend:** React (Vite)
- **LLM:** Google Gemini (`gemini-2.5-flash`) عبر مكتبة `google-genai`
- **Deployment:** Render

## هيكل المشروع

```
ai-assistant-platform/
├── backend/
│   ├── app/
│   │   ├── main.py              # نقطة الدخول
│   │   ├── api/
│   │   │   └── chat.py          # /api/chat endpoint
│   │   ├── core/
│   │   │   ├── config.py        # الإعدادات
│   │   │   └── llm_client.py    # التعامل مع Gemini
│   │   └── services/            # (تُضاف لاحقاً: RAG, tools...)
│   ├── requirements.txt
│   └── .env.example
├── frontend/                    # واجهة React (قيد الإنشاء)
└── README.md
```

## التشغيل محلياً

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # على Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # ثم حط الـ API key الحقيقي جوا .env
uvicorn app.main:app --reload --port 8000
```

بعد التشغيل، جرب الـ API مباشرة من: `http://localhost:8000/docs`

### الحصول على Gemini API Key

من https://aistudio.google.com/apikey

## الحالة الحالية

- [x] Task 1: Backend chat endpoint (FastAPI + Gemini)
- [ ] Task 1: Frontend chat interface (React)
- [ ] Task 2: RAG pipeline
- [ ] Task 3: AI Agent + tools
- [ ] Task 4: Prompt engineering playground
- [ ] Task 5: دمج ونشر نهائي
