export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface Recruiter {
  id: number;
  user_id: number;
  company_name: string;
  title: string;
  department: string;
}

export interface Skill {
  id: number;
  name: string;
  category?: string;
}

export interface CandidateSkill {
  skill: Skill;
  proficiency: string;
  years_experience: number;
}

export interface JobSkill {
  skill: Skill;
  importance: string;
}

export interface Experience {
  id: number;
  company: string;
  title: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  responsibilities?: string;
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  gpa?: number;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  technologies?: string;
  url?: string;
}

export interface Certificate {
  id: number;
  name: string;
  issuing_organization: string;
  issue_date?: string;
}

export interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  experience_years: number;
  current_title?: string;
  current_company?: string;
  summary?: string;
  education_summary?: string;
  status: string;
  parsed_at?: string;
  created_at: string;
}

export interface CandidateDetail extends Candidate {
  strengths?: string; // JSON string encoded list
  weaknesses?: string; // JSON string encoded list
  missing_skills?: string; // JSON string encoded list
  career_growth_score: number;
  growth_analysis?: string;
  confidence_score: number;
  ranking_reason?: string;
  interview_questions?: string; // JSON string encoded list
  
  candidate_skills: CandidateSkill[];
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  certificates: Certificate[];
}

export interface Job {
  id: number;
  title: string;
  description: string;
  department?: string;
  location?: string;
  type: string;
  experience_level?: string;
  status: string;
  created_at: string;
  job_skills: JobSkill[];
}

export interface Ranking {
  id: number;
  job_id: number;
  candidate_id: number;
  rank: number;
  semantic_score: number;
  experience_score: number;
  projects_score: number;
  education_score: number;
  certificates_score: number;
  career_progression_score: number;
  activity_score: number;
  final_score: number;
  explanation?: string;
  created_at: string;
  candidate: Candidate;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DashboardMetrics {
  total_candidates: number;
  jobs_posted: number;
  active_searches: number;
  ai_ranked_today: number;
  shortlisted_candidates: number;
  interviews_scheduled: number;
}
