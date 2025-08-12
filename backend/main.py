from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
import logging
from typing import List, Optional

from app.core.config import settings
from app.core.database import engine, Base
from app.core.security import get_current_user, get_current_admin_user
from app.models.user import User
from app.schemas.container import ContainerCreate, ContainerResponse, ContainerStats
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.system import SystemConfigUpdate
from app.services.container_service import ContainerService
from app.services.user_service import UserService
from app.services.admin_service import AdminService
from app.core.cleanup import start_cleanup_task

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting CyberLab application...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Start background cleanup task
    start_cleanup_task()
    
    logger.info("CyberLab application started successfully!")
    yield
    
    # Shutdown
    logger.info("Shutting down CyberLab application...")

# Create FastAPI app
app = FastAPI(
    title="CyberLab API",
    description="Cloud-based cybersecurity laboratory platform",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CyberLab API"}

# Authentication endpoints
@app.post("/auth/login")
async def login(username: str, password: str):
    """User login endpoint"""
    user_service = UserService()
    return await user_service.authenticate_user(username, password)

@app.post("/auth/refresh")
async def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Refresh JWT token"""
    user_service = UserService()
    return await user_service.refresh_token(credentials.credentials)

@app.post("/auth/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """User logout endpoint"""
    user_service = UserService()
    return await user_service.logout_user(current_user.id)

# User endpoints
@app.get("/users/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@app.put("/users/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current user information"""
    user_service = UserService()
    return await user_service.update_user(current_user.id, user_update)

# Container management endpoints
@app.post("/containers", response_model=ContainerResponse)
async def create_container(
    container_data: ContainerCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new container"""
    container_service = ContainerService()
    return await container_service.create_container(current_user.id, container_data)

@app.get("/containers", response_model=List[ContainerResponse])
async def list_user_containers(current_user: User = Depends(get_current_user)):
    """List all containers for current user"""
    container_service = ContainerService()
    return await container_service.list_user_containers(current_user.id)

@app.get("/containers/{container_id}", response_model=ContainerResponse)
async def get_container(
    container_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get container details"""
    container_service = ContainerService()
    return await container_service.get_user_container(current_user.id, container_id)

@app.delete("/containers/{container_id}")
async def destroy_container(
    container_id: str,
    current_user: User = Depends(get_current_user)
):
    """Destroy a container"""
    container_service = ContainerService()
    return await container_service.destroy_container(current_user.id, container_id)

@app.post("/containers/{container_id}/start")
async def start_container(
    container_id: str,
    current_user: User = Depends(get_current_user)
):
    """Start a stopped container"""
    container_service = ContainerService()
    return await container_service.start_container(current_user.id, container_id)

@app.post("/containers/{container_id}/stop")
async def stop_container(
    container_id: str,
    current_user: User = Depends(get_current_user)
):
    """Stop a running container"""
    container_service = ContainerService()
    return await container_service.stop_container(current_user.id, container_id)

@app.get("/containers/{container_id}/stats", response_model=ContainerStats)
async def get_container_stats(
    container_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get container resource usage statistics"""
    container_service = ContainerService()
    return await container_service.get_container_stats(current_user.id, container_id)

# Admin endpoints
@app.get("/admin/users", response_model=List[UserResponse])
async def list_all_users(current_user: User = Depends(get_current_admin_user)):
    """List all users (admin only)"""
    admin_service = AdminService()
    return await admin_service.list_all_users()

@app.post("/admin/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new user (admin only)"""
    admin_service = AdminService()
    return await admin_service.create_user(user_data)

@app.put("/admin/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_admin_user)
):
    """Update user (admin only)"""
    admin_service = AdminService()
    return await admin_service.update_user(user_id, user_update)

@app.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete user (admin only)"""
    admin_service = AdminService()
    return await admin_service.delete_user(user_id)

@app.get("/admin/containers")
async def list_all_containers(current_user: User = Depends(get_current_admin_user)):
    """List all containers (admin only)"""
    admin_service = AdminService()
    return await admin_service.list_all_containers()

@app.get("/admin/stats")
async def get_system_stats(current_user: User = Depends(get_current_admin_user)):
    """Get system statistics (admin only)"""
    admin_service = AdminService()
    return await admin_service.get_system_stats()

@app.put("/admin/config")
async def update_system_config(
    config_update: SystemConfigUpdate,
    current_user: User = Depends(get_current_admin_user)
):
    """Update system configuration (admin only)"""
    admin_service = AdminService()
    return await admin_service.update_system_config(config_update)

# Container images endpoints
@app.get("/images")
async def list_available_images():
    """List all available container images"""
    container_service = ContainerService()
    return await container_service.list_available_images()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
