'use client';

import { ArrowLeft, LineChart, TrendingUp, Activity, Target, Zap, Shield, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function PerformancePage() {
  const stats = [
    { label: 'Win Rate', value: '68%', trend: '+5%', icon: Target, color: 'text-[#3B82F6]' },
    { label: 'Matches Played', value: '42', trend: '+12', icon: Activity, color: 'text-[#10B981]' },
    { label: 'Current Streak', value: '3 W', trend: 'Best: 7 W', icon: Zap, color: 'text-yellow-500' },
    { label: 'Defensive Rating', value: 'A-', trend: '+1 Tier', icon: Shield, color: 'text-purple-500' }
  ];

  const recentMatches = [
    { result: 'W', opponent: 'Rahul S.', score: '21-18, 21-15', date: '2 days ago' },
    { result: 'L', opponent: 'Vikram Singh', score: '19-21, 14-21', date: '5 days ago' },
    { result: 'W', opponent: 'Deepak K.', score: '21-12, 18-21, 21-19', date: '1 week ago' },
    { result: 'W', opponent: 'Sanjay R.', score: '21-9, 21-11', date: '1 week ago' },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-[#3B82F6] selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 text-foreground hover:text-[#3B82F6] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
            Performance
          </h1>
        </div>
        
        <button className="p-2 -mr-2 text-foreground hover:text-[#3B82F6] transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-4">

        {/* Player Overview Card */}
        <section className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-foreground/10 rounded-[24px] p-6 shadow-[0_10px_40px_rgba(59,130,246,0.15)] relative overflow-hidden">
          {/* Background Accents */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#3B82F6]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground/70 uppercase tracking-widest">Season 2026</span>
              <h2 className="text-3xl font-black text-white mt-1">Arjun K.</h2>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-[#3B82F6] bg-surface flex items-center justify-center font-black text-xl text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              AK
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/5 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-[10px] font-bold text-foreground/50 uppercase">{stat.label}</span>
                </div>
                <div className="flex items-end justify-between mt-auto">
                  <span className="text-xl font-black text-white leading-none">{stat.value}</span>
                  <span className="text-[10px] font-bold text-green-400">{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Radar (Mock visualization) */}
        <section className="bg-surface border border-foreground/5 rounded-[24px] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-foreground/50 tracking-wider uppercase">Skill Analysis</h3>
            <LineChart className="w-4 h-4 text-foreground/50" />
          </div>
          
          <div className="flex flex-col gap-4">
            {[
              { skill: 'Smash Power', val: 85, color: 'bg-red-500' },
              { skill: 'Agility', val: 92, color: 'bg-blue-500' },
              { skill: 'Stamina', val: 78, color: 'bg-green-500' },
              { skill: 'Net Play', val: 88, color: 'bg-yellow-500' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-foreground">{item.skill}</span>
                  <span className="text-[10px] font-black text-foreground/70">{item.val}/100</span>
                </div>
                <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Form */}
        <section>
          <div className="flex items-center justify-between mb-4 mt-2">
            <h3 className="text-xs font-bold text-foreground/50 tracking-wider uppercase">Recent Matches</h3>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {recentMatches.map((match, idx) => (
              <div key={idx} className="bg-surface border border-foreground/5 rounded-[16px] p-3 flex items-center justify-between hover:border-foreground/20 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${match.result === 'W' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {match.result}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-foreground group-hover:text-[#3B82F6] transition-colors">{match.opponent}</span>
                    <span className="text-[10px] text-foreground/50">{match.date}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-foreground/80 tracking-wider">{match.score}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
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
