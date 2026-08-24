import type { ThemeKey } from './theme-types';

// ─── Storage ───────────────────────────────────────────────────────────────
export const THEME_STORAGE_KEY = 'athlon-theme';
export const DEFAULT_THEME_KEY: ThemeKey = 'algae';

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
