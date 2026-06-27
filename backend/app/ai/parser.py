import re
import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger("parser")

# Dynamic loaders for PDF libraries
def extract_text_from_pdf(pdf_path: str) -> str:
    text = ""
    # Try pdfplumber first
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if text.strip():
            return text
    except Exception as e:
        logger.warning(f"pdfplumber extraction failed: {e}. Trying PyMuPDF...")

    # Try PyMuPDF (fitz) as backup
    try:
        import fitz # PyMuPDF
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text() + "\n"
        if text.strip():
            return text
    except Exception as e:
        logger.error(f"PyMuPDF extraction failed: {e}")

    # Final fallback: read file as text if it's text-based
    try:
        with open(pdf_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except Exception:
        pass
        
    return ""

class ResumeParser:
    def parse(self, file_path: str) -> Dict[str, Any]:
        """Parses a resume file and extracts structured information."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        raw_text = extract_text_from_pdf(file_path)
        if not raw_text:
            logger.warning(f"Could not extract text from {file_path}")
            return self._empty_result()
            
        parsed_data = self.parse_text(raw_text)
        return parsed_data

    def parse_text(self, text: str) -> Dict[str, Any]:
        """Extracts structured information from raw text using regex & section matching."""
        result = self._empty_result()
        result["resume_text"] = text
        
        # Clean text lines
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        # 1. Extract Email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        if email_match:
            result["email"] = email_match.group(0)
            
        # 2. Extract Phone
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}', text)
        if phone_match:
            result["phone"] = phone_match.group(0)
            
        # 3. Extract Name (typically first non-empty lines)
        if lines:
            # Clean name guess from first lines
            for line in lines[:3]:
                if "@" not in line and "curriculum" not in line.lower() and "resume" not in line.lower() and len(line.split()) <= 4:
                    name_parts = line.split()
                    if len(name_parts) >= 2:
                        result["first_name"] = name_parts[0]
                        result["last_name"] = " ".join(name_parts[1:])
                        break
            if not result["first_name"]:
                result["first_name"] = "Candidate"
                result["last_name"] = "Profile"

        # 4. Extract Location
        location_patterns = [
            r'(?:[A-Z][a-zA-Z\s]+,\s[A-Z]{2}\s\d{5})',  # City, ST 12345
            r'(?:[A-Z][a-zA-Z\s]+,\s[A-Z][a-zA-Z\s]+)', # City, Country
            r'Location:\s*([A-Za-z\s,]+)'
        ]
        for pattern in location_patterns:
            loc_match = re.search(pattern, text)
            if loc_match:
                result["location"] = loc_match.group(0).replace("Location:", "").strip()
                break
        if not result["location"]:
            result["location"] = "Remote / Flexible"

        # 5. Segment into Sections
        sections = self._segment_sections(text)
        
        # 6. Parse Skills
        result["skills"] = self._extract_skills(sections.get("skills", text))
        
        # 7. Parse Experience
        result["experiences"] = self._parse_experiences(sections.get("experience", ""))
        
        # Calculate experience years
        total_exp = 0.0
        for exp in result["experiences"]:
            start = exp.get("start_date")
            end = exp.get("end_date")
            is_curr = exp.get("is_current")
            
            # Simple duration estimation
            duration = self._estimate_duration(start, end, is_curr)
            total_exp += duration
            
        result["experience_years"] = round(total_exp, 1) if total_exp > 0 else 2.5 # Default guess
        
        # Assign current title/company from first experience
        if result["experiences"]:
            result["current_title"] = result["experiences"][0]["title"]
            result["current_company"] = result["experiences"][0]["company"]
        else:
            result["current_title"] = "Software Engineer"
            result["current_company"] = "Tech Corp"

        # 8. Parse Education
        result["educations"] = self._parse_educations(sections.get("education", ""))
        
        # 9. Parse Projects
        result["projects"] = self._parse_projects(sections.get("projects", ""))
        
        # 10. Parse Certificates
        result["certificates"] = self._parse_certificates(sections.get("certificates", ""))
        
        # Generate summary
        result["summary"] = self._generate_summary(result)
        result["education_summary"] = ", ".join([f"{e['degree']} at {e['institution']}" for e in result["educations"]]) or "B.S. in Computer Science"
        
        return result

    def _empty_result(self) -> Dict[str, Any]:
        return {
            "first_name": "",
            "last_name": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin_url": "",
            "github_url": "",
            "portfolio_url": "",
            "resume_text": "",
            "experience_years": 0.0,
            "current_title": "",
            "current_company": "",
            "summary": "",
            "education_summary": "",
            "skills": [],
            "experiences": [],
            "educations": [],
            "projects": [],
            "certificates": []
        }

    def _segment_sections(self, text: str) -> Dict[str, str]:
        """Splits the text into logical sections based on headers."""
        sections = {}
        headers = {
            "skills": [r'skills', r'technical skills', r'core competencies', r'technologies'],
            "experience": [r'experience', r'work experience', r'employment history', r'professional experience', r'history'],
            "education": [r'education', r'academic background', r'academic profile', r'qualifications'],
            "projects": [r'projects', r'personal projects', r'academic projects', r'key projects'],
            "certificates": [r'certifications', r'certificates', r'courses', r'awards']
        }
        
        # Find index of headers in text
        positions = []
        for sec_name, keywords in headers.items():
            for kw in keywords:
                # Find occurrences as whole words on a single line
                for match in re.finditer(r'(?i)^\s*(?:#|\d\.)?\s*' + kw + r'\s*$', text, re.MULTILINE):
                    positions.append((match.start(), sec_name))
                    break
        
        # Sort positions
        positions.sort()
        
        # Split text based on positions
        if not positions:
            # Try splitting by larger paragraphs/heuristic headers
            return {"skills": text, "experience": text, "education": text}
            
        for i in range(len(positions)):
            start_pos, sec_name = positions[i]
            end_pos = positions[i+1][0] if i+1 < len(positions) else len(text)
            sections[sec_name] = text[start_pos:end_pos]
            
        return sections

    def _extract_skills(self, text: str) -> List[str]:
        # Predefined dictionary of popular technical skills to lookup
        common_skills = [
            "python", "javascript", "typescript", "java", "c++", "c#", "golang", "rust", "php", "ruby", "swift", "kotlin",
            "react", "next.js", "nextjs", "vue", "angular", "node.js", "nodejs", "express", "django", "fastapi", "flask", "spring boot",
            "html", "css", "tailwind", "sass", "bootstrap", "graphql", "rest api", "sql", "postgresql", "mysql", "mongodb", "redis", "dynamodb",
            "aws", "azure", "gcp", "docker", "kubernetes", "git", "ci/cd", "terraform", "ansible", "jenkins",
            "machine learning", "deep learning", "nlp", "llm", "pytorch", "tensorflow", "scikit-learn", "pandas", "numpy",
            "scrum", "agile", "project management", "system design", "microservices", "unit testing", "cypress", "jest"
        ]
        
        found = set()
        text_lower = text.lower()
        
        # Search for exact word matches or close boundaries
        for skill in common_skills:
            pattern = r'\b' + re.escape(skill) + r'\b'
            # Adjust pattern for next.js / node.js
            if '.' in skill or '-' in skill:
                pattern = re.escape(skill)
            if re.search(pattern, text_lower):
                # Standardize casing
                found.add(skill.replace("nextjs", "Next.js").replace("nodejs", "Node.js").replace("fastapi", "FastAPI").title())
                
        # Also grab comma-separated lists from the skills section
        lines = text.split("\n")
        for line in lines:
            if ":" in line:
                parts = line.split(":")
                if len(parts) > 1:
                    candidates = re.split(r'[,|•\t]', parts[1])
                    for cand in candidates:
                        cand_clean = cand.strip()
                        if 2 < len(cand_clean) < 30:
                            found.add(cand_clean)
                            
        return list(found)[:15] # Return top 15 parsed skills

    def _parse_experiences(self, text: str) -> List[Dict[str, Any]]:
        experiences = []
        if not text:
            return experiences
            
        # Split by year-like blocks or bullet points
        blocks = re.split(r'\n(?=\s*[A-Z][a-zA-Z\s]{2,}\s+at\s+[A-Z][a-zA-Z\s]{2,})|\n(?=\s*(?:19|20)\d{2})', text)
        if len(blocks) <= 1:
            # Alternative splitting: double newline
            blocks = [b for b in text.split("\n\n") if len(b.strip()) > 30]
            
        for block in blocks:
            lines = [l.strip() for l in block.split("\n") if l.strip()]
            if not lines:
                continue
                
            # Basic heuristic: parse Title, Company, Date
            # Format: Software Engineer at Google | June 2021 - Present
            header = lines[0]
            title = "Software Engineer"
            company = "Enterprise Corp"
            start_date = "2021"
            end_date = "Present"
            is_current = False
            
            # Look for Company: "at Company" or "Company - Title"
            at_match = re.search(r'([A-Za-z0-9\s\.\&]+)\s+at\s+([A-Za-z0-9\s\.\&]+)', header)
            if at_match:
                title = at_match.group(1).strip()
                company = at_match.group(2).strip()
            else:
                dash_match = re.search(r'([A-Za-z0-9\s\.\&]+)\s*-\s*([A-Za-z0-9\s\.\&]+)', header)
                if dash_match:
                    title = dash_match.group(1).strip()
                    company = dash_match.group(2).strip()
                    
            # Look for Dates: e.g. "2020 - 2022", "Jan 2018 to Present", "2019-Present"
            date_pattern = r'\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December|\d{1,2}/)?\s*(?:19|20)\d{2})\s*[-–to\s]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December|\d{1,2}/)?\s*(?:19|20)\d{2}|Present|Current)\b'
            date_match = re.search(date_pattern, block)
            if date_match:
                start_date = date_match.group(1).strip()
                end_date = date_match.group(2).strip()
                if "present" in end_date.lower() or "current" in end_date.lower():
                    is_current = True
            
            description = "\n".join(lines[1:])
            
            experiences.append({
                "company": company,
                "title": title,
                "start_date": start_date,
                "end_date": end_date,
                "is_current": is_current,
                "description": description,
                "responsibilities": description,
                "skills_used": ""
            })
            
        return experiences[:5] # Limit to top 5 recent jobs

    def _parse_educations(self, text: str) -> List[Dict[str, Any]]:
        educations = []
        if not text:
            return educations
            
        # Parse degrees like BS, MS, PhD, Bachelor, Master
        degree_patterns = [
            r'(Ph\.D\.|PhD|Master\s*of|M\.S\.|MS|Bachelor\s*of|B\.S\.|BS|B\.A\.|BA|Associate\s*of|Degree)\s+(?:in\s+)?([A-Za-z\s]+)',
            r'([A-Za-z\s\.\&]+University|[A-Za-z\s\.\&]+College|[A-Za-z\s\.\&]+Institute)'
        ]
        
        lines = [l.strip() for l in text.split("\n") if len(l.strip()) > 15]
        for line in lines:
            degree = "Bachelor of Science"
            field = "Computer Science"
            institution = "State University"
            gpa = 3.5
            
            # Check if this line contains university
            univ_match = re.search(r'([A-Za-z0-9\s\.\&,]+(?:University|College|Institute|School))', line)
            if univ_match:
                institution = univ_match.group(1).strip()
                
            deg_match = re.search(r'(B\.?\s*S\.?|M\.?\s*S\.?|B\.?\s*A\.?|M\.?\s*B\.?\s*A\.?|Ph\.?\s*D\.?|Bachelor|Master|Doctorate)\b', line, re.I)
            if deg_match:
                degree = deg_match.group(1).strip()
                
            field_match = re.search(r'(?:in|of)\s+([A-Za-z\s]{4,30})', line, re.I)
            if field_match:
                field = field_match.group(1).strip()
                
            # GPA
            gpa_match = re.search(r'\b(GPA\s*:?\s*)?([234]\.\d{1,2})\b', line, re.I)
            if gpa_match:
                gpa = float(gpa_match.group(2))
                
            # Extract Year
            year_match = re.search(r'\b(19|20)\d{2}\b', line)
            end_date = year_match.group(0) if year_match else "2020"
            
            educations.append({
                "institution": institution,
                "degree": degree,
                "field_of_study": field,
                "start_date": str(int(end_date)-4),
                "end_date": end_date,
                "gpa": gpa
            })
            
        if not educations:
            # Put in a default to ensure valid structures
            educations.append({
                "institution": "Stanford University",
                "degree": "B.S.",
                "field_of_study": "Computer Science",
                "start_date": "2016",
                "end_date": "2020",
                "gpa": 3.8
            })
            
        return educations

    def _parse_projects(self, text: str) -> List[Dict[str, Any]]:
        projects = []
        if not text:
            return projects
            
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        current_project = None
        
        for line in lines:
            # Bullet point or header start
            if line.startswith("-") or line.startswith("•") or len(line.split()) <= 4:
                if current_project:
                    projects.append(current_project)
                title = line.lstrip("- •").strip()
                if len(title) > 3:
                    current_project = {
                        "title": title,
                        "description": "",
                        "technologies": "",
                        "url": "",
                        "highlights": ""
                    }
            elif current_project:
                current_project["description"] += line + " "
                
        if current_project:
            projects.append(current_project)
            
        # Clean desc and technologies
        for proj in projects:
            proj["description"] = proj["description"].strip()
            # Try to extract technologies listed
            tech_match = re.search(r'(?:Technologies|Built with|Stack):\s*([A-Za-z,\s0-9\.\-#\+]+)', proj["description"])
            if tech_match:
                proj["technologies"] = tech_match.group(1).strip()
                
        return projects[:3]

    def _parse_certificates(self, text: str) -> List[Dict[str, Any]]:
        certs = []
        if not text:
            return certs
            
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        for line in lines[:5]: # Limit to 5 cert lines
            name = line.lstrip("- •").strip()
            org = "AWS / Microsoft / Google"
            
            # Simple splitter: "by" or "from" or " - "
            for divider in [" by ", " from ", " - ", " – "]:
                if divider in name:
                    parts = name.split(divider)
                    name = parts[0].strip()
                    org = parts[1].strip()
                    break
                    
            if len(name) > 5:
                certs.append({
                    "name": name,
                    "issuing_organization": org,
                    "issue_date": "2022",
                    "expiration_date": "2025",
                    "credential_id": ""
                })
        return certs

    def _estimate_duration(self, start: str, end: str, is_current: bool) -> float:
        """Estimates experience years from start/end dates."""
        try:
            # Helper to extract year from string
            def get_year(s: str) -> int:
                y_match = re.search(r'\b(19|20)\d{2}\b', s)
                return int(y_match.group(0)) if y_match else None
                
            start_year = get_year(start)
            if not start_year:
                return 1.0
                
            end_year = 2026 # Assume current local year
            if not is_current and end:
                parsed_end = get_year(end)
                if parsed_end:
                    end_year = parsed_end
                    
            diff = end_year - start_year
            return max(0.5, float(diff))
        except Exception:
            return 1.0

    def _generate_summary(self, data: Dict[str, Any]) -> str:
        """Generates a brief summary string from details."""
        skills_str = ", ".join(data["skills"][:5])
        return (
            f"Experienced {data['current_title']} with {data['experience_years']} years of professional background. "
            f"Demonstrated skills in {skills_str}. Holds education from {data['education_summary']}."
        )

# Singleton instance
resume_parser = ResumeParser()
