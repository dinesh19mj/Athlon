import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  rating: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  assignedBatches: string[];
  joinedAt: string;
}

export interface CoachState {
  coaches: Coach[];
  isLoading: boolean;
  searchQuery: string;
}

const initialState: CoachState = {
  coaches: [
    {
      id: 'c1',
      firstName: 'Vikram',
      lastName: 'Nair',
      email: 'vikram.nair@example.com',
      phone: '+91 9998887776',
      specialization: 'Advanced Tactics',
      rating: 4.9,
      status: 'ACTIVE',
      assignedBatches: ['b1', 'b2'],
      joinedAt: '2023-05-12T00:00:00Z',
    },
    {
      id: 'c2',
      firstName: 'Sneha',
      lastName: 'Reddy',
      email: 'sneha.r@example.com',
      phone: '+91 9998887777',
      specialization: 'Beginner Foundations',
      rating: 4.6,
      status: 'ACTIVE',
      assignedBatches: ['b3'],
      joinedAt: '2024-02-10T00:00:00Z',
    },
  ],
  isLoading: false,
  searchQuery: '',
};

export const coachSlice = createSlice({
  name: 'coach',
  initialState,
  reducers: {
    setCoachSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addCoach: (state, action: PayloadAction<Coach>) => {
      state.coaches.push(action.payload);
    },
  },
});

export const { setCoachSearchQuery, addCoach } = coachSlice.actions;
export default coachSlice.reducer;
