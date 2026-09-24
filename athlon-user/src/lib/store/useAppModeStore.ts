import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ApplicationMode = 'ATHLON' | 'MARKET';

interface AppModeState {
  applicationMode: ApplicationMode;
  lastAthlonPath: string;
  setApplicationMode: (mode: ApplicationMode) => void;
  setLastAthlonPath: (path: string) => void;
}

export const useAppModeStore = create<AppModeState>()(
  persist(
    (set) => ({
      applicationMode: 'ATHLON',
      lastAthlonPath: '/home',

      setApplicationMode: (mode) => set({ applicationMode: mode }),
      setLastAthlonPath: (path) => {
        // Only remember valid ATHLON paths (not /market routes, not /login, not /register)
        if (
          path &&
          !path.startsWith('/market') &&
          !path.startsWith('/login') &&
          !path.startsWith('/register')
        ) {
          set({ lastAthlonPath: path });
        }
      },
    }),
    {
      name: 'athlon-app-mode-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
