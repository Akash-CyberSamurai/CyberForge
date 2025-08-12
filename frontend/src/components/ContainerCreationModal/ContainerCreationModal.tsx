import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Grid,
} from '@mui/material';
import axios from 'axios';
import { ContainerImage } from '../../types/container';

interface ContainerCreationModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (imageId: string, containerName: string) => void;
  maxContainers: number;
  currentContainers: number;
}

const ContainerCreationModal: React.FC<ContainerCreationModalProps> = ({
  open,
  onClose,
  onCreate,
  maxContainers,
  currentContainers,
}) => {
  const [images, setImages] = useState<ContainerImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [containerName, setContainerName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchImages();
    }
  }, [open]);

  const fetchImages = async () => {
    try {
      const response = await axios.get('/images');
      setImages(response.data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const handleCreate = async () => {
    if (!selectedImage || !containerName.trim()) return;

    setLoading(true);
    try {
      await onCreate(selectedImage, containerName.trim());
      setSelectedImage('');
      setContainerName('');
    } catch (error) {
      console.error('Failed to create container:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreate = selectedImage && containerName.trim() && currentContainers < maxContainers;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Launch New Container</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Container Limit: {currentContainers}/{maxContainers}
          </Typography>
          {currentContainers >= maxContainers && (
            <Typography variant="body2" color="error">
              You have reached your container limit. Please destroy a container first.
            </Typography>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Container Image</InputLabel>
              <Select
                value={selectedImage}
                onChange={(e) => setSelectedImage(e.target.value)}
                label="Container Image"
              >
                {images.map((image) => (
                  <MenuItem key={image.id} value={image.id}>
                    <Box>
                      <Typography variant="body1">{image.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {image.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`CPU: ${image.cpu_limit} cores`} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={`RAM: ${image.memory_limit_mb} MB`} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={`Storage: ${image.storage_limit_gb} GB`} 
                          size="small"
                        />
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Container Name (Optional)"
              value={containerName}
              onChange={(e) => setContainerName(e.target.value)}
              placeholder="Auto-generated if left empty"
              helperText="Leave empty for auto-generated name"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!canCreate || loading}
        >
          {loading ? 'Creating...' : 'Launch Container'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContainerCreationModal;
