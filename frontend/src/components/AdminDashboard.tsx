import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  last_login: string;
  container_count: number;
}

interface SystemStats {
  total_containers: number;
  active_containers: number;
  total_users: number;
  active_users: number;
  system_cpu_usage: number;
  system_memory_usage: number;
  system_disk_usage: number;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_containers: 15,
    active_containers: 8,
    total_users: 25,
    active_users: 12,
    system_cpu_usage: 45,
    system_memory_usage: 67,
    system_disk_usage: 78
  });
  const [currentView, setCurrentView] = useState('overview');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    // Sample user data
    const sampleUsers: User[] = [
      {
        id: '1',
        username: 'john_doe',
        email: 'john@company.com',
        role: 'user',
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        last_login: '2024-01-20T14:30:00Z',
        container_count: 2
      },
      {
        id: '2',
        username: 'jane_smith',
        email: 'jane@company.com',
        role: 'user',
        status: 'active',
        created_at: '2024-01-16T11:00:00Z',
        last_login: '2024-01-20T16:45:00Z',
        container_count: 1
      },
      {
        id: '3',
        username: 'bob_wilson',
        email: 'bob@company.com',
        role: 'user',
        status: 'inactive',
        created_at: '2024-01-10T09:00:00Z',
        last_login: '2024-01-18T12:20:00Z',
        container_count: 0
      }
    ];
    setUsers(sampleUsers);
  };

  const createUser = () => {
    const username = prompt('Enter username:');
    const email = prompt('Enter email:');
    const role = prompt('Enter role (user/admin):', 'user');

    if (username && email && role) {
      const newUser: User = {
        id: Date.now().toString(),
        username,
        email,
        role: role.toLowerCase(),
        status: 'active',
        created_at: new Date().toISOString(),
        last_login: 'Never',
        container_count: 0
      };

      setUsers(prev => [...prev, newUser]);
      alert('✅ User created successfully!');
    }
  };

  const deleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      alert('✅ User deleted successfully!');
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? '#ff0080' : '#00ff88';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#00ff88' : '#ff4444';
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return '#00ff88';
    if (usage < 80) return '#ffaa00';
    return '#ff4444';
  };

  const renderOverview = () => (
    <div style={{ padding: '20px' }}>
      {/* System Overview */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        border: '2px solid #00ff88',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#00ff88', marginTop: 0 }}>📊 System Overview</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>🐳 Containers</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00ff88' }}>
              {systemStats.active_containers}/{systemStats.total_containers}
            </div>
            <p style={{ margin: '10px 0 0 0', color: '#ccc' }}>Active/Total</p>
          </div>

          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>👥 Users</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00ff88' }}>
              {systemStats.active_users}/{systemStats.total_users}
            </div>
            <p style={{ margin: '10px 0 0 0', color: '#ccc' }}>Active/Total</p>
          </div>

          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>💻 CPU</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: getUsageColor(systemStats.system_cpu_usage) }}>
              {systemStats.system_cpu_usage}%
            </div>
            <p style={{ margin: '10px 0 0 0', color: '#ccc' }}>System Usage</p>
          </div>

          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>🧠 Memory</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: getUsageColor(systemStats.system_memory_usage) }}>
              {systemStats.system_memory_usage}%
            </div>
            <p style={{ margin: '10px 0 0 0', color: '#ccc' }}>System Usage</p>
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
          <button
            onClick={() => setCurrentView('users')}
            style={{
              padding: '15px',
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              border: '1px solid #00ff88',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            👥 Manage Users
          </button>
          <button
            onClick={() => setCurrentView('monitoring')}
            style={{
              padding: '15px',
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              border: '1px solid #ff0080',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📊 System Monitoring
          </button>
          <button
            onClick={() => setCurrentView('containers')}
            style={{
              padding: '15px',
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              border: '1px solid #ffaa00',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🐳 Container Management
          </button>
          <button style={{
            padding: '15px',
            backgroundColor: '#2a2a2a',
            color: '#ffffff',
            border: '1px solid #00ff88',
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

  const renderUsers = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        border: '2px solid #ff0080',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#ff0080', margin: 0 }}>👥 User Management</h3>
          <button
            onClick={createUser}
            style={{
              padding: '10px 20px',
              backgroundColor: '#00ff88',
              color: '#000000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ➕ Create User
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {users.map((user) => (
            <div key={user.id} style={{ 
              backgroundColor: '#2a2a2a', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <h4 style={{ color: '#00ff88', margin: 0 }}>{user.username}</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ 
                    color: getRoleColor(user.role),
                    fontWeight: 'bold',
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: '#2a2a2a',
                    border: `1px solid ${getRoleColor(user.role)}`,
                    borderRadius: '4px'
                  }}>
                    {user.role.toUpperCase()}
                  </span>
                  <span style={{ 
                    color: getStatusColor(user.status),
                    fontWeight: 'bold',
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: '#2a2a2a',
                    border: `1px solid ${getStatusColor(user.status)}`,
                    borderRadius: '4px'
                  }}>
                    {user.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '5px 0', color: '#ccc' }}>
                  <strong>Email:</strong> {user.email}
                </p>
                <p style={{ margin: '5px 0', color: '#ccc' }}>
                  <strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}
                </p>
                <p style={{ margin: '5px 0', color: '#ccc' }}>
                  <strong>Last Login:</strong> {user.last_login === 'Never' ? 'Never' : new Date(user.last_login).toLocaleDateString()}
                </p>
                <p style={{ margin: '5px 0', color: '#ccc' }}>
                  <strong>Containers:</strong> {user.container_count}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => toggleUserStatus(user.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: user.status === 'active' ? '#ffaa00' : '#00ff88',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    flex: 1
                  }}
                >
                  {user.status === 'active' ? '⏸️ Deactivate' : '▶️ Activate'}
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
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
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        border: '2px solid #ffaa00',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#ffaa00', marginTop: 0 }}>📊 Advanced System Monitoring</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>💻 System Resources</h4>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#ccc' }}>CPU Usage</span>
                <span style={{ color: getUsageColor(systemStats.system_cpu_usage), fontWeight: 'bold' }}>
                  {systemStats.system_cpu_usage}%
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
                  width: `${systemStats.system_cpu_usage}%`, 
                  height: '100%', 
                  backgroundColor: getUsageColor(systemStats.system_cpu_usage),
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#ccc' }}>Memory Usage</span>
                <span style={{ color: getUsageColor(systemStats.system_memory_usage), fontWeight: 'bold' }}>
                  {systemStats.system_memory_usage}%
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
                  width: `${systemStats.system_memory_usage}%`, 
                  height: '100%', 
                  backgroundColor: getUsageColor(systemStats.system_memory_usage),
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#ccc' }}>Disk Usage</span>
                <span style={{ color: getUsageColor(systemStats.system_disk_usage), fontWeight: 'bold' }}>
                  {systemStats.system_disk_usage}%
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
                  width: `${systemStats.system_disk_usage}%`, 
                  height: '100%', 
                  backgroundColor: getUsageColor(systemStats.system_disk_usage),
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>🐳 Container Statistics</h4>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Total Containers: </span>
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{systemStats.total_containers}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Active Containers: </span>
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{systemStats.active_containers}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Inactive Containers: </span>
              <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>
                {systemStats.total_containers - systemStats.active_containers}
              </span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Utilization Rate: </span>
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                {Math.round((systemStats.active_containers / systemStats.total_containers) * 100)}%
              </span>
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>👥 User Statistics</h4>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Total Users: </span>
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{systemStats.total_users}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Active Users: </span>
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{systemStats.active_users}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Inactive Users: </span>
              <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>
                {systemStats.total_users - systemStats.active_users}
              </span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc' }}>Engagement Rate: </span>
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                {Math.round((systemStats.active_users / systemStats.total_users) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContainers = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        border: '2px solid #00ff88',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#00ff88', margin: 0 }}>🐳 Container Management (Admin View)</h3>
        <p style={{ color: '#ccc', marginBottom: '20px' }}>
          Monitor and manage all containers across all users in the system.
        </p>
        
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#00ff88', margin: '0 0 15px 0' }}>System-wide Container Status</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff88' }}>
                {systemStats.total_containers}
              </div>
              <div style={{ color: '#ccc', fontSize: '14px' }}>Total Containers</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff88' }}>
                {systemStats.active_containers}
              </div>
              <div style={{ color: '#ccc', fontSize: '14px' }}>Running</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffaa00' }}>
                {systemStats.total_containers - systemStats.active_containers}
              </div>
              <div style={{ color: '#ccc', fontSize: '14px' }}>Stopped</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff88' }}>
                {Math.round((systemStats.active_containers / systemStats.total_containers) * 100)}%
              </div>
              <div style={{ color: '#ccc', fontSize: '14px' }}>Utilization</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case 'users':
        return renderUsers();
      case 'monitoring':
        return renderMonitoring();
      case 'containers':
        return renderContainers();
      default:
        return renderOverview();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Admin Header */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        border: '2px solid #ff0080',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#ff0080', marginTop: 0 }}>👑 Admin Dashboard</h2>
        <p style={{ color: '#ccc', marginBottom: '20px' }}>
          Manage users, monitor system resources, and oversee the entire CyberForge platform.
        </p>
      </div>

      {/* Admin Navigation */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '15px 25px', 
        borderRadius: '12px',
        border: '1px solid #333',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentView('overview')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentView === 'overview' ? '#ff0080' : '#2a2a2a',
              color: currentView === 'overview' ? '#ffffff' : '#ffffff',
              border: '1px solid #ff0080',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setCurrentView('users')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentView === 'users' ? '#ff0080' : '#2a2a2a',
              color: currentView === 'users' ? '#ffffff' : '#ffffff',
              border: '1px solid #ff0080',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            👥 Users
          </button>
          <button
            onClick={() => setCurrentView('monitoring')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentView === 'monitoring' ? '#ff0080' : '#2a2a2a',
              color: currentView === 'monitoring' ? '#ffffff' : '#ffffff',
              border: '1px solid #ff0080',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📈 Monitoring
          </button>
          <button
            onClick={() => setCurrentView('containers')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentView === 'containers' ? '#ff0080' : '#2a2a2a',
              color: currentView === 'containers' ? '#ffffff' : '#ffffff',
              border: '1px solid #ff0080',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🐳 Containers
          </button>
        </div>
      </div>

      {/* Main Content */}
      {renderView()}
    </div>
  );
};

export default AdminDashboard;
