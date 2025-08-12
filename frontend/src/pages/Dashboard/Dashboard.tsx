import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Delete,
  Add,
  Refresh,
  Security,
  Memory,
  Storage,
  Speed,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { fetchContainers, createContainer, destroyContainer } from '../../store/slices/containerSlice';
import ContainerCreationModal from '../../components/ContainerCreationModal/ContainerCreationModal';
import ResourceUsageChart from '../../components/ResourceUsageChart/ResourceUsageChart';
import { Container, ContainerImage } from '../../types/container';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { containers, loading, error } = useSelector((state: RootState) => state.containers);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ContainerImage | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  useEffect(() => {
    dispatch(fetchContainers());
  }, [dispatch]);

  const handleCreateContainer = async (imageId: string, containerName: string) => {
    try {
      await dispatch(createContainer({ imageId, name: containerName }));
      setSnackbar({ open: true, message: 'Container created successfully!', severity: 'success' });
      setIsModalOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create container', severity: 'error' });
    }
  };

  const handleDestroyContainer = async (containerId: string) => {
    try {
      await dispatch(destroyContainer(containerId));
      setSnackbar({ open: true, message: 'Container destroyed successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to destroy container', severity: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'starting':
        return 'warning';
      case 'stopped':
        return 'error';
      default:
        return 'default';
    }
  };

  const getResourceUsage = () => {
    const runningContainers = containers.filter(c => c.status === 'running');
    const totalCpu = runningContainers.reduce((sum, c) => sum + (c.cpu_usage || 0), 0);
    const totalMemory = runningContainers.reduce((sum, c) => sum + (c.memory_usage_mb || 0), 0);
    
    return {
      cpu: totalCpu,
      memory: totalMemory,
      containers: runningContainers.length,
      maxContainers: user?.max_concurrent_containers || 2
    };
  };

  const resourceUsage = getResourceUsage();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome back, {user?.username}!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your cybersecurity lab containers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsModalOpen(true)}
          disabled={resourceUsage.containers >= resourceUsage.maxContainers}
          sx={{ px: 3, py: 1.5 }}
        >
          Launch Container
        </Button>
      </Box>

      {/* Resource Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">CPU Usage</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {resourceUsage.cpu.toFixed(1)} cores
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(resourceUsage.cpu / 4) * 100} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Memory sx={{ color: 'secondary.main', mr: 1 }} />
                <Typography variant="h6">Memory Usage</Typography>
              </Box>
              <Typography variant="h4" color="secondary.main">
                {resourceUsage.memory} MB
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(resourceUsage.memory / 8192) * 100} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6">Active Containers</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {resourceUsage.containers}/{resourceUsage.maxContainers}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(resourceUsage.containers / resourceUsage.maxContainers) * 100} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6">Security Status</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                Secure
              </Typography>
              <Chip 
                label="All containers isolated" 
                color="success" 
                size="small" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => dispatch(fetchContainers())}
            >
              Refresh Status
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Stop />}
              disabled={!containers.some(c => c.status === 'running')}
            >
              Stop All
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              disabled={!containers.some(c => c.status !== 'destroyed')}
            >
              Destroy All
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Active Containers */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Active Containers</Typography>
            <Chip 
              label={`${resourceUsage.containers}/${resourceUsage.maxContainers} Active`}
              color={resourceUsage.containers >= resourceUsage.maxContainers ? 'error' : 'success'}
            />
          </Box>
          
          {loading ? (
            <LinearProgress />
          ) : containers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No containers running
              </Typography>
              <Typography color="text.secondary">
                Launch your first container to get started
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {containers.map((container) => (
                <Grid item xs={12} md={6} lg={4} key={container.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" noWrap>
                          {container.name}
                        </Typography>
                        <Chip 
                          label={container.status} 
                          color={getStatusColor(container.status) as any}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {container.image_name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip 
                          label={`CPU: ${container.cpu_usage || 0} cores`} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`RAM: ${container.memory_usage_mb || 0} MB`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {container.status === 'running' && (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Stop />}
                              color="warning"
                            >
                              Stop
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<PlayArrow />}
                              color="primary"
                            >
                              VNC
                            </Button>
                          </>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Delete />}
                          color="error"
                          onClick={() => handleDestroyContainer(container.id)}
                        >
                          Destroy
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Container Creation Modal */}
      <ContainerCreationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateContainer}
        maxContainers={resourceUsage.maxContainers}
        currentContainers={resourceUsage.containers}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
