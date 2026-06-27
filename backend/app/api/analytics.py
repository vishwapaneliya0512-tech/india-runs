from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from backend.app.database.connection import get_db
from backend.app.schemas.schemas import DashboardMetrics
from backend.app.models.models import Recruiter
from backend.app.auth.jwt import get_current_active_recruiter
from backend.app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard", response_model=DashboardMetrics)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    try:
        return analytics_service.get_dashboard_metrics(db, recruiter.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard metrics: {str(e)}"
        )

@router.get("/details")
def get_detailed_charts(
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    try:
        return analytics_service.get_detailed_analytics(db, recruiter.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile detailed charts: {str(e)}"
        )
