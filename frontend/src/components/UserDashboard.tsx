import React, { useState, useEffect } from 'react';

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  created_at: string;
  cpu_usage: number;
  memory_usage: number;
  vnc_url?: string;
  ssh_command?: string;
}

const UserDashboard: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [containerName, setContainerName] = useState('');

  // Sample container images for users
  const availableImages = [
    { name: 'kalilinux/kali-rolling', tag: 'latest', description: 'Kali Linux with full penetration testing tools' },
    { name: 'kalilinux/kali-purple', tag: 'latest', description: 'Kali Linux Purple - Defensive Security Edition' },
    { name: 'chromium', tag: 'latest', description: 'Chromium browser for web analysis' },
    { name: 'brave-browser', tag: 'latest', description: 'Brave browser with privacy features' },
    { name: 'torproject/tor-browser', tag: 'latest', description: 'Tor browser for anonymous browsing' },
    { name: 'ubuntu', tag: '22.04', description: 'Clean Ubuntu environment for custom tool installation' }
  ];

  useEffect(() => {
    loadUserContainers();
  }, []);

  const loadUserContainers = () => {
    // Simulate loading user containers
    const userContainers = [
      {
        id: '1',
        name: 'my-kali-lab',
        image: 'kalilinux/kali-rolling:latest',
        status: 'running',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        cpu_usage: 12,
        memory_usage: 1800,
        vnc_url: `http://${window.location.hostname}:8080/vnc.html?host=${window.location.hostname}&port=5900&autoconnect=true`,
        ssh_command: `ssh -p 22 root@${window.location.hostname}`
      }
    ];
    setContainers(userContainers);
  };

  const launchContainer = () => {
    if (!selectedImage || !containerName) {
      alert('Please select an image and enter a container name');
      return;
    }

    if (containers.filter(c => c.status === 'running').length >= 2) {
      alert('❌ You can only have 2 concurrent containers running. Please stop one first.');
      return;
    }

    const newContainer: Container = {
      id: Date.now().toString(),
      name: containerName,
      image: selectedImage,
      status: 'starting',
      created_at: new Date().toISOString(),
      cpu_usage: 0,
      memory_usage: 0,
      vnc_url: `http://${window.location.hostname}:8080/vnc.html?host=${window.location.hostname}&port=5900&autoconnect=true`,
      ssh_command: `ssh -p 22 root@${window.location.hostname}`
    };

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
  };

  const deleteContainer = (containerId: string) => {
    if (window.confirm('Are you sure you want to delete this container?')) {
      setContainers(prev => prev.filter(cont => cont.id !== containerId));
      alert('✅ Container deleted successfully!');
    }
  };

  const startContainer = (containerId: string) => {
    setContainers(prev => 
      prev.map(cont => 
        cont.id === containerId 
          ? { ...cont, status: 'starting' }
          : cont
      )
    );
    
    setTimeout(() => {
      setContainers(prev => 
        prev.map(cont => 
          cont.id === containerId 
            ? { ...cont, status: 'running', cpu_usage: 5, memory_usage: 1024 }
            : cont
        )
      );
    }, 2000);
    
    alert('🚀 Container starting up...');
  };

  const stopContainer = (containerId: string) => {
    setContainers(prev => 
      prev.map(cont => 
        cont.id === containerId 
          ? { ...cont, status: 'stopped', cpu_usage: 0, memory_usage: 0 }
          : cont
      )
    );
    
    alert('⏹️ Container stopped successfully!');
  };

  const connectToContainer = (container: Container) => {
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
      case 'running': return '#00ff88';
      case 'stopped': return '#ff4444';
      case 'starting': return '#ffaa00';
      default: return '#888';
    }
  };

  const runningContainers = containers.filter(c => c.status === 'running').length;
  const maxContainers = 2;

  return (
    <div style={{ padding: '20px' }}>
      {/* User Welcome */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        border: '2px solid #00ff88',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#00ff88', marginTop: 0 }}>👋 Welcome to Your CyberForge</h2>
        <p style={{ color: '#ccc', marginBottom: '20px' }}>
          Manage your cybersecurity tools and containers. You can run up to {maxContainers} concurrent containers.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#00ff88', margin: '0 0 10px 0' }}>🐳 Active Containers</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00ff88' }}>
              {runningContainers}/{maxContainers}
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#00ff88', margin: '0 0 10px 0' }}>🛠️ Available Tools</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00ff88' }}>
              {availableImages.length}
            </div>
          </div>
        </div>
      </div>

      {/* Launch New Container */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        border: '2px solid #00ff88',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#00ff88', marginTop: 0 }}>🚀 Launch New Container</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#00ff88' }}>
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
                border: '1px solid #333',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#00ff88' }}>
              Select Tool:
            </label>
            <select
              value={selectedImage}
              onChange={(e) => setSelectedImage(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                fontSize: '16px'
              }}
            >
              <option value="">Choose a tool...</option>
              {availableImages.map((image, index) => (
                <option key={index} value={`${image.name}:${image.tag}`}>
                  {image.name}:{image.tag} - {image.description}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={launchContainer}
            disabled={!selectedImage || !containerName || runningContainers >= maxContainers}
            style={{
              padding: '12px 24px',
              backgroundColor: (!selectedImage || !containerName || runningContainers >= maxContainers) ? '#666' : '#00ff88',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              cursor: (!selectedImage || !containerName || runningContainers >= maxContainers) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {runningContainers >= maxContainers ? '🚫 Limit Reached' : '🚀 Launch'}
          </button>
        </div>

        {runningContainers >= maxContainers && (
          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            backgroundColor: '#ff4444', 
            color: '#ffffff', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            ⚠️ You've reached your limit of {maxContainers} concurrent containers. Please stop one before launching another.
          </div>
        )}
      </div>

      {/* User's Containers */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        border: '1px solid #333'
      }}>
        <h3 style={{ color: '#00ff88', margin: 0 }}>🐳 Your Containers</h3>
        
        {containers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            🐳 No containers found. Launch your first container above!
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {containers.map((container) => (
              <div key={container.id} style={{ 
                backgroundColor: '#2a2a2a', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid #333'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h4 style={{ color: '#00ff88', margin: 0 }}>{container.name}</h4>
                  <span style={{ 
                    color: getStatusColor(container.status),
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {container.status.toUpperCase()}
                  </span>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: '5px 0', color: '#ccc' }}>
                    <strong>Tool:</strong> {container.image}
                  </p>
                  <p style={{ margin: '5px 0', color: '#ccc' }}>
                    <strong>Created:</strong> {new Date(container.created_at).toLocaleString()}
                  </p>
                  <p style={{ margin: '5px 0', color: '#ccc' }}>
                    <strong>CPU:</strong> {container.cpu_usage}%
                  </p>
                  <p style={{ margin: '5px 0', color: '#ccc' }}>
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
                          backgroundColor: '#2a2a2a',
                          color: '#ffffff',
                          border: '1px solid #00ff88',
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
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ffaa00',
                          color: '#000000',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
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
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#00ff88',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        flex: 1
                      }}
                    >
                      🚀 Start
                    </button>
                  )}
                  <button
                    onClick={() => deleteContainer(container.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ff4444',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
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
};

export default UserDashboard;
