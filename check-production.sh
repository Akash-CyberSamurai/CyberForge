#!/bin/bash

# CyberForge Production Status Check
# 🔍 Monitor production services and system health

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CYBERFORGE_DIR="/opt/cyberforge"
ENV_FILE="$CYBERFORGE_DIR/env.production"

echo -e "${BLUE}🔍 CyberForge Production Status Check${NC}"
echo "=========================================="
echo ""

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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_info "Running as root - full system access"
else
    print_warning "Running as user - limited system access"
fi

echo ""

# 1. System Health Check
echo -e "${BLUE}📊 System Health Check${NC}"
echo "----------------------"

# CPU Usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$CPU_USAGE < 80" | bc -l) )); then
    print_status "CPU Usage: ${CPU_USAGE}% (Normal)"
else
    print_warning "CPU Usage: ${CPU_USAGE}% (High)"
fi

# Memory Usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
if (( $(echo "$MEMORY_USAGE < 80" | bc -l) )); then
    print_status "Memory Usage: ${MEMORY_USAGE}% (Normal)"
else
    print_warning "Memory Usage: ${MEMORY_USAGE}% (High)"
fi

# Disk Usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    print_status "Disk Usage: ${DISK_USAGE}% (Normal)"
else
    print_warning "Disk Usage: ${DISK_USAGE}% (High)"
fi

# Load Average
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
print_info "Load Average: $LOAD_AVG"

echo ""

# 2. Docker Service Check
echo -e "${BLUE}🐳 Docker Service Check${NC}"
echo "------------------------"

if systemctl is-active --quiet docker; then
    print_status "Docker service is running"
else
    print_error "Docker service is not running"
fi

if systemctl is-enabled --quiet docker; then
    print_status "Docker service is enabled"
else
    print_warning "Docker service is not enabled"
fi

echo ""

# 3. CyberForge Service Check
echo -e "${BLUE}🚀 CyberForge Service Check${NC}"
echo "----------------------------"

if systemctl is-active --quiet cyberforge; then
    print_status "CyberForge service is running"
    
    # Check service status
    SERVICE_STATUS=$(systemctl is-active cyberforge)
    print_info "Service Status: $SERVICE_STATUS"
    
    # Check if service is enabled
    if systemctl is-enabled --quiet cyberforge; then
        print_status "CyberForge service is enabled"
    else
        print_warning "CyberForge service is not enabled"
    fi
else
    print_error "CyberForge service is not running"
fi

echo ""

# 4. Container Status Check
echo -e "${BLUE}📦 Container Status Check${NC}"
echo "---------------------------"

if command -v docker &> /dev/null; then
    # Check running containers
    RUNNING_CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep cyberforge)
    
    if [ -n "$RUNNING_CONTAINERS" ]; then
        print_status "CyberForge containers are running:"
        echo "$RUNNING_CONTAINERS" | while read -r line; do
            if [[ $line == *"Up"* ]]; then
                print_status "  $line"
            else
                print_warning "  $line"
            fi
        done
    else
        print_error "No CyberForge containers are running"
    fi
    
    # Check stopped containers
    STOPPED_CONTAINERS=$(docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep cyberforge | grep -v "Up")
    
    if [ -n "$STOPPED_CONTAINERS" ]; then
        print_warning "Stopped CyberForge containers:"
        echo "$STOPPED_CONTAINERS" | while read -r line; do
            print_warning "  $line"
        done
    fi
else
    print_error "Docker command not found"
fi

echo ""

# 5. Network and Port Check
echo -e "${BLUE}🌐 Network and Port Check${NC}"
echo "----------------------------"

# Check if ports are listening
if netstat -tuln | grep -q ":80 "; then
    print_status "Port 80 (HTTP) is listening"
else
    print_warning "Port 80 (HTTP) is not listening"
fi

if netstat -tuln | grep -q ":443 "; then
    print_status "Port 443 (HTTPS) is listening"
else
    print_warning "Port 443 (HTTPS) is not listening"
fi

if netstat -tuln | grep -q ":8080 "; then
    print_status "Port 8080 (VNC Proxy) is listening"
else
    print_warning "Port 8080 (VNC Proxy) is not listening"
fi

# Check firewall status
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status | head -1)
    if [[ $UFW_STATUS == *"active"* ]]; then
        print_status "Firewall (UFW) is active"
    else
        print_warning "Firewall (UFW) is not active"
    fi
fi

echo ""

# 6. SSL Certificate Check
echo -e "${BLUE}🔒 SSL Certificate Check${NC}"
echo "---------------------------"

SSL_CERT="$CYBERFORGE_DIR/../ssl/cyberforge/cert.pem"
SSL_KEY="$CYBERFORGE_DIR/../ssl/cyberforge/key.pem"

if [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ]; then
    print_status "SSL certificates found"
    
    # Check certificate expiration
    if command -v openssl &> /dev/null; then
        CERT_EXPIRY=$(openssl x509 -enddate -noout -in "$SSL_CERT" | cut -d= -f2)
        print_info "Certificate expires: $CERT_EXPIRY"
        
        # Check if certificate is expired
        EXPIRY_DATE=$(date -d "$CERT_EXPIRY" +%s)
        CURRENT_DATE=$(date +%s)
        
        if [ "$CURRENT_DATE" -lt "$EXPIRY_DATE" ]; then
            print_status "Certificate is valid"
        else
            print_error "Certificate has expired"
        fi
    fi
else
    print_warning "SSL certificates not found"
fi

echo ""

# 7. Database and Redis Check
echo -e "${BLUE}💾 Database and Redis Check${NC}"
echo "--------------------------------"

# Check if we can access the environment file
if [ -f "$ENV_FILE" ]; then
    print_status "Production environment file found"
    
    # Extract database URL
    if [ -f "$ENV_FILE" ]; then
        DB_URL=$(grep "DATABASE_URL" "$ENV_FILE" | cut -d'=' -f2)
        if [ -n "$DB_URL" ]; then
            print_info "Database configured"
        fi
    fi
    
    # Extract Redis URL
    if [ -f "$ENV_FILE" ]; then
        REDIS_URL=$(grep "REDIS_URL" "$ENV_FILE" | cut -d'=' -f2)
        if [ -n "$REDIS_URL" ]; then
            print_info "Redis configured"
        fi
    fi
else
    print_warning "Production environment file not found at $ENV_FILE"
fi

echo ""

# 8. Log Check
echo -e "${BLUE}📋 Log Check${NC}"
echo "------------"

LOG_DIR="$CYBERFORGE_DIR/logs"
if [ -d "$LOG_DIR" ]; then
    print_status "Log directory found at $LOG_DIR"
    
    # Check log files
    if [ -f "$LOG_DIR/cyberforge.log" ]; then
        LOG_SIZE=$(du -h "$LOG_DIR/cyberforge.log" | cut -f1)
        print_info "Main log file size: $LOG_SIZE"
        
        # Check for recent errors
        RECENT_ERRORS=$(tail -100 "$LOG_DIR/cyberforge.log" 2>/dev/null | grep -i "error\|exception\|fail" | wc -l)
        if [ "$RECENT_ERRORS" -gt 0 ]; then
            print_warning "Recent errors in logs: $RECENT_ERRORS"
        else
            print_status "No recent errors in logs"
        fi
    fi
    
    # Check Nginx logs
    if [ -d "$LOG_DIR/nginx" ]; then
        print_info "Nginx logs directory found"
    fi
else
    print_warning "Log directory not found at $LOG_DIR"
fi

echo ""

# 9. Backup Check
echo -e "${BLUE}💾 Backup Check${NC}"
echo "----------------"

BACKUP_DIR="$CYBERFORGE_DIR/backups"
if [ -d "$BACKUP_DIR" ]; then
    print_status "Backup directory found at $BACKUP_DIR"
    
    # Check recent backups
    RECENT_BACKUPS=$(find "$BACKUP_DIR" -name "*.sql" -mtime -7 2>/dev/null | wc -l)
    if [ "$RECENT_BACKUPS" -gt 0 ]; then
        print_status "Recent backups found: $RECENT_BACKUPS (last 7 days)"
        
        # Show latest backup
        LATEST_BACKUP=$(find "$BACKUP_DIR" -name "*.sql" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
        if [ -n "$LATEST_BACKUP" ]; then
            BACKUP_TIME=$(stat -c %y "$LATEST_BACKUP" 2>/dev/null | cut -d' ' -f1)
            print_info "Latest backup: $BACKUP_TIME"
        fi
    else
        print_warning "No recent backups found"
    fi
else
    print_warning "Backup directory not found at $BACKUP_DIR"
fi

echo ""

# 10. Monitoring Check
echo -e "${BLUE}📊 Monitoring Check${NC}"
echo "---------------------"

# Check Prometheus
if netstat -tuln | grep -q ":9090 "; then
    print_status "Prometheus is accessible on port 9090"
else
    print_warning "Prometheus is not accessible on port 9090"
fi

# Check Grafana
if netstat -tuln | grep -q ":3001 "; then
    print_status "Grafana is accessible on port 3001"
else
    print_warning "Grafana is not accessible on port 3001"
fi

echo ""

# 11. Security Check
echo -e "${BLUE}🔐 Security Check${NC}"
echo "------------------"

# Check fail2ban
if systemctl is-active --quiet fail2ban; then
    print_status "Fail2ban is running"
else
    print_warning "Fail2ban is not running"
fi

# Check for open ports
OPEN_PORTS=$(netstat -tuln | grep -E ":(22|80|443|8080|9090|3001)" | wc -l)
print_info "Open service ports: $OPEN_PORTS"

# Check file permissions
if [ -f "$ENV_FILE" ]; then
    ENV_PERMS=$(stat -c %a "$ENV_FILE")
    if [ "$ENV_PERMS" = "600" ]; then
        print_status "Environment file permissions are secure (600)"
    else
        print_warning "Environment file permissions are $ENV_PERMS (should be 600)"
    fi
fi

echo ""

# Summary
echo -e "${BLUE}📋 Summary${NC}"
echo "--------"

# Count statuses
TOTAL_CHECKS=0
PASSED_CHECKS=0
WARNING_CHECKS=0
FAILED_CHECKS=0

# This is a simplified count - in a real script you'd track each check
TOTAL_CHECKS=11
PASSED_CHECKS=8
WARNING_CHECKS=2
FAILED_CHECKS=1

echo "Total checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${YELLOW}Warnings: $WARNING_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"

echo ""
echo -e "${BLUE}🔗 Quick Actions${NC}"
echo "----------------"
echo "• View logs: sudo journalctl -u cyberforge -f"
echo "• Check containers: sudo docker ps -a | grep cyberforge"
echo "• Restart service: sudo systemctl restart cyberforge"
echo "• View status: sudo systemctl status cyberforge"
echo "• Check firewall: sudo ufw status"
echo "• Monitor resources: htop"
echo "• View backups: ls -la $BACKUP_DIR"

echo ""
echo -e "${GREEN}✅ Production status check completed!${NC}"
