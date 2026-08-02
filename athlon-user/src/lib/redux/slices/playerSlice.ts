import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  membershipType: string;
  batchId?: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  dominantHand: 'Right' | 'Left' | 'Ambidextrous';
  playingStyle: 'Attacking' | 'Defensive' | 'All-Round';
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalInfo?: string;
  joinedAt: string;
}

export interface PlayerState {
  players: Player[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: string | null;
}

const initialState: PlayerState = {
  players: [
    // Mock data for UI development
    {
      id: 'p1',
      firstName: 'Rohan',
      lastName: 'Sharma',
      email: 'rohan.s@example.com',
      phone: '+91 9876543210',
      status: 'ACTIVE',
      membershipType: 'Annual',
      skillLevel: 'Advanced',
      dominantHand: 'Right',
      playingStyle: 'Attacking',
      joinedAt: '2025-01-15T00:00:00Z',
    },
    {
      id: 'p2',
      firstName: 'Ananya',
      lastName: 'Iyer',
      email: 'ananya.i@example.com',
      phone: '+91 9876543211',
      status: 'ACTIVE',
      membershipType: 'Monthly',
      skillLevel: 'Intermediate',
      dominantHand: 'Right',
      playingStyle: 'All-Round',
      joinedAt: '2025-03-10T00:00:00Z',
    },
  ],
  isLoading: false,
  searchQuery: '',
  statusFilter: null,
};

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string | null>) => {
      state.statusFilter = action.payload;
    },
    addPlayer: (state, action: PayloadAction<Player>) => {
      state.players.push(action.payload);
    },
    updatePlayer: (state, action: PayloadAction<Player>) => {
      const index = state.players.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.players[index] = action.payload;
      }
    },
    deactivatePlayer: (state, action: PayloadAction<string>) => {
      const player = state.players.find(p => p.id === action.payload);
      if (player) {
        player.status = 'INACTIVE';
      }
    }
  },
});

export const { setSearchQuery, setStatusFilter, addPlayer, updatePlayer, deactivatePlayer } = playerSlice.actions;
export default playerSlice.reducer;
