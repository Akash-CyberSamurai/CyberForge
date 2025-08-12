#!/bin/bash

# CyberLab Deployment Script for Google Cloud VM
# This script sets up the complete CyberLab platform

set -e

echo "🚀 Starting CyberLab deployment on Google Cloud VM..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
sudo apt-get install -y \
    docker.io \
    docker-compose \
    postgresql-client \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Start and enable Docker
echo "🐳 Setting up Docker..."
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
echo "📋 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create CyberLab directory
echo "📁 Creating CyberLab directory..."
mkdir -p ~/cyberlab
cd ~/cyberlab

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env << EOF
# CyberLab Environment Configuration
APP_NAME=CyberLab
APP_VERSION=1.0.0
DEBUG=false

# Database settings
DATABASE_URL=postgresql://cyberlab_user:cyberlab_password@localhost:5432/cyberlab

# Redis settings
REDIS_URL=redis://localhost:6379

# Security settings
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Docker settings
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_NETWORK=cyberlab_network

# Container settings
DEFAULT_INACTIVITY_TIMEOUT_MINUTES=10
DEFAULT_MAX_CONCURRENT_CONTAINERS=2
CONTAINER_CLEANUP_INTERVAL_SECONDS=300

# VNC and SSH proxy settings
VNC_PROXY_PORT=8080
SSH_PROXY_PORT_START=22000
SSH_PROXY_PORT_END=22999

# Resource limits
DEFAULT_CPU_LIMIT=1.0
DEFAULT_MEMORY_LIMIT_MB=2048
DEFAULT_STORAGE_LIMIT_GB=10

# Monitoring settings
ENABLE_METRICS=true
METRICS_PORT=9090
EOF

# Create Docker network
echo "🌐 Creating Docker network..."
sudo docker network create cyberlab_network || true

# Set up firewall rules
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8000/tcp  # Backend API
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8080/tcp  # VNC Proxy
sudo ufw allow 5432/tcp  # PostgreSQL
sudo ufw allow 6379/tcp  # Redis
sudo ufw --force enable

# Create systemd service for CyberLab
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/cyberlab.service > /dev/null << EOF
[Unit]
Description=CyberLab Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/$USER/cyberlab
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable cyberlab.service

echo "✅ CyberLab deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your CyberLab code to ~/cyberlab/"
echo "2. Run: sudo systemctl start cyberlab"
echo "3. Access the platform at: http://$(curl -s ifconfig.me)"
echo ""
echo "🔑 Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "⚠️  Remember to change the default password!"
echo ""
echo "📚 For more information, check the README.md file"
