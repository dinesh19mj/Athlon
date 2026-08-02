'use client';

import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

interface AntdProviderProps {
  children: React.ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            // Colors based on user requirements
            colorPrimary: '#2979FF',
            colorSuccess: '#19C37D',
            colorWarning: '#F7B500',
            colorError: '#FF4D5A',
            colorInfo: '#2979FF',
            colorTextBase: '#FFFFFF',
            colorTextSecondary: '#B7C2D8',
            colorBgBase: '#0A0F1F',
            colorBgContainer: '#131B2E', // Surface
            colorBgElevated: '#1C2742',  // Card
            
            // Typography & Styling
            fontFamily: 'inherit', // Use next.js font
            borderRadius: 8,
            wireframe: false,
          },
          components: {
            Layout: {
              bodyBg: '#0A0F1F',
              headerBg: '#131B2E',
              siderBg: '#131B2E',
            },
            Card: {
              colorBgContainer: '#1C2742',
              colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
            },
            Table: {
              colorBgContainer: '#1C2742',
              headerBg: '#131B2E',
              headerColor: '#B7C2D8',
              rowHoverBg: 'rgba(41, 121, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
            Menu: {
              itemBg: 'transparent',
              itemSelectedBg: 'rgba(41, 121, 255, 0.15)',
              itemHoverBg: 'rgba(255, 255, 255, 0.04)',
              itemSelectedColor: '#2979FF',
              itemColor: '#B7C2D8',
              itemHoverColor: '#FFFFFF',
            }
          },
        }}
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
}
