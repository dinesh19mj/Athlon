'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Drawer } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  AppstoreOutlined,
  CheckSquareOutlined,
  PlaySquareOutlined,
  ScheduleOutlined,
  ShoppingOutlined,
  DollarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { toggleSidebar } from '@/lib/redux/slices/academySlice';

const { Sider } = Layout;

export function AcademySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.academy.sidebarCollapsed);
  const { token } = theme.useToken();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile && !collapsed) {
        dispatch(toggleSidebar());
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { key: '/academy/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/academy/players', icon: <UserOutlined />, label: 'Players' },
    { key: '/academy/coaches', icon: <TeamOutlined />, label: 'Coaches' },
    { key: '/academy/batches', icon: <AppstoreOutlined />, label: 'Batches' },
    { key: '/academy/attendance', icon: <CheckSquareOutlined />, label: 'Attendance' },
    { key: '/academy/practice-matches', icon: <PlaySquareOutlined />, label: 'Practice Matches' },
    { key: '/academy/courts', icon: <AppstoreOutlined />, label: 'Courts' },
    { key: '/academy/court-booking', icon: <ScheduleOutlined />, label: 'Court Booking' },
    { key: '/academy/shuttle-inventory', icon: <ShoppingOutlined />, label: 'Shuttle Inventory' },
    { key: '/academy/fee-management', icon: <DollarOutlined />, label: 'Fee Management' },
    { key: '/academy/reports', icon: <FileTextOutlined />, label: 'Reports & Analytics' },
  ];

  const handleMenuClick = (key: string) => {
    router.push(key);
    if (isMobile && !collapsed) {
      dispatch(toggleSidebar()); // Close drawer on mobile after clicking
    }
  };

  const SidebarContent = (
    <>
      <div className="flex items-center justify-center h-16 border-b" style={{ borderColor: token.colorBorderSecondary }}>
        {collapsed && !isMobile ? (
          <div className="w-8 h-8 rounded bg-primary text-foreground flex items-center justify-center font-bold">A</div>
        ) : (
          <div className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-primary text-foreground flex items-center justify-center text-xs">A</span>
            Athlon Academy
          </div>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        onClick={({ key }) => handleMenuClick(key)}
        items={menuItems}
        style={{ borderRight: 0, padding: '16px 8px', background: 'transparent' }}
      />
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        closable={false}
        onClose={() => dispatch(toggleSidebar())}
        open={!collapsed}
        width={260}
        styles={{ 
          body: { padding: 0, background: '#0A0F1F' },
          header: { display: 'none' }
        }}
      >
        {SidebarContent}
      </Drawer>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        background: '#0A0F1F'
      }}
      width={260}
    >
      {SidebarContent}
    </Sider>
  );
}
