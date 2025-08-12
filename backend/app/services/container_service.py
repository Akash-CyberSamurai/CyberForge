import docker
import asyncio
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.core.config import settings
from app.schemas.container import ContainerCreate, ContainerResponse, ContainerStatus
from app.models.container import UserContainer
from app.models.user import User
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class ContainerService:
    def __init__(self):
        try:
            self.docker_client = docker.from_env()
            logger.info("Docker client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Docker client: {e}")
            self.docker_client = None

    async def create_container(self, user_id: str, image_name: str, container_name: str) -> Dict[str, Any]:
        """Create a real Docker container with VNC support"""
        try:
            if not self.docker_client:
                raise Exception("Docker client not available")

            # Determine container configuration based on image
            is_selenium = 'selenium' in image_name.lower()
            
            # Container configuration
            container_config = {
                'image': image_name,
                'name': f"{container_name}-{user_id}",
                'detach': True,
                'environment': {},
                'ports': {},
                'volumes': {},
                'command': None,
                'mem_limit': '2g',
                'cpu_period': 100000,
                'cpu_quota': 100000,  # 1 CPU core
            }

            if is_selenium:
                # Selenium container configuration
                container_config.update({
                    'environment': {
                        'DISPLAY': ':99',
                        'VNC_NO_PASSWORD': '1',
                        'VNC_SERVER_WIDTH': '1920',
                        'VNC_SERVER_HEIGHT': '1080',
                        'VNC_SERVER_DEPTH': '24',
                        'VNC_LISTENING_PORT': '7900',
                        'VNC_VIEW_ONLY': '0'
                    },
                    'ports': {
                        '7900/tcp': None,  # VNC port
                        '4444/tcp': None,  # Selenium port
                        '22/tcp': None     # SSH port
                    },
                    'command': '/opt/bin/entry_point.sh'
                })
            else:
                # Regular container configuration
                container_config.update({
                    'ports': {
                        '5900/tcp': None,  # VNC port
                        '22/tcp': None     # SSH port
                    }
                })

            # Create the container
            logger.info(f"Creating container with config: {container_config}")
            container = self.docker_client.containers.run(**container_config)
            
            # Wait for container to start
            await asyncio.sleep(5)
            
            # Get container info
            container.reload()
            
            # Get assigned ports
            ports = container.ports
            vnc_port = None
            ssh_port = None
            
            if is_selenium:
                # For Selenium, VNC is on port 7900
                vnc_port = ports.get('7900/tcp', [{}])[0].get('HostPort') if ports.get('7900/tcp') else None
                ssh_port = ports.get('22/tcp', [{}])[0].get('HostPort') if ports.get('22/tcp') else None
            else:
                # For regular containers, VNC is on port 5900
                vnc_port = ports.get('5900/tcp', [{}])[0].get('HostPort') if ports.get('5900/tcp') else None
                ssh_port = ports.get('22/tcp', [{}])[0].get('HostPort') if ports.get('22/tcp') else None

            # Generate connection URLs
            host = settings.HOST_IP or 'localhost'
            vnc_url = None
            ssh_command = None
            
            if vnc_port:
                if is_selenium:
                    vnc_url = f"https://{host}:8080/vnc.html?host={host}&port={vnc_port}&autoconnect=true&resize=scale"
                else:
                    vnc_url = f"https://{host}:8080/vnc.html?host={host}&port={vnc_port}&autoconnect=true"
            
            if ssh_port:
                ssh_command = f"ssh -p {ssh_port} root@{host}"

            return {
                'id': container.id,
                'name': container_name,
                'image': image_name,
                'status': container.status,
                'created_at': datetime.now().isoformat(),
                'cpu_usage': 0,
                'memory_usage': 0,
                'vnc_url': vnc_url,
                'ssh_command': ssh_command,
                'is_selenium': is_selenium,
                'vnc_port': vnc_port,
                'ssh_port': ssh_port,
                'container_id': container.id
            }

        except Exception as e:
            logger.error(f"Failed to create container: {e}")
            raise Exception(f"Container creation failed: {str(e)}")

    async def start_container(self, container_id: str) -> bool:
        """Start a stopped container"""
        try:
            if not self.docker_client:
                return False
            
            container = self.docker_client.containers.get(container_id)
            container.start()
            return True
        except Exception as e:
            logger.error(f"Failed to start container {container_id}: {e}")
            return False

    async def stop_container(self, container_id: str) -> bool:
        """Stop a running container"""
        try:
            if not self.docker_client:
                return False
            
            container = self.docker_client.containers.get(container_id)
            container.stop()
            return True
        except Exception as e:
            logger.error(f"Failed to stop container {container_id}: {e}")
            return False

    async def delete_container(self, container_id: str) -> bool:
        """Delete a container"""
        try:
            if not self.docker_client:
                return False
            
            container = self.docker_client.containers.get(container_id)
            container.remove(force=True)
            return True
        except Exception as e:
            logger.error(f"Failed to delete container {container_id}: {e}")
            return False

    async def get_container_stats(self, container_id: str) -> Dict[str, Any]:
        """Get real-time container statistics"""
        try:
            if not self.docker_client:
                return {}
            
            container = self.docker_client.containers.get(container_id)
            stats = container.stats(stream=False)
            
            # Calculate CPU usage
            cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
            system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
            cpu_usage = (cpu_delta / system_delta) * 100 if system_delta > 0 else 0
            
            # Calculate memory usage
            memory_usage = stats['memory_stats']['usage'] / (1024 * 1024)  # Convert to MB
            
            return {
                'cpu_usage': round(cpu_usage, 2),
                'memory_usage': round(memory_usage, 2),
                'status': container.status
            }
        except Exception as e:
            logger.error(f"Failed to get stats for container {container_id}: {e}")
            return {}

    async def list_user_containers(self, user_id: str) -> List[Dict[str, Any]]:
        """List all containers for a user"""
        try:
            if not self.docker_client:
                return []
            
            containers = []
            for container in self.docker_client.containers.list(all=True):
                # Check if container belongs to user (by name convention)
                if f"-{user_id}" in container.name:
                    # Get container stats
                    stats = await self.get_container_stats(container.id)
                    
                    # Determine container type
                    is_selenium = 'selenium' in container.image.tags[0].lower() if container.image.tags else False
                    
                    # Get ports
                    ports = container.ports
                    vnc_port = None
                    ssh_port = None
                    
                    if is_selenium:
                        vnc_port = ports.get('7900/tcp', [{}])[0].get('HostPort') if ports.get('7900/tcp') else None
                        ssh_port = ports.get('22/tcp', [{}])[0].get('HostPort') if ports.get('22/tcp') else None
                    else:
                        vnc_port = ports.get('5900/tcp', [{}])[0].get('HostPort') if ports.get('5900/tcp') else None
                        ssh_port = ports.get('22/tcp', [{}])[0].get('HostPort') if ports.get('22/tcp') else None
                    
                    # Generate connection URLs
                    host = settings.HOST_IP or 'localhost'
                    vnc_url = None
                    ssh_command = None
                    
                    if vnc_port:
                        if is_selenium:
                            vnc_url = f"https://{host}:8080/vnc.html?host={host}&port={vnc_port}&autoconnect=true&resize=scale"
                        else:
                            vnc_url = f"https://{host}:8080/vnc.html?host={host}&port={vnc_port}&autoconnect=true"
                    
                    if ssh_port:
                        ssh_command = f"ssh -p {ssh_port} root@{host}"
                    
                    containers.append({
                        'id': container.id,
                        'name': container.name.replace(f"-{user_id}", ""),
                        'image': container.image.tags[0] if container.image.tags else 'unknown',
                        'status': container.status,
                        'created_at': datetime.fromtimestamp(container.attrs['Created']).isoformat(),
                        'cpu_usage': stats.get('cpu_usage', 0),
                        'memory_usage': stats.get('memory_usage', 0),
                        'vnc_url': vnc_url,
                        'ssh_command': ssh_command,
                        'is_selenium': is_selenium,
                        'vnc_port': vnc_port,
                        'ssh_port': ssh_port
                    })
            
            return containers
        except Exception as e:
            logger.error(f"Failed to list containers for user {user_id}: {e}")
            return []

    async def cleanup_inactive_containers(self, user_id: str, timeout_minutes: int = 10):
        """Clean up containers that have been inactive for too long"""
        try:
            if not self.docker_client:
                return
            
            timeout = timedelta(minutes=timeout_minutes)
            current_time = datetime.now()
            
            for container in self.docker_client.containers.list(all=True):
                if f"-{user_id}" in container.name:
                    # Check last activity (simplified - in real app, track user activity)
                    created_time = datetime.fromtimestamp(container.attrs['Created'])
                    if current_time - created_time > timeout:
                        logger.info(f"Cleaning up inactive container {container.id} for user {user_id}")
                        await self.delete_container(container.id)
        except Exception as e:
            logger.error(f"Failed to cleanup containers for user {user_id}: {e}")

container_service = ContainerService()
