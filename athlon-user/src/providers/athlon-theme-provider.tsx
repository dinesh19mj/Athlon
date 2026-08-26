'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { themeController } from '@/config/theme/theme-controller';
import type { AthlonTheme, ThemeKey, SemanticColors } from '@/config/theme/theme-types';

export type IconStyle = '2d' | '3d';

interface AthlonThemeContextValue {
  theme: AthlonTheme;
  themeKey: ThemeKey;
  semantic: SemanticColors;
  setTheme: (key: ThemeKey) => void;
  availableThemes: AthlonTheme[];
  iconStyle: IconStyle;
  setIconStyle: (style: IconStyle) => void;
}

const AthlonThemeContext = createContext<AthlonThemeContextValue | null>(null);

const ICON_STYLE_STORAGE_KEY = 'athlon_icon_style';

export function AthlonThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AthlonTheme>(() => themeController.getCurrentTheme());
  const [iconStyle, setIconStyleState] = useState<IconStyle>('2d');

  const setTheme = useCallback((key: ThemeKey) => {
    themeController.setTheme(key);
    setThemeState(themeController.getCurrentTheme());
  }, []);

  const setIconStyle = useCallback((style: IconStyle) => {
    setIconStyleState(style);
    try {
      localStorage.setItem(ICON_STYLE_STORAGE_KEY, style);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    themeController.initializeTheme();
    setThemeState(themeController.getCurrentTheme());

    try {
      const saved = localStorage.getItem(ICON_STYLE_STORAGE_KEY) as IconStyle | null;
      if (saved === '2d' || saved === '3d') {
        setIconStyleState(saved);
      }
    } catch {
      // ignore
    }

    return themeController.subscribe((t) => setThemeState(t));
  }, []);

  const value: AthlonThemeContextValue = {
    theme,
    themeKey: theme.key,
    semantic: theme.semantic,
    setTheme,
    availableThemes: themeController.getAvailableThemes(),
    iconStyle,
    setIconStyle,
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
