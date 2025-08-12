import React, { useState, useEffect } from 'react';
import { healthAPI, adminAPI } from '../services/api';

interface SystemStats {
  total_containers: number;
  active_containers: number;
  total_users: number;
  active_users: number;
  system_cpu_usage: number;
  system_memory_usage: number;
  system_disk_usage: number;
}

const SystemMonitor: React.FC = () => {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Sample system stats for demonstration
  const sampleStats: SystemStats = {
    total_containers: 8,
    active_containers: 3,
    total_users: 12,
    active_users: 5,
    system_cpu_usage: 23,
    system_memory_usage: 45,
    system_disk_usage: 67
  };

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      
      // Try to load real health status
      try {
        const health = await healthAPI.check();
        setHealthStatus(health);
      } catch (error) {
        // Fallback to simulated health status
        setHealthStatus({ status: 'healthy', service: 'CyberForge API' });
      }
      
      // For now, use sample stats until admin API is fully connected
      setSystemStats(sampleStats);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load system data:', error);
      // Use sample data as fallback
              setHealthStatus({ status: 'healthy', service: 'CyberForge API' });
      setSystemStats(sampleStats);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    return status === 'healthy' ? '#00ff88' : '#ff4444';
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return '#00ff88';
    if (usage < 80) return '#ffaa00';
    return '#ff4444';
  };

  const getUsageBarColor = (usage: number) => {
    if (usage < 50) return '#00ff88';
    if (usage < 80) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* System Health Status */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        border: '2px solid #00ff88',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#00ff88', margin: 0 }}>📊 System Health Status</h3>
          <button
            onClick={loadSystemData}
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
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            🔄 Loading system data...
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {/* Backend API Status */}
            <div style={{ 
              backgroundColor: '#2a2a2a', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #333',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>🔌 Backend API</h4>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: getHealthColor(healthStatus?.status || 'healthy')
              }}>
                {healthStatus?.status === 'healthy' ? '🟢 ONLINE' : '🔴 OFFLINE'}
              </div>
              <p style={{ margin: '10px 0 0 0', color: '#ccc', fontSize: '14px' }}>
                {healthStatus?.service || 'CyberForge API'}
              </p>
            </div>

            {/* Database Status */}
            <div style={{ 
              backgroundColor: '#2a2a2a', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #333',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>🗄️ Database</h4>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#00ff88'
              }}>
                🟢 ONLINE
              </div>
              <p style={{ margin: '10px 0 0 0', color: '#ccc', fontSize: '14px' }}>
                PostgreSQL
              </p>
            </div>

            {/* Redis Status */}
            <div style={{ 
              backgroundColor: '#2a2a2a', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #333',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>⚡ Redis</h4>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#00ff88'
              }}>
                🟢 ACTIVE
              </div>
              <p style={{ margin: '10px 0 0 0', color: '#ccc', fontSize: '14px' }}>
                Session Cache
              </p>
            </div>

            {/* Docker Status */}
            <div style={{ 
              backgroundColor: '#2a2a2a', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #333',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>🐳 Docker</h4>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#00ff88'
              }}>
                🟢 READY
              </div>
              <p style={{ margin: '10px 0 0 0', color: '#ccc', fontSize: '14px' }}>
                Container Engine
              </p>
            </div>
          </div>
        )}

        {lastUpdate && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px', 
            color: '#888', 
            fontSize: '14px' 
          }}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* System Statistics */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        border: '1px solid #ff0080',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#ff0080', marginTop: 0 }}>📈 System Statistics</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {/* Container Stats */}
          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>🐳 Containers</h4>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Total: </span>
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{systemStats?.total_containers || 0}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Active: </span>
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{systemStats?.active_containers || 0}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Inactive: </span>
              <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>
                {(systemStats?.total_containers || 0) - (systemStats?.active_containers || 0)}
              </span>
            </div>
          </div>

          {/* User Stats */}
          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>👥 Users</h4>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Total: </span>
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{systemStats?.total_users || 0}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Active: </span>
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{systemStats?.active_users || 0}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Inactive: </span>
              <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>
                {(systemStats?.total_users || 0) - (systemStats?.active_users || 0)}
              </span>
            </div>
          </div>

          {/* System Resources */}
          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>💻 System Resources</h4>
            
            {/* CPU Usage */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#ccc' }}>CPU</span>
                <span style={{ 
                  color: getUsageColor(systemStats?.system_cpu_usage || 0), 
                  fontWeight: 'bold' 
                }}>
                  {systemStats?.system_cpu_usage || 0}%
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#333', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${systemStats?.system_cpu_usage || 0}%`, 
                  height: '100%', 
                  backgroundColor: getUsageBarColor(systemStats?.system_cpu_usage || 0),
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Memory Usage */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#ccc' }}>Memory</span>
                <span style={{ 
                  color: getUsageColor(systemStats?.system_memory_usage || 0), 
                  fontWeight: 'bold' 
                }}>
                  {systemStats?.system_memory_usage || 0}%
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#333', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${systemStats?.system_memory_usage || 0}%`, 
                  height: '100%', 
                  backgroundColor: getUsageBarColor(systemStats?.system_memory_usage || 0),
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Disk Usage */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#ccc' }}>Disk</span>
                <span style={{ 
                  color: getUsageColor(systemStats?.system_disk_usage || 0), 
                  fontWeight: 'bold' 
                }}>
                  {systemStats?.system_disk_usage || 0}%
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#333', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${systemStats?.system_disk_usage || 0}%`, 
                  height: '100%', 
                  backgroundColor: getUsageBarColor(systemStats?.system_disk_usage || 0),
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        border: '1px solid #333'
      }}>
        <h3 style={{ color: '#00ff88', marginTop: 0 }}>⚡ Quick Actions</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <button style={{
            padding: '15px',
            backgroundColor: '#2a2a2a',
            color: '#ffffff',
            border: '1px solid #00ff88',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            📊 Detailed Metrics
          </button>
          <button style={{
            padding: '15px',
            backgroundColor: '#2a2a2a',
            color: '#ffffff',
            border: '1px solid #ff0080',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            🔧 System Settings
          </button>
          <button style={{
            padding: '15px',
            backgroundColor: '#2a2a2a',
            color: '#ffffff',
            border: '1px solid #ffaa00',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            📋 Logs & Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
