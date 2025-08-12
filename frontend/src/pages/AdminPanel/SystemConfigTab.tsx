import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Save } from '@mui/icons-material';

interface SystemConfigTabProps {
  onNotification: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
}

const SystemConfigTab: React.FC<SystemConfigTabProps> = ({ onNotification }) => {
  const [config, setConfig] = useState({
    inactivity_timeout_minutes: '10',
    max_concurrent_containers_per_user: '2',
    container_cleanup_interval_seconds: '300',
    max_container_lifetime_hours: '24',
    enable_audit_logging: true,
  });

  const handleSave = () => {
    onNotification('System configuration updated successfully', 'success');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h2>System Configuration</h2>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Container Settings
              </Typography>
              <TextField
                fullWidth
                label="Inactivity Timeout (minutes)"
                type="number"
                value={config.inactivity_timeout_minutes}
                onChange={(e) => setConfig({ ...config, inactivity_timeout_minutes: e.target.value })}
                margin="normal"
                helperText="Containers will be automatically destroyed after this period of inactivity"
              />
              <TextField
                fullWidth
                label="Max Concurrent Containers per User"
                type="number"
                value={config.max_concurrent_containers_per_user}
                onChange={(e) => setConfig({ ...config, max_concurrent_containers_per_user: e.target.value })}
                margin="normal"
                helperText="Maximum number of containers a user can run simultaneously"
              />
              <TextField
                fullWidth
                label="Container Cleanup Interval (seconds)"
                type="number"
                value={config.container_cleanup_interval_seconds}
                onChange={(e) => setConfig({ ...config, container_cleanup_interval_seconds: e.target.value })}
                margin="normal"
                helperText="How often the system checks for inactive containers"
              />
              <TextField
                fullWidth
                label="Max Container Lifetime (hours)"
                type="number"
                value={config.max_container_lifetime_hours}
                onChange={(e) => setConfig({ ...config, max_container_lifetime_hours: e.target.value })}
                margin="normal"
                helperText="Maximum time a container can exist before forced destruction"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security & Monitoring
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.enable_audit_logging}
                    onChange={(e) => setConfig({ ...config, enable_audit_logging: e.target.checked })}
                  />
                }
                label="Enable Audit Logging"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Log all user actions and system events for compliance and security
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Resource Limits
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Default CPU Limit: 1.0 cores
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Default Memory Limit: 2 GB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Default Storage Limit: 10 GB
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemConfigTab;
