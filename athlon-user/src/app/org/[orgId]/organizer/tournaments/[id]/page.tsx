'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Trophy, LayoutGrid, CalendarDays, Share2, Copy, Settings, CheckCircle2, TrendingUp, ChevronRight } from 'lucide-react';
import { use } from 'react';

export default function ManageTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  // Using React.use to unwrap Next.js 15+ promise params
  const { id } = use(params);

  // Mock tournament data
  const tournament = {
    id,
    name: 'Summer Slam 2026',
    status: 'ACTIVE',
    dates: 'Jul 20 - Jul 25',
    category: "Men's Singles, Mixed Doubles",
    location: 'Central Sports Arena',
    registrations: 128,
    revenue: 64000,
    matchesCompleted: 45,
    totalMatches: 127
  };

  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://athlon.sport/t/${tournament.id}/register`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { title: 'Registrations', icon: <Users className="w-6 h-6" />, desc: 'Manage entries and fees', link: `/organizer/tournaments/${id}/registrations`, color: 'bg-blue-500/10 text-blue-500' },
    { title: 'Draws & Brackets', icon: <LayoutGrid className="w-6 h-6" />, desc: 'Generate fixtures', link: `/organizer/tournaments/${id}/draws`, color: 'bg-purple-500/10 text-purple-500' },
    { title: 'Match Schedule', icon: <CalendarDays className="w-6 h-6" />, desc: 'Assign courts & times', link: `/organizer/tournaments/${id}/schedule`, color: 'bg-orange-500/10 text-orange-500' },
    { title: 'Live Results', icon: <Trophy className="w-6 h-6" />, desc: 'Update match winners', link: `/organizer/results?t=${id}`, color: 'bg-[#1B9C56]/10 text-[#1B9C56]' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 pb-32">
      
      {/* Header */}
      <header className="mb-6 mt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/organizer/tournaments" className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide">
                {tournament.name}
              </h1>
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">{tournament.category}</span>
            </div>
          </div>
          <button className="p-2 bg-surface border border-foreground/10 rounded-xl hover:bg-foreground/5 transition-colors">
            <Settings className="w-5 h-5 text-foreground/70" />
          </button>
        </div>

        {/* Share Link Banner */}
        <div className="bg-[#1B9C56]/10 border border-[#1B9C56]/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-[#1B9C56] uppercase tracking-wide">Registration is Open!</h3>
            <p className="text-xs font-medium text-foreground/60 mt-1">Share this link with players to let them register online.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-background border border-foreground/10 rounded-xl px-4 py-3 text-xs font-mono text-foreground/70 overflow-hidden text-ellipsis whitespace-nowrap md:w-64">
              athlon.sport/t/{tournament.id}/register
            </div>
            <button 
              onClick={copyLink}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${copied ? 'bg-[#1B9C56] text-black' : 'bg-[#1B9C56] text-black hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(27,156,86,0.3)]'}`}
            >
              {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
            <button className="w-12 h-12 rounded-xl bg-surface border border-foreground/10 flex items-center justify-center text-foreground hover:bg-foreground/5 transition-colors shrink-0">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <h2 className="text-[11px] font-black text-foreground/40 uppercase tracking-widest mb-3 pl-1">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="bg-surface border border-foreground/5 rounded-2xl p-4 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Registrations</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black">{tournament.registrations}</span>
            <span className="text-xs font-bold text-[#1B9C56] flex items-center mb-1"><TrendingUp className="w-3 h-3 mr-0.5" /> +12</span>
          </div>
        </div>
        <div className="bg-surface border border-foreground/5 rounded-2xl p-4 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Revenue</span>
          <span className="text-2xl font-black">₹{tournament.revenue.toLocaleString()}</span>
        </div>
        <div className="bg-surface border border-foreground/5 rounded-2xl p-4 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Matches</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black">{tournament.matchesCompleted}</span>
            <span className="text-xs font-bold text-foreground/40 mb-1">/ {tournament.totalMatches}</span>
          </div>
        </div>
        <div className="bg-surface border border-foreground/5 rounded-2xl p-4 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Status</span>
          <span className="text-lg font-black text-[#1B9C56] mt-1">{tournament.status}</span>
        </div>
      </div>

      {/* Management Sections */}
      <h2 className="text-[11px] font-black text-foreground/40 uppercase tracking-widest mb-3 pl-1">Tournament Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, idx) => (
          <Link href={section.link} key={idx} className="bg-surface border border-foreground/5 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-foreground/20 transition-all flex items-center gap-4 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${section.color} group-hover:scale-105 transition-transform`}>
              {section.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-black tracking-wide">{section.title}</h3>
              <p className="text-xs font-medium text-foreground/50 mt-0.5">{section.desc}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
              <ChevronRight className="w-4 h-4 text-foreground/60" />
            </div>
          </Link>
        ))}
      </div>
      
    </div>
  );
}
