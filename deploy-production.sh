#!/bin/bash

# CyberForge Production Deployment Script
# 🚀 Deploy CyberForge to production with security hardening

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CYBERFORGE_DIR="/opt/cyberforge"
BACKUP_DIR="/opt/cyberforge/backups"
LOG_DIR="/opt/cyberforge/logs"
SSL_DIR="/etc/ssl/cyberforge"

echo -e "${BLUE}🚀 CyberForge Production Deployment${NC}"
echo "=================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Update system
print_status "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install required packages
print_status "Installing required packages..."
apt-get install -y \
    docker.io \
    docker-compose \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    htop \
    iotop \
    nethogs \
    curl \
    wget \
    git \
    unzip \
    jq \
    postgresql-client \
    redis-tools

# Start and enable Docker
print_status "Configuring Docker..."
systemctl start docker
systemctl enable docker
usermod -aG docker $SUDO_USER

# Create CyberForge directories
print_status "Creating CyberForge directories..."
mkdir -p $CYBERFORGE_DIR/{postgres_data,redis_data,prometheus_data,grafana_data,backups,logs/nginx}
mkdir -p $SSL_DIR

# Set proper permissions
chown -R $SUDO_USER:$SUDO_USER $CYBERFORGE_DIR
chmod -R 755 $CYBERFORGE_DIR
chmod -R 777 $CYBERFORGE_DIR/logs $CYBERFORGE_DIR/backups

# Configure firewall
print_status "Configuring firewall (UFW)..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (adjust port if needed)
ufw allow ssh

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow VNC proxy (only from localhost)
ufw allow from 127.0.0.1 to any port 8080

# Enable firewall
ufw --force enable

# Configure fail2ban
print_status "Configuring fail2ban..."
systemctl start fail2ban
systemctl enable fail2ban

# Create fail2ban jail for CyberForge
cat > /etc/fail2ban/jail.d/cyberforge.conf << EOF
[cyberforge-nginx]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
findtime = 600

[cyberforge-ssh]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
EOF

# Restart fail2ban
systemctl restart fail2ban

# Generate strong passwords
print_status "Generating secure passwords..."
SECRET_KEY=$(openssl rand -hex 64)
DB_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
GRAFANA_PASSWORD=$(openssl rand -base64 32)

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me)

# Create production environment file
print_status "Creating production environment configuration..."
cat > $CYBERFORGE_DIR/env.production << EOF
# CyberForge Production Environment Configuration
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING

# Security Settings
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database Configuration
POSTGRES_DB=cyberforge
POSTGRES_USER=cyberforge_user
POSTGRES_PASSWORD=$DB_PASSWORD
DATABASE_URL=postgresql://cyberforge_user:$DB_PASSWORD@localhost:5432/cyberforge

# Redis Configuration
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_DB=0
REDIS_URL=redis://:$REDIS_PASSWORD@localhost:6379/0

# Docker Configuration
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_TIMEOUT=300

# Network Configuration
HOST_IP=$PUBLIC_IP
VNC_PROXY_HOST=localhost
ALLOWED_HOSTS=$PUBLIC_IP
CORS_ORIGINS=https://$PUBLIC_IP

# Resource Limits
MAX_CONTAINERS_PER_USER=2
MAX_CONTAINER_MEMORY=4g
MAX_CONTAINER_CPU=2
CONTAINER_TIMEOUT_MINUTES=60

# Monitoring & Metrics
ENABLE_METRICS=true
METRICS_PORT=9090
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true

# Grafana Configuration
GRAFANA_PASSWORD=$GRAFANA_PASSWORD

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_INTERVAL_HOURS=24
BACKUP_RETENTION_DAYS=30

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Session Management
SESSION_TIMEOUT_MINUTES=30
MAX_SESSIONS_PER_USER=3

# Logging Configuration
LOG_FORMAT=json
LOG_FILE=/app/logs/cyberforge.log
LOG_MAX_SIZE=100MB
LOG_BACKUP_COUNT=5

# Performance Tuning
WORKER_PROCESSES=4
WORKER_CONNECTIONS=1000
KEEP_ALIVE_TIMEOUT=65
CLIENT_MAX_BODY_SIZE=100M

# Security Headers
SECURITY_HEADERS_ENABLED=true
HSTS_MAX_AGE=31536000
CSP_ENABLED=true
X_FRAME_OPTIONS=DENY
X_CONTENT_TYPE_OPTIONS=nosniff
X_XSS_PROTECTION=1; mode=block
REFERRER_POLICY=strict-origin-when-cross-origin
EOF

# Set proper permissions for environment file
chown $SUDO_USER:$SUDO_USER $CYBERFORGE_DIR/env.production
chmod 600 $CYBERFORGE_DIR/env.production

# Copy application files
print_status "Copying application files..."
cp -r . $CYBERFORGE_DIR/app
cd $CYBERFORGE_DIR/app

# Create Redis configuration
print_status "Creating Redis configuration..."
cat > redis.conf << EOF
# Redis Production Configuration
bind 127.0.0.1
port 6379
requirepass $REDIS_PASSWORD
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
EOF

# Create monitoring configuration
print_status "Creating monitoring configuration..."
mkdir -p monitoring

# Prometheus configuration
cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'cyberforge-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'cyberforge-postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 60s

  - job_name: 'cyberforge-redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 60s
EOF

# Create systemd service for CyberForge
print_status "Creating systemd service..."
cat > /etc/systemd/system/cyberforge.service << EOF
[Unit]
Description=CyberForge Production Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$CYBERFORGE_DIR/app
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml --env-file env.production up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml --env-file env.production down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable cyberforge

# Create SSL certificates (self-signed for now)
print_status "Creating SSL certificates..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $SSL_DIR/key.pem \
    -out $SSL_DIR/cert.pem \
    -subj "/C=US/ST=State/L=City/O=CyberForge/CN=$PUBLIC_IP"

chmod 600 $SSL_DIR/key.pem
chmod 644 $SSL_DIR/cert.pem

# Create Nginx configuration
print_status "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/cyberforge << EOF
server {
    listen 80;
    server_name $PUBLIC_IP;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $PUBLIC_IP;
    
    # SSL Configuration
    ssl_certificate $SSL_DIR/cert.pem;
    ssl_certificate_key $SSL_DIR/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
    
    # Proxy to CyberForge frontend
    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/cyberforge /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start CyberForge
print_status "Starting CyberForge production service..."
systemctl start cyberforge

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service status
print_status "Checking service status..."
systemctl status cyberforge --no-pager

# Display deployment information
echo ""
echo -e "${GREEN}🎉 CyberForge Production Deployment Complete!${NC}"
echo "================================================"
echo ""
echo -e "${BLUE}📋 Deployment Information:${NC}"
echo "  • Application URL: https://$PUBLIC_IP"
echo "  • Admin Panel: https://$PUBLIC_IP/admin"
echo "  • Monitoring: http://localhost:9090 (Prometheus)"
echo "  • Dashboard: http://localhost:3001 (Grafana)"
echo ""
echo -e "${BLUE}🔐 Default Credentials:${NC}"
echo "  • Admin: admin / admin123"
echo "  • User: john / user123"
echo "  • User: jane / user123"
echo ""
echo -e "${BLUE}📁 Important Files:${NC}"
echo "  • Environment: $CYBERFORGE_DIR/env.production"
echo "  • Logs: $CYBERFORGE_DIR/logs"
echo "  • Backups: $CYBERFORGE_DIR/backups"
echo "  • SSL Certificates: $SSL_DIR"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo "  • Start: systemctl start cyberforge"
echo "  • Stop: systemctl stop cyberforge"
echo "  • Restart: systemctl restart cyberforge"
echo "  • Status: systemctl status cyberforge"
echo "  • Logs: journalctl -u cyberforge -f"
echo ""
echo -e "${YELLOW}⚠️  Security Notes:${NC}"
echo "  • Change all passwords in $CYBERFORGE_DIR/env.production"
echo "  • Configure firewall rules for your network"
echo "  • Set up proper SSL certificates for production"
echo "  • Monitor logs for security events"
echo "  • Regular backups are enabled"
echo ""
echo -e "${GREEN}✅ Your CyberForge platform is now production-ready!${NC}"
echo ""
echo -e "${BLUE}🔗 Next Steps:${NC}"
echo "  1. Access https://$PUBLIC_IP"
echo "  2. Login with admin credentials"
echo "  3. Change default passwords"
echo "  4. Configure monitoring alerts"
echo "  5. Set up automated backups"
echo "  6. Test container functionality"
echo ""

# Save credentials to file
cat > $CYBERFORGE_DIR/deployment-info.txt << EOF
CyberForge Production Deployment Information
===========================================

Deployment Date: $(date)
Public IP: $PUBLIC_IP
Application URL: https://$PUBLIC_IP

Database Credentials:
- Database: cyberforge
- Username: cyberforge_user
- Password: $DB_PASSWORD

Redis Credentials:
- Password: $REDIS_PASSWORD

Grafana Credentials:
- Username: admin
- Password: $GRAFANA_PASSWORD

Application Credentials:
- Admin: admin / admin123
- User: john / user123
- User: jane / user123

IMPORTANT: Change all passwords immediately after first login!
EOF

chown $SUDO_USER:$SUDO_USER $CYBERFORGE_DIR/deployment-info.txt
chmod 600 $CYBERFORGE_DIR/deployment-info.txt

print_status "Deployment information saved to $CYBERFORGE_DIR/deployment-info.txt"
print_status "Production deployment completed successfully!"
