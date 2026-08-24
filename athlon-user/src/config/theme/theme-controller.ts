import type { AthlonTheme, ThemeKey } from './theme-types';
import { ATHLON_THEMES, THEME_ORDER } from './athlon-themes';
import { DEFAULT_THEME_KEY, THEME_STORAGE_KEY } from './theme-constants';

type ThemeListener = (theme: AthlonTheme) => void;

class ThemeController {
  private static instance: ThemeController;
  private currentTheme: AthlonTheme;
  private listeners: Set<ThemeListener> = new Set();

  private constructor() {
    this.currentTheme = ATHLON_THEMES[DEFAULT_THEME_KEY];
  }

  static getInstance(): ThemeController {
    if (!ThemeController.instance) {
      ThemeController.instance = new ThemeController();
    }
    return ThemeController.instance;
  }

  getCurrentTheme(): AthlonTheme {
    return this.currentTheme;
  }

  getAvailableThemes(): AthlonTheme[] {
    return THEME_ORDER.map((k) => ATHLON_THEMES[k]);
  }

  setTheme(key: ThemeKey): void {
    const theme = ATHLON_THEMES[key];
    if (!theme) return;
    this.currentTheme = theme;
    this.applyThemeCSSVariables(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, key);
    }
    this.listeners.forEach((fn) => fn(theme));
  }

  applyThemeCSSVariables(theme: AthlonTheme): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const c = theme.colors;
    const s = theme.semantic;

    // Backgrounds & Surfaces
    root.style.setProperty('--athlon-background', c.background);
    root.style.setProperty('--athlon-background-secondary', c.backgroundSecondary);
    root.style.setProperty('--athlon-surface', c.surface);
    root.style.setProperty('--athlon-surface-hover', c.surfaceHover);
    root.style.setProperty('--athlon-surface-active', c.surfaceActive);
    root.style.setProperty('--athlon-card', c.card);
    root.style.setProperty('--athlon-card-hover', c.cardHover);
    root.style.setProperty('--athlon-card-elevated', c.cardElevated);

    // Borders
    root.style.setProperty('--athlon-border', c.border);
    root.style.setProperty('--athlon-border-strong', c.borderStrong);
    root.style.setProperty('--athlon-border-subtle', c.borderSubtle);

    // Primary
    root.style.setProperty('--athlon-primary', c.primary);
    root.style.setProperty('--athlon-primary-hover', c.primaryHover);
    root.style.setProperty('--athlon-primary-active', c.primaryActive);
    root.style.setProperty('--athlon-primary-light', c.primaryLight);
    root.style.setProperty('--athlon-primary-dark', c.primaryDark);
    root.style.setProperty('--athlon-primary-soft', c.primarySoft);
    root.style.setProperty('--athlon-primary-muted', c.primaryMuted);
    root.style.setProperty('--athlon-primary-glow', c.primaryGlow);
    root.style.setProperty('--athlon-primary-foreground', c.primaryForeground);

    // Typography
    root.style.setProperty('--athlon-text', c.text);
    root.style.setProperty('--athlon-text-secondary', c.textSecondary);
    root.style.setProperty('--athlon-text-muted', c.textMuted);
    root.style.setProperty('--athlon-text-disabled', c.textDisabled);

    // Icons
    root.style.setProperty('--athlon-icon', c.icon);
    root.style.setProperty('--athlon-icon-muted', c.iconMuted);
    root.style.setProperty('--athlon-icon-active', c.iconActive);

    // Inputs
    root.style.setProperty('--athlon-input', c.inputBackground);
    root.style.setProperty('--athlon-input-border', c.inputBorder);
    root.style.setProperty('--athlon-input-focus', c.inputFocus);

    // Navigation & Layout
    root.style.setProperty('--athlon-navigation', c.navigationBackground);
    root.style.setProperty('--athlon-navigation-active', c.navigationActive);
    root.style.setProperty('--athlon-navigation-hover', c.navigationHover);
    root.style.setProperty('--athlon-header', c.headerBackground);
    root.style.setProperty('--athlon-sidebar', c.sidebarBackground);
    root.style.setProperty('--athlon-panel', c.panelBackground);

    // Gradients
    root.style.setProperty('--athlon-gradient-start', c.gradientStart);
    root.style.setProperty('--athlon-gradient-middle', c.gradientMiddle);
    root.style.setProperty('--athlon-gradient-end', c.gradientEnd);

    // Visual Effects
    root.style.setProperty('--athlon-shadow', c.shadow);
    root.style.setProperty('--athlon-glow', c.glow);

    // Charts
    root.style.setProperty('--athlon-chart-primary', c.chartPrimary);
    root.style.setProperty('--athlon-chart-secondary', c.chartSecondary);
    root.style.setProperty('--athlon-chart-tertiary', c.chartTertiary);

    // Semantic
    root.style.setProperty('--athlon-success', s.success);
    root.style.setProperty('--athlon-info', s.info);
    root.style.setProperty('--athlon-warning', s.warning);
    root.style.setProperty('--athlon-error', s.error);
    root.style.setProperty('--athlon-live', s.live);

    root.classList.add('dark');
    root.classList.remove('light');
  }

  initializeTheme(): void {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeKey | null;
    const key = saved && ATHLON_THEMES[saved] ? saved : DEFAULT_THEME_KEY;
    this.currentTheme = ATHLON_THEMES[key];
    this.applyThemeCSSVariables(this.currentTheme);
  }

  subscribe(fn: ThemeListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const themeController = ThemeController.getInstance();
