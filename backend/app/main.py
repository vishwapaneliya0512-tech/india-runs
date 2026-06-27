import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.database.connection import init_db
from backend.app.api import auth, jobs, candidates, ranking, chat, analytics, comparison

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("main")

app = FastAPI(
    title="TalentMind AI API",
    description="Intelligent Candidate Discovery & Ranking Platform Services",
    version="1.0.0"
)

# CORS configuration
# Allowing all origins for simple, hassle-free hackathon deployment and local developer runtimes.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup DB initialization
@app.on_event("startup")
def startup_event():
    logger.info("Starting up FastAPI application...")
    init_db()

# Root status endpoint
@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app": "TalentMind AI API Backend",
        "features": [
            "all-MiniLM-L6-v2 Embeddings",
            "ChromaDB Vector Matching",
            "Local Fallback LLM Engine",
            "Multi-Signal Weighted Candidate Ranking"
        ]
    }

# Global exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error for {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )

# Mount API routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(candidates.router, prefix="/api")
app.include_router(ranking.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(comparison.router, prefix="/api")
