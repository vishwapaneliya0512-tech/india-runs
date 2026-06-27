import io
import csv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.connection import get_db
from backend.app.schemas.schemas import RankingResponse, RankCandidatesRequest
from backend.app.models.models import Ranking, Job, Recruiter
from backend.app.auth.jwt import get_current_active_recruiter
from backend.app.services.candidate_service import candidate_service

router = APIRouter(prefix="/ranking", tags=["ranking"])

@router.post("", response_model=List[RankingResponse])
def trigger_ranking(
    req: RankCandidatesRequest,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    """
    Triggers the multi-signal AI ranking pipeline for all candidates 
    against the specified job ID.
    """
    job = db.query(Job).filter(Job.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    try:
        rankings = candidate_service.trigger_candidate_ranking(db, req.job_id)
        return rankings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ranking pipeline failure: {str(e)}"
        )

@router.get("/job/{job_id}", response_model=List[RankingResponse])
def get_rankings(
    job_id: int,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    """Fetches the pre-calculated rankings list for a job, sorted by rank."""
    rankings = db.query(Ranking).filter(Ranking.job_id == job_id).order_by(Ranking.rank).all()
    return rankings

@router.get("/job/{job_id}/export/csv")
def export_rankings_csv(
    job_id: int,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    """Generates and streams a CSV report containing the ranked candidates."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    rankings = db.query(Ranking).filter(Ranking.job_id == job_id).order_by(Ranking.rank).all()
    
    # Create file-like object in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write CSV Header
    writer.writerow([
        "Rank", "Match Score", "Candidate Name", "Email", "Phone", 
        "Location", "Current Title", "Experience Years", 
        "Semantic Score (40%)", "Experience Score (20%)", "Projects Score (10%)",
        "Education Score (5%)", "Certificates Score (5%)", "Progression Score (10%)",
        "Activity Score (5%)", "Recruiter Score (5%)", "Ranking Explanation"
    ])
    
    # Write CSV Rows
    for r in rankings:
        cand = r.candidate
        name = f"{cand.first_name} {cand.last_name}"
        writer.writerow([
            r.rank, f"{r.final_score}%", name, cand.email, cand.phone or "N/A",
            cand.location or "N/A", cand.current_title or "N/A", cand.experience_years,
            r.semantic_score, r.experience_score, r.projects_score,
            r.education_score, r.certificates_score, r.career_progression_score,
            r.activity_score, r.activity_score, r.explanation or ""
        ])
        
    # Reset buffer position
    output.seek(0)
    
    # Return as StreamingResponse
    headers = {"Content-Disposition": f"attachment; filename=TalentMind_Rankings_Job_{job_id}.csv"}
    return StreamingResponse(output, media_type="text/csv", headers=headers)
