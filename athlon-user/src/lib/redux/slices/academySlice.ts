import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AcademyState {
  currentAcademyId: string | null;
  sidebarCollapsed: boolean;
  activeModule: string;
}

const initialState: AcademyState = {
  currentAcademyId: null,
  sidebarCollapsed: false,
  activeModule: 'dashboard',
};

export const academySlice = createSlice({
  name: 'academy',
  initialState,
  reducers: {
    setAcademyId: (state, action: PayloadAction<string>) => {
      state.currentAcademyId = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setActiveModule: (state, action: PayloadAction<string>) => {
      state.activeModule = action.payload;
    },
  },
});

export const { setAcademyId, toggleSidebar, setActiveModule } = academySlice.actions;
export default academySlice.reducer;
