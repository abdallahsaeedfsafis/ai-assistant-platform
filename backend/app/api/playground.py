from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.prompt_playground import compare_strategies
from app.services.prompt_library import list_categories

router = APIRouter(prefix="/api/playground", tags=["playground"])


class CompareRequest(BaseModel):
    category: str
    input: str


@router.get("/categories")
async def get_categories():
    return {"categories": list_categories()}


@router.post("/compare")
async def compare(request: CompareRequest):
    if not request.input.strip():
        raise HTTPException(status_code=400, detail="Input cannot be empty.")

    try:
        result = await compare_strategies(request.category, request.input)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong while comparing strategies. Please try again.")