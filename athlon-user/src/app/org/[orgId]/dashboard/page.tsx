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
  BarChart2
} from 'lucide-react';



export default function OrganizationDashboard() {
  const { getActiveOrganization } = useWorkspaceStore();
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
      actions.push({ id: `/org/${org.id}/umpiring`, label: 'Umpiring', icon: ShieldCheck, color: 'text-red-500' });
    } else if (org.type === 'CLUB') {
      actions.push({ id: `/org/${org.id}/members`, label: 'Members', icon: Users, color: 'text-[#3B82F6]' });
      actions.push({ id: `/org/${org.id}/matches`, label: 'Matches', icon: Activity, color: 'text-red-400' });
      actions.push({ id: `/org/${org.id}/attendance`, label: 'Attendance', icon: ClipboardList, color: 'text-green-500' });
      actions.push({ id: `/org/${org.id}/leaderboard`, label: 'Leaderboard', icon: BarChart2, color: 'text-purple-400' });
      actions.push({ id: `/org/${org.id}/inventory`, label: 'Inventory', icon: Package, color: 'text-orange-400' });
    }
    
    if (org.type === 'ORGANIZER' || org.type === 'ASSOCIATION') {
      actions.push({ id: `/org/${org.id}/tournaments`, label: 'Tournaments', icon: Trophy, color: 'text-yellow-400' });
      actions.push({ id: `/org/${org.id}/umpiring`, label: 'Umpiring', icon: ShieldCheck, color: 'text-red-400' });
    }

    if (org.type === 'COURT') {
      actions.push({ id: `/org/${org.id}/bookings`, label: 'Bookings', icon: Calendar, color: 'text-[#1B9C56]' });
      actions.push({ id: `/org/${org.id}/facilities`, label: 'Facilities', icon: MapPin, color: 'text-purple-400' });
    }

    // Common actions
    actions.push({ id: `/org/${org.id}/finances`, label: 'Finances', icon: CreditCard, color: 'text-[#1B9C56]' });
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
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/athlon-background.mp4" type="video/mp4" />
              </video>
            </div>

          </section>
        </div>

        {/* ORG STATS CARD */}
        <div className="px-6 relative z-10 mb-6 max-w-7xl mx-auto">
          <div className="bg-[#0A101D] border border-white/5 rounded-[20px] shadow-xl overflow-hidden p-5">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center shrink-0 shadow-md overflow-hidden relative">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                  ) : (
                    <OrgIcon className="w-8 h-8 text-foreground/40" />
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="text-[#3B82F6] font-black text-[10px] tracking-widest uppercase mb-1">
                    {org.type}
                  </div>
                  <h1 className="text-xl font-black text-white uppercase leading-tight mb-1 truncate">
                    {org.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground/40 text-[10px] font-mono font-bold tracking-widest uppercase">
                      ID: {org.id.toUpperCase()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-foreground/20" />
                    <span className="text-[10px] font-bold text-[#1B9C56] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1B9C56] animate-pulse" />
                      Active Workspace
                    </span>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="px-6 md:px-8 max-w-7xl mx-auto mt-8 space-y-8">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <div className="bg-gradient-to-br from-[#1B9C56] to-[#158045] rounded-2xl p-4 text-black shadow-[0_4px_10px_rgba(27,156,86,0.2)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Monthly Revenue</span>
                <CreditCard className="w-3.5 h-3.5 opacity-80" />
              </div>
              <div className="text-xl font-black mb-1">₹42,500</div>
              <div className="text-[10px] font-bold bg-black/10 inline-block px-1.5 py-0.5 rounded-md">
                +12% vs last month
              </div>
            </div>

            <div className="bg-surface border border-foreground/5 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Active Members</span>
                <Users className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-xl font-black text-foreground mb-1">148</div>
              <div className="text-[10px] font-medium text-foreground/40">
                <span className="text-blue-500 font-bold">+5</span> new this week
              </div>
            </div>
          </div>

          {/* Horizontal Quick Actions (Menu based icons) */}
          <div className="grid grid-cols-4 gap-4 pb-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.id} href={action.id} className="group flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-[16px] bg-surface border border-foreground/5 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 group-active:scale-95 group-hover:bg-foreground/[0.02]">
                    <Icon className={`w-6 h-6 ${action.color} drop-shadow-sm group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-foreground/70 group-hover:text-foreground transition-colors uppercase tracking-wider text-center leading-tight">
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
