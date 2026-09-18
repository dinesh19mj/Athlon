'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, LineChart, TrendingUp, Activity, Target, Zap, Shield, Share2, Award, Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { UserService, SportsProfileResponse, UserResponse } from '@/lib/api/user';

export default function PerformancePage() {
  const { userUuid, userEmail } = useAuthStore();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [stats, setStats] = useState<SportsProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPerformanceData() {
      if (!userUuid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [userRes, statsRes] = await Promise.allSettled([
          UserService.getUserByUuid(userUuid),
          UserService.getUserStats(userUuid, 'Badminton'),
        ]);

        if (userRes.status === 'fulfilled' && userRes.value?.success && userRes.value.data) {
          setProfile(userRes.value.data);
        }

        if (statsRes.status === 'fulfilled' && statsRes.value?.success && statsRes.value.data) {
          setStats(statsRes.value.data);
        } else if (userRes.status === 'fulfilled' && userRes.value?.data?.sportsProfiles?.[0]) {
          setStats(userRes.value.data.sportsProfiles[0]);
        }
      } catch (err) {
        console.warn('Error loading performance data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPerformanceData();
  }, [userUuid]);

  const displayName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email
    : (userEmail ? userEmail.split('@')[0] : 'Athlete');

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AT';

  const winRateVal = stats?.winRate != null ? `${Math.round(stats.winRate)}%` : '0%';
  const matchesVal = stats?.totalMatches != null ? `${stats.totalMatches}` : '0';
  const streakVal = stats?.currentStreak != null ? `${stats.currentStreak} W` : '0 W';
  const eloVal = stats?.eloRating != null ? `${stats.eloRating}` : '1200';
  const rankVal = stats?.globalRank ? `#${stats.globalRank}` : (stats?.districtRank ? `#${stats.districtRank}` : 'Unranked');

  const statCards = [
    { label: 'Win Rate', value: winRateVal, trend: stats?.matchesWon ? `${stats.matchesWon} Won` : '0 Won', icon: Target, color: 'text-primary' },
    { label: 'Matches Played', value: matchesVal, trend: stats?.matchesLost ? `${stats.matchesLost} Lost` : '0 Lost', icon: Activity, color: 'text-emerald-400' },
    { label: 'Current Streak', value: streakVal, trend: 'Form Tracked', icon: Zap, color: 'text-amber-400' },
    { label: 'Athlon Rating', value: eloVal, trend: rankVal, icon: Trophy, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-primary selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
            Performance &amp; Stats
          </h1>
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: `${displayName}'s Athlon Performance`, url: window.location.href });
            }
          }}
          className="p-2 -mr-2 text-foreground hover:text-primary transition-colors"
          title="Share Profile"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-bold text-foreground/50">Loading verified athlete statistics...</p>
          </div>
        ) : (
          <>
            {/* Player Overview Card */}
            <section className="bg-gradient-to-br from-surface to-background border border-foreground/10 rounded-[28px] p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">
                    {stats?.sportName || 'Badminton'} • Verified Athlete
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1 truncate max-w-[220px]">
                    {displayName}
                  </h2>
                  <p className="text-xs text-foreground/50 font-medium mt-0.5">
                    {profile?.city ? `${profile.city}, ${profile.state || 'India'}` : 'Athlon Sports Network'}
                  </p>
                </div>
                {profile?.photo ? (
                  <img
                    src={profile.photo}
                    alt={displayName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/50 shadow-lg shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl border-2 border-primary/40 bg-primary/10 flex items-center justify-center font-black text-xl text-primary shadow-lg shrink-0">
                    {initials}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {statCards.map((stat, idx) => (
                  <div key={idx} className="bg-background/80 backdrop-blur-md rounded-2xl p-3.5 border border-foreground/5 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-[10px] font-bold text-foreground/50 uppercase truncate">{stat.label}</span>
                    </div>
                    <div className="flex items-end justify-between mt-auto">
                      <span className="text-xl font-black text-foreground leading-none">{stat.value}</span>
                      <span className="text-[10px] font-bold text-foreground/60">{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Match Career Highlights */}
            <section className="bg-surface border border-foreground/5 rounded-[24px] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> Career Highlights &amp; Accolades
                </h3>
              </div>

              {stats?.careerHighlights ? (
                <p className="text-xs text-foreground/80 font-medium leading-relaxed bg-background/50 p-3.5 rounded-xl border border-foreground/5">
                  {stats.careerHighlights}
                </p>
              ) : (
                <div className="p-4 rounded-2xl bg-background/50 border border-foreground/5 text-center">
                  <p className="text-xs text-foreground/60 font-medium">
                    Compete in registered Athlon tournaments and leagues to unlock badges and automated rating points.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
