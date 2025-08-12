import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';

const Containers: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Container Management
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Manage and monitor your cybersecurity lab containers
      </Typography>
      
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Container Management Features
          </Typography>
          <Typography variant="body1" paragraph>
            This page will provide detailed container management capabilities including:
          </Typography>
          <ul>
            <li>Real-time container status monitoring</li>
            <li>Resource usage tracking (CPU, Memory, Storage)</li>
            <li>Container lifecycle management (start, stop, destroy)</li>
            <li>VNC and SSH access to running containers</li>
            <li>Container logs and debugging tools</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Containers;
