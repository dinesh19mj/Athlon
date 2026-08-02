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
    <div className="min-h-screen bg-background overflow-y-auto pb-24 animate-in fade-in duration-500">
      
      {/* Hero Banner Section (Matches Player Home Page Design) */}
      <div className="relative h-[280px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-35">
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 max-w-7xl mx-auto flex items-end gap-6">
          {/* Org Logo / Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-surface border-4 border-background flex items-center justify-center shadow-2xl relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
              {org.logo ? (
                <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
              ) : (
                <OrgIcon className="w-10 h-10 text-foreground/40" />
              )}
            </div>
            {/* Type Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#1B9C56] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
              {org.type}
            </div>
          </div>

          <div className="flex-grow pb-1">
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight drop-shadow-md">
              {org.name}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sm font-bold text-foreground/60 uppercase tracking-widest font-mono">
                ID: {org.id.toUpperCase()}
              </span>
              <span className="w-1 h-1 rounded-full bg-foreground/20" />
              <span className="text-sm font-medium text-[#1B9C56] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1B9C56] animate-pulse" />
                Active Workspace
              </span>
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
        <div className="flex flex-wrap gap-6 pb-4 -mx-6 px-6 md:mx-0 md:px-0">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.id} href={action.id} className="group flex flex-col items-center gap-3 min-w-[90px]">
                <div className="w-16 h-16 rounded-2xl bg-surface border border-foreground/5 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 group-active:scale-95 group-hover:bg-foreground/[0.02]">
                  <Icon className={`w-7 h-7 ${action.color} drop-shadow-sm group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <span className="text-[11px] font-bold text-foreground/70 group-hover:text-foreground transition-colors uppercase tracking-wider text-center">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
