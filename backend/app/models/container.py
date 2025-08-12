from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class ContainerImage(Base):
    __tablename__ = "container_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    image_name = Column(String(255), nullable=False)
    description = Column(String)
    category = Column(String(50), nullable=False)
    cpu_limit = Column(Numeric(5, 2), nullable=False, default=1.0)
    memory_limit_mb = Column(Integer, nullable=False, default=2048)
    storage_limit_gb = Column(Integer, nullable=False, default=10)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class UserContainer(Base):
    __tablename__ = "user_containers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    image_id = Column(UUID(as_uuid=True), ForeignKey("container_images.id"), nullable=False)
    container_name = Column(String(100), nullable=False)
    docker_container_id = Column(String(100), unique=True, nullable=False)
    status = Column(String(20), nullable=False, default="starting")
    vnc_port = Column(Integer)
    ssh_port = Column(Integer)
    cpu_usage = Column(Numeric(5, 2), default=0.0)
    memory_usage_mb = Column(Integer, default=0)
    storage_usage_gb = Column(Numeric(5, 2), default=0.0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    destroyed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="containers")
    image = relationship("ContainerImage", backref="containers")
