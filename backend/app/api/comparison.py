from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from backend.app.database.connection import get_db
from backend.app.models.models import Candidate, Job, Recruiter
from backend.app.auth.jwt import get_current_active_recruiter
from backend.app.ai.llm import llm_provider

router = APIRouter(prefix="/comparison", tags=["comparison"])

class CompareRequest(BaseModel):
    candidate_ids: List[int]
    job_id: int

@router.post("")
def compare_candidates(
    req: CompareRequest,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    if len(req.candidate_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide at least 2 candidate IDs for comparison"
        )
        
    job = db.query(Job).filter(Job.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    candidates = db.query(Candidate).filter(Candidate.id.in_(req.candidate_ids)).all()
    if len(candidates) != len(req.candidate_ids):
        raise HTTPException(status_code=404, detail="One or more candidates could not be found")
        
    # Serialize data for LLM comparison
    cand_details = []
    for c in candidates:
        cand_details.append({
            "id": c.id,
            "first_name": c.first_name,
            "last_name": c.last_name,
            "experience_years": c.experience_years,
            "skills": [cs.skill.name for cs in c.candidate_skills],
            "strengths": c.strengths,
            "career_growth_score": c.career_growth_score or 70.0
        })
        
    job_details = {
        "title": job.title,
        "description": job.description
    }
    
    try:
        comparison_result = llm_provider.generate_candidate_comparison(cand_details, job_details)
        return comparison_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate side-by-side comparison: {str(e)}"
        )
