'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  Trophy,
  Users,
  CreditCard,
  Activity,
  Calendar,
  Settings,
  ChevronRight,
  ShieldCheck,
  Building,
  MapPin,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  Package,
  BarChart2,
  Video,
  Play
} from 'lucide-react';



import HomeRoleHeader from '@/components/home/HomeRoleHeader';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { getThemeVideo } from '@/config/theme';

export default function OrganizationDashboard() {
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const { themeKey } = useAthlonTheme();
  const backgroundVideo = getThemeVideo(themeKey);
  const org = getActiveOrganization();



  if (!org) return null;

  // Determine quick actions based on organization type
  const getQuickActions = () => {
    const actions = [];

    if (org.type === 'ACADEMY') {
      actions.push({ id: `/org/${org.id}/students`, label: 'Students', icon: GraduationCap, color: 'text-[#3B82F6]' });
      actions.push({ id: `/org/${org.id}/attendance`, label: 'Attendance', icon: ClipboardList, color: 'text-green-500' });
      actions.push({ id: `/org/${org.id}/coaches`, label: 'Coaches', icon: Users, color: 'text-purple-400' });
      actions.push({ id: `/org/${org.id}/members`, label: 'Staff', icon: Users, color: 'text-foreground/70' });
      actions.push({ id: `/org/${org.id}/schedule`, label: 'Schedule', icon: Calendar, color: 'text-orange-400' });
      actions.push({ id: `/org/${org.id}/performance`, label: 'Performance', icon: TrendingUp, color: 'text-blue-400' });
      actions.push({ id: `/org/${org.id}/matches`, label: 'Matches', icon: Activity, color: 'text-red-400' });
      actions.push({ id: `/org/${org.id}/match-setup`, label: 'Setup', icon: Play, color: 'text-amber-500' });
      actions.push({ id: `/org/${org.id}/livestream`, label: 'Live Stream', icon: Video, color: 'text-red-500' });
    } else if (org.type === 'CLUB') {
      actions.push({ id: `/org/${org.id}/members`, label: 'Members', icon: Users, color: 'text-[#3B82F6]' });
      actions.push({ id: `/org/${org.id}/matches`, label: 'Matches', icon: Activity, color: 'text-red-400' });
      actions.push({ id: `/org/${org.id}/match-setup`, label: 'Setup', icon: Play, color: 'text-amber-500' });
      actions.push({ id: `/org/${org.id}/attendance`, label: 'Attendance', icon: ClipboardList, color: 'text-green-500' });
      actions.push({ id: `/org/${org.id}/leaderboard`, label: 'Leaderboard', icon: BarChart2, color: 'text-purple-400' });
      actions.push({ id: `/org/${org.id}/inventory`, label: 'Inventory', icon: Package, color: 'text-orange-400' });
    }

    if (org.type === 'ORGANIZER' || org.type === 'ASSOCIATION') {
      actions.push({ id: `/org/${org.id}/tournaments`, label: 'Tournaments', icon: Trophy, color: 'text-yellow-400' });
      actions.push({ id: `/org/${org.id}/match-setup`, label: 'Setup', icon: Play, color: 'text-amber-500' });
      actions.push({ id: `/org/${org.id}/livestream`, label: 'Live Stream', icon: Video, color: 'text-red-400' });
    }

    if (org.type === 'COURT') {
      actions.push({ id: `/org/${org.id}/bookings`, label: 'Bookings', icon: Calendar, color: 'text-primary' });
      actions.push({ id: `/org/${org.id}/facilities`, label: 'Facilities', icon: MapPin, color: 'text-purple-400' });
    }

    // Common actions
    actions.push({ id: `/org/${org.id}/finances`, label: 'Finances', icon: CreditCard, color: 'text-primary' });
    actions.push({ id: `/org/${org.id}/settings`, label: 'Settings', icon: Settings, color: 'text-foreground/60' });

    return actions;
  };

  const getOrgIcon = () => {
    switch (org.type) {
      case 'ACADEMY': return Users;
      case 'CLUB': return Building;
      case 'ORGANIZER': return Trophy;
      case 'ASSOCIATION': return ShieldCheck;
      case 'COURT': return MapPin;
      default: return Building;
    }
  };

  const quickActions = getQuickActions();
  const OrgIcon = getOrgIcon();

  return (
    <div className="h-[calc(100vh-80px)] md:h-screen overflow-hidden bg-background text-foreground flex flex-col relative">

      {/* Main Scrollable Area */}
      <div className="relative z-10 flex-1 overflow-y-auto hide-scrollbar pb-24">

        {/* HERO SECTION (Video Container) */}
        <div className="px-6 relative z-10 mt-6 mb-6 max-w-7xl mx-auto">
          <section className="relative w-full min-h-[160px] rounded-[24px] overflow-hidden bg-background border border-foreground/10 shadow-lg">

            {/* Video Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <video
                key={backgroundVideo}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={backgroundVideo} type="video/mp4" />
              </video>
            </div>

          </section>
        </div>

        {/* ROLE SWITCHER HEADER */}
        <div className="px-6 mb-6 max-w-7xl mx-auto">
          <HomeRoleHeader
            activeRole={org.id}
            organizations={organizations}
            showSearch={false}
          />
        </div>

        {/* UNIFIED ORG STATS & METRICS CARD */}
        <div className="px-6 relative z-10 mb-4 max-w-7xl mx-auto">
          <div
            className="rounded-[18px] shadow-lg overflow-hidden border border-white/[0.08] relative"
            style={{
              background: 'linear-gradient(145deg, var(--athlon-card) 0%, rgba(14, 22, 38, 0.95) 100%)',
            }}
          >
            {/* Top Subtle Ambient Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            {/* Org Info Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/[0.06] relative z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                    {org.logo ? (
                      <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                    ) : (
                      <OrgIcon className="w-4 h-4 text-foreground/50" />
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0A0F1D]" />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-foreground font-bold text-xs sm:text-sm tracking-wide uppercase truncate">
                    {org.name}
                  </span>
                  {/* <span className="text-foreground/45 text-[9px] font-semibold tracking-wider uppercase mt-0.5">
                    {org.type}
                  </span> */}
                </div>
              </div>

              {/* Role Capsule Badge */}
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-2.5 py-1.5 shrink-0">
                <div className="flex flex-col items-end">
                  {/* <span className="text-[7.5px] font-extrabold tracking-widest uppercase text-primary/80 leading-none mb-0.5">
                    WORKSPACE
                  </span> */}
                  <span className="text-primary font-black text-xs sm:text-sm leading-none">
                    {org.type}
                  </span>
                </div>
                <OrgIcon className="w-3.5 h-3.5 text-primary shrink-0 opacity-90" />
              </div>
            </div>

            {/* 2 Metrics Grid (Compact) */}
            <div className="grid grid-cols-2 divide-x divide-white/[0.06] bg-black/[0.15] relative z-10">
              <div className="flex flex-col items-center justify-center py-2.5 px-2 gap-1">
                <div className="flex items-center gap-1 text-foreground/40 text-[8px] font-extrabold tracking-wider uppercase">
                  <CreditCard className="w-3 h-3 text-foreground/50" />
                  <span>MONTHLY REVENUE</span>
                </div>
                <div className="text-foreground font-bold text-xs sm:text-sm leading-tight flex items-baseline gap-1">
                  <span>₹42,500</span>
                  <span className="text-[8px] text-emerald-400 font-semibold">+12%</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-2.5 px-2 gap-1">
                <div className="flex items-center gap-1 text-foreground/40 text-[8px] font-extrabold tracking-wider uppercase">
                  <Users className="w-3 h-3 text-foreground/50" />
                  <span>ACTIVE MEMBERS</span>
                </div>
                <div className="text-foreground font-bold text-xs sm:text-sm leading-tight flex items-baseline gap-1">
                  <span>148</span>
                  <span className="text-[8px] text-blue-400 font-semibold">+5 new</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-8 max-w-7xl mx-auto mt-4 space-y-6">

          {/* Horizontal Quick Actions (Menu based icons) */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.id} href={action.id} className="flex flex-col items-center gap-1.5 shrink-0">
                  <div
                    className="w-[68px] h-[68px] rounded-[16px] flex flex-col items-center justify-center transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
                    style={{ backgroundColor: 'var(--athlon-surface)', border: '1px solid var(--athlon-border)' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-medium text-center" style={{ color: 'var(--athlon-text-secondary)' }}>
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
