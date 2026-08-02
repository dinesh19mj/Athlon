import { configureStore } from '@reduxjs/toolkit';
import academyReducer from './slices/academySlice';
import playerReducer from './slices/playerSlice';
import coachReducer from './slices/coachSlice';
import batchReducer from './slices/batchSlice';
import courtReducer from './slices/courtSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      academy: academyReducer,
      player: playerReducer,
      coach: coachReducer,
      batch: batchReducer,
      court: courtReducer,
    },
    // Adding middleware to disable serializable check for large state if needed, though default is fine
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
