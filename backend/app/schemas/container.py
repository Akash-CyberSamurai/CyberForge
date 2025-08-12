from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class ContainerCreate(BaseModel):
    image_id: UUID
    name: Optional[str] = None

class ContainerResponse(BaseModel):
    id: str
    name: str
    image_name: str
    status: str
    vnc_url: Optional[str] = None
    ssh_command: Optional[str] = None
    created_at: datetime
    last_activity: datetime

    class Config:
        from_attributes = True

class ContainerStats(BaseModel):
    container_id: str
    cpu_usage: float
    memory_usage_mb: int
    storage_usage_gb: float
    timestamp: datetime
