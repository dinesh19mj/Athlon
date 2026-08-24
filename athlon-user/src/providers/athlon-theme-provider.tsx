'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { themeController } from '@/config/theme/theme-controller';
import type { AthlonTheme, ThemeKey, SemanticColors } from '@/config/theme/theme-types';

interface AthlonThemeContextValue {
  theme: AthlonTheme;
  themeKey: ThemeKey;
  semantic: SemanticColors;
  setTheme: (key: ThemeKey) => void;
  availableThemes: AthlonTheme[];
}

const AthlonThemeContext = createContext<AthlonThemeContextValue | null>(null);

export function AthlonThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AthlonTheme>(() => themeController.getCurrentTheme());

  const setTheme = useCallback((key: ThemeKey) => {
    themeController.setTheme(key);
    setThemeState(themeController.getCurrentTheme());
  }, []);

  useEffect(() => {
    themeController.initializeTheme();
    setThemeState(themeController.getCurrentTheme());
    return themeController.subscribe((t) => setThemeState(t));
  }, []);

  const value: AthlonThemeContextValue = {
    theme,
    themeKey: theme.key,
    semantic: theme.semantic,
    setTheme,
    availableThemes: themeController.getAvailableThemes(),
  };

  return (
    <AthlonThemeContext.Provider value={value}>
      {children}
    </AthlonThemeContext.Provider>
  );
}

export function useAthlonTheme(): AthlonThemeContextValue {
  const ctx = useContext(AthlonThemeContext);
  if (!ctx) throw new Error('useAthlonTheme must be used inside AthlonThemeProvider');
  return ctx;
}
