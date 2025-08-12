import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import containerReducer from './slices/containerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    containers: containerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
