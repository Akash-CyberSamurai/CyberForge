import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Container {
  id: string;
  name: string;
  image_name: string;
  status: string;
  vnc_url?: string;
  ssh_command?: string;
  created_at: string;
  last_activity: string;
  cpu_usage?: number;
  memory_usage_mb?: number;
}

interface ContainerState {
  containers: Container[];
  loading: boolean;
  error: string | null;
}

const initialState: ContainerState = {
  containers: [],
  loading: false,
  error: null,
};

export const fetchContainers = createAsyncThunk(
  'containers/fetchContainers',
  async () => {
    const response = await axios.get('/containers');
    return response.data;
  }
);

export const createContainer = createAsyncThunk(
  'containers/createContainer',
  async (containerData: { imageId: string; name: string }) => {
    const response = await axios.post('/containers', containerData);
    return response.data;
  }
);

export const destroyContainer = createAsyncThunk(
  'containers/destroyContainer',
  async (containerId: string) => {
    await axios.delete(`/containers/${containerId}`);
    return containerId;
  }
);

const containerSlice = createSlice({
  name: 'containers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContainers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContainers.fulfilled, (state, action) => {
        state.loading = false;
        state.containers = action.payload;
        state.error = null;
      })
      .addCase(fetchContainers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch containers';
      })
      .addCase(createContainer.fulfilled, (state, action) => {
        state.containers.unshift(action.payload);
      })
      .addCase(destroyContainer.fulfilled, (state, action) => {
        state.containers = state.containers.filter(
          (container) => container.id !== action.payload
        );
      });
  },
});

export const { clearError } = containerSlice.actions;
export default containerSlice.reducer;
