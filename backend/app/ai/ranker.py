import logging
from typing import Dict, Any, List
from backend.app.models.models import Candidate, Job, Skill

logger = logging.getLogger("ranker")

class RankingEngine:
    def calculate_score(self, candidate: Candidate, job: Job, semantic_similarity: float) -> Dict[str, Any]:
        """
        Calculates a composite score (0-100) using multi-signal weights.
        Returns the final score and individual component breakdowns.
        """
        # 1. Semantic Similarity - 40% (semantic_similarity is in range 0.0 to 1.0)
        semantic_score = float(semantic_similarity * 40.0)
        
        # 2. Experience - 20%
        experience_score = self._calculate_experience_score(candidate, job)
        
        # 3. Projects - 10%
        projects_score = self._calculate_projects_score(candidate, job)
        
        # 4. Education - 5%
        education_score = self._calculate_education_score(candidate)
        
        # 5. Certifications - 5%
        certificates_score = self._calculate_certificates_score(candidate)
        
        # 6. Career Progression - 10%
        career_progression_score = self._calculate_career_progression(candidate)
        
        # 7. Portfolio & GitHub - 5%
        activity_signals = self._calculate_portfolio_signals(candidate)
        
        # 8. Recruiter Activity Signals - 5%
        recruiter_activity_score = self._calculate_activity_signals(candidate)
        
        # Sum components
        final_score = (
            semantic_score + 
            experience_score + 
            projects_score + 
            education_score + 
            certificates_score + 
            career_progression_score + 
            activity_signals + 
            recruiter_activity_score
        )
        
        # Round values for display
        return {
            "semantic_score": round(semantic_score, 1),
            "experience_score": round(experience_score, 1),
            "projects_score": round(projects_score, 1),
            "education_score": round(education_score, 1),
            "certificates_score": round(certificates_score, 1),
            "career_progression_score": round(career_progression_score, 1),
            "activity_score": round(activity_signals, 1), # portfolio/git signals
            "recruiter_activity_score": round(recruiter_activity_score, 1), # active logs signals
            "final_score": round(final_score, 1)
        }

    def _calculate_experience_score(self, candidate: Candidate, job: Job) -> float:
        # Determine job required experience level
        job_level = (job.experience_level or "mid").lower()
        cand_years = candidate.experience_years or 0.0
        
        max_points = 20.0
        
        if "junior" in job_level:
            if cand_years >= 1.0 and cand_years <= 3.0:
                return max_points
            elif cand_years > 3.0:
                return max_points - 2.0 # Slightly overqualified for junior
            else:
                return (cand_years / 1.0) * max_points if cand_years > 0 else 5.0
                
        elif "senior" in job_level or "lead" in job_level:
            if cand_years >= 6.0:
                return max_points
            elif cand_years >= 4.0:
                return max_points - 5.0 # 15 pts
            elif cand_years >= 2.0:
                return max_points - 10.0 # 10 pts
            else:
                return 4.0
                
        else: # Mid level
            if cand_years >= 3.0 and cand_years <= 6.0:
                return max_points
            elif cand_years > 6.0:
                return max_points # More is fine
            elif cand_years >= 1.5:
                return max_points - 5.0 # 15 pts
            else:
                return 6.0

    def _calculate_projects_score(self, candidate: Candidate, job: Job) -> float:
        projects = candidate.projects
        if not projects:
            return 2.0 # Minimum baseline for having projects section
            
        points = len(projects) * 3.0 # 3 pts per project
        points = min(points, 8.0) # Up to 8 points for quantity
        
        # Check description keyword matches (up to 2 extra points)
        desc_matches = 0
        job_desc_lower = (job.description or "").lower()
        for proj in projects:
            proj_desc = (proj.description or "").lower()
            proj_tech = (proj.technologies or "").lower()
            # If any technologies from job are mentioned in projects
            for word in ["react", "python", "aws", "docker", "kubernetes", "typescript", "postgres"]:
                if word in job_desc_lower and (word in proj_desc or word in proj_tech):
                    desc_matches += 1
                    break
                    
        points += min(desc_matches * 1.0, 2.0)
        return min(points, 10.0)

    def _calculate_education_score(self, candidate: Candidate) -> float:
        educations = candidate.educations
        if not educations:
            return 2.0
            
        max_edu_points = 2.0
        for edu in educations:
            deg = (edu.degree or "").lower()
            if "phd" in deg or "doctor" in deg:
                max_edu_points = max(max_edu_points, 5.0)
            elif "master" in deg or "ms" in deg or "mba" in deg:
                max_edu_points = max(max_edu_points, 4.5)
            elif "bachelor" in deg or "bs" in deg or "ba" in deg:
                max_edu_points = max(max_edu_points, 4.0)
                
        return max_edu_points

    def _calculate_certificates_score(self, candidate: Candidate) -> float:
        certs = candidate.certificates
        if not certs:
            return 1.5 # baseline
        count = len(certs)
        if count == 1:
            return 3.5
        elif count >= 2:
            return 5.0
        return 1.5

    def _calculate_career_progression(self, candidate: Candidate) -> float:
        experiences = candidate.experiences
        if not experiences:
            return 3.0
            
        points = 5.0 # Baseline for stable work history
        
        # 1. Job stability (avoid high hopping, e.g. average job length)
        # 2. Upward mobility in title (Junior -> Mid -> Senior)
        titles = [exp.title.lower() for exp in experiences if exp.title]
        
        # Upward mobility indicators
        has_senior = any("senior" in t or "lead" in t or "principal" in t for t in titles[:2]) # Recent title
        has_junior = any("junior" in t or "associate" in t or "intern" in t for t in titles[2:]) # Older title
        
        if has_senior and has_junior:
            points += 3.0 # Demonstrated career progression
        elif has_senior:
            points += 2.0 # Solid current standing
            
        # Add points for tenure stability
        if len(experiences) > 0:
            avg_tenure = (candidate.experience_years or 0.0) / len(experiences)
            if avg_tenure >= 2.0:
                points += 2.0
            elif avg_tenure >= 1.0:
                points += 1.0
                
        return min(points, 10.0)

    def _calculate_portfolio_signals(self, candidate: Candidate) -> float:
        points = 1.0 # baseline
        if candidate.github_url:
            points += 2.0
        if candidate.portfolio_url:
            points += 1.5
        if candidate.linkedin_url:
            points += 0.5
        return min(points, 5.0)

    def _calculate_activity_signals(self, candidate: Candidate) -> float:
        """
        Activity score out of 5 based on candidates details:
        e.g. status changes, shortlists, resume update date.
        """
        points = 2.0 # baseline
        if candidate.status in ["Shortlisted", "Interviewed"]:
            points += 2.0
        if candidate.parsed_at:
            points += 1.0 # recently processed
        return min(points, 5.0)

# Singleton instance
ranking_engine = RankingEngine()
