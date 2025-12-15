# CyberLab - Cloud-Based Cybersecurity Laboratory

A modern, cost-effective cybersecurity lab platform that provides on-demand access to security tools through web browsers. Deploy containers for malware analysis, dark web research, and security testing with automatic cleanup to optimize costs.

##  Features

- **Instant Container Access**: Launch security tools in seconds through your browser
- **Cost Optimization**: Automatic container cleanup after inactivity
- **Professional UI**: Modern, responsive interface for seamless user experience
- **Resource Management**: Efficient allocation of CPU/RAM per container
- **Admin Dashboard**: Comprehensive monitoring and user management
- **Security Tools**: Pre-configured images for Kali Linux, Chrome, Tor, Brave, and more

##  Available Tools

- **Kali Linux**: Purple and main editions for penetration testing
- **Web Browsers**: Chrome, Brave, Tor for safe browsing and dark web access
- **Ubuntu**: Clean Linux environment for custom tool installation
- **Telegram**: Secure messaging analysis tools
- **Custom Images**: Easy to add new security tools

##  Architecture

- **Backend**: FastAPI (Python) with async container management
- **Frontend**: React + TypeScript with Material-UI
- **Database**: PostgreSQL for user management and analytics
- **Container Engine**: Docker with resource constraints
- **Authentication**: JWT-based secure user sessions

##  **Quick Start**

1. **Clone and Setup:** 
   ```bash
   git clone git clone https://github.com/Akash-CyberSamurai/CyberForge.git
   cd cyberlab
   ```

2. **Start Services:**
   ```bash
   # Start all services
   sudo docker-compose up -d
   
   # Or start with HTTPS
   sudo docker-compose -f docker-compose-https.yml up -d
   ```

3. **Access CyberForge:**
   - **HTTP:** http://localhost:3000
   - **HTTPS:** https://localhost:443 (if using HTTPS compose)
   - **Public IP:** http://YOUR_PUBLIC_IP:3000

4. **Login:**
   - **Admin:** `admin` / `admin123`
   - **User:** `john` / `user123` or `jane` / `user123`

##  **Container Management**

### **Available Tools:**
- **Kali Linux Rolling** - Full penetration testing suite
- **Kali Linux Purple** - Defensive security edition  
- **Selenium Chrome Debug** - Chrome browser with VNC access
- **Selenium Firefox Debug** - Firefox browser with VNC access
- **Tor Browser** - Anonymous browsing
- **Ubuntu Desktop** - Custom tool installation
- **Telegram Desktop** - Messaging analysis

### **Container Operations:**
- **Launch:** Select image + name → Click "🚀 Launch"
- **Start/Stop:** Control container lifecycle
- **Connect:** VNC (graphical) or SSH (terminal)
- **Delete:** Remove when done
- **Monitor:** Real-time CPU/memory usage

## 🔧 **Selenium Container Guide**

### **Why Selenium Containers?**
Selenium containers provide **isolated, safe web browsing** for:
-  **Web scraping** and analysis
-  **Security testing** of websites
-  **Malware analysis** in safe environment
-  **Data collection** from web sources
-  **Testing suspicious URLs** safely

### **Connection Types:**

#### ** VNC Access (Recommended):**
- **Port:** 7900 (Selenium) vs 5900 (Regular)
- **URL:** Automatically generated
- **Features:** Full browser control, mouse/keyboard
- **Use Case:** Interactive web browsing and testing

#### ** SSH Access:**
- **Port:** 22
- **Command:** Automatically generated
- **Features:** Terminal access for automation
- **Use Case:** Scripted operations, file management

### **Troubleshooting Selenium:**

#### ** "Connection Reset" Error:**
**Cause:** Wrong VNC port or container not ready
**Solution:** 
1. Wait for container to fully start (status: "running")
2. Use VNC connection (not SSH)
3. Check if popup blocker is enabled

#### ** VNC Not Opening:**
**Solutions:**
1. **Allow popups** for your domain
2. **Check container status** - must be "running"
3. **Try different browser** (Chrome, Firefox, Edge)
4. **Clear browser cache** and cookies

#### ** Browser Not Responding:**
**Solutions:**
1. **Wait longer** - Selenium containers take time to initialize
2. **Refresh VNC connection** - close and reopen
3. **Check resource usage** - ensure container has enough CPU/memory

### **Best Practices:**
1. **Always use VNC** for Selenium containers
2. **Wait for "running" status** before connecting
3. **Use descriptive names** for containers
4. **Stop containers** when not in use
5. **Monitor resource usage** to prevent overload

##  **Resource Allocation**

| Container Type | CPU | RAM | Storage | Notes |
|----------------|-----|-----|---------|-------|
| **Kali Linux** | 2 cores | 4GB | 20GB | Full tool suite |
| **Selenium** | 1 core | 2GB | 10GB | Browser + VNC |
| **Ubuntu** | 1 core | 2GB | 15GB | Custom tools |
| **Tor Browser** | 1 core | 1GB | 5GB | Anonymous browsing |

##  **Security Features**

- **Container Isolation** - Each container runs in isolated network
- **Resource Limits** - CPU, RAM, and storage constraints
- **Auto-cleanup** - Containers destroyed after inactivity
- **HTTPS Encryption** - All traffic encrypted
- **User Limits** - Max 2 concurrent containers per user
- **Audit Logging** - Track all container operations

##  **Deployment Options**

### **Local Development:**
```bash
sudo docker-compose up -d
```

### **Production with HTTPS:**
```bash
sudo docker-compose -f docker-compose-https.yml up -d
```

### **Cloud Deployment:**
- **AWS EC2:** Use public IP and security groups
- **Google Cloud:** Use Compute Engine with firewall rules
- **Azure:** Use VM with network security groups

##  **Troubleshooting**

### **Common Issues:**

#### **Container Won't Start:**
```bash
# Check logs
sudo docker-compose logs backend
sudo docker-compose logs frontend

# Check resource usage
sudo docker stats
```

#### **VNC Connection Issues:**
1. **Verify container status** is "running"
2. **Check VNC proxy** is accessible on port 8080
3. **Allow popups** in browser
4. **Try different browser** or incognito mode

#### **Database Connection:**
```bash
# Check PostgreSQL
sudo docker-compose exec postgres psql -U cyberlab_user -d cyberlab

# Check Redis
sudo docker-compose exec redis redis-cli ping
```

### **Performance Issues:**
- **Increase Docker memory** in Docker Desktop settings
- **Use SSD storage** for better I/O performance
- **Monitor resource usage** with `docker stats`
- **Limit concurrent containers** per user

##  **Advanced Usage**

### **Custom Container Images:**
```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y your-tools
EXPOSE 5900 22
```

### **Automation Scripts:**
```bash
# Launch container via API
curl -X POST http://localhost:8000/api/containers \
  -H "Content-Type: application/json" \
  -d '{"name":"auto-test","image":"selenium/standalone-chrome-debug"}'
```

### **Monitoring & Alerts:**
- **Resource thresholds** for CPU/memory
- **Container health checks**
- **User activity monitoring**
- **Cost optimization alerts**

##  **Support & Contributing**

- **Issues:** Report bugs and feature requests
- **Documentation:** Help improve guides and examples
- **Code:** Submit pull requests for improvements
- **Testing:** Help test on different platforms

---

**CyberForge by Akash** - Advanced Cybersecurity Operations Platform 🚀
# CyberForge
