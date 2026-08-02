import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Batch {
  id: string;
  name: string;
  type: 'Morning' | 'Evening' | 'Weekend';
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  assignedCoachId: string | null;
  assignedCourtIds: string[];
  enrolledPlayerIds: string[];
  maxCapacity: number;
  schedule: string; // e.g., 'Mon-Wed-Fri, 6:00 AM - 8:00 AM'
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BatchState {
  batches: Batch[];
  isLoading: boolean;
  searchQuery: string;
}

const initialState: BatchState = {
  batches: [
    {
      id: 'b1',
      name: 'Morning Advanced Squad',
      type: 'Morning',
      skillLevel: 'Advanced',
      assignedCoachId: 'c1',
      assignedCourtIds: ['crt1', 'crt2'],
      enrolledPlayerIds: ['p1', 'p2', 'p3'],
      maxCapacity: 10,
      schedule: 'Mon-Wed-Fri, 6:00 AM - 8:00 AM',
      status: 'ACTIVE',
    },
    {
      id: 'b2',
      name: 'Weekend Beginners',
      type: 'Weekend',
      skillLevel: 'Beginner',
      assignedCoachId: 'c2',
      assignedCourtIds: ['crt3'],
      enrolledPlayerIds: ['p4', 'p5'],
      maxCapacity: 15,
      schedule: 'Sat-Sun, 9:00 AM - 11:00 AM',
      status: 'ACTIVE',
    }
  ],
  isLoading: false,
  searchQuery: '',
};

export const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
    setBatchSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addBatch: (state, action: PayloadAction<Batch>) => {
      state.batches.push(action.payload);
    },
    updateBatch: (state, action: PayloadAction<Batch>) => {
      const index = state.batches.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.batches[index] = action.payload;
      }
    }
  },
});

export const { setBatchSearchQuery, addBatch, updateBatch } = batchSlice.actions;
export default batchSlice.reducer;
