import type { ThemeKey, ThemeMode, LightThemeTokens } from './theme-types';

// ─── Storage ───────────────────────────────────────────────────────────────
export const THEME_STORAGE_KEY = 'athlon-theme';
export const DEFAULT_THEME_KEY: ThemeKey = 'algae';

export const THEME_MODE_STORAGE_KEY = 'athlon-theme-mode';
export const DEFAULT_THEME_MODE: ThemeMode = 'dark';

// ─── Semantic Colors (invariant across all themes) ────────────────────────
export const SEMANTIC_COLORS = {
  success: '#54AC68',
  info: '#14A3C7',
  warning: '#F59E0B',
  error: '#EF4444',
  live: '#FF453A',
  pending: '#F59E0B',
  cancelled: '#EF4444',
} as const;

// ─── Light Theme Token Sets (Exact, Reviewed Specs per Accent) ─────────────
export const LIGHT_THEME_TOKENS: Record<ThemeKey, LightThemeTokens> = {
  algae: {
    bgPage: '#F1F8F3',
    border: '#D6EBDB',
    iconMuted: '#2F7A44',
    textPrimary: '#12241A',
  },
  cyan: {
    bgPage: '#E9FAFC',
    border: '#C8EEF3',
    iconMuted: '#0A93AC',
    textPrimary: '#0C1F22',
  },
  pulse: {
    bgPage: '#FDF0F3',
    border: '#F7D3DC',
    iconMuted: '#C22E4C',
    textPrimary: '#241016',
  },
  fire: {
    bgPage: '#FEF1EA',
    border: '#F9D9C6',
    iconMuted: '#B23200',
    textPrimary: '#2A1108',
  },
  wine: {
    bgPage: '#F8EEF4',
    border: '#EAD2E1',
    iconMuted: '#7A2458',
    textPrimary: '#241019',
  },
  berry: {
    bgPage: '#F8EEF1',
    border: '#EBD5DB',
    iconMuted: '#7D2C44',
    textPrimary: '#241318',
  },
  slate: {
    bgPage: '#F1F1F6',
    border: '#DCDCE9',
    iconMuted: '#5C5D82',
    textPrimary: '#1C1C28',
  },
  forest: {
    bgPage: '#EEF4EE',
    border: '#D5E4D6',
    iconMuted: '#29572C',
    textPrimary: '#10190F',
  },
};

