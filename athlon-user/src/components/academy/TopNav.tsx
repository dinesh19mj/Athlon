'use client';

import React from 'react';
import { Layout, Button, Dropdown, Avatar, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { toggleSidebar } from '@/lib/redux/slices/academySlice';

const { Header } = Layout;

export function AcademyTopNav() {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.academy.sidebarCollapsed);
  const { token } = theme.useToken();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Account Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Log out',
      danger: true,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => dispatch(toggleSidebar())}
          style={{
            fontSize: '16px',
            width: 40,
            height: 40,
            color: token.colorTextSecondary,
          }}
        />
        <h2 className="text-lg font-semibold m-0 text-foreground hidden md:block">
          Overview
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{ color: token.colorTextSecondary }}
        />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-foreground/5 p-1 px-2 rounded transition-colors">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-sm font-medium text-foreground leading-tight">Admin User</span>
              <span className="text-xs text-gray-400">Academy Owner</span>
            </div>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary }} />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}
