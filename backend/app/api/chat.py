from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.schemas.schemas import ChatRequest, ChatResponse
from backend.app.models.models import Recruiter
from backend.app.auth.jwt import get_current_active_recruiter
from backend.app.services.chat_service import chat_service

router = APIRouter(prefix="/chat", tags=["ai-chat"])

@router.post("", response_model=ChatResponse)
def chat_with_copilot(
    chat_in: ChatRequest,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    try:
        return chat_service.handle_chat_query(db, chat_in)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat assistant error: {str(e)}"
        )
