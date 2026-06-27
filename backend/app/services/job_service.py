import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.models import Job, Skill, JobSkill, Ranking
from backend.app.schemas.schemas import JobCreate
from backend.app.ai.llm import llm_provider
from backend.app.ai.embeddings import embedding_service
from backend.app.ai.chroma_client import chroma_client

logger = logging.getLogger("job_service")

class JobService:
    def get_job(self, db: Session, job_id: int) -> Optional[Job]:
        return db.query(Job).filter(Job.id == job_id).first()

    def get_jobs(self, db: Session, recruiter_id: int) -> List[Job]:
        return db.query(Job).filter(Job.recruiter_id == recruiter_id).all()

    def create_job(self, db: Session, job_in: JobCreate, recruiter_id: int) -> Job:
        logger.info(f"Creating job: {job_in.title} for recruiter {recruiter_id}")
        
        # 1. Create Job in DB
        db_job = Job(
            recruiter_id=recruiter_id,
            title=job_in.title,
            description=job_in.description,
            department=job_in.department,
            location=job_in.location,
            type=job_in.type,
            experience_level=job_in.experience_level,
            status="Active"
        )
        db.add(db_job)
        db.flush() # Flush to get ID
        
        # 2. Use LLM to extract requirements
        extracted = llm_provider.analyze_job_requirements(job_in.title, job_in.description)
        
        # Update experience level based on LLM suggestions if not set
        if not db_job.experience_level:
            db_job.experience_level = extracted.get("experience_level", "Mid")
            
        # Process skills
        skills_to_add = extracted.get("skills", [])
        # Add user-specified skills as well
        for u_skill in job_in.skills:
            if u_skill not in skills_to_add:
                skills_to_add.append(u_skill)
                
        for s_name in skills_to_add:
            # Check or create skill in DB
            db_skill = db.query(Skill).filter(Skill.name == s_name).first()
            if not db_skill:
                db_skill = Skill(name=s_name, category="Technical")
                db.add(db_skill)
                db.flush()
                
            # Connect skill to job
            job_skill = JobSkill(
                job_id=db_job.id,
                skill_id=db_skill.id,
                importance="Required"
            )
            db.add(job_skill)
            
        db.commit()
        db.refresh(db_job)
        
        # 3. Create Job Embedding
        job_text = f"{db_job.title} {db_job.description} " + " ".join(skills_to_add)
        embedding = embedding_service.get_embedding(job_text)
        
        # 4. Store in ChromaDB
        metadata = {
            "job_id": db_job.id,
            "title": db_job.title,
            "department": db_job.department or "Engineering",
            "location": db_job.location or "Remote"
        }
        chroma_client.add_job(db_job.id, embedding, metadata, job_text)
        
        logger.info(f"Job {db_job.id} created and indexed successfully.")
        return db_job

    def duplicate_job(self, db: Session, job_id: int) -> Optional[Job]:
        orig = self.get_job(db, job_id)
        if not orig:
            return None
            
        db_job = Job(
            recruiter_id=orig.recruiter_id,
            title=f"{orig.title} (Copy)",
            description=orig.description,
            department=orig.department,
            location=orig.location,
            type=orig.type,
            experience_level=orig.experience_level,
            status="Draft"
        )
        db.add(db_job)
        db.flush()
        
        # Duplicate skills association
        for js in orig.job_skills:
            js_copy = JobSkill(
                job_id=db_job.id,
                skill_id=js.skill_id,
                importance=js.importance
            )
            db.add(js_copy)
            
        db.commit()
        db.refresh(db_job)
        
        # Index Copy in ChromaDB
        skills_text = " ".join([js.skill.name for js in db_job.job_skills])
        job_text = f"{db_job.title} {db_job.description} {skills_text}"
        embedding = embedding_service.get_embedding(job_text)
        metadata = {
            "job_id": db_job.id,
            "title": db_job.title,
            "department": db_job.department or "Engineering",
            "location": db_job.location or "Remote"
        }
        chroma_client.add_job(db_job.id, embedding, metadata, job_text)
        
        return db_job

    def delete_job(self, db: Session, job_id: int) -> bool:
        job = self.get_job(db, job_id)
        if not job:
            return False
            
        db.delete(job)
        db.commit()
        return True

# Singleton instance
job_service = JobService()
