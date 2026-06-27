import os
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
import json

from backend.app.models.models import (
    Candidate, Skill, CandidateSkill, Experience, Education, Project, Certificate, Job, Ranking, ActivityLog
)
from backend.app.schemas.schemas import CandidateCreate
from backend.app.ai.parser import resume_parser
from backend.app.ai.embeddings import embedding_service
from backend.app.ai.chroma_client import chroma_client
from backend.app.ai.llm import llm_provider
from backend.app.ai.ranker import ranking_engine

logger = logging.getLogger("candidate_service")

class CandidateService:
    def get_candidate(self, db: Session, candidate_id: int) -> Optional[Candidate]:
        return db.query(Candidate).filter(Candidate.id == candidate_id).first()

    def get_candidates(
        self, 
        db: Session, 
        search: Optional[str] = None, 
        skills: Optional[List[str]] = None,
        location: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Candidate]:
        query = db.query(Candidate)
        
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    Candidate.first_name.like(search_filter),
                    Candidate.last_name.like(search_filter),
                    Candidate.email.like(search_filter),
                    Candidate.current_title.like(search_filter),
                    Candidate.summary.like(search_filter)
                )
            )
            
        if location:
            query = query.filter(Candidate.location.like(f"%{location}%"))
            
        if status:
            query = query.filter(Candidate.status == status)
            
        if skills:
            # Filter candidates who have ANY of the listed skills
            query = query.join(CandidateSkill).join(Skill).filter(Skill.name.in_(skills))
            
        return query.offset(skip).limit(limit).all()

    def create_candidate(self, db: Session, candidate_in: CandidateCreate) -> Candidate:
        db_cand = Candidate(
            first_name=candidate_in.first_name,
            last_name=candidate_in.last_name,
            email=candidate_in.email,
            phone=candidate_in.phone,
            location=candidate_in.location,
            linkedin_url=candidate_in.linkedin_url,
            github_url=candidate_in.github_url,
            portfolio_url=candidate_in.portfolio_url,
            status="New"
        )
        db.add(db_cand)
        db.commit()
        db.refresh(db_cand)
        return db_cand

    def delete_candidate(self, db: Session, candidate_id: int) -> bool:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            return False
            
        # Delete from ChromaDB
        chroma_client.delete_resume(candidate_id)
        
        db.delete(candidate)
        db.commit()
        return True

    def process_candidate_resume(self, db: Session, candidate_id: int, file_path: str) -> Candidate:
        """Runs the entire resume processing pipeline."""
        candidate = self.get_candidate(db, candidate_id)
        if not candidate:
            raise ValueError(f"Candidate {candidate_id} not found.")
            
        logger.info(f"Parsing resume for candidate {candidate_id}: {file_path}")
        
        # 1. Parse resume text & metadata
        parsed_data = resume_parser.parse(file_path)
        
        candidate.resume_path = file_path
        candidate.resume_text = parsed_data["resume_text"]
        candidate.parsed_at = datetime.utcnow()
        candidate.experience_years = parsed_data["experience_years"]
        candidate.current_title = parsed_data["current_title"]
        candidate.current_company = parsed_data["current_company"]
        candidate.summary = parsed_data["summary"]
        candidate.education_summary = parsed_data["education_summary"]
        candidate.location = parsed_data["location"] or candidate.location
        
        # Clear existing nested models to avoid duplicates on re-parse
        db.query(Experience).filter(Experience.candidate_id == candidate_id).delete()
        db.query(Education).filter(Education.candidate_id == candidate_id).delete()
        db.query(Project).filter(Project.candidate_id == candidate_id).delete()
        db.query(Certificate).filter(Certificate.candidate_id == candidate_id).delete()
        db.query(CandidateSkill).filter(CandidateSkill.candidate_id == candidate_id).delete()
        
        # Populate new relations
        # Experiences
        for exp in parsed_data["experiences"]:
            db_exp = Experience(
                candidate_id=candidate_id,
                company=exp["company"],
                title=exp["title"],
                start_date=exp["start_date"],
                end_date=exp["end_date"],
                is_current=exp["is_current"],
                description=exp["description"],
                responsibilities=exp["responsibilities"]
            )
            db.add(db_exp)
            
        # Educations
        for edu in parsed_data["educations"]:
            db_edu = Education(
                candidate_id=candidate_id,
                institution=edu["institution"],
                degree=edu["degree"],
                field_of_study=edu["field_of_study"],
                start_date=edu["start_date"],
                end_date=edu["end_date"],
                gpa=edu["gpa"]
            )
            db.add(db_edu)
            
        # Projects
        for proj in parsed_data["projects"]:
            db_proj = Project(
                candidate_id=candidate_id,
                title=proj["title"],
                description=proj["description"],
                technologies=proj["technologies"]
            )
            db.add(db_proj)
            
        # Certificates
        for cert in parsed_data["certificates"]:
            db_cert = Certificate(
                candidate_id=candidate_id,
                name=cert["name"],
                issuing_organization=cert["issuing_organization"],
                issue_date=cert["issue_date"]
            )
            db.add(db_cert)
            
        # Skills & CandidateSkills
        for skill_name in parsed_data["skills"]:
            # Find or create Skill in DB
            db_skill = db.query(Skill).filter(Skill.name == skill_name).first()
            if not db_skill:
                db_skill = Skill(name=skill_name, category="Technical")
                db.add(db_skill)
                db.flush() # Flush to get ID
                
            db_cand_skill = CandidateSkill(
                candidate_id=candidate_id,
                skill_id=db_skill.id,
                proficiency="Intermediate",
                years_experience=round(candidate.experience_years * 0.6, 1) # simple guess
            )
            db.add(db_cand_skill)
            
        db.commit()
        db.refresh(candidate)
        
        # 2. Generate Resume Vector Embedding
        logger.info(f"Generating resume embedding for candidate {candidate_id}...")
        text_to_embed = f"{candidate.current_title} {candidate.summary} " + " ".join(parsed_data["skills"])
        embedding = embedding_service.get_embedding(text_to_embed)
        
        # 3. Store Vector in ChromaDB
        metadata = {
            "id": candidate.id,
            "name": f"{candidate.first_name} {candidate.last_name}",
            "experience_years": candidate.experience_years,
            "location": candidate.location or "Remote",
            "current_title": candidate.current_title or "Engineer"
        }
        chroma_client.add_resume(candidate_id, embedding, metadata, text_to_embed)
        
        logger.info(f"Resume processing pipeline completed for candidate {candidate_id}.")
        return candidate

    def trigger_candidate_ranking(self, db: Session, job_id: int) -> List[Ranking]:
        """Ranks all parsed candidates against a single job description."""
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")
            
        # Get Job Embedding
        job_text = f"{job.title} {job.description}"
        job_embedding = embedding_service.get_embedding(job_text)
        
        # Vector Match from ChromaDB
        # Query for all candidates (say, top 100)
        query_results = chroma_client.query_resumes(job_embedding, n_results=100)
        
        # Clear past rankings for this job
        db.query(Ranking).filter(Ranking.job_id == job_id).delete()
        db.commit()
        
        rankings = []
        for idx, match in enumerate(query_results):
            cand_id = match["candidate_id"]
            sim_score = match["score"]
            
            candidate = db.query(Candidate).filter(Candidate.id == cand_id).first()
            if not candidate:
                continue
                
            # Perform multi-dimensional score logic
            scores = ranking_engine.calculate_score(candidate, job, sim_score)
            
            # Use LLM (or Fallback) to generate explainable text elements
            # Cache it inside candidate table if not already populated, or generate on ranking
            if not candidate.strengths:
                analysis = llm_provider.generate_candidate_analysis(
                    candidate_info={
                        "first_name": candidate.first_name,
                        "last_name": candidate.last_name,
                        "summary": candidate.summary,
                        "experience_years": candidate.experience_years,
                        "skills": [cs.skill.name for cs in candidate.candidate_skills],
                        "projects": [{"title": p.title, "description": p.description} for p in candidate.projects]
                    },
                    job_info={
                        "title": job.title,
                        "description": job.description,
                        "skills": [js.skill.name for js in job.job_skills]
                    }
                )
                candidate.strengths = json.dumps(analysis.get("strengths", []))
                candidate.weaknesses = json.dumps(analysis.get("weaknesses", []))
                candidate.missing_skills = json.dumps(analysis.get("missing_skills", []))
                candidate.ranking_reason = analysis.get("ranking_reason", "")
                candidate.interview_questions = json.dumps(analysis.get("interview_questions", []))
                candidate.confidence_score = analysis.get("confidence_score", 85.0)
                candidate.career_growth_score = analysis.get("career_growth_score", 75.0)
                candidate.growth_analysis = analysis.get("career_growth_analysis", "")
                db.add(candidate)
                
            explanation = candidate.ranking_reason
            
            db_rank = Ranking(
                job_id=job_id,
                candidate_id=cand_id,
                rank=idx + 1, # initial rough order, we will resort based on final score
                semantic_score=scores["semantic_score"],
                experience_score=scores["experience_score"],
                projects_score=scores["projects_score"],
                education_score=scores["education_score"],
                certificates_score=scores["certificates_score"],
                career_progression_score=scores["career_progression_score"],
                activity_score=scores["activity_score"], # portfolio
                final_score=scores["final_score"],
                explanation=explanation
            )
            db.add(db_rank)
            rankings.append(db_rank)
            
        db.commit()
        
        # Sort rankings by final score descending and re-assign ranks
        rankings = db.query(Ranking).filter(Ranking.job_id == job_id).order_by(Ranking.final_score.desc()).all()
        for new_rank, r in enumerate(rankings):
            r.rank = new_rank + 1
        db.commit()
        
        return rankings

# Singleton instance
candidate_service = CandidateService()
