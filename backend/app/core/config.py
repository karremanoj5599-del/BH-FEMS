"""
FEMS - Core Configuration
Environment-based settings with sensible defaults for local development.
"""
from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

# Base directory for the app (where app/ resides)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "FEMS - Field Employee Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://fems_user:fems_password@localhost:5432/fems_db"

    # JWT Authentication
    JWT_SECRET_KEY: str = "fems-super-secret-key-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Redis Cache
    REDIS_URL: str = "redis://localhost:6379/0"

    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    model_config = {
        "env_file": str(ENV_PATH),
        "case_sensitive": True,
        "extra": "ignore"
    }


settings = Settings()
