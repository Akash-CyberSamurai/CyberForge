import React, { useState, useEffect } from 'react';
import { containerAPI } from '../services/api';

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  created_at: string;
  cpu_usage: number;
  memory_usage: number;
}

interface ContainerImage {
  name: string;
  tag: string;
  size: string;
  description: string;
}

const ContainerManager: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [images, setImages] = useState<ContainerImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [containerName, setContainerName] = useState('');

  // Sample container images for demonstration
  const sampleImages: ContainerImage[] = [
    {
      name: 'kalilinux/kali-rolling',
      tag: 'latest',
      size: '2.1GB',
      description: 'Kali Linux with full penetration testing tools'
    },
    {
      name: 'kalilinux/kali-purple',
      tag: 'latest',
      size: '2.3GB',
      description: 'Kali Linux Purple - Defensive Security Edition'
    },
    {
      name: 'chromium',
      tag: 'latest',
      size: '1.8GB',
      description: 'Chromium browser for web analysis'
    },
    {
      name: 'brave-browser',
      tag: 'latest',
      size: '1.9GB',
      description: 'Brave browser with privacy features'
    },
    {
      name: 'torproject/tor-browser',
      tag: 'latest',
      size: '2.0GB',
      description: 'Tor browser for anonymous browsing'
    },
    {
      name: 'ubuntu',
      tag: '22.04',
      size: '1.5GB',
      description: 'Ubuntu Desktop for custom tool installation'
    },
    {
      name: 'telegram-desktop',
      tag: 'latest',
      size: '800MB',
      description: 'Telegram Desktop for messaging analysis'
    }
  ];

  useEffect(() => {
    loadContainers();
    // Use sample images for now
    setImages(sampleImages);
  }, []);

  const loadContainers = async () => {
    try {
      setLoading(true);
      // For now, use sample data until backend is fully connected
      const sampleContainers: Container[] = [
        {
          id: '1',
          name: 'kali-pentest',
          image: 'kalilinux/kali-rolling:latest',
          status: 'running',
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          cpu_usage: 15,
          memory_usage: 2048
        },
        {
          id: '2',
          name: 'chrome-analysis',
          image: 'chromium:latest',
          status: 'stopped',
          created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          cpu_usage: 0,
          memory_usage: 0
        }
      ];
      setContainers(sampleContainers);
    } catch (error) {
      console.error('Failed to load containers:', error);
      // Fallback to sample data
      const sampleContainers: Container[] = [
        {
          id: '1',
          name: 'kali-pentest',
          image: 'kalilinux/kali-rolling:latest',
          status: 'running',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          cpu_usage: 15,
          memory_usage: 2048
        }
      ];
      setContainers(sampleContainers);
    } finally {
      setLoading(false);
    }
  };

  const launchContainer = async () => {
    if (!selectedImage || !containerName) {
      alert('Please select an image and enter a container name');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate container creation
      const newContainer: Container = {
        id: Date.now().toString(),
        name: containerName,
        image: selectedImage,
        status: 'starting',
        created_at: new Date().toISOString(),
        cpu_usage: 0,
        memory_usage: 0
      };
      
      // Add to list
      setContainers(prev => [...prev, newContainer]);
      
      // Reset form
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
    if (!confirm('Are you sure you want to delete this container?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Remove from list
      setContainers(prev => prev.filter(cont => cont.id !== containerId));
      
      alert('✅ Container deleted successfully!');
    } catch (error) {
      console.error('Failed to delete container:', error);
      alert('❌ Failed to delete container. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startContainer = async (containerId: string) => {
    try {
      setContainers(prev => 
        prev.map(cont => 
          cont.id === containerId 
            ? { ...cont, status: 'starting' }
            : cont
        )
      );
      
      // Simulate starting
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
    } catch (error) {
      console.error('Failed to start container:', error);
    }
  };

  const stopContainer = async (containerId: string) => {
    try {
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
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return '#00ff88';
      case 'stopped':
        return '#ff4444';
      case 'starting':
        return '#ffaa00';
      default:
        return '#888';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
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
              Select Image:
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
              <option value="">Choose an image...</option>
              {images.map((image, index) => (
                <option key={index} value={`${image.name}:${image.tag}`}>
                  {image.name}:{image.tag} - {image.description}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={launchContainer}
            disabled={loading || !selectedImage || !containerName}
            style={{
              padding: '12px 24px',
              backgroundColor: loading || !selectedImage || !containerName ? '#666' : '#00ff88',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !selectedImage || !containerName ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {loading ? '🔄 Launching...' : '🚀 Launch'}
          </button>
        </div>
      </div>

      {/* Container List */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        border: '1px solid #333'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#00ff88', margin: 0 }}>🐳 Your Containers</h3>
          <button
            onClick={loadContainers}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              border: '1px solid #00ff88',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            🔄 Loading containers...
          </div>
        ) : containers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            🐳 No containers found. Launch your first container above!
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px'
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
                    <strong>Image:</strong> {container.image}
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
                      <button style={{
                        padding: '8px 16px',
                        backgroundColor: '#2a2a2a',
                        color: '#ffffff',
                        border: '1px solid #00ff88',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        flex: 1
                      }}>
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

export default ContainerManager;
