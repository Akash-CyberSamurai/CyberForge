# 🚀 **CyberForge Production Deployment - Quick Start**

## ⚡ **Deploy to Production in 5 Minutes**

### **1. Quick Deployment Command**
```bash
# Clone and deploy
git clone <your-repo>
cd cyberlab
sudo ./deploy-production.sh
```

### **2. Manual Deployment (Step by Step)**
```bash
# Create production directories
sudo mkdir -p /opt/cyberforge/{postgres_data,redis_data,prometheus_data,grafana_data,backups,logs/nginx}
sudo mkdir -p /etc/ssl/cyberforge

# Set permissions
sudo chown -R $USER:$USER /opt/cyberforge
sudo chmod -R 755 /opt/cyberforge
sudo chmod -R 777 /opt/cyberforge/logs /opt/cyberforge/backups

# Copy application
cp -r . /opt/cyberforge/app
cd /opt/cyberforge/app

# Start production services
sudo docker-compose -f docker-compose.prod.yml --env-file env.production up -d
```

## 🔐 **Production Credentials (Auto-Generated)**

After deployment, check `/opt/cyberforge/deployment-info.txt` for:
- **Database Password** - Auto-generated strong password
- **Redis Password** - Auto-generated strong password  
- **Grafana Password** - Auto-generated strong password
- **Secret Key** - Auto-generated 64-character secret

## 🌐 **Access URLs**

| Service | URL | Port | Notes |
|---------|-----|-------|-------|
| **CyberForge** | https://YOUR_IP | 443 | Main application |
| **Admin Panel** | https://YOUR_IP/admin | 443 | Admin interface |
| **Prometheus** | http://localhost:9090 | 9090 | Metrics (local only) |
| **Grafana** | http://localhost:3001 | 3001 | Dashboards (local only) |
| **VNC Proxy** | https://YOUR_IP:8080 | 8080 | Container access |

## 🛠️ **Management Commands**

### **Service Management**
```bash
# Start CyberForge
sudo systemctl start cyberforge

# Stop CyberForge  
sudo systemctl stop cyberforge

# Restart CyberForge
sudo systemctl restart cyberforge

# Check status
sudo systemctl status cyberforge

# View logs
sudo journalctl -u cyberforge -f
```

### **Container Management**
```bash
# View running containers
sudo docker ps | grep cyberforge

# View all containers
sudo docker ps -a | grep cyberforge

# View container logs
sudo docker logs cyberforge-backend-prod

# Restart specific service
sudo docker-compose -f docker-compose.prod.yml restart backend
```

### **Health Checks**
```bash
# Run production status check
./check-production.sh

# Check application health
curl -k https://YOUR_IP/health

# Check database health
sudo docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Check Redis health
sudo docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

## 🔒 **Security Features**

### **✅ Automatically Configured**
- **Firewall (UFW)** - Only necessary ports open
- **Fail2ban** - Brute force protection
- **SSL/TLS** - HTTPS encryption
- **Security Headers** - XSS, CSRF protection
- **Rate Limiting** - API abuse prevention
- **Container Isolation** - Network segmentation
- **Non-root Containers** - Privilege reduction

### **🔧 Manual Configuration Required**
- **SSH Key Authentication** - Replace password auth
- **VPN Access** - Restrict admin access
- **Monitoring Alerts** - Email/SMS notifications
- **External Backups** - Cloud storage integration

## 📊 **Monitoring & Alerts**

### **Built-in Dashboards**
- **System Overview** - CPU, memory, disk usage
- **Application Metrics** - Request rates, response times
- **Container Monitoring** - Resource utilization
- **Security Events** - Failed logins, rate limiting

### **Alerting Setup**
```bash
# Edit Prometheus alerts
sudo nano /opt/cyberforge/app/monitoring/alerts.yml

# Restart Prometheus
sudo docker-compose -f docker-compose.prod.yml restart prometheus

# Access Grafana
# Username: admin
# Password: Check deployment-info.txt
```

## 💾 **Backup & Recovery**

### **Automated Backups**
- **Frequency**: Every 24 hours
- **Location**: `/opt/cyberforge/backups/`
- **Retention**: 30 days
- **Format**: PostgreSQL dumps

### **Manual Backup**
```bash
# Create manual backup
sudo docker-compose -f docker-compose.prod.yml exec postgres \
    pg_dump -U cyberforge_user cyberforge > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
sudo docker-compose -f docker-compose.prod.yml exec -T postgres \
    psql -U cyberforge_user cyberforge < backup_file.sql
```

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **Service Won't Start**
```bash
# Check logs
sudo journalctl -u cyberforge -f

# Check Docker status
sudo docker ps -a

# Verify environment file
sudo cat /opt/cyberforge/env.production
```

#### **Container Connection Issues**
```bash
# Check network
sudo docker network ls
sudo docker network inspect cyberforge_cyberforge-network

# Check VNC proxy
curl -k https://localhost:8080
```

#### **Performance Issues**
```bash
# Monitor resources
sudo docker stats
htop
df -h

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

# Add load balancer
# Configure HAProxy or Nginx load balancer
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

## 🔄 **Updates & Maintenance**

### **Application Updates**
```bash
# Update application
cd /opt/cyberforge/app
git pull origin main

# Rebuild and restart
sudo docker-compose -f docker-compose.prod.yml --env-file env.production build
sudo docker-compose -f docker-compose.prod.yml --env-file env.production up -d

# Clean up old images
sudo docker image prune -f
sudo docker system prune -f
```

### **System Updates**
```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Restart CyberForge after system updates
sudo systemctl restart cyberforge
```

## 📞 **Support & Resources**

### **Documentation**
- **README.md** - Complete project documentation
- **PRODUCTION.md** - Detailed production guide
- **test-selenium.md** - Selenium troubleshooting

### **Monitoring Tools**
- **Prometheus** - Metrics collection
- **Grafana** - Visualization dashboards
- **Status Check** - `./check-production.sh`

### **Log Locations**
- **Application Logs**: `/opt/cyberforge/logs/cyberforge.log`
- **Nginx Logs**: `/opt/cyberforge/logs/nginx/`
- **System Logs**: `sudo journalctl -u cyberforge -f`

## 🎯 **Next Steps After Deployment**

1. **✅ Change Default Passwords**
   - Admin: admin / admin123
   - User: john / user123
   - User: jane / user123

2. **🔐 Configure Security**
   - Set up SSH key authentication
   - Configure VPN access
   - Set up monitoring alerts

3. **📊 Set Up Monitoring**
   - Configure Grafana dashboards
   - Set up email/SMS alerts
   - Test monitoring systems

4. **💾 Configure Backups**
   - Test backup procedures
   - Set up external backup storage
   - Verify recovery procedures

5. **🧪 Test Functionality**
   - Launch test containers
   - Test VNC connections
   - Verify admin functions

6. **📈 Performance Tuning**
   - Monitor resource usage
   - Optimize container limits
   - Configure auto-scaling

---

## 🎉 **Production Ready!**

Your CyberForge platform is now deployed with enterprise-grade features:

- **🔒 Security Hardened** - Firewall, SSL, isolation
- **📊 Fully Monitored** - Prometheus, Grafana, alerts  
- **💾 Auto-Backup** - Daily database backups
- **🚀 Production Optimized** - Resource limits, scaling
- **🛠️ Easy Management** - Systemd service, scripts

**Access your platform at: https://YOUR_IP**

**CyberForge by Akash** - Enterprise-Grade Cybersecurity Operations Platform 🚀✨
