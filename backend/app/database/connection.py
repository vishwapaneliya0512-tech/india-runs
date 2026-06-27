import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database")

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Auto fallback configuration
if not DATABASE_URL:
    logger.warning("DATABASE_URL environment variable not found. Defaulting to local SQLite database.")
    DATABASE_URL = "sqlite:///./talentmind.db"

# Create engine with appropriate options based on database dialect
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_recycle=300,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for getting DB session in FastAPI endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes tables using metadata."""
    global engine, SessionLocal
    try:
        logger.info(f"Initializing database with engine: {engine.url.drivername}")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        # If PostgreSQL fails, try to fallback to SQLite immediately
        if not DATABASE_URL.startswith("sqlite"):
            logger.warning("PostgreSQL initialization failed. Retrying with local SQLite database...")
            sqlite_url = "sqlite:///./talentmind.db"
            engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            Base.metadata.create_all(bind=engine)
            logger.info("SQLite fallback database tables initialized successfully.")
        else:
            raise e
