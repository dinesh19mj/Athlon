'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Activity,
  TrendingUp,
  CreditCard,
  ChevronRight,
  MapPin,
  Calendar,
  Star,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  Building,
  Users,
  Plus
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';



const quickActions = [
  { id: '/home/tournaments', label: 'My Events', icon: Trophy, color: 'text-[#1B9C56]' },
  { id: '/home/rankings', label: 'Rankings', icon: TrendingUp, color: 'text-orange-400' },
  { id: '/home/matches', label: 'History', icon: Activity, color: 'text-[#3B82F6]' },
  { id: '/home/wallet', label: 'Wallet', icon: Wallet, color: 'text-purple-400' },
];

const upcomingMatches = [
  { id: 'match-101', tournament: 'Summer Slam 2026', date: 'Today, 2:00 PM', opponent: 'John Doe', court: 'Center Court', status: 'Next up' },
  { id: 'match-102', tournament: 'Summer Slam 2026', date: 'Tomorrow, 10:00 AM', opponent: 'Jane Smith', court: 'TBD', status: 'Scheduled' },
];

export default function PersonalHomePage() {
  const { userEmail, playerId, token } = useAuthStore();
  const { personalProfile, organizations } = useWorkspaceStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);



  const displayName = personalProfile?.name || (userEmail ? userEmail.split('@')[0] : 'Athlete');
  const athlonId = personalProfile?.athlonId || 'ATH-0000000';

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col relative">

      {/* Main Scrollable Area */}
      <div className="relative z-10 flex-1 overflow-y-auto hide-scrollbar">

        {/* HERO SECTION - DIGITAL SPORTS PASSPORT */}
        <div className="px-6 pt-8 pb-12 border-b border-foreground/10 relative overflow-hidden">

          {/* Video Background (Hero Only) */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            >
              <source src="/athlon-background.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-[100px] pointer-events-none z-0" />


          <div className="flex items-center gap-4 relative z-10 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-black/50 border border-white/10 overflow-hidden shrink-0 shadow-xl">
              <img src={personalProfile?.avatar || '/placeholder.png'} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold mb-1 text-foreground tracking-tight capitalize flex items-center gap-2">
                {displayName} <span className="animate-wave origin-bottom-right inline-block text-xl">👋</span>
              </h1>
              <div className="inline-block bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[#3B82F6] px-2 py-0.5 rounded text-xs font-mono font-bold tracking-widest">
                {athlonId}
              </div>
            </div>
          </div>

        </div>

        <div className="px-6 pt-6 relative z-10">
          <div className="flex gap-3">
            <div className="flex-1 bg-black/40 border border-foreground/10 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-center shadow-lg">
              <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1">State Rank</span>
              <span className="text-2xl font-black text-foreground">#18</span>
            </div>
            <div className="flex-1 bg-[#3B82F6]/10 border border-[#3B82F6]/30 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[#3B82F6]/10 pointer-events-none" />
              <span className="text-[10px] font-black text-[#3B82F6]/80 uppercase tracking-widest mb-1">Career Matches</span>
              <span className="text-2xl font-black text-[#3B82F6]">124</span>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS GRID */}
        <div className="p-6 overflow-hidden">
          <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-4 pl-1">Personal Apps</h2>
          <section className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {quickActions.map((action) => (
              <Link href={action.id} key={action.id} className="flex flex-col items-center gap-1.5 shrink-0 snap-start">
                <div className="w-[68px] h-[68px] rounded-[16px] bg-surface border border-foreground/5 hover:border-foreground/20 flex flex-col items-center justify-center transition-colors shadow-lg cursor-pointer">
                  <action.icon className={`w-6 h-6 ${action.color.replace('text-', '') === action.color ? action.color.replace('bg-', 'text-') : action.color}`} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-medium text-foreground/80">{action.label}</span>
              </Link>
            ))}
          </section>
        </div>

        {/* MY ORGANIZATIONS */}
        {organizations && (
          <div className="px-6 pb-6 overflow-hidden">
            <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-4 pl-1">My Organizations</h2>
            <section className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
              {organizations.map((org) => {
                const isAssoc = org.type === 'ASSOCIATION';
                const isAcad = org.type === 'ACADEMY';
                const isClub = org.type === 'CLUB';

                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      window.location.href = `/org/${org.id}/dashboard`;
                    }}
                    className="flex flex-col items-center gap-2 shrink-0 snap-start max-w-[80px]"
                  >
                    <div className={`w-[68px] h-[68px] rounded-[20px] bg-surface border border-foreground/5 flex flex-col items-center justify-center transition-all shadow-md hover:shadow-xl hover:border-foreground/20 cursor-pointer`}>
                      {isAssoc && <Trophy className="w-8 h-8 text-yellow-500" strokeWidth={1.5} />}
                      {isAcad && <Building className="w-8 h-8 text-blue-500" strokeWidth={1.5} />}
                      {isClub && <Users className="w-8 h-8 text-green-500" strokeWidth={1.5} />}
                      {!isAssoc && !isAcad && !isClub && <ShieldCheck className="w-8 h-8 text-purple-500" strokeWidth={1.5} />}
                    </div>
                    <span className="text-[10px] font-medium text-foreground/80 text-center leading-tight line-clamp-2">{org.name}</span>
                  </button>
                )
              })}

              <button
                onClick={() => {
                  window.location.href = `/subscription`;
                }}
                className="flex flex-col items-center gap-2 shrink-0 snap-start max-w-[80px]"
              >
                <div className={`w-[68px] h-[68px] rounded-[20px] bg-surface/50 border border-foreground/5 border-dashed flex flex-col items-center justify-center transition-all shadow-sm hover:shadow-md hover:border-foreground/20 cursor-pointer`}>
                  <Plus className="w-8 h-8 text-foreground/40" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-medium text-foreground/80 text-center leading-tight line-clamp-2">Add New</span>
              </button>
            </section>
          </div>
        )}

        {/* UPCOMING MATCHES */}
        <div className="px-6 pb-8">
          <div className="flex items-center justify-between mb-4 pl-1 pr-2">
            <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">My Schedule</h2>
            <Link href="/home/matches" className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider flex items-center hover:underline">
              View All <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingMatches.length > 0 ? upcomingMatches.map((match, i) => (
              <div key={match.id} className={`bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-3xl p-5 shadow-xl relative overflow-hidden ${i === 0 ? 'border-[#3B82F6]/30' : ''}`}>
                {i === 0 && <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#3B82F6] opacity-80" />}

                <div className="flex items-center justify-between mb-3 border-b border-foreground/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-[#3B82F6]' : 'text-foreground/40'}`}>
                      {match.status}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-foreground/70">{match.date}</span>
                </div>

                <div className="mb-4">
                  <h3 className="font-extrabold text-lg text-foreground mb-1">{match.tournament}</h3>
                  <div className="flex items-center gap-1.5 text-foreground/50">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{match.court}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-background p-3.5 rounded-2xl border border-foreground/5">
                  <span className="text-xs font-bold text-[#3B82F6] uppercase tracking-widest shrink-0">VS</span>
                  <span className="text-sm font-bold text-foreground truncate text-right">{match.opponent}</span>
                </div>
              </div>
            )) : (
              <div className="bg-surface/50 border border-foreground/5 border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center">
                <Calendar className="w-8 h-8 text-foreground/20 mb-3" />
                <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">No upcoming schedule</span>
              </div>
            )}
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
        @keyframes wave {
          0% { transform: rotate(0.0deg) }
          10% { transform: rotate(14.0deg) }
          20% { transform: rotate(-8.0deg) }
          30% { transform: rotate(14.0deg) }
          40% { transform: rotate(-4.0deg) }
          50% { transform: rotate(10.0deg) }
          60% { transform: rotate(0.0deg) }
          100% { transform: rotate(0.0deg) }
        }
        .animate-wave {
          animation: wave 2.5s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
