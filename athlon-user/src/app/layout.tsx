import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import StoreProvider from "@/components/providers/StoreProvider";
import { AntdProvider } from "@/components/providers/AntdProvider";
import { AthlonThemeProvider } from "@/providers/athlon-theme-provider";
import {
  ATHLON_THEMES,
  ATHLON_LIGHT_THEMES,
  DEFAULT_THEME_KEY,
  THEME_STORAGE_KEY,
  DEFAULT_THEME_MODE,
  THEME_MODE_STORAGE_KEY,
  SEMANTIC_COLORS,
} from "@/config/theme";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Athlon Tournament Portal",
  description: "The tournament experience, elevated.",
  applicationName: "Athlon",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Athlon",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#040806',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

// Inline script: apply full theme token matrix before hydration to prevent flash
const themeInitScript = `
(function() {
  try {
    var storageKey = '${THEME_STORAGE_KEY}';
    var defaultKey = '${DEFAULT_THEME_KEY}';
    var modeStorageKey = '${THEME_MODE_STORAGE_KEY}';
    var defaultMode = '${DEFAULT_THEME_MODE}';
    var darkThemes = ${JSON.stringify(ATHLON_THEMES)};
    var lightThemes = ${JSON.stringify(ATHLON_LIGHT_THEMES)};
    var semantic = ${JSON.stringify(SEMANTIC_COLORS)};

    var savedKey = localStorage.getItem(storageKey);
    var savedMode = localStorage.getItem(modeStorageKey);
    var mode = (savedMode === 'light') ? 'light' : 'dark';
    var activeDict = mode === 'light' ? lightThemes : darkThemes;
    var t = (savedKey && activeDict[savedKey]) ? activeDict[savedKey] : activeDict[defaultKey];
    var c = t.colors;
    var root = document.documentElement;

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

    // Effects
    root.style.setProperty('--athlon-shadow', c.shadow);
    root.style.setProperty('--athlon-glow', c.glow);

    // Charts
    root.style.setProperty('--athlon-chart-primary', c.chartPrimary);
    root.style.setProperty('--athlon-chart-secondary', c.chartSecondary);
    root.style.setProperty('--athlon-chart-tertiary', c.chartTertiary);

    // Semantic — invariant
    root.style.setProperty('--athlon-success', semantic.success);
    root.style.setProperty('--athlon-info', semantic.info);
    root.style.setProperty('--athlon-warning', semantic.warning);
    root.style.setProperty('--athlon-error', semantic.error);
    root.style.setProperty('--athlon-live', semantic.live);

    if (mode === 'light') {
      root.style.setProperty('--sport-skel-stroke', c.primary);
      root.style.setProperty('--sport-skel-fill', c.primarySoft);
      root.style.setProperty('--sport-skel-fill-solid', c.primary);
      root.style.setProperty('--sport-skel-dot', c.primary);
      root.style.setProperty('--sport-skel-dot-opacity', '0.14');
      root.style.setProperty('--sport-skel-turf', c.primary);
      root.style.setProperty('--sport-skel-turf-opacity', '0.035');
      root.style.setProperty('--sport-skel-beam', c.primary);
      root.style.setProperty('--sport-skel-beam-opacity', '0.25');
      root.style.setProperty('--sport-skel-rail', c.primary);
      root.style.setProperty('--sport-skel-rail-opacity', '0.75');
      root.style.setProperty('--sport-skel-text', c.primary);
      root.style.setProperty('--sport-skel-halo-1', 'radial-gradient(circle, ' + c.primary + ' 0%, rgba(52, 211, 153, 0.3) 40%, transparent 75%)');
      root.style.setProperty('--sport-skel-halo-opacity-1', '0.35');
      root.style.setProperty('--sport-skel-halo-2', 'radial-gradient(circle, ' + c.primaryLight + ' 0%, rgba(34, 197, 94, 0.2) 50%, transparent 80%)');
      root.style.setProperty('--sport-skel-halo-opacity-2', '0.18');
      root.style.setProperty('--sport-skel-spark', c.primary);
      root.style.setProperty('--sport-skel-spark-opacity', '0.6');
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.style.setProperty('--sport-skel-stroke', '#475569');
      root.style.setProperty('--sport-skel-fill', 'rgba(255, 255, 255, 0.03)');
      root.style.setProperty('--sport-skel-fill-solid', '#334155');
      root.style.setProperty('--sport-skel-dot', '#334155');
      root.style.setProperty('--sport-skel-dot-opacity', '0.22');
      root.style.setProperty('--sport-skel-turf', '#1E293B');
      root.style.setProperty('--sport-skel-turf-opacity', '0.05');
      root.style.setProperty('--sport-skel-beam', '#334155');
      root.style.setProperty('--sport-skel-beam-opacity', '0.14');
      root.style.setProperty('--sport-skel-rail', '#334155');
      root.style.setProperty('--sport-skel-rail-opacity', '0.35');
      root.style.setProperty('--sport-skel-text', '#64748B');
      root.style.setProperty('--sport-skel-halo-1', 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)');
      root.style.setProperty('--sport-skel-halo-opacity-1', '0.08');
      root.style.setProperty('--sport-skel-halo-2', 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)');
      root.style.setProperty('--sport-skel-halo-opacity-2', '0.04');
      root.style.setProperty('--sport-skel-spark', '#475569');
      root.style.setProperty('--sport-skel-spark-opacity', '0.2');
      root.classList.add('dark');
      root.classList.remove('light');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script id="athlon-theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} suppressHydrationWarning />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <StoreProvider>
          <AthlonThemeProvider>
            <AntdProvider>
              {children}
              <PWAInstallPrompt />
            </AntdProvider>
          </AthlonThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
