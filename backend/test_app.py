import pytest
from backend.app.ai.ranker import ranking_engine
from backend.app.auth.jwt import get_password_hash, verify_password, create_access_token
from backend.app.models.models import Candidate, Job, Skill, CandidateSkill

def test_password_hashing():
    """Verify bcrypt hash generation and evaluation."""
    password = "MySecurePassword123"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_jwt_generation():
    """Verify access token encryption and structure."""
    payload = {"sub": "recruiter@talentmind.ai", "role": "recruiter"}
    token = create_access_token(data=payload)
    assert isinstance(token, str)
    assert len(token) > 20

def test_ranking_math_logic():
    """Verify weighted candidate scoring coordinates correctly (total bounds)."""
    # Create mock database objects
    job = Job(
        title="Python Developer",
        description="Write Python code and cloud microservices using FastAPI and AWS.",
        experience_level="Mid"
    )
    
    cand = Candidate(
        first_name="Alice",
        last_name="Smith",
        experience_years=4.0, # Fits mid-level (20 pts)
        linkedin_url="https://linkedin.com/in/alice",
        github_url="https://github.com/alice", # Has git + linkedin (4 pts)
        status="New"
    )
    
    # Calculate scores with a semantic score of 0.8 (which yields 0.8 * 40 = 32 pts)
    scores = ranking_engine.calculate_score(cand, job, semantic_similarity=0.8)
    
    assert "final_score" in scores
    assert "semantic_score" in scores
    assert "experience_score" in scores
    assert "projects_score" in scores
    assert "education_score" in scores
    
    # Check bounds
    assert 0 <= scores["final_score"] <= 100
    assert scores["semantic_score"] == 32.0
    assert scores["experience_score"] == 20.0
