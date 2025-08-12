from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    # Application Settings
    APP_NAME: str = "CyberForge"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    
    # Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-in-production-immediately")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://cyberlab_user:cyberlab_password@localhost:5432/cyberlab")
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 30
    
    # Redis Settings
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    REDIS_PASSWORD: Optional[str] = os.getenv("REDIS_PASSWORD")
    REDIS_DB: int = 0
    
    # Docker Settings
    DOCKER_HOST: str = os.getenv("DOCKER_HOST", "unix:///var/run/docker.sock")
    DOCKER_TIMEOUT: int = 300
    
    # VNC Settings
    VNC_PROXY_PORT: int = 8080
    VNC_PROXY_HOST: str = os.getenv("VNC_PROXY_HOST", "localhost")
    
    # Network Settings
    HOST_IP: str = os.getenv("HOST_IP", "localhost")
    ALLOWED_HOSTS: list = ["*"]  # Configure for production
    CORS_ORIGINS: list = ["*"]   # Configure for production
    
    # Resource Limits
    MAX_CONTAINERS_PER_USER: int = 2
    MAX_CONTAINER_MEMORY: str = "4g"
    MAX_CONTAINER_CPU: str = "2"
    CONTAINER_TIMEOUT_MINUTES: int = 60
    
    # Monitoring & Logging
    LOG_LEVEL: str = "INFO"
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090
    
    # Backup & Recovery
    BACKUP_ENABLED: bool = True
    BACKUP_INTERVAL_HOURS: int = 24
    BACKUP_RETENTION_DAYS: int = 30
    
    # SSL/TLS Settings
    SSL_CERT_FILE: Optional[str] = os.getenv("SSL_CERT_FILE")
    SSL_KEY_FILE: Optional[str] = os.getenv("SSL_KEY_FILE")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60
    
    # Session Management
    SESSION_TIMEOUT_MINUTES: int = 30
    MAX_SESSIONS_PER_USER: int = 3
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Production-specific overrides
if os.getenv("ENVIRONMENT") == "production":
    settings = Settings(
        DEBUG=False,
        ENVIRONMENT="production",
        SECRET_KEY=os.getenv("SECRET_KEY"),
        DATABASE_URL=os.getenv("DATABASE_URL"),
        REDIS_URL=os.getenv("REDIS_URL"),
        HOST_IP=os.getenv("HOST_IP"),
        ALLOWED_HOSTS=os.getenv("ALLOWED_HOSTS", "").split(",") if os.getenv("ALLOWED_HOSTS") else ["localhost"],
        CORS_ORIGINS=os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else ["https://localhost"],
        LOG_LEVEL="WARNING",
        ENABLE_METRICS=True,
        RATE_LIMIT_ENABLED=True
    )
else:
    settings = Settings()

# Validate production settings
if settings.ENVIRONMENT == "production":
    if not settings.SECRET_KEY or settings.SECRET_KEY == "change-this-in-production-immediately":
        raise ValueError("SECRET_KEY must be set in production environment")
    
    if not settings.DATABASE_URL or "localhost" in settings.DATABASE_URL:
        raise ValueError("DATABASE_URL must point to production database in production environment")
    
    if not settings.REDIS_URL or "localhost" in settings.REDIS_URL:
        raise ValueError("REDIS_URL must point to production Redis in production environment")
