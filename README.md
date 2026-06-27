# TalentMind AI – Intelligent Candidate Discovery Platform

TalentMind AI is a production-quality Candidate Discovery & Match-Ranking system designed for enterprise recruiters. The platform contextually parses resumes, indexes them in a ChromaDB vector store, matches them against job descriptions, and runs a multi-dimensional weighted ranking calculation.

---

## Key Features

- 📑 **Resume Parser**: PDF text extraction (using `pdfplumber`/`PyMuPDF`) and entity recognition.
- 🧠 **Semantic Vector Match**: Contextual match beyond keyword searching using SentenceTransformers (`all-MiniLM-L6-v2`) and ChromaDB.
- ⚖️ **Multi-Signal Weighted Ranking**: Candidate scores evaluated across 8 weights:
  - Vector Similarity (40%)
  - Work Experience Level Fit (20%)
  - Relevant Projects Detail (10%)
  - High Degree Education (5%)
  - Technical Certifications (5%)
  - Stable Career Progression (10%)
  - Portfolio/GitHub Activity Signals (5%)
  - Recruiter Actions Activity Logs (5%)
- 💬 **Recruiter AI Chatbot**: Conversational recruiter copilot.
- 📊 **Detailed Dashboards**: Beautiful charting visualizations of universities, top skills, locations, and hiring funnel conversion rates.
- ⚙️ **Fallback Safe Execution**: Automatically falls back to SQLite databases and local rule-based LLM mock generation if PostgreSQL or API Keys are missing.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Framer Motion, Axios, React Query.
- **Backend**: FastAPI, SQLAlchemy, SQLite/PostgreSQL, Uvicorn, Python-Jose JWT.
- **AI Engine**: SentenceTransformers (`all-MiniLM-L6-v2`), ChromaDB, spaCy.

---

## Architectural Layout

```
├── backend/
│   ├── app/
│   │   ├── ai/          # Embeddings, Vector Index, LLM, Parser, Ranker
│   │   ├── api/         # FastAPI Endpoint routers
│   │   ├── auth/        # JWT security helpers
│   │   ├── database/    # Engine connections (Postgres / SQLite fallback)
│   │   ├── models/      # SQLAlchemy Database Models
│   │   ├── schemas/     # Pydantic payloads validations
│   │   ├── services/    # Business services and pipelines
│   │   └── main.py      # Entry point
│   ├── requirements.txt # Dependencies
│   ├── Dockerfile       # Container builds
│   ├── seed.py          # Seeding script (105 candidates + 20 jobs)
│   └── test_app.py      # pytest suite
│
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js Pages & Router
│   │   ├── components/  # Reusable UI elements
│   │   ├── lib/         # Axios client, Types, Context Providers
│   └── package.json     # Node modules config
│
└── docker-compose.yml   # Multi-service configuration
```

---

## Installation & Setup

### Option 1: Running with Docker (Recommended)
Launch the entire stack (PostgreSQL database, FastAPI backend, and Next.js frontend) with a single command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

---

### Option 2: Running Locally

#### 1. Setup Backend
1. Initialize virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/Scripts/activate # Windows
   ```
2. Install packages:
   ```bash
   python -m pip install -r requirements.txt
   ```
3. Seed the database (Generates default recruiter, 20 jobs, 105 candidate profiles, vector indexes, and rankings):
   ```bash
   python seed.py
   ```
4. Launch FastAPI Server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### 2. Setup Frontend
1. Install node dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## Demo Accounts

- **Email**: `recruiter@talentmind.ai`
- **Password**: `Password123`
