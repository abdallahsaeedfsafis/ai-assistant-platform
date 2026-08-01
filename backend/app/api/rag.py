import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from pydantic import BaseModel
from app.core.config import settings
from app.services.pdf_processor import extract_text_from_pdf, chunk_text
from app.services.vector_store import add_document_chunks, get_document_count

router = APIRouter(prefix="/api/rag", tags=["rag"])


def _verify_admin(x_admin_password: str | None) -> None:
    if not settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=500, detail="Admin password is not configured on the server.")
    if x_admin_password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password.")


class UploadResponse(BaseModel):
    doc_id: str
    filename: str
    chunks_added: int


class VerifyPasswordRequest(BaseModel):
    password: str


@router.post("/verify-admin")
async def verify_admin(request: VerifyPasswordRequest):
    _verify_admin(request.password)
    return {"valid": True}


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...), x_admin_password: str | None = Header(default=None)):
    _verify_admin(x_admin_password)

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        text = extract_text_from_pdf(file_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Couldn't read the PDF file. It may be corrupted.")

    if not text.strip():
        raise HTTPException(status_code=422, detail="No extractable text found (the PDF might be scanned images).")

    chunks = chunk_text(text)
    doc_id = str(uuid.uuid4())

    try:
        chunks_added = add_document_chunks(doc_id, chunks)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to process the document. Please try again.")

    return UploadResponse(doc_id=doc_id, filename=file.filename, chunks_added=chunks_added)


@router.get("/status")
async def rag_status():
    return {"chunks_stored": get_document_count()}