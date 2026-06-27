import os
import random
import logging
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from backend.app.database.connection import SessionLocal, init_db, engine
from backend.app.models.models import (
    User, Recruiter, Job, Candidate, Skill, CandidateSkill, JobSkill, 
    Experience, Education, Project, Certificate, Ranking, Shortlist, Interview, ActivityLog, Notification
)
from backend.app.auth.jwt import get_password_hash
from backend.app.ai.embeddings import embedding_service
from backend.app.ai.chroma_client import chroma_client
from backend.app.ai.llm import llm_provider
from backend.app.ai.ranker import ranking_engine
from backend.app.services.candidate_service import candidate_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

# Predefined datasets for procedural generation
FIRST_NAMES = [
    "John", "Sarah", "David", "Emily", "Michael", "Jessica", "James", "Amanda", "Robert", "Ashley",
    "William", "Olivia", "Daniel", "Sophia", "Matthew", "Isabella", "Joseph", "Mia", "Christopher", "Charlotte",
    "Andrew", "Amelia", "Ryan", "Evelyn", "Nicholas", "Abigail", "Brandon", "Harper", "Kevin", "Emily",
    "Alex", "Rachel", "Arjun", "Priya", "Vikram", "Neha", "Rahul", "Anjali", "Siddharth", "Tanvi",
    "Yusuf", "Amina", "Kenji", "Hana", "Chen", "Wei", "Carlos", "Elena", "Lucas", "Sofia"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Sharma", "Patel", "Mehta", "Rao", "Joshi", "Das", "Nair", "Reddy", "Sen", "Gupta",
    "Sato", "Tanaka", "Watanabe", "Suzuki", "Kim", "Park", "Silva", "Santos", "Gomez", "Fernandez"
]

COMPANIES = [
    "Google", "Meta", "Apple", "Netflix", "Amazon", "Microsoft", "Stripe", "Airbnb", "Uber", "Lyft",
    "Salesforce", "Slack", "Zoom", "Figma", "Canva", "Spotify", "Shopify", "HubSpot", "Atlassian", "Datadog",
    "Snowflake", "HashiCorp", "Confluent", "Vercel", "Supabase", "OpenAI", "Anthropic", "Scale AI", "Linear", "Notion"
]

UNIVERSITIES = [
    "Stanford University", "Massachusetts Institute of Technology", "University of California, Berkeley",
    "Carnegie Mellon University", "Harvard University", "California Institute of Technology", 
    "Georgia Institute of Technology", "University of Washington", "University of Michigan", "Cornell University",
    "Indian Institute of Technology, Bombay", "Indian Institute of Technology, Delhi",
    "University of Toronto", "Oxford University", "Cambridge University", "Tsinghua University"
]

DEGREES = [
    "B.S.", "B.Eng.", "M.S.", "M.Eng.", "Ph.D.", "B.Tech.", "M.Tech."
]

MAJORS = [
    "Computer Science", "Software Engineering", "Electrical Engineering", "Data Science", 
    "Information Technology", "Computer Engineering", "Human-Computer Interaction"
]

TITLES = [
    "Software Engineer", "Senior Software Engineer", "Frontend Developer", "Backend Engineer", 
    "Full Stack Engineer", "DevOps Engineer", "Cloud Architect", "Machine Learning Engineer",
    "Data Scientist", "Mobile Developer", "QA Automation Engineer", "Product Engineer",
    "Systems Engineer", "Security Engineer", "Engineering Manager"
]

LOCATIONS = [
    "San Francisco, CA", "Seattle, WA", "New York, NY", "Austin, TX", "Boston, MA", 
    "Chicago, IL", "Remote", "London, UK", "Toronto, ON", "Bangalore, India"
]

SKILLS_POOL = {
    "Languages": ["Python", "JavaScript", "TypeScript", "Go", "Rust", "Java", "C++", "C#", "Kotlin", "Swift"],
    "Frameworks": ["React", "Next.js", "Vue", "Angular", "FastAPI", "Express", "Django", "Flask", "Spring Boot"],
    "Databases": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra", "DynamoDB"],
    "Cloud & DevOps": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions"],
    "AI/ML": ["PyTorch", "TensorFlow", "scikit-learn", "NLTK", "OpenCV", "Hugging Face", "ChromaDB"],
    "General": ["Git", "Agile", "Scrum", "REST APIs", "GraphQL", "System Design", "Microservices"]
}

CERTIFICATES_POOL = [
    ("AWS Certified Solutions Architect", "Amazon Web Services"),
    ("Certified Kubernetes Administrator (CKA)", "The Linux Foundation"),
    ("Google Cloud Professional Cloud Architect", "Google Cloud"),
    ("HashiCorp Certified: Terraform Associate", "HashiCorp"),
    ("Microsoft Certified: Azure Solutions Architect Expert", "Microsoft"),
    ("Certified ScrumMaster (CSM)", "Scrum Alliance"),
    ("TensorFlow Developer Certificate", "Google")
]

PROJECT_TITLES = [
    "Distributed Key-Value Store", "Serverless E-Commerce Backend", "AI-Powered Chat Assistant",
    "Real-time Video Analytics Pipeline", "Kubernetes Native Deployment Operator", "GraphQL Gateway Engine",
    "Collaborative Design Canvas", "Microservices Event Broker", "Automated Resume Screener",
    "DeFi Yield Aggregator Protocol", "Intelligent Cache Middleware", "Multi-Tenant CRM Dashboard"
]

# 20 Sample Jobs to Seed
JOBS_DATA = [
    {"title": "Senior Full Stack Engineer", "dept": "Product Engineering", "loc": "San Francisco, CA", "type": "Full-time", "level": "Senior", "skills": ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "AWS"]},
    {"title": "Backend Python Developer", "dept": "Platform Services", "loc": "Remote", "type": "Full-time", "level": "Mid", "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"]},
    {"title": "Cloud Infrastructure Architect", "dept": "DevOps / Infrastructure", "loc": "Seattle, WA", "type": "Full-time", "level": "Senior", "skills": ["AWS", "Kubernetes", "Terraform", "Go", "Docker", "GitHub Actions"]},
    {"title": "Machine Learning Engineer", "dept": "Artificial Intelligence", "loc": "New York, NY", "type": "Full-time", "level": "Mid", "skills": ["Python", "PyTorch", "TensorFlow", "scikit-learn", "ChromaDB"]},
    {"title": "Frontend UI Developer", "dept": "Design & Frontend", "loc": "Remote", "type": "Contract", "level": "Mid", "skills": ["JavaScript", "React", "Next.js", "Tailwind", "CSS"]},
    {"title": "DevOps Engineer", "dept": "DevOps / Infrastructure", "loc": "Austin, TX", "type": "Full-time", "level": "Mid", "skills": ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform", "Python"]},
    {"title": "Junior Backend Developer", "dept": "Product Engineering", "loc": "Boston, MA", "type": "Full-time", "level": "Junior", "skills": ["Java", "Spring Boot", "MySQL", "Git", "REST APIs"]},
    {"title": "Android Mobile Engineer", "dept": "Mobile Applications", "loc": "Remote", "type": "Full-time", "level": "Mid", "skills": ["Kotlin", "Java", "Android", "Git"]},
    {"title": "iOS Developer", "dept": "Mobile Applications", "loc": "San Francisco, CA", "type": "Full-time", "level": "Senior", "skills": ["Swift", "iOS", "Git", "REST APIs"]},
    {"title": "QA Automation Specialist", "dept": "Quality Assurance", "loc": "Chicago, IL", "type": "Full-time", "level": "Mid", "skills": ["Python", "Selenium", "Cypress", "Git", "REST APIs"]},
    {"title": "Staff ML Systems Architect", "dept": "Artificial Intelligence", "loc": "San Francisco, CA", "type": "Full-time", "level": "Lead", "skills": ["Python", "PyTorch", "C++", "Docker", "Kubernetes", "System Design"]},
    {"title": "Product Engineer (NextJS)", "dept": "Product Engineering", "loc": "Remote", "type": "Full-time", "level": "Mid", "skills": ["TypeScript", "Next.js", "React", "Tailwind", "PostgreSQL"]},
    {"title": "Data Scientist", "dept": "Data Analytics", "loc": "New York, NY", "type": "Full-time", "level": "Mid", "skills": ["Python", "Pandas", "SQL", "scikit-learn", "TensorFlow"]},
    {"title": "Security Compliance Engineer", "dept": "SecOps", "loc": "Remote", "type": "Full-time", "level": "Senior", "skills": ["Python", "AWS", "Docker", "Git"]},
    {"title": "Golang Platforms Engineer", "dept": "Platform Services", "loc": "Seattle, WA", "type": "Full-time", "level": "Senior", "skills": ["Go", "Kubernetes", "Docker", "Redis", "gRPC"]},
    {"title": "Technical Product Manager", "dept": "Product Management", "loc": "San Francisco, CA", "type": "Full-time", "level": "Senior", "skills": ["Agile", "Scrum", "REST APIs", "System Design"]},
    {"title": "Database Reliability Engineer", "dept": "DevOps / Infrastructure", "loc": "Austin, TX", "type": "Full-time", "level": "Senior", "skills": ["PostgreSQL", "Redis", "AWS", "Terraform", "Go"]},
    {"title": "Data Platform Developer", "dept": "Data Analytics", "loc": "Remote", "type": "Full-time", "level": "Mid", "skills": ["Python", "Go", "PostgreSQL", "Docker", "Apache Spark"]},
    {"title": "Senior React Native Engineer", "dept": "Mobile Applications", "loc": "Remote", "type": "Full-time", "level": "Senior", "skills": ["TypeScript", "React", "JavaScript", "iOS", "Android"]},
    {"title": "Systems Integrator (Rust)", "dept": "Platform Services", "loc": "Boston, MA", "type": "Full-time", "level": "Senior", "skills": ["Rust", "C++", "Go", "Docker", "System Design"]}
]

def seed_db():
    init_db()
    db = SessionLocal()
    
    try:
        # Check if user already seeded
        recruiter_exists = db.query(User).filter(User.email == "recruiter@talentmind.ai").first()
        if recruiter_exists:
            logger.info("Database already seeded. Skipping...")
            return
            
        logger.info("Seeding users & recruiter profiles...")
        # Create default recruiter
        user_hashed_pass = get_password_hash("Password123")
        rec_user = User(
            email="recruiter@talentmind.ai",
            hashed_password=user_hashed_pass,
            full_name="Samantha Mercer",
            role="recruiter"
        )
        db.add(rec_user)
        db.flush()
        
        rec_profile = Recruiter(
            user_id=rec_user.id,
            company_name="TalentMind AI Innovations",
            title="Principal AI Recruiter",
            department="Global Talent Operations"
        )
        db.add(rec_profile)
        db.flush()
        
        # Create Admin Account
        admin_user = User(
            email="admin@talentmind.ai",
            hashed_password=user_hashed_pass,
            full_name="Admin Director",
            role="admin"
        )
        db.add(admin_user)
        db.flush()
        
        # 1. Create Skills in database
        logger.info("Seeding tech skills list...")
        skills_map = {} # Maps name to skill instance
        for cat, sks in SKILLS_POOL.items():
            for name in sks:
                skill = db.query(Skill).filter(Skill.name == name).first()
                if not skill:
                    skill = Skill(name=name, category=cat)
                    db.add(skill)
                    db.flush()
                skills_map[name] = skill
                
        # Extra skills mentioned in JOBS_DATA
        for job_info in JOBS_DATA:
            for s_name in job_info["skills"]:
                if s_name not in skills_map:
                    skill = Skill(name=s_name, category="Technical")
                    db.add(skill)
                    db.flush()
                    skills_map[s_name] = skill
                    
        # 2. Seeding Job Listings
        logger.info("Seeding Job Descriptions...")
        jobs = []
        for idx, job_info in enumerate(JOBS_DATA):
            skills_list_str = ", ".join(job_info["skills"])
            description = (
                f"We are looking for a skilled {job_info['title']} to join our growing {job_info['dept']} department. "
                f"In this role, you will help architecture, develop, and maintain high-performance software modules. "
                f"You will work closely with other team members in an agile environment.\n\n"
                f"Required Technologies: {skills_list_str}.\n"
                f"Key Responsibilities:\n"
                f"- Architect scalable backend and frontend microservices.\n"
                f"- Code and test reliable production workflows.\n"
                f"- Collaborate via Git and Jira in daily standups."
            )
            
            job = Job(
                recruiter_id=rec_profile.id,
                title=job_info["title"],
                description=description,
                department=job_info["dept"],
                location=job_info["loc"],
                type=job_info["type"],
                experience_level=job_info["level"],
                status="Active"
            )
            db.add(job)
            db.flush()
            jobs.append(job)
            
            # Add JobSkills
            for s_name in job_info["skills"]:
                job_skill = JobSkill(
                    job_id=job.id,
                    skill_id=skills_map[s_name].id,
                    importance="Required"
                )
                db.add(job_skill)
                
            # Create Job Embedding & Add to ChromaDB
            job_text = f"{job.title} {job.description}"
            job_embedding = embedding_service.get_embedding(job_text)
            chroma_client.add_job(
                job_id=job.id,
                embedding=job_embedding,
                metadata={
                    "job_id": job.id,
                    "title": job.title,
                    "department": job.department,
                    "location": job.location
                },
                document=job_text
            )
            
        # 3. Seeding 100+ candidates procedurally
        logger.info("Generating 105 realistic candidate resumes & profiles...")
        candidates = []
        for i in range(1, 106):
            # Select names, locations
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            email = f"{first_name.lower()}.{last_name.lower()}.{i}@talentmind-candidate.io"
            phone = f"+1 (555) {random.randint(100, 999)}-{random.randint(1000, 9999)}"
            location = random.choice(LOCATIONS)
            
            # Select titles, years exp
            experience_years = round(random.uniform(0.5, 14.0), 1)
            if experience_years < 3.0:
                current_title = f"Junior {random.choice(['Software Engineer', 'Frontend Engineer', 'Backend Developer'])}"
            elif experience_years < 8.0:
                current_title = random.choice(TITLES)
            else:
                current_title = f"Senior {random.choice(TITLES)}"
                
            current_company = random.choice(COMPANIES)
            
            # Select skills
            # Random pick 6 to 12 skills
            candidate_skills_list = []
            categories = list(SKILLS_POOL.keys())
            for _ in range(random.randint(6, 12)):
                cat = random.choice(categories)
                sk = random.choice(SKILLS_POOL[cat])
                if sk not in candidate_skills_list:
                    candidate_skills_list.append(sk)
            # Ensure skills are mapped in DB
            for sk_name in candidate_skills_list:
                if sk_name not in skills_map:
                    skill = Skill(name=sk_name, category="Technical")
                    db.add(skill)
                    db.flush()
                    skills_map[sk_name] = skill
                    
            summary_skills = ", ".join(candidate_skills_list[:4])
            summary = (
                f"Talented and motivated {current_title} with {experience_years} years of industry experience. "
                f"Proficient in building systems with {summary_skills}. Committed to team growth and coding standards."
            )
            
            # Select Status
            status_opts = ["New", "Shortlisted", "Interviewed", "Rejected", "Hired"]
            status_weights = [60, 15, 15, 10, 5]
            cand_status = random.choices(status_opts, weights=status_weights)[0]
            
            cand = Candidate(
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone,
                location=location,
                linkedin_url=f"https://linkedin.com/in/{first_name.lower()}-{last_name.lower()}-{i}",
                github_url=f"https://github.com/{first_name.lower()}{last_name.lower()}{i}" if random.random() > 0.3 else None,
                portfolio_url=f"https://{first_name.lower()}{last_name.lower()}.dev" if random.random() > 0.6 else None,
                experience_years=experience_years,
                current_title=current_title,
                current_company=current_company,
                summary=summary,
                education_summary="",
                status=cand_status,
                parsed_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )
            db.add(cand)
            db.flush()
            candidates.append(cand)
            
            # Add CandidateSkills
            for sk_name in candidate_skills_list:
                proficiency = random.choice(["Beginner", "Intermediate", "Advanced"])
                cand_skill = CandidateSkill(
                    candidate_id=cand.id,
                    skill_id=skills_map[sk_name].id,
                    proficiency=proficiency,
                    years_experience=round(experience_years * random.uniform(0.3, 0.8), 1)
                )
                db.add(cand_skill)
                
            # Add Educations
            edu_count = 1 if experience_years < 6.0 else 2
            edu_summaries = []
            for e_idx in range(edu_count):
                degree = random.choice(DEGREES)
                major = random.choice(MAJORS)
                univ = random.choice(UNIVERSITIES)
                gpa = round(random.uniform(3.0, 4.0), 2)
                
                # dates
                end_yr = 2026 - random.randint(0, int(experience_years))
                start_yr = end_yr - 4
                
                edu = Education(
                    candidate_id=cand.id,
                    institution=univ,
                    degree=degree,
                    field_of_study=major,
                    start_date=str(start_yr),
                    end_date=str(end_yr),
                    gpa=gpa
                )
                db.add(edu)
                edu_summaries.append(f"{degree} in {major} from {univ}")
                
            cand.education_summary = " and ".join(edu_summaries)
            
            # Add Experiences (1 to 3 recent jobs)
            exp_count = random.randint(1, 3)
            for x_idx in range(exp_count):
                comp = random.choice(COMPANIES)
                title = random.choice(TITLES)
                is_curr = (x_idx == 0)
                
                start_yr = 2026 - int(experience_years) + x_idx * 2
                end_yr = "Present" if is_curr else str(start_yr + 2)
                
                description = (
                    f"Developed mission-critical web software using {', '.join(candidate_skills_list[:3])}. "
                    f"Collaborated with project leads to define technical layouts. Optimized system components."
                )
                
                exp = Experience(
                    candidate_id=cand.id,
                    company=comp,
                    title=title,
                    start_date=str(start_yr),
                    end_date=end_yr,
                    is_current=is_curr,
                    description=description,
                    responsibilities=description
                )
                db.add(exp)
                
            # Add Projects (1 to 2)
            proj_count = random.randint(1, 2)
            for p_idx in range(proj_count):
                proj_title = random.choice(PROJECT_TITLES)
                proj_tech = ", ".join(candidate_skills_list[2:5])
                proj = Project(
                    candidate_id=cand.id,
                    title=proj_title,
                    description=f"Developed an open source {proj_title.lower()} system implementing {proj_tech}.",
                    technologies=proj_tech
                )
                db.add(proj)
                
            # Add Certifications (0 to 2)
            cert_count = random.randint(0, 2)
            for c_idx in range(cert_count):
                cert_name, cert_org = random.choice(CERTIFICATES_POOL)
                cert = Certificate(
                    candidate_id=cand.id,
                    name=cert_name,
                    issuing_organization=cert_org,
                    issue_date="2023"
                )
                db.add(cert)
                
            # Compile Resume Text for Indexing
            resume_text = (
                f"{cand.first_name} {cand.last_name}\n"
                f"Location: {cand.location}\n"
                f"Summary: {cand.summary}\n"
                f"Experience:\n" + f"Current: {cand.current_title} at {cand.current_company}\n"
                f"Skills: {', '.join(candidate_skills_list)}\n"
                f"Education: {cand.education_summary}"
            )
            cand.resume_text = resume_text
            
            # Embed candidate and add to ChromaDB
            text_to_embed = f"{cand.current_title} {cand.summary} " + " ".join(candidate_skills_list)
            cand_embedding = embedding_service.get_embedding(text_to_embed)
            
            chroma_client.add_resume(
                candidate_id=cand.id,
                embedding=cand_embedding,
                metadata={
                    "id": cand.id,
                    "name": f"{cand.first_name} {cand.last_name}",
                    "experience_years": cand.experience_years,
                    "location": cand.location,
                    "current_title": cand.current_title
                },
                document=text_to_embed
            )
            
        db.commit()
        
        # 4. Trigger AI rankings for the first 3 Jobs to populate dashboards
        logger.info("Simulating initial AI rankings for main job listings...")
        for j in jobs[:3]:
            candidate_service.trigger_candidate_ranking(db, j.id)
            
        # 5. Populate initial Shortlists & Interviews
        logger.info("Simulating Shortlists & Scheduled Interviews...")
        ranked_top = db.query(Ranking).filter(Ranking.job_id == jobs[0].id).limit(5).all()
        for idx, r in enumerate(ranked_top):
            # Shortlist
            db_short = Shortlist(
                job_id=jobs[0].id,
                candidate_id=r.candidate_id,
                notes=f"Top AI ranked profile (Rank {r.rank})"
            )
            db.add(db_short)
            
            # Schedule Interview for top 2
            if idx < 2:
                scheduled_time = datetime.utcnow() + timedelta(days=idx+2, hours=10)
                db_int = Interview(
                    job_id=jobs[0].id,
                    candidate_id=r.candidate_id,
                    scheduled_at=scheduled_time,
                    type="Technical Assessment",
                    link="https://meet.google.com/xyz-123-abc",
                    notes="Automated scheduling from TalentMind ranking portal."
                )
                db.add(db_int)
                
        # 6. Add some ActivityLogs & Notifications
        logger.info("Adding recruiter activities logs and system alerts...")
        log1 = ActivityLog(recruiter_id=rec_profile.id, action="Create Job", target_type="job", target_id=jobs[0].id, details="Created Senior Full Stack Engineer role")
        log2 = ActivityLog(recruiter_id=rec_profile.id, action="Create Job", target_type="job", target_id=jobs[1].id, details="Created Backend Python Developer role")
        log3 = ActivityLog(recruiter_id=rec_profile.id, action="AI Rank", target_type="job", target_id=jobs[0].id, details="Calculated fit score for 100+ profiles")
        db.add_all([log1, log2, log3])
        
        notif = Notification(
            user_id=rec_user.id,
            title="Resume Processing Complete",
            message="Successfully processed 105 resumes in candidate discovering pipeline.",
            is_read=False
        )
        db.add(notif)
        
        db.commit()
        logger.info("Database successfully seeded with TalentMind AI mock datasets!")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}", exc_info=True)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
