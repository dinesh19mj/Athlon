import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MarketplaceApi, AppModuleConfig } from '@/lib/api/marketplace';

export type ApplicationMode = 'ATHLON' | 'MARKET';

interface AppModeState {
  applicationMode: ApplicationMode;
  lastAthlonPath: string;
  athlonActive: boolean;
  marketActive: boolean;
  showModeSwitcher: boolean;
  defaultMode: ApplicationMode;
  isConfigLoaded: boolean;

  setApplicationMode: (mode: ApplicationMode) => void;
  setLastAthlonPath: (path: string) => void;
  fetchModuleConfig: () => Promise<AppModuleConfig>;
  setModuleConfig: (config: Partial<AppModuleConfig>) => void;
}

export const useAppModeStore = create<AppModeState>()(
  persist(
    (set, get) => ({
      applicationMode: 'ATHLON',
      lastAthlonPath: '/home',
      athlonActive: true,
      marketActive: true,
      showModeSwitcher: true,
      defaultMode: 'ATHLON',
      isConfigLoaded: false,

      setApplicationMode: (mode) => {
        const { athlonActive, marketActive } = get();
        // If only one mode is active, enforce the active one
        if (athlonActive && !marketActive) {
          set({ applicationMode: 'ATHLON' });
        } else if (!athlonActive && marketActive) {
          set({ applicationMode: 'MARKET' });
        } else {
          set({ applicationMode: mode });
        }
      },

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

      fetchModuleConfig: async () => {
        try {
          const config = await MarketplaceApi.getModuleConfig();
          const athlonActive = config.athlonActive ?? true;
          const marketActive = config.marketActive ?? true;
          const showModeSwitcher = athlonActive && marketActive;
          const defaultMode = (config.defaultMode as ApplicationMode) || 'ATHLON';

          let nextMode: ApplicationMode = get().applicationMode;
          if (athlonActive && !marketActive) {
            nextMode = 'ATHLON';
          } else if (!athlonActive && marketActive) {
            nextMode = 'MARKET';
          }

          set({
            athlonActive,
            marketActive,
            showModeSwitcher,
            defaultMode,
            applicationMode: nextMode,
            isConfigLoaded: true,
          });

          return config;
        } catch {
          set({ isConfigLoaded: true });
          return {
            athlonActive: true,
            marketActive: true,
            defaultMode: 'ATHLON',
            showModeSwitcher: true,
            activeModes: ['ATHLON', 'MARKET'],
          };
        }
      },

      setModuleConfig: (config) => {
        const athlonActive = config.athlonActive ?? get().athlonActive;
        const marketActive = config.marketActive ?? get().marketActive;
        const showModeSwitcher = athlonActive && marketActive;
        const defaultMode = (config.defaultMode as ApplicationMode) ?? get().defaultMode;

        let nextMode: ApplicationMode = get().applicationMode;
        if (athlonActive && !marketActive) {
          nextMode = 'ATHLON';
        } else if (!athlonActive && marketActive) {
          nextMode = 'MARKET';
        }

        set({
          athlonActive,
          marketActive,
          showModeSwitcher,
          defaultMode,
          applicationMode: nextMode,
        });
      },
    }),
    {
      name: 'athlon-app-mode-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
