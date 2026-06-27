import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database.connection import get_db
from backend.app.schemas.schemas import CandidateCreate, CandidateResponse, CandidateDetailResponse
from backend.app.models.models import Candidate, Shortlist, Job, Recruiter
from backend.app.auth.jwt import get_current_active_recruiter
from backend.app.services.candidate_service import candidate_service

router = APIRouter(prefix="/candidates", tags=["candidates"])

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[CandidateResponse])
def read_candidates(
    search: Optional[str] = None,
    location: Optional[str] = None,
    status: Optional[str] = None,
    skills: Optional[List[str]] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    return candidate_service.get_candidates(db, search, skills, location, status, skip, limit)

@router.get("/{candidate_id}", response_model=CandidateDetailResponse)
def read_candidate(
    candidate_id: int, 
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    candidate = candidate_service.get_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.post("", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(
    candidate_in: CandidateCreate, 
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    existing = db.query(Candidate).filter(Candidate.email == candidate_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Candidate with this email already exists")
    return candidate_service.create_candidate(db, candidate_in)

@router.post("/upload", response_model=CandidateDetailResponse)
async def upload_resume(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    """
    Saves a resume PDF to file, creates an initial candidate placeholder,
    and runs the parsing + embedding pipeline.
    """
    # Verify file format
    if not file.filename.lower().endswith(('.pdf', '.txt')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload PDF or TXT files."
        )
        
    # Save the file
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
        
    # Create a placeholder candidate with dummy fields, we'll parse the actual values next
    temp_email = f"parsing.{datetime_to_ms()}@talentmind.ai"
    db_cand = Candidate(
        first_name="Parsing",
        last_name="Resume...",
        email=temp_email,
        status="New"
    )
    db.add(db_cand)
    db.commit()
    db.refresh(db_cand)
    
    try:
        # Run parsing pipeline
        processed = candidate_service.process_candidate_resume(db, db_cand.id, file_path)
        return processed
    except Exception as e:
        # Clean up database entry if parsing fails completely
        db.delete(db_cand)
        db.commit()
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Resume processing pipeline failed: {str(e)}")

@router.post("/{candidate_id}/shortlist", response_model=CandidateResponse)
def shortlist_candidate(
    candidate_id: int,
    job_id: int,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # Check if already shortlisted
    existing = db.query(Shortlist).filter(Shortlist.job_id == job_id, Shortlist.candidate_id == candidate_id).first()
    if not existing:
        db_short = Shortlist(
            job_id=job_id,
            candidate_id=candidate_id,
            notes=notes
        )
        db.add(db_short)
        
    candidate.status = "Shortlisted"
    db.commit()
    db.refresh(candidate)
    return candidate

@router.post("/{candidate_id}/reject", response_model=CandidateResponse)
def reject_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    candidate.status = "Rejected"
    db.commit()
    db.refresh(candidate)
    return candidate

@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    success = candidate_service.delete_candidate(db, candidate_id)
    if not success:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return None

def datetime_to_ms() -> int:
    import time
    return int(time.time() * 1000)
