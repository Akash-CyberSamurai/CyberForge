# 🧪 **Selenium Container Test Guide**

## 🚀 **Quick Test Steps:**

### **1. Launch Selenium Container:**
1. **Login** to CyberForge
2. **Select:** `selenium/standalone-chrome-debug:latest`
3. **Name:** `test-chrome`
4. **Click:** 🚀 Launch

### **2. Wait for Container:**
- **Status:** "starting" → "running"
- **Time:** 2-3 minutes for full initialization
- **Check:** CPU and memory usage appear

### **3. Connect via VNC:**
1. **Click:** 🔗 Connect
2. **Choose:** VNC (OK button)
3. **Wait:** New window opens
4. **Result:** Chrome browser interface

## 🔧 **Troubleshooting:**

### **❌ "Connection Reset" Error:**
**Solutions:**
1. **Wait longer** - Container needs time to start
2. **Check status** - Must be "running" (not "starting")
3. **Use VNC** - Don't use SSH for Selenium
4. **Allow popups** - Check browser popup blocker

### **🌐 VNC Window Not Opening:**
**Solutions:**
1. **Check popup blocker** - Allow popups for your domain
2. **Try different browser** - Chrome, Firefox, Edge
3. **Clear cache** - Clear browser data
4. **Incognito mode** - Test in private browsing

### **📱 Browser Not Responding:**
**Solutions:**
1. **Wait 5-10 minutes** - Selenium takes time to initialize
2. **Refresh connection** - Close and reopen VNC
3. **Check resources** - Ensure container has CPU/memory
4. **Restart container** - Stop and start again

## 🎯 **Expected Behavior:**

### **✅ Success Indicators:**
- Container status shows "running"
- VNC window opens with Chrome interface
- Browser responds to mouse/keyboard
- Can navigate to websites
- No connection errors

### **❌ Failure Indicators:**
- Container stuck in "starting" status
- VNC window doesn't open
- "Connection reset" errors
- Browser not responding
- Timeout errors

## 🆘 **If Still Not Working:**

### **Check System Resources:**
```bash
# Check Docker resources
sudo docker stats

# Check system resources
free -h
df -h
```

### **Check Container Logs:**
```bash
# Check container logs
sudo docker logs <container_id>

# Check VNC proxy logs
sudo docker-compose logs vnc-proxy
```

### **Alternative Solutions:**
1. **Use different image** - Try Firefox instead of Chrome
2. **Reduce resource limits** - Lower CPU/memory allocation
3. **Check firewall** - Ensure ports 8080 and 7900 are open
4. **Restart services** - Restart Docker and CyberForge

## 📞 **Need Help?**

- **Check README.md** for detailed troubleshooting
- **Verify system requirements** - Docker, memory, storage
- **Test with simple container** - Ubuntu first, then Selenium
- **Check network connectivity** - Internet access required

---

**Remember:** Selenium containers are complex and take time to initialize. Patience is key! 🕐✨
