import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Court {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  pricingPerHour: number;
}

export interface Booking {
  id: string;
  courtId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  bookedBy: 'BATCH' | 'MEMBER' | 'GUEST' | 'MATCH';
  referenceId?: string; // batchId, playerId, matchId
  paymentStatus: 'PAID' | 'PENDING' | 'NA';
}

export interface CourtState {
  courts: Court[];
  bookings: Booking[];
  searchQuery: string;
}

const initialState: CourtState = {
  courts: [
    { id: 'crt1', name: 'Court 1 - Premium', status: 'AVAILABLE', pricingPerHour: 500 },
    { id: 'crt2', name: 'Court 2 - Premium', status: 'OCCUPIED', pricingPerHour: 500 },
    { id: 'crt3', name: 'Court 3 - Standard', status: 'AVAILABLE', pricingPerHour: 300 },
    { id: 'crt4', name: 'Court 4 - Standard', status: 'MAINTENANCE', pricingPerHour: 300 },
  ],
  bookings: [
    {
      id: 'bk1',
      courtId: 'crt2',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      bookedBy: 'MEMBER',
      referenceId: 'p1',
      paymentStatus: 'PAID',
    }
  ],
  searchQuery: '',
};

export const courtSlice = createSlice({
  name: 'court',
  initialState,
  reducers: {
    setCourtSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addCourt: (state, action: PayloadAction<Court>) => {
      state.courts.push(action.payload);
    },
    updateCourtStatus: (state, action: PayloadAction<{ id: string, status: Court['status'] }>) => {
      const court = state.courts.find(c => c.id === action.payload.id);
      if (court) {
        court.status = action.payload.status;
      }
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.push(action.payload);
    }
  },
});

export const { setCourtSearchQuery, addCourt, updateCourtStatus, addBooking } = courtSlice.actions;
export default courtSlice.reducer;
