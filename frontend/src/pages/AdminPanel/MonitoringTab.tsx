import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

interface MonitoringTabProps {
  onNotification: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
}

const MonitoringTab: React.FC<MonitoringTabProps> = ({ onNotification }) => {
  const systemStats = {
    total_users: 24,
    active_containers: 18,
    system_load: 67,
    memory_usage: 78,
    disk_usage: 45,
    network_traffic: "2.3 GB/s"
  };

  const containerStats = [
    { image: 'Kali Linux', count: 8, cpu_avg: 1.2, memory_avg: 3.1 },
    { image: 'Chrome Browser', count: 5, cpu_avg: 0.8, memory_avg: 1.8 },
    { image: 'Ubuntu Desktop', count: 3, cpu_avg: 0.5, memory_avg: 1.2 },
    { image: 'Tor Browser', count: 2, cpu_avg: 0.3, memory_avg: 1.0 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Monitoring & Analytics
      </Typography>

      {/* System Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Load
              </Typography>
              <Typography variant="h4" color="warning.main">
                {systemStats.system_load}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={systemStats.system_load} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Memory Usage
              </Typography>
              <Typography variant="h4" color="info.main">
                {systemStats.memory_usage}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={systemStats.memory_usage} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Disk Usage
              </Typography>
              <Typography variant="h4" color="success.main">
                {systemStats.disk_usage}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={systemStats.disk_usage} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Network Traffic
              </Typography>
              <Typography variant="h4" color="secondary.main">
                {systemStats.network_traffic}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current bandwidth usage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Container Statistics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Container Distribution
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Image</TableCell>
                      <TableCell>Count</TableCell>
                      <TableCell>Avg CPU</TableCell>
                      <TableCell>Avg Memory</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {containerStats.map((stat) => (
                      <TableRow key={stat.image}>
                        <TableCell>{stat.image}</TableCell>
                        <TableCell>{stat.count}</TableCell>
                        <TableCell>{stat.cpu_avg} cores</TableCell>
                        <TableCell>{stat.memory_avg} GB</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resource Utilization
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  CPU Usage: 67% of total capacity
                </Typography>
                <LinearProgress variant="determinate" value={67} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Memory Usage: 78% of total capacity
                </Typography>
                <LinearProgress variant="determinate" value={78} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Storage Usage: 45% of total capacity
                </Typography>
                <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MonitoringTab;
