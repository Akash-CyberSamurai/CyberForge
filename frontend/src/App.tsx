import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [currentView, setCurrentView] = useState('dashboard');
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [containerName, setContainerName] = useState('');

  // Sample user data - in real app this would come from backend
  const users = {
    'admin': { role: 'admin', password: 'admin123' },
    'john': { role: 'user', password: 'user123' },
    'jane': { role: 'user', password: 'user123' }
  };

  // Available container images
  const availableImages = [
    { id: '1', name: 'kalilinux/kali-rolling', tag: 'latest', description: 'Kali Linux with full penetration testing tools', category: 'Penetration Testing' },
    { id: '2', name: 'kalilinux/kali-purple', tag: 'latest', description: 'Kali Linux Purple - Defensive Security Edition', category: 'Defensive Security' },
    { id: '3', name: 'selenium/standalone-chrome-debug', tag: 'latest', description: 'Chrome browser with VNC access for safe web browsing and analysis', category: 'Web Analysis' },
    { id: '4', name: 'selenium/standalone-firefox-debug', tag: 'latest', description: 'Firefox browser with VNC access for web analysis', category: 'Web Analysis' },
    { id: '5', name: 'torproject/tor-browser', tag: 'latest', description: 'Tor browser for anonymous browsing', category: 'Anonymous Browsing' },
    { id: '6', name: 'ubuntu', tag: '22.04', description: 'Clean Ubuntu environment for custom tool installation', category: 'Operating System' },
    { id: '7', name: 'telegram-desktop', tag: 'latest', description: 'Telegram Desktop for messaging analysis', category: 'Communication' }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const usernameInput = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    
    if (users[usernameInput as keyof typeof users] && users[usernameInput as keyof typeof users].password === password) {
      setUsername(usernameInput);
      setUserRole(users[usernameInput as keyof typeof users].role);
      setIsLoggedIn(true);
      setCurrentView('dashboard');
      loadUserContainers();
    } else {
      alert('❌ Invalid credentials!\n\nTry:\n- admin / admin123 (Admin)\n- john / user123 (User)\n- jane / user123 (User)');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserRole('user');
    setCurrentView('dashboard');
    setContainers([]);
  };

  const loadUserContainers = async () => {
    setLoading(true);
    try {
      // Simulate API call - in real app this would be: fetch('/api/containers')
      const response = await new Promise(resolve => setTimeout(() => {
        resolve({
          containers: [
            {
              id: '1',
              name: 'my-kali-lab',
              image: 'kalilinux/kali-rolling:latest',
              status: 'running',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              cpu_usage: 12,
              memory_usage: 1800,
              vnc_url: `https://${window.location.hostname}:8080/vnc.html?host=${window.location.hostname}&port=5900&autoconnect=true`,
              ssh_command: `ssh -p 22 root@${window.location.hostname}`,
              is_selenium: false
            }
          ]
        });
      }, 1000));
      
      setContainers(response.containers);
    } catch (error) {
      console.error('Failed to load containers:', error);
      // Fallback to sample data
      setContainers([
        {
          id: '1',
          name: 'my-kali-lab',
          image: 'kalilinux/kali-rolling:latest',
          status: 'running',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          cpu_usage: 12,
          memory_usage: 1800,
          vnc_url: `https://${window.location.hostname}:8080/vnc.html?host=${window.location.hostname}&port=5900&autoconnect=true`,
          ssh_command: `ssh -p 22 root@${window.location.hostname}`,
          is_selenium: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const launchContainer = async () => {
    if (!selectedImage || !containerName) {
      alert('Please select an image and enter a container name');
      return;
    }

    if (containers.filter(c => c.status === 'running').length >= 2) {
      alert('❌ You can only have 2 concurrent containers running. Please stop one first.');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call - in real app this would be: fetch('/api/containers', { method: 'POST', body: {...} })
      const response = await new Promise(resolve => setTimeout(() => {
        const selectedImg = availableImages.find(img => img.id === selectedImage);
        const isSelenium = selectedImg?.name.includes('selenium');
        
        // Generate proper VNC URL based on container type
        let vncUrl = '';
        let sshCommand = '';
        
        if (isSelenium) {
          // Selenium containers use port 7900 for VNC
          vncUrl = `https://${window.location.hostname}:8080/vnc.html?host=${window.location.hostname}&port=7900&autoconnect=true&resize=scale`;
          sshCommand = `ssh -p 22 root@${window.location.hostname}`;
        } else {
          // Regular containers use port 5900 for VNC
          vncUrl = `https://${window.location.hostname}:8080/vnc.html?host=${window.location.hostname}&port=5900&autoconnect=true`;
          sshCommand = `ssh -p 22 root@${window.location.hostname}`;
        }
        
        resolve({
          container: {
            id: Date.now().toString(),
            name: containerName,
            image: selectedImg ? `${selectedImg.name}:${selectedImg.tag}` : selectedImage,
            status: 'starting',
            created_at: new Date().toISOString(),
            cpu_usage: 0,
            memory_usage: 0,
            vnc_url: vncUrl,
            ssh_command: sshCommand,
            is_selenium: isSelenium
          }
        });
      }, 2000));

      const newContainer = response.container;
      setContainers(prev => [...prev, newContainer]);
      setSelectedImage('');
      setContainerName('');

      // Simulate container starting
      setTimeout(() => {
        setContainers(prev => 
          prev.map(cont => 
            cont.id === newContainer.id 
              ? { ...cont, status: 'running', cpu_usage: 5, memory_usage: 1024 }
              : cont
          )
        );
      }, 3000);

      alert('✅ Container launched successfully! Starting up...');
    } catch (error) {
      console.error('Failed to launch container:', error);
      alert('❌ Failed to launch container. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteContainer = async (containerId: string) => {
    if (window.confirm('Are you sure you want to delete this container?')) {
      setLoading(true);
      try {
        // Simulate API call - in real app this would be: fetch(`/api/containers/${containerId}`, { method: 'DELETE' })
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setContainers(prev => prev.filter(cont => cont.id !== containerId));
        alert('✅ Container deleted successfully!');
      } catch (error) {
        console.error('Failed to delete container:', error);
        alert('❌ Failed to delete container. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const startContainer = async (containerId: string) => {
    setLoading(true);
    try {
      setContainers(prev => 
        prev.map(cont => 
          cont.id === containerId 
            ? { ...cont, status: 'starting' }
            : cont
        )
      );
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setContainers(prev => 
        prev.map(cont => 
          cont.id === containerId 
            ? { ...cont, status: 'running', cpu_usage: 5, memory_usage: 1024 }
            : cont
        )
      );
      
      alert('🚀 Container started successfully!');
    } catch (error) {
      console.error('Failed to start container:', error);
      alert('❌ Failed to start container. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stopContainer = async (containerId: string) => {
    setLoading(true);
    try {
      setContainers(prev => 
        prev.map(cont => 
          cont.id === containerId 
            ? { ...cont, status: 'stopping' }
            : cont
        )
      );
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setContainers(prev => 
        prev.map(cont => 
          cont.id === containerId 
            ? { ...cont, status: 'stopped', cpu_usage: 0, memory_usage: 0 }
            : cont
        )
      );
      
      alert('⏹️ Container stopped successfully!');
    } catch (error) {
      console.error('Failed to stop container:', error);
      alert('❌ Failed to stop container. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const connectToContainer = (container: any) => {
    if (container.status !== 'running') {
      alert('❌ Container must be running to connect!');
      return;
    }

    const connectionType = window.confirm(
      'Choose connection type:\n\n' +
      'OK = VNC (Graphical Desktop)\n' +
      'Cancel = SSH (Terminal)'
    );

    if (connectionType) {
      // VNC Connection
      if (container.vnc_url) {
        if (container.is_selenium) {
          alert('🌐 Opening Selenium browser container...\n\n' +
                '📱 This will open a Chrome/Firefox browser that you can control.\n' +
                '🔍 Perfect for web scraping, testing, and analysis.\n' +
                '⚡ The browser will be isolated and safe for any website.');
        }
        
        window.open(container.vnc_url, '_blank', 'width=1200,height=800');
        alert('🌐 Opening VNC connection in new window...\n\nIf the window doesn\'t open, check your popup blocker!');
      } else {
        alert('❌ VNC connection not available for this container');
      }
    } else {
      // SSH Connection
      if (container.ssh_command) {
        const sshInfo = `SSH Connection Details:\n\n` +
          `Command: ${container.ssh_command}\n` +
          `Username: root\n` +
          `Password: (check container documentation)\n\n` +
          `You can use:\n` +
          `- Terminal/SSH client\n` +
          `- Web-based SSH (if available)\n` +
          `- VS Code Remote SSH extension`;
        
        alert(sshInfo);
        
        if (navigator.clipboard) {
          navigator.clipboard.writeText(container.ssh_command);
          alert('📋 SSH command copied to clipboard!');
        }
      } else {
        alert('❌ SSH connection not available for this container');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running': return '#28a745';
      case 'stopped': return '#dc3545';
      case 'starting': return '#ffc107';
      case 'stopping': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const renderUserDashboard = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '25px', 
        borderRadius: '12px',
        border: '2px solid #3498db',
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#3498db', marginTop: 0 }}>👋 Welcome to Your CyberForge</h2>
        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
          Manage your cybersecurity tools and containers. You can run up to 2 concurrent containers.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#3498db', margin: '0 0 10px 0' }}>🐳 Active Containers</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3498db' }}>
              {containers.filter(c => c.status === 'running').length}/2
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#3498db', margin: '0 0 10px 0' }}>🛠️ Available Tools</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3498db' }}>
              {availableImages.length}
            </div>
          </div>
        </div>
      </div>

      {/* Launch New Container */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '25px', 
        borderRadius: '12px',
        border: '2px solid #3498db',
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#3498db', marginTop: 0 }}>🚀 Launch New Container</h3>
          <button
            onClick={loadUserContainers}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Refresh
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#3498db' }}>
              Container Name:
            </label>
            <input
              type="text"
              value={containerName}
              onChange={(e) => setContainerName(e.target.value)}
              placeholder="Enter container name"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e9ecef',
                backgroundColor: '#ffffff',
                color: '#2c3e50',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#3498db' }}>
              Select Tool:
            </label>
            <select
              value={selectedImage}
              onChange={(e) => setSelectedImage(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e9ecef',
                backgroundColor: '#ffffff',
                color: '#2c3e50',
                fontSize: '16px'
              }}
            >
              <option value="">Choose a tool...</option>
              {availableImages.map((image) => (
                <option key={image.id} value={image.id}>
                  {image.name}:{image.tag} - {image.description}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={launchContainer}
            disabled={!selectedImage || !containerName || containers.filter(c => c.status === 'running').length >= 2 || loading}
            style={{
              padding: '12px 24px',
              backgroundColor: (!selectedImage || !containerName || containers.filter(c => c.status === 'running').length >= 2 || loading) ? '#6c757d' : '#3498db',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: (!selectedImage || !containerName || containers.filter(c => c.status === 'running').length >= 2 || loading) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {loading ? '🔄 Launching...' : containers.filter(c => c.status === 'running').length >= 2 ? '🚫 Limit Reached' : '🚀 Launch'}
          </button>
        </div>

        {containers.filter(c => c.status === 'running').length >= 2 && (
          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            backgroundColor: '#dc3545', 
            color: '#ffffff', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            ⚠️ You've reached your limit of 2 concurrent containers. Please stop one before launching another.
          </div>
        )}
      </div>

      {/* User's Containers */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '25px', 
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#3498db', marginTop: 0 }}>🐳 Your Containers</h3>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            🔄 Loading containers...
          </div>
        )}
        
        {!loading && containers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            🐳 No containers found. Launch your first container above!
          </div>
        )}
        
        {!loading && containers.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {containers.map((container) => (
              <div key={container.id} style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h4 style={{ color: '#3498db', margin: 0 }}>{container.name}</h4>
                  <span style={{ 
                    color: getStatusColor(container.status),
                    fontWeight: 'bold',
                    fontSize: '14px',
                    padding: '4px 8px',
                    backgroundColor: '#ffffff',
                    border: `1px solid ${getStatusColor(container.status)}`,
                    borderRadius: '4px'
                  }}>
                    {container.status.toUpperCase()}
                  </span>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: '5px 0', color: '#6c757d' }}>
                    <strong>Tool:</strong> {container.image}
                  </p>
                  <p style={{ margin: '5px 0', color: '#6c757d' }}>
                    <strong>Created:</strong> {new Date(container.created_at).toLocaleString()}
                  </p>
                  <p style={{ margin: '5px 0', color: '#6c757d' }}>
                    <strong>CPU:</strong> {container.cpu_usage}%
                  </p>
                  <p style={{ margin: '5px 0', color: '#6c757d' }}>
                    <strong>Memory:</strong> {container.memory_usage} MB
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {container.status === 'running' ? (
                    <>
                      <button
                        onClick={() => connectToContainer(container)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ffffff',
                          color: '#3498db',
                          border: '1px solid #3498db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          flex: 1
                        }}
                      >
                        🔗 Connect
                      </button>
                      <button
                        onClick={() => stopContainer(container.id)}
                        disabled={loading}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ffc107',
                          color: '#212529',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          flex: 1
                        }}
                      >
                        ⏹️ Stop
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startContainer(container.id)}
                      disabled={loading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        flex: 1
                      }}
                    >
                      🚀 Start
                    </button>
                  )}
                  <button
                    onClick={() => deleteContainer(container.id)}
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      flex: 1
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '25px', 
        borderRadius: '12px',
        border: '2px solid #e74c3c',
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#e74c3c', marginTop: 0 }}>👑 Admin Dashboard</h2>
        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
          Manage users, monitor system resources, and oversee the entire CyberForge platform.
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '25px', 
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#3498db', marginTop: 0 }}>📊 System Overview</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#3498db', margin: '0 0 15px 0' }}>🐳 Containers</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3498db' }}>
              8/15
            </div>
            <p style={{ margin: '10px 0 0 0', color: '#6c757d' }}>Active/Total</p>
          </div>

          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#3498db', margin: '0 0 15px 0' }}>👥 Users</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3498db' }}>
              12/25
            </div>
            <p style={{ margin: '10px 0 0 0', color: '#6c757d' }}>Active/Total</p>
          </div>

          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#3498db', margin: '0 0 15px 0' }}>💻 CPU</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
              45%
            </div>
            <p style={{ margin: '10px 0 0 0', color: '#6c757d' }}>System Usage</p>
          </div>

          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#3498db', margin: '0 0 15px 0' }}>🧠 Memory</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
              67%
            </div>
            <p style={{ margin: '10px 0 0 0', color: '#6c757d' }}>System Usage</p>
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '25px', 
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#3498db', marginTop: 0 }}>⚡ Quick Actions</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <button style={{
            padding: '15px',
            backgroundColor: '#ffffff',
            color: '#3498db',
            border: '1px solid #3498db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            👥 Manage Users
          </button>
          <button style={{
            padding: '15px',
            backgroundColor: '#ffffff',
            color: '#e74c3c',
            border: '1px solid #e74c3c',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            📊 System Monitoring
          </button>
          <button style={{
            padding: '15px',
            backgroundColor: '#ffffff',
            color: '#ffc107',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            🐳 Container Management
          </button>
          <button style={{
            padding: '15px',
            backgroundColor: '#ffffff',
            color: '#3498db',
            border: '1px solid #3498db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            ⚙️ System Settings
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoggedIn) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        color: '#2c3e50', 
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div>
            <h1 style={{ color: userRole === 'admin' ? '#e74c3c' : '#3498db', margin: 0 }}>
              {userRole === 'admin' ? '👑 CyberForge' : '⚡ CyberForge'}
            </h1>
            <div style={{ 
              color: userRole === 'admin' ? '#e74c3c' : '#3498db', 
              fontSize: '14px',
              marginTop: '2px',
              fontStyle: 'italic'
            }}>
              by Akash
            </div>
            <p style={{ color: '#6c757d', margin: '5px 0 0 0' }}>
              {userRole === 'admin' ? 'Administrative Control Panel' : 'User Dashboard'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: userRole === 'admin' ? '#e74c3c' : '#3498db' }}>
                Welcome, {username}!
              </span>
              <div style={{ 
                color: userRole === 'admin' ? '#e74c3c' : '#3498db', 
                fontSize: '12px',
                marginTop: '2px'
              }}>
                Role: {userRole.toUpperCase()}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        {userRole === 'admin' ? renderAdminDashboard() : renderUserDashboard()}
      </div>
    );
  }

  // Login Form (shown when not logged in)
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      color: '#2c3e50', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#3498db', textAlign: 'center', marginBottom: '5px' }}>⚡ CyberForge</h1>
      <div style={{ 
        color: '#3498db', 
        fontSize: '16px',
        textAlign: 'center',
        marginBottom: '20px',
        fontStyle: 'italic'
      }}>
        by Akash
      </div>
      <h2 style={{ textAlign: 'center', color: '#6c757d' }}>Advanced Cybersecurity Operations Platform</h2>
      
      {/* Login Form */}
      <div style={{ 
        maxWidth: '400px', 
        margin: '50px auto', 
        backgroundColor: '#ffffff', 
        padding: '30px', 
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        boxShadow: '0 8px 32px rgba(52, 152, 219, 0.2)'
      }}>
        <h3 style={{ color: '#3498db', textAlign: 'center', marginBottom: '30px' }}>
          🔐 Login to CyberForge
        </h3>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#3498db' }}>
              Username:
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter username"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e9ecef',
                backgroundColor: '#ffffff',
                color: '#2c3e50',
                fontSize: '16px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#3498db' }}>
              Password:
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e9ecef',
                backgroundColor: '#ffffff',
                color: '#2c3e50',
                fontSize: '16px'
              }}
              required
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#3498db',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(52, 152, 219, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2980b9';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(52, 152, 219, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3498db';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(52, 152, 219, 0.3)';
            }}
          >
            🚀 Launch CyberForge
          </button>
        </form>
        
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#6c757d' 
        }}>
          <div style={{ 
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <strong>🔐 Secure Access</strong><br/>
            Contact your system administrator for login credentials
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '50px auto', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#e74c3c' }}>🔒 Security Features</h3>
          <ul>
            <li>Container isolation</li>
            <li>10-min timeout</li>
            <li>2 concurrent limit</li>
            <li>Resource monitoring</li>
          </ul>
        </div>
        
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#3498db' }}>🛠️ Available Tools</h3>
          <ul>
            <li>Kali Linux</li>
            <li>Chrome/Brave/Tor</li>
            <li>Ubuntu Desktop</li>
            <li>Telegram Desktop</li>
          </ul>
        </div>
        
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#f39c12' }}>💰 Cost Benefits</h3>
          <ul>
            <li>Auto-destroy containers</li>
            <li>Resource optimization</li>
            <li>Fast deployment</li>
            <li>Professional UI</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
