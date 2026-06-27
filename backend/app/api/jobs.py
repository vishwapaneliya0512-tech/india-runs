from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.connection import get_db
from backend.app.schemas.schemas import JobCreate, JobResponse
from backend.app.models.models import Recruiter
from backend.app.auth.jwt import get_current_active_recruiter
from backend.app.services.job_service import job_service

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("", response_model=List[JobResponse])
def read_jobs(
    db: Session = Depends(get_db), 
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    return job_service.get_jobs(db, recruiter.id)

@router.get("/{job_id}", response_model=JobResponse)
def read_job(
    job_id: int, 
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    job = job_service.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate, 
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    try:
        return job_service.create_job(db, job_in, recruiter.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")

@router.post("/{job_id}/duplicate", response_model=JobResponse)
def duplicate_job(
    job_id: int,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    job = job_service.duplicate_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Original job not found")
    return job

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_active_recruiter)
):
    success = job_service.delete_job(db, job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    return None
