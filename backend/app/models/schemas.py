from pydantic import BaseModel
from typing import Optional

class QueryRequest(BaseModel):
    """
    Request model for code generation
    """
    prompt: str

class CodeResponse(BaseModel):
    """
    Response model for generated code
    """
    code: Optional[str]
    explanation: Optional[str]
    error: Optional[str]