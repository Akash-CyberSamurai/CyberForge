# 🚀 **CyberForge Production Deployment Guide**

## 📋 **Overview**

This guide covers deploying CyberForge to production with enterprise-grade security, monitoring, and scalability features.

## 🎯 **Production Features**

### **🔒 Security Hardening**
- **Container Isolation** - Each container runs in isolated network
- **Firewall Configuration** - UFW with fail2ban protection
- **SSL/TLS Encryption** - HTTPS with security headers
- **Rate Limiting** - API protection against abuse
- **Non-root Containers** - Security-optimized Docker images
- **Secret Management** - Environment-based configuration

### **📊 Monitoring & Observability**
- **Prometheus** - Metrics collection and alerting
- **Grafana** - Beautiful dashboards and visualization
- **Structured Logging** - JSON-formatted logs with rotation
- **Health Checks** - Automated service monitoring
- **Performance Metrics** - CPU, memory, and network tracking

### **💾 Data Management**
- **Automated Backups** - Daily database backups
- **Data Persistence** - Host-mounted volumes
- **Recovery Procedures** - Point-in-time restoration
- **High Availability** - Service redundancy and failover

### **🚀 Performance & Scalability**
- **Load Balancing** - Nginx reverse proxy
- **Resource Limits** - CPU and memory constraints
- **Connection Pooling** - Database optimization
- **Caching** - Redis-based session management
- **Auto-scaling** - Container lifecycle management

## 🛠️ **Prerequisites**

### **System Requirements**
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **CPU**: 4+ cores (2.4 GHz+)
- **RAM**: 8GB+ (16GB recommended)
- **Storage**: 100GB+ SSD
- **Network**: Stable internet connection

### **Software Dependencies**
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Python**: 3.9+
- **Node.js**: 16+ (for development)

## 🚀 **Quick Deployment**

### **1. Automated Deployment (Recommended)**
```bash
# Clone repository
git clone <your-repo>
cd cyberlab

# Make deployment script executable
chmod +x deploy-production.sh

# Run production deployment
sudo ./deploy-production.sh
```

### **2. Manual Deployment**
```bash
# Create production directories
sudo mkdir -p /opt/cyberforge/{postgres_data,redis_data,prometheus_data,grafana_data,backups,logs/nginx}
sudo mkdir -p /etc/ssl/cyberforge

# Set permissions
sudo chown -R $USER:$USER /opt/cyberforge
sudo chmod -R 755 /opt/cyberforge
sudo chmod -R 777 /opt/cyberforge/logs /opt/cyberforge/backups

# Copy application files
cp -r . /opt/cyberforge/app
cd /opt/cyberforge/app

# Start production services
sudo docker-compose -f docker-compose.prod.yml --env-file env.production up -d
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Copy and customize production environment
cp env.production .env.production

# Edit configuration
nano .env.production
```

### **Key Configuration Options**
```bash
# Security
SECRET_KEY=your-strong-secret-key
ENVIRONMENT=production
DEBUG=false

# Database
POSTGRES_PASSWORD=strong-db-password
DATABASE_URL=postgresql://user:pass@host:port/db

# Network
HOST_IP=your-public-ip
ALLOWED_HOSTS=your-domain.com,your-ip
CORS_ORIGINS=https://your-domain.com

# Resource Limits
MAX_CONTAINERS_PER_USER=2
MAX_CONTAINER_MEMORY=4g
MAX_CONTAINER_CPU=2
```

## 🔒 **Security Configuration**

### **Firewall Setup**
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### **SSL/TLS Configuration**
```bash
# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/cyberforge/key.pem \
    -out /etc/ssl/cyberforge/cert.pem \
    -subj "/C=US/ST=State/L=City/O=CyberForge/CN=your-domain.com"

# Set permissions
sudo chmod 600 /etc/ssl/cyberforge/key.pem
sudo chmod 644 /etc/ssl/cyberforge/cert.pem
```

### **Let's Encrypt (Recommended)**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 **Monitoring Setup**

### **Prometheus Configuration**
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'cyberforge-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

### **Grafana Dashboards**
- **System Overview** - CPU, memory, disk usage
- **Application Metrics** - Request rates, response times
- **Container Monitoring** - Resource utilization
- **Security Events** - Failed logins, rate limiting

### **Alerting Rules**
```yaml
# monitoring/alerts.yml
groups:
  - name: cyberforge
    rules:
      - alert: HighCPUUsage
        expr: container_cpu_usage_seconds_total > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
```

## 💾 **Backup & Recovery**

### **Automated Backups**
```bash
# Database backups run automatically every 24 hours
# Location: /opt/cyberforge/backups/
# Retention: 30 days

# Manual backup
sudo docker-compose -f docker-compose.prod.yml exec postgres \
    pg_dump -U cyberforge_user cyberforge > backup_$(date +%Y%m%d_%H%M%S).sql
```

### **Recovery Procedures**
```bash
# Restore database
sudo docker-compose -f docker-compose.prod.yml exec -T postgres \
    psql -U cyberforge_user cyberforge < backup_file.sql

# Restore application
sudo systemctl stop cyberforge
sudo cp -r /opt/cyberforge/backups/app /opt/cyberforge/
sudo systemctl start cyberforge
```

## 🔄 **Maintenance & Updates**

### **Regular Maintenance**
```bash
# Check service status
sudo systemctl status cyberforge

# View logs
sudo journalctl -u cyberforge -f

# Update application
cd /opt/cyberforge/app
git pull origin main
sudo docker-compose -f docker-compose.prod.yml --env-file env.production build
sudo docker-compose -f docker-compose.prod.yml --env-file env.production up -d

# Clean up old images
sudo docker image prune -f
sudo docker system prune -f
```

### **Health Checks**
```bash
# Application health
curl -k https://your-domain.com/health

# Database health
sudo docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Redis health
sudo docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Service Won't Start**
```bash
# Check logs
sudo journalctl -u cyberforge -f

# Check Docker status
sudo docker ps -a
sudo docker logs <container_id>

# Verify environment file
sudo cat /opt/cyberforge/env.production
```

#### **Container Connection Issues**
```bash
# Check network connectivity
sudo docker network ls
sudo docker network inspect cyberforge_cyberforge-network

# Verify VNC proxy
curl -k https://localhost:8080

# Check container logs
sudo docker logs cyberforge-vnc-proxy-prod
```

#### **Performance Issues**
```bash
# Monitor resource usage
sudo docker stats

# Check system resources
htop
df -h
free -h

# Analyze logs
sudo tail -f /opt/cyberforge/logs/cyberforge.log
```

### **Debug Mode**
```bash
# Enable debug logging
sudo nano /opt/cyberforge/env.production
# Set: LOG_LEVEL=DEBUG

# Restart service
sudo systemctl restart cyberforge
```

## 📈 **Scaling & Optimization**

### **Horizontal Scaling**
```bash
# Scale backend workers
sudo docker-compose -f docker-compose.prod.yml --env-file env.production \
    up -d --scale backend=3

# Load balancer configuration
# Add HAProxy or Nginx load balancer
```

### **Performance Tuning**
```bash
# Database optimization
sudo docker-compose -f docker-compose.prod.yml exec postgres \
    psql -U cyberforge_user -d cyberforge -c "VACUUM ANALYZE;"

# Redis optimization
sudo docker-compose -f docker-compose.prod.yml exec redis \
    redis-cli --eval /opt/redis-optimize.lua
```

### **Resource Limits**
```bash
# Adjust container limits
sudo nano /opt/cyberforge/docker-compose.prod.yml

# Update resource constraints
deploy:
  resources:
    limits:
      memory: 4G
      cpus: '4'
```

## 🔐 **Security Best Practices**

### **Password Management**
- **Change default passwords** immediately after deployment
- **Use strong passwords** (16+ characters, mixed case, symbols)
- **Rotate passwords** every 90 days
- **Store secrets** in environment variables, not code

### **Access Control**
- **Limit SSH access** to specific IP ranges
- **Use key-based authentication** for SSH
- **Implement 2FA** for admin accounts
- **Regular access reviews** and cleanup

### **Network Security**
- **Segment networks** for different services
- **Use VPN** for remote access
- **Monitor network traffic** for anomalies
- **Regular security audits** and penetration testing

### **Container Security**
- **Scan images** for vulnerabilities
- **Update base images** regularly
- **Limit container privileges** (no-new-privileges)
- **Monitor container behavior** for suspicious activity

## 📞 **Support & Maintenance**

### **Monitoring Alerts**
- **Set up email/SMS alerts** for critical issues
- **Configure escalation procedures** for outages
- **Document incident response** procedures
- **Regular review** of alert thresholds

### **Documentation**
- **Keep deployment logs** updated
- **Document configuration changes**
- **Maintain runbooks** for common procedures
- **Version control** for configuration files

### **Backup Verification**
- **Test restore procedures** monthly
- **Verify backup integrity** regularly
- **Document recovery time** objectives
- **Practice disaster recovery** scenarios

---

## 🎉 **Production Ready!**

Your CyberForge platform is now deployed with enterprise-grade security, monitoring, and scalability features.

### **Next Steps:**
1. **Access your platform** at https://your-domain.com
2. **Change default passwords** immediately
3. **Configure monitoring alerts** for your team
4. **Set up automated backups** to external storage
5. **Test container functionality** with real workloads
6. **Monitor performance** and optimize as needed

### **Support Resources:**
- **Documentation**: README.md and this guide
- **Monitoring**: Prometheus and Grafana dashboards
- **Logs**: Structured logging with rotation
- **Backups**: Automated daily backups with retention

**CyberForge by Akash** - Enterprise-Grade Cybersecurity Operations Platform 🚀✨
