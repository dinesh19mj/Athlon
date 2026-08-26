'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  CalendarClock,
  Trophy,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  Radio,
  Zap,
  Shield,
  Clock,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';

const initialNotifications = [
  {
    id: 1,
    type: 'match_update',
    category: 'Match Updates',
    title: 'Match Rescheduled',
    message: 'Your Quarter-Finals match against Arjun M has been moved to Court 1 at 10:00 AM.',
    time: '2 hours ago',
    read: false,
    urgent: true,
    icon: CalendarClock,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-500/30',
  },
  {
    id: 2,
    type: 'registration',
    category: 'Registrations',
    title: 'Registration Confirmed',
    message: "You have successfully registered for the Summer Smash 2026 (Men's Singles).",
    time: 'Yesterday',
    read: true,
    urgent: false,
    icon: CheckCircle2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  {
    id: 3,
    type: 'result',
    category: 'Results',
    title: 'Match Won!',
    message: 'Congratulations! You won your Round of 16 match against Siva K (21-18, 15-21, 21-19).',
    time: '2 days ago',
    read: true,
    urgent: false,
    icon: Trophy,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-500/30',
  },
  {
    id: 4,
    type: 'system',
    category: 'System',
    title: 'Season 2026 Rankings Published',
    message: 'New season division rankings and ELO calculations are now active. Check your standing.',
    time: '3 days ago',
    read: true,
    urgent: false,
    icon: Info,
    color: 'text-[#3B82F6]',
    bgColor: 'bg-[#3B82F6]/10',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 5,
    type: 'match_update',
    category: 'Match Updates',
    title: 'Umpire Assignment Call',
    message: 'You have been assigned as official umpire for Men\'s Doubles Round 1 on Court 3.',
    time: '4 days ago',
    read: false,
    urgent: true,
    icon: Shield,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-500/30',
  },
  {
    id: 6,
    type: 'result',
    category: 'Results',
    title: 'Tournament Semifinals Draw Ready',
    message: 'Semifinals bracket matchups and court allocations have been locked in by organizers.',
    time: '5 days ago',
    read: true,
    urgent: false,
    icon: Zap,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-500/30',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const urgentTrackRef = useRef<HTMLDivElement>(null);
  const allTrackRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const categories = ['All', 'Match Updates', 'Registrations', 'Results', 'System'];

  const filteredNotifications = notifications.filter((n) => {
    if (selectedFilter === 'All') return true;
    return n.category === selectedFilter;
  });

  const urgentNotifications = notifications.filter((n) => !n.read || n.urgent);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - 100% UNTOUCHED ORIGINAL DESIGN
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24">
        {/* Header */}
        <header className="p-4 border-b border-foreground/5 bg-surface/50 backdrop-blur-md sticky top-0 z-20 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wide flex items-center gap-2">
              <Bell className="w-7 h-7 text-[#3B82F6]" /> Notifications
            </h1>
            <p className="text-foreground/50 font-bold mt-1 text-sm">
              Stay updated on your upcoming matches and results.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 max-w-3xl mx-auto space-y-3">
          {/* Mobile mark as read */}
          <div className="flex justify-end mb-2">
            <button
              onClick={markAllAsRead}
              className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6] hover:underline"
            >
              Mark all as read
            </button>
          </div>

          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-surface border rounded-2xl p-4 flex gap-4 transition-colors group relative overflow-hidden ${
                !notif.read ? 'border-foreground/20 shadow-md' : 'border-foreground/5 opacity-80 hover:opacity-100'
              }`}
            >
              {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3B82F6]" />}

              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.bgColor}`}>
                <notif.icon className={`w-5 h-5 ${notif.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`text-sm font-black tracking-tight truncate pr-2 ${
                      !notif.read ? 'text-foreground' : 'text-foreground/80'
                    }`}
                  >
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-bold text-foreground/40 shrink-0 mt-0.5">{notif.time}</span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    !notif.read ? 'font-bold text-foreground/70' : 'font-medium text-foreground/50'
                  }`}
                >
                  {notif.message}
                </p>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="bg-surface/50 border border-foreground/5 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center mt-8">
              <Bell className="w-12 h-12 text-foreground/20 mb-4" />
              <h3 className="text-lg font-black uppercase tracking-widest text-foreground/70 mb-2">
                You're all caught up!
              </h3>
              <p className="text-xs font-bold text-foreground/40 max-w-sm">There are no new notifications at this time.</p>
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - HORIZONTAL SCROLLING TRACKS FOR ALERTS & DISPATCHES
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen pb-20 bg-background">
        {/* Desktop Header Command Bar */}
        <div
          className="border-b px-8 py-8 bg-gradient-to-b from-card/70 via-card/30 to-background"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] shadow-lg shadow-blue-500/10">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black tracking-tight text-foreground">
                      Athlete Alert Center &amp; Dispatches
                    </h1>
                    {unreadCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-500 text-white animate-pulse">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/50">
                    Real-time match schedule adjustments, tournament registrations, and referee calls
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider text-foreground/80 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <CheckCheck className="w-4 h-4 text-primary" />
                <span>Mark All As Read</span>
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    selectedFilter === cat
                      ? 'bg-primary text-black shadow-md shadow-primary/20 scale-[1.02]'
                      : 'border text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                  style={{
                    borderColor: selectedFilter === cat ? 'transparent' : 'var(--athlon-border)',
                    backgroundColor: selectedFilter === cat ? 'var(--athlon-primary)' : 'var(--athlon-surface)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Main Tracks (Horizontal Scrolling) */}
        <main className="max-w-7xl mx-auto px-8 py-8 space-y-12">
          {/* 1. Urgent & Actionable Alerts Track (Horizontal Scroll) */}
          {urgentNotifications.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <div>
                    <h2 className="text-lg font-black text-foreground">
                      Action Required &amp; Priority Alerts ({urgentNotifications.length})
                    </h2>
                    <p className="text-xs text-foreground/50">High-priority court schedule shifts and match duties</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollTrack(urgentTrackRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollTrack(urgentTrackRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={urgentTrackRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {urgentNotifications.map((notif) => (
                  <div key={notif.id} className="snap-start shrink-0 w-[380px]">
                    <div
                      className={`p-6 rounded-[28px] border relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 transition-all group ${
                        !notif.read
                          ? 'border-orange-500/40 bg-gradient-to-b from-orange-500/10 via-card to-card'
                          : 'border-border bg-card'
                      }`}
                      style={{ backgroundColor: 'var(--athlon-card)' }}
                    >
                      <div className="h-1.5 w-full bg-orange-500 absolute top-0 left-0 right-0" />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/30">
                            {notif.category}
                          </span>
                          <span className="text-xs text-foreground/50 font-mono">{notif.time}</span>
                        </div>

                        <div className="flex items-start gap-3 pt-1">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${notif.bgColor}`}>
                            <notif.icon className={`w-5 h-5 ${notif.color}`} />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-foreground">{notif.title}</h3>
                            <p className="text-xs text-foreground/75 leading-relaxed mt-1">{notif.message}</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-between pt-3 border-t text-xs text-primary font-bold"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. All Activity & Dispatch Feed (Horizontal Scroll) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Radio className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    All Dispatches &amp; Activity ({filteredNotifications.length})
                  </h2>
                  <p className="text-xs text-foreground/50">Complete event history, notifications, and system bulletins</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTrack(allTrackRef, 'left')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTrack(allTrackRef, 'right')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={allTrackRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
            >
              {filteredNotifications.map((notif) => (
                <div key={notif.id} className="snap-start shrink-0 w-[380px]">
                  <div
                    className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-primary/40 transition-all group"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className={`h-1 w-full bg-primary/40 absolute top-0 left-0 right-0`} />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface border border-foreground/10 text-foreground/60">
                          {notif.category}
                        </span>
                        <span className="text-xs text-foreground/40 font-mono">{notif.time}</span>
                      </div>

                      <div className="flex items-start gap-3 pt-1">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${notif.bgColor}`}>
                          <notif.icon className={`w-5 h-5 ${notif.color}`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-foreground">{notif.title}</h3>
                          <p className="text-xs text-foreground/70 leading-relaxed mt-1">{notif.message}</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between pt-3 border-t text-xs text-foreground/50 font-bold group-hover:text-primary transition-colors"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <span>Dismiss or Action</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
