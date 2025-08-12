import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.services.container_service import ContainerService
from app.core.config import settings
import time

logger = logging.getLogger(__name__)

class ContainerCleanupService:
    def __init__(self):
        self.container_service = ContainerService()
        self.running = False
        self.cleanup_interval = settings.CONTAINER_CLEANUP_INTERVAL_SECONDS
    
    async def start(self):
        """Start the cleanup service"""
        self.running = True
        logger.info("Container cleanup service started")
        
        while self.running:
            try:
                await self._cleanup_cycle()
                await asyncio.sleep(self.cleanup_interval)
            except Exception as e:
                logger.error(f"Error in cleanup cycle: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying
    
    async def stop(self):
        """Stop the cleanup service"""
        self.running = False
        logger.info("Container cleanup service stopped")
    
    async def _cleanup_cycle(self):
        """Perform one cleanup cycle"""
        logger.debug("Starting cleanup cycle")
        
        async with AsyncSessionLocal() as db:
            try:
                # Get system configuration for timeout
                timeout_minutes = await self._get_system_config("inactivity_timeout_minutes", db)
                timeout_minutes = int(timeout_minutes) if timeout_minutes else settings.DEFAULT_INACTIVITY_TIMEOUT_MINUTES
                
                cutoff_time = datetime.utcnow() - timedelta(minutes=timeout_minutes)
                
                # Find inactive containers
                result = await db.execute(
                    select("UserContainer")
                    .where(
                        "UserContainer.status == 'running'",
                        "UserContainer.last_activity < :cutoff_time"
                    )
                    .params(cutoff_time=cutoff_time)
                )
                
                inactive_containers = result.scalars().all()
                
                if inactive_containers:
                    logger.info(f"Found {len(inactive_containers)} inactive containers to cleanup")
                    
                    for container in inactive_containers:
                        try:
                            await self.container_service.destroy_container(
                                str(container.user_id), 
                                str(container.id), 
                                db
                            )
                            logger.info(f"Auto-destroyed inactive container {container.container_name}")
                        except Exception as e:
                            logger.error(f"Failed to auto-destroy container {container.container_name}: {e}")
                else:
                    logger.debug("No inactive containers found")
                    
            except Exception as e:
                logger.error(f"Error during cleanup cycle: {e}")
                await db.rollback()
    
    async def _get_system_config(self, key: str, db: AsyncSession) -> str:
        """Get system configuration value"""
        from app.models.system import SystemConfig
        result = await db.execute(
            select(SystemConfig.value)
            .where(SystemConfig.key == key)
        )
        return result.scalar_one_or_none()

# Global cleanup service instance
cleanup_service = ContainerCleanupService()

def start_cleanup_task():
    """Start the background cleanup task"""
    async def run_cleanup():
        await cleanup_service.start()
    
    # Start cleanup service in background
    loop = asyncio.get_event_loop()
    if loop.is_running():
        asyncio.create_task(run_cleanup())
    else:
        loop.create_task(run_cleanup())
    
    logger.info("Background cleanup task started")

def stop_cleanup_task():
    """Stop the background cleanup task"""
    asyncio.create_task(cleanup_service.stop())
    logger.info("Background cleanup task stopped")

# Manual cleanup function for testing
async def manual_cleanup():
    """Manually trigger a cleanup cycle"""
    async with AsyncSessionLocal() as db:
        await cleanup_service._cleanup_cycle()
