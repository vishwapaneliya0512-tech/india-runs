from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ================= USER SCHEMAS =================
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "recruiter"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ================= AUTH SCHEMAS =================
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class RecruiterBase(BaseModel):
    company_name: Optional[str] = None
    title: Optional[str] = None
    department: Optional[str] = None

class RecruiterCreate(RecruiterBase):
    pass

class RecruiterResponse(RecruiterBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ================= SKILL SCHEMAS =================
class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None

class SkillResponse(SkillBase):
    id: int
    
    class Config:
        from_attributes = True

class CandidateSkillSchema(BaseModel):
    skill: SkillResponse
    proficiency: str
    years_experience: float

    class Config:
        from_attributes = True

class JobSkillSchema(BaseModel):
    skill: SkillResponse
    importance: str

    class Config:
        from_attributes = True

# ================= EXPERIENCE & PROJECT SCHEMAS =================
class ExperienceBase(BaseModel):
    company: str
    title: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    skills_used: Optional[str] = None

class ExperienceResponse(ExperienceBase):
    id: int
    
    class Config:
        from_attributes = True

class EducationBase(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa: Optional[float] = None

class EducationResponse(EducationBase):
    id: int
    
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    url: Optional[str] = None
    highlights: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    
    class Config:
        from_attributes = True

class CertificateBase(BaseModel):
    name: str
    issuing_organization: str
    issue_date: Optional[str] = None
    expiration_date: Optional[str] = None
    credential_id: Optional[str] = None

class CertificateResponse(CertificateBase):
    id: int
    
    class Config:
        from_attributes = True

# ================= JOB SCHEMAS =================
class JobCreate(BaseModel):
    title: str
    description: str
    department: Optional[str] = None
    location: Optional[str] = None
    type: str = "Full-time"
    experience_level: Optional[str] = None
    skills: List[str] = [] # Names of required skills

class JobResponse(BaseModel):
    id: int
    recruiter_id: Optional[int] = None
    title: str
    description: str
    department: Optional[str] = None
    location: Optional[str] = None
    type: str
    experience_level: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    job_skills: List[JobSkillSchema] = []

    class Config:
        from_attributes = True

# ================= CANDIDATE SCHEMAS =================
class CandidateBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    experience_years: float
    current_title: Optional[str] = None
    current_company: Optional[str] = None
    summary: Optional[str] = None
    education_summary: Optional[str] = None
    
    status: str
    parsed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class CandidateDetailResponse(CandidateResponse):
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    missing_skills: Optional[str] = None
    career_growth_score: float
    growth_analysis: Optional[str] = None
    confidence_score: float
    ranking_reason: Optional[str] = None
    interview_questions: Optional[str] = None
    
    candidate_skills: List[CandidateSkillSchema] = []
    experiences: List[ExperienceResponse] = []
    educations: List[EducationResponse] = []
    projects: List[ProjectResponse] = []
    certificates: List[CertificateResponse] = []

    class Config:
        from_attributes = True

# ================= RANKING SCHEMAS =================
class RankingResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    rank: int
    semantic_score: float
    experience_score: float
    projects_score: float
    education_score: float
    certificates_score: float
    career_progression_score: float
    activity_score: float
    final_score: float
    explanation: Optional[str] = None
    created_at: datetime
    candidate: CandidateResponse

    class Config:
        from_attributes = True

class RankCandidatesRequest(BaseModel):
    job_id: int

# ================= CHAT SCHEMAS =================
class ChatMessage(BaseModel):
    role: str # user, assistant
    content: str

class ChatRequest(BaseModel):
    message: str
    job_id: Optional[int] = None
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []

# ================= ANALYTICS SCHEMAS =================
class DashboardMetrics(BaseModel):
    total_candidates: int
    jobs_posted: int
    active_searches: int
    ai_ranked_today: int
    shortlisted_candidates: int
    interviews_scheduled: int

class RecentActivityResponse(BaseModel):
    id: int
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    details: Optional[str] = None
    created_at: datetime

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
