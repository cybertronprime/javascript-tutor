from fastapi import APIRouter, HTTPException
from app.models.schemas import QueryRequest, CodeResponse
from app.services.ai_service import AIService

# Initialize router and service
router = APIRouter()
ai_service = AIService()

@router.post("/generate", response_model=CodeResponse)
async def generate_code(request: QueryRequest):
    """
    Generate code based on user prompt
    """
    try:
        if not request.prompt:
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")

        response = await ai_service.generate_code(request.prompt)
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}