import logging
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from backend.app.schemas.schemas import ChatRequest, ChatResponse
from backend.app.models.models import Candidate, Ranking
from backend.app.ai.llm import llm_provider

logger = logging.getLogger("chat_service")

class ChatService:
    def handle_chat_query(self, db: Session, chat_in: ChatRequest) -> ChatResponse:
        """Processes recruiter natural language questions about candidates."""
        logger.info(f"Handling chat query: {chat_in.message}")
        
        # 1. Fetch relevant candidates to provide as context
        # If job_id is passed, we fetch candidates ranked for that job.
        # Otherwise, we fetch top general candidates.
        context_candidates = []
        if chat_in.job_id:
            rankings = db.query(Ranking).filter(Ranking.job_id == chat_in.job_id).order_by(Ranking.rank).all()
            for r in rankings:
                cand = r.candidate
                context_candidates.append({
                    "id": cand.id,
                    "first_name": cand.first_name,
                    "last_name": cand.last_name,
                    "rank": r.rank,
                    "final_score": r.final_score,
                    "current_title": cand.current_title,
                    "experience_years": cand.experience_years,
                    "skills": [cs.skill.name for cs in cand.candidate_skills],
                    "strengths": cand.strengths
                })
        else:
            candidates = db.query(Candidate).order_by(Candidate.experience_years.desc()).limit(15).all()
            for c in candidates:
                context_candidates.append({
                    "id": c.id,
                    "first_name": c.first_name,
                    "last_name": c.last_name,
                    "current_title": c.current_title,
                    "experience_years": c.experience_years,
                    "skills": [cs.skill.name for cs in c.candidate_skills],
                    "strengths": c.strengths
                })
                
        # 2. Convert history schemas to LLM format
        history_list = []
        for h in chat_in.history:
            history_list.append({
                "role": h.role,
                "content": h.content
            })
            
        # 3. Request completion from LLM Provider
        result = llm_provider.generate_chat_reply(
            message=chat_in.message,
            context_candidates=context_candidates,
            history=history_list
        )
        
        return ChatResponse(
            reply=result.get("reply", "I am scanning our databases. How can I assist you with candidate matching?"),
            suggestions=result.get("suggestions", ["Find python developers", "Show candidate list", "Who is ranked first?"])
        )

# Singleton instance
chat_service = ChatService()
