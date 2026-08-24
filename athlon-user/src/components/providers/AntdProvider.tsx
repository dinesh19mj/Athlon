'use client';

import React from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

interface AntdProviderProps {
  children: React.ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  const { theme, semantic } = useAthlonTheme();
  const c = theme.colors;

  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          algorithm: antdTheme.darkAlgorithm,
          token: {
            colorPrimary: c.primary,
            colorSuccess: semantic.success,
            colorWarning: semantic.warning,
            colorError: semantic.error,
            colorInfo: semantic.info,
            colorTextBase: c.text,
            colorBgBase: c.background,
            colorBgContainer: c.surface,
            colorBgElevated: c.card,
            colorBorder: c.border,
            fontFamily: 'inherit',
            borderRadius: 8,
            wireframe: false,
          },
          components: {
            Layout: {
              bodyBg: c.background,
              headerBg: c.headerBackground,
              siderBg: c.sidebarBackground,
            },
            Card: {
              colorBgContainer: c.card,
              colorBorderSecondary: c.border,
            },
            Table: {
              colorBgContainer: c.card,
              headerBg: c.surface,
              headerColor: c.textSecondary,
              rowHoverBg: c.primarySoft,
              borderColor: c.border,
            },
            Menu: {
              itemBg: 'transparent',
              itemSelectedBg: c.primarySoft,
              itemHoverBg: c.surfaceHover,
              itemSelectedColor: c.primary,
              itemColor: c.textSecondary,
              itemHoverColor: c.text,
            },
            Button: {
              primaryColor: c.primaryForeground,
            },
            Modal: {
              contentBg: c.card,
              headerBg: c.card,
              titleColor: c.text,
            },
            Select: {
              selectorBg: c.inputBackground,
              optionActiveBg: c.surfaceHover,
              optionSelectedBg: c.primarySoft,
              optionSelectedColor: c.primary,
            },
            Input: {
              colorBgContainer: c.inputBackground,
              colorBorder: c.inputBorder,
              activeBorderColor: c.inputFocus,
              hoverBorderColor: c.primary,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
}
