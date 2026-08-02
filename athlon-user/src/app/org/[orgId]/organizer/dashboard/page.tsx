'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, ArrowLeft, TrendingUp, Users, DollarSign, Calendar, ChevronRight } from 'lucide-react';

export default function DetailedDashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 pb-32">
      
      {/* Header */}
      <header className="mb-8 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/organizer" className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <LayoutDashboard className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wide">
            Analytics Dashboard
          </h1>
        </div>
      </header>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface p-5 rounded-3xl border border-foreground/5 shadow-xl relative overflow-hidden group hover:border-foreground/20 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#1B9C56]/10 rounded-full blur-2xl group-hover:bg-[#1B9C56]/20 transition-colors" />
          <DollarSign className="w-6 h-6 text-[#1B9C56] mb-4" />
          <p className="text-3xl font-black tracking-tight">$12,450</p>
          <p className="text-xs text-foreground/50 uppercase tracking-widest font-bold mt-1">Total Revenue</p>
          <div className="flex items-center gap-1 text-[#1B9C56] text-[10px] font-bold mt-3 bg-[#1B9C56]/10 w-fit px-2 py-1 rounded-md">
            <TrendingUp className="w-3 h-3" /> +14% this month
          </div>
        </div>

        <div className="bg-surface p-5 rounded-3xl border border-foreground/5 shadow-xl relative overflow-hidden group hover:border-foreground/20 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <Users className="w-6 h-6 text-blue-400 mb-4" />
          <p className="text-3xl font-black tracking-tight">842</p>
          <p className="text-xs text-foreground/50 uppercase tracking-widest font-bold mt-1">Active Players</p>
          <div className="flex items-center gap-1 text-blue-400 text-[10px] font-bold mt-3 bg-blue-400/10 w-fit px-2 py-1 rounded-md">
            <TrendingUp className="w-3 h-3" /> +24 new this week
          </div>
        </div>

        <div className="bg-surface p-5 rounded-3xl border border-foreground/5 shadow-xl relative overflow-hidden group hover:border-foreground/20 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
          <Calendar className="w-6 h-6 text-purple-400 mb-4" />
          <p className="text-3xl font-black tracking-tight">14</p>
          <p className="text-xs text-foreground/50 uppercase tracking-widest font-bold mt-1">Upcoming Events</p>
        </div>

        <div className="bg-surface p-5 rounded-3xl border border-foreground/5 shadow-xl relative overflow-hidden group hover:border-foreground/20 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors" />
          <LayoutDashboard className="w-6 h-6 text-red-400 mb-4" />
          <p className="text-3xl font-black tracking-tight">89%</p>
          <p className="text-xs text-foreground/50 uppercase tracking-widest font-bold mt-1">Court Utilization</p>
          <div className="flex items-center gap-1 text-red-400 text-[10px] font-bold mt-3 bg-red-400/10 w-fit px-2 py-1 rounded-md">
            Peak hours: 6PM-9PM
          </div>
        </div>
      </div>

      {/* Charts / Tables Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-surface border border-foreground/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B9C56]/5 to-transparent z-0 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black uppercase tracking-wide">Revenue Overview</h2>
              <select className="bg-background border border-foreground/10 rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-[#1B9C56]">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
            
            {/* Mock Chart Area */}
            <div className="h-64 flex items-end justify-between gap-2 pt-4">
              {[40, 60, 30, 80, 50, 90, 70, 100, 60, 40, 80, 50].map((height, i) => (
                <div key={i} className="w-full bg-foreground/5 hover:bg-[#1B9C56]/40 transition-colors rounded-t-sm relative group cursor-crosshair" style={{ height: `${height}%` }}>
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border border-[#1B9C56]/30 text-[#1B9C56] text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg whitespace-nowrap">
                    ${height * 120}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-foreground/5 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black uppercase tracking-wide">Top Tournaments</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Summer Slam 2026', revenue: '$4,200', players: 128 },
              { name: 'City Finals', revenue: '$3,800', players: 96 },
              { name: 'Spring Open', revenue: '$2,450', players: 256 },
              { name: 'Amateur League', revenue: '$1,200', players: 64 },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-background border border-foreground/5 hover:border-foreground/20 transition-colors group cursor-pointer">
                <div>
                  <h4 className="font-bold text-sm tracking-wide group-hover:text-[#1B9C56] transition-colors">{t.name}</h4>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">{t.players} Players</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#1B9C56] text-sm">{t.revenue}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-xl text-foreground font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-colors">
            View All Reports <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
