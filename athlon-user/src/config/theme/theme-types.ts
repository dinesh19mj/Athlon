export type ThemeKey =
  | 'algae'
  | 'pulse'
  | 'rush'
  | 'fire'
  | 'wine'
  | 'berry'
  | 'slate'
  | 'forest';

export interface ThemeColors {
  // Backgrounds & Surfaces
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  card: string;
  cardHover: string;
  cardElevated: string;

  // Borders
  border: string;
  borderStrong: string;
  borderSubtle: string;

  // Primary Brand & Accents
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryLight: string;
  primaryDark: string;
  primarySoft: string;
  primaryMuted: string;
  primaryGlow: string;
  primaryForeground: string;

  // Typography
  text: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;

  // Icons
  icon: string;
  iconMuted: string;
  iconActive: string;

  // Form Controls
  inputBackground: string;
  inputBorder: string;
  inputFocus: string;

  // Navigation & Structural Layout
  navigationBackground: string;
  navigationActive: string;
  navigationHover: string;
  headerBackground: string;
  sidebarBackground: string;
  panelBackground: string;

  // Gradients
  gradientStart: string;
  gradientMiddle: string;
  gradientEnd: string;

  // Visual Effects
  shadow: string;
  glow: string;

  // Data Visualization / Charts
  chartPrimary: string;
  chartSecondary: string;
  chartTertiary: string;
}

export interface SemanticColors {
  success: string;
  info: string;
  warning: string;
  error: string;
  live: string;
  pending: string;
  cancelled: string;
}

export interface AthlonTheme {
  key: ThemeKey;
  name: string;
  description: string;
  colors: ThemeColors;
  semantic: SemanticColors;
}
