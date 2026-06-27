import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

# Association table for Candidate - Skills many-to-many relationship
# Although CandidateSkill has extra columns, a simple association or full model works.
# Let's use an explicit model class for CandidateSkill and JobSkill to store extra metadata.

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(50), default="recruiter") # recruiter, admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    recruiter_profile = relationship("Recruiter", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")

class Recruiter(Base):
    __tablename__ = "recruiters"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    company_name = Column(String(100), nullable=True)
    title = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="recruiter_profile")
    jobs = relationship("Job", back_populates="recruiter")
    activity_logs = relationship("ActivityLog", back_populates="recruiter")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    department = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    type = Column(String(50), default="Full-time") # Full-time, Part-time, Contract, Internship
    experience_level = Column(String(50), nullable=True) # Junior, Mid, Senior, Lead
    status = Column(String(50), default="Active") # Active, Closed, Draft
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    recruiter = relationship("Recruiter", back_populates="jobs")
    job_skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    rankings = relationship("Ranking", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    shortlists = relationship("Shortlist", back_populates="job", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="job", cascade="all, delete-orphan")

class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    location = Column(String(100), nullable=True)
    
    linkedin_url = Column(String(200), nullable=True)
    github_url = Column(String(200), nullable=True)
    portfolio_url = Column(String(200), nullable=True)
    
    resume_path = Column(String(250), nullable=True)
    resume_text = Column(Text, nullable=True)
    parsed_at = Column(DateTime, nullable=True)
    
    # Parsed career metadata
    experience_years = Column(Float, default=0.0)
    current_title = Column(String(100), nullable=True)
    current_company = Column(String(100), nullable=True)
    summary = Column(Text, nullable=True)
    education_summary = Column(Text, nullable=True)
    
    # AI Explanation & Stats
    strengths = Column(Text, nullable=True)  # JSON-encoded array or text
    weaknesses = Column(Text, nullable=True) # JSON-encoded array or text
    career_growth_score = Column(Float, default=50.0)
    growth_analysis = Column(Text, nullable=True)
    missing_skills = Column(Text, nullable=True) # JSON-encoded array or text
    confidence_score = Column(Float, default=70.0)
    ranking_reason = Column(Text, nullable=True)
    interview_questions = Column(Text, nullable=True) # JSON-encoded array or text
    
    status = Column(String(50), default="New") # New, Shortlisted, Interviewed, Rejected, Hired
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    candidate_skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="candidate", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="candidate", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="candidate", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="candidate", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")
    rankings = relationship("Ranking", back_populates="candidate", cascade="all, delete-orphan")
    shortlists = relationship("Shortlist", back_populates="candidate", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="candidate", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=True) # Technical, Soft, Language, etc.
    
    candidate_skills = relationship("CandidateSkill", back_populates="skill")
    job_skills = relationship("JobSkill", back_populates="skill")

class CandidateSkill(Base):
    __tablename__ = "candidate_skills"
    
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    proficiency = Column(String(50), default="Intermediate") # Beginner, Intermediate, Advanced
    years_experience = Column(Float, default=0.0)
    
    candidate = relationship("Candidate", back_populates="candidate_skills")
    skill = relationship("Skill", back_populates="candidate_skills")

class JobSkill(Base):
    __tablename__ = "job_skills"
    
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    importance = Column(String(50), default="Required") # Required, Preferred
    
    job = relationship("Job", back_populates="job_skills")
    skill = relationship("Skill", back_populates="job_skills")

class Experience(Base):
    __tablename__ = "experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    company = Column(String(100), nullable=False)
    title = Column(String(100), nullable=False)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    responsibilities = Column(Text, nullable=True)
    skills_used = Column(Text, nullable=True) # Comma-separated or JSON
    
    candidate = relationship("Candidate", back_populates="experiences")

class Education(Base):
    __tablename__ = "educations"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    institution = Column(String(150), nullable=False)
    degree = Column(String(100), nullable=False)
    field_of_study = Column(String(100), nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    gpa = Column(Float, nullable=True)
    
    candidate = relationship("Candidate", back_populates="educations")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(Text, nullable=True) # Comma-separated or JSON
    url = Column(String(200), nullable=True)
    highlights = Column(Text, nullable=True) # Comma-separated or JSON
    
    candidate = relationship("Candidate", back_populates="projects")

class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    name = Column(String(150), nullable=False)
    issuing_organization = Column(String(150), nullable=False)
    issue_date = Column(String(50), nullable=True)
    expiration_date = Column(String(50), nullable=True)
    credential_id = Column(String(100), nullable=True)
    
    candidate = relationship("Candidate", back_populates="certificates")

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"))
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="Applied") # Applied, Reviewing, Shortlisted, Interviewed, Rejected, Offer
    match_score = Column(Float, default=0.0)
    
    candidate = relationship("Candidate", back_populates="applications")
    job = relationship("Job", back_populates="applications")

class Ranking(Base):
    __tablename__ = "rankings"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"))
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    rank = Column(Integer, nullable=False)
    
    # Weight breakdowns
    semantic_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    projects_score = Column(Float, default=0.0)
    education_score = Column(Float, default=0.0)
    certificates_score = Column(Float, default=0.0)
    career_progression_score = Column(Float, default=0.0)
    activity_score = Column(Float, default=0.0)
    
    final_score = Column(Float, default=0.0)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    job = relationship("Job", back_populates="rankings")
    candidate = relationship("Candidate", back_populates="rankings")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id", ondelete="CASCADE"))
    action = Column(String(100), nullable=False) # Create Job, Shortlist Candidate, Search, etc.
    target_type = Column(String(50), nullable=True) # candidate, job, user
    target_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    recruiter = relationship("Recruiter", back_populates="activity_logs")

class Shortlist(Base):
    __tablename__ = "shortlists"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"))
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    added_at = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text, nullable=True)
    
    job = relationship("Job", back_populates="shortlists")
    candidate = relationship("Candidate", back_populates="shortlists")

class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"))
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    scheduled_at = Column(DateTime, nullable=False)
    status = Column(String(50), default="Scheduled") # Scheduled, Completed, Cancelled
    type = Column(String(50), default="Technical Interview") # Technical, HR, Manager, Panel
    link = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    
    job = relationship("Job", back_populates="interviews")
    candidate = relationship("Candidate", back_populates="interviews")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")
