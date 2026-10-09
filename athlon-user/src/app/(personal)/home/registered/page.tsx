'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Trophy,
  Users,
  Search,
  CreditCard,
  QrCode,
  ChevronRight,
  ShieldCheck,
  XCircle,
  RefreshCw,
  Phone,
  Tag,
  IndianRupee,
  X,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import { RegistrationService, TournamentService, Registration, Tournament, RegistrationPlayer } from '@/lib/api/tournaments';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { UserService } from '@/lib/api/user';

interface RegisteredTournament extends Registration {
  tournamentDetails?: Tournament;
}

export default function RegisteredTournamentsPage() {
  const router = useRouter();
  const { userId, userEmail } = useAuthStore();
  const { theme, mode, themeKey } = useAthlonTheme();

  const [registrations, setRegistrations] = useState<RegisteredTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'PAID' | 'UNPAID' | 'REJECTED'>('ALL');
  const [selectedPass, setSelectedPass] = useState<RegisteredTournament | null>(null);
  const [playerPhotos, setPlayerPhotos] = useState<Record<string, string>>({});
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const fetchRegistrations = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 1. Fetch user registrations
      const regRes = await RegistrationService.getByUser(userId);
      const userRegistrations: Registration[] = Array.isArray(regRes)
        ? regRes
        : (regRes as any)?.data || [];

      // 2. Fetch all tournaments for enriched details
      const allTournamentsRes = await TournamentService.getAll();
      const allTournaments: Tournament[] = Array.isArray(allTournamentsRes)
        ? allTournamentsRes
        : (allTournamentsRes as any)?.data || [];

      const enrichedRegistrations: RegisteredTournament[] = userRegistrations
        .map((reg) => {
          const tournamentDetails = allTournaments.find(
            (t) =>
              t.tournamentId === reg.tournamentId ||
              (reg.tournamentId && String(t.tournamentId) === String(reg.tournamentId))
          );
          return { ...reg, tournamentDetails };
        })
        .sort((a, b) => {
          const idA = a.registrationId || (a as any).id || 0;
          const idB = b.registrationId || (b as any).id || 0;
          return idB - idA;
        });

      setRegistrations(enrichedRegistrations);

      // Background lookup player profile photos
      const phonesToFetch = new Set<string>();
      enrichedRegistrations.forEach((r) => {
        r.players?.forEach((p) => {
          if (p.phoneNumber) {
            const clean = p.phoneNumber.replace(/\D/g, '');
            if (clean.length >= 10) phonesToFetch.add(clean.slice(-10));
          }
        });
      });

      const photoMap: Record<string, string> = {};
      const fetchPhotoPromises = Array.from(phonesToFetch).map(async (phone) => {
        try {
          const u = await UserService.getUserByPhone(phone);
          const userData = (u as any)?.data || u;
          if (userData && (userData.photo || userData.avatar || userData.profilePic)) {
            const pic = userData.photo || userData.avatar || userData.profilePic;
            photoMap[phone] = pic.startsWith('http') || pic.startsWith('data:') ? pic : UserService.getPhotoUrl(pic);
          }
        } catch {
          // Ignore
        }
      });
      await Promise.allSettled(fetchPhotoPromises);
      setPlayerPhotos((prev) => ({ ...prev, ...photoMap }));
    } catch (error) {
      console.error('Failed to fetch registrations', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [userId]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchRegistrations();
  };

  // Stats calculation
  const approvedCount = registrations.filter((r) => r.status === 'APPROVED').length;
  const pendingCount = registrations.filter((r) => r.status === 'PENDING' || !r.status).length;
  const paidCount = registrations.filter((r) => r.paymentStatus === 'PAID').length;
  const unpaidCount = registrations.filter((r) => r.paymentStatus !== 'PAID').length;

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      // Status filter
      if (statusFilter === 'APPROVED' && reg.status !== 'APPROVED') return false;
      if (statusFilter === 'PENDING' && reg.status !== 'PENDING' && reg.status) return false;
      if (statusFilter === 'PAID' && reg.paymentStatus !== 'PAID') return false;
      if (statusFilter === 'UNPAID' && reg.paymentStatus === 'PAID') return false;
      if (statusFilter === 'REJECTED' && reg.status !== 'REJECTED') return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const tournName = (reg.tournamentDetails?.name || '').toLowerCase();
        const teamName = (reg.teamName || '').toLowerCase();
        const category = (reg.category || '').toLowerCase();
        const location = (reg.tournamentDetails?.location || reg.place || '').toLowerCase();
        const players = (reg.players || []).map((p) => p.playerName.toLowerCase()).join(' ');

        return (
          tournName.includes(query) ||
          teamName.includes(query) ||
          category.includes(query) ||
          location.includes(query) ||
          players.includes(query)
        );
      }

      return true;
    });
  }, [registrations, statusFilter, searchQuery]);

  const resolvePlayerPhoto = (p: RegistrationPlayer): string => {
    const direct =
      p.photo ||
      p.photoUrl ||
      p.avatar ||
      p.profilePic ||
      p.userPhoto ||
      (p as any).image;

    if (direct) {
      if (direct.startsWith('http') || direct.startsWith('data:') || direct.startsWith('/')) {
        return direct;
      }
      return UserService.getPhotoUrl(direct);
    }

    if (p.phoneNumber && playerPhotos[p.phoneNumber]) {
      return playerPhotos[p.phoneNumber];
    }

    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.playerName)}&backgroundColor=0ea5e9,10b981,8b5cf6,f59e0b`;
  };

  const getSportBadge = (sport?: string) => {
    const s = (sport || 'badminton').toLowerCase();
    if (s.includes('badminton')) return { label: 'Badminton', icon: '🏸' };
    if (s.includes('cricket')) return { label: 'Cricket', icon: '🏏' };
    if (s.includes('football') || s.includes('soccer')) return { label: 'Football', icon: '⚽' };
    if (s.includes('tennis')) return { label: 'Tennis', icon: '🎾' };
    if (s.includes('table')) return { label: 'Table Tennis', icon: '🏓' };
    if (s.includes('basket')) return { label: 'Basketball', icon: '🏀' };
    return { label: sport || 'Sport', icon: '🏆' };
  };

  return (
    <div
      className="min-h-screen font-sans pb-32 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--athlon-background)',
        color: 'var(--athlon-text)',
      }}
    >
      {/* ── MOBILE-FIRST TOP APP BAR ────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-xl transition-colors duration-200 shadow-xs safe-header"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="max-w-lg mx-auto px-3.5 py-3 flex items-center justify-between gap-2.5">
          {/* Back Action & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => router.push('/home')}
              className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all shadow-xs active:scale-95 shrink-0 hover:opacity-80 cursor-pointer"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Return Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black uppercase tracking-tight truncate" style={{ color: 'var(--athlon-text)' }}>
                  Registered Matches
                </h1>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border"
                  style={{
                    backgroundColor: 'var(--athlon-primary-soft)',
                    color: 'var(--athlon-primary)',
                    borderColor: 'var(--athlon-primary)',
                  }}
                >
                  {registrations.length}
                </span>
              </div>
              <p className="text-[10px] font-semibold truncate opacity-60">
                Match entries &amp; tournament credentials
              </p>
            </div>
          </div>

          {/* Quick Refresh Icon */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Sync passes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} style={{ color: 'var(--athlon-primary)' }} />
            </button>
          </div>
        </div>

        {/* ── SLEEK STATUS FILTER CAPSULES ─────────────────────────────────── */}
        <div className="px-3.5 pb-2.5 max-w-lg mx-auto flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
          {(
            [
              { id: 'ALL', label: 'All', count: registrations.length, dot: null },
              { id: 'APPROVED', label: 'Confirmed', count: approvedCount, dot: 'bg-emerald-500' },
              { id: 'PENDING', label: 'In Review', count: pendingCount, dot: 'bg-amber-500 animate-pulse' },
              { id: 'UNPAID', label: 'Unpaid', count: unpaidCount, dot: 'bg-amber-400' },
              { id: 'PAID', label: 'Paid', count: paidCount, dot: 'bg-emerald-400' },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className="px-3 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 border shadow-xs active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: isActive ? 'var(--athlon-primary)' : 'var(--athlon-surface)',
                  color: isActive ? 'var(--athlon-primary-foreground, #050807)' : 'var(--athlon-text)',
                  borderColor: isActive ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                  boxShadow: isActive ? '0 2px 8px var(--athlon-primary-glow)' : undefined,
                }}
              >
                {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />}
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className="text-[9px] px-1 py-0.2 rounded-full font-mono font-bold"
                    style={{
                      backgroundColor: isActive ? 'rgba(0,0,0,0.18)' : 'var(--athlon-card)',
                      color: isActive ? 'var(--athlon-primary-foreground, #050807)' : 'var(--athlon-text-muted)',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── MAIN CONTENT FEED ────────────────────────────────────────────────── */}
      <main className="max-w-lg mx-auto px-3.5 pt-3.5 space-y-3.5">
        {/* ── COMPACT ATHLETE GLANCE BAR ─────────────────────────────────────── */}
        {registrations.length > 0 && (
          <div
            className="p-3 rounded-2xl border flex items-center justify-between shadow-xs text-xs font-semibold"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: 'var(--athlon-primary-soft)',
                  color: 'var(--athlon-primary)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] truncate">
                <span className="font-black" style={{ color: 'var(--athlon-text)' }}>
                  {approvedCount} Confirmed
                </span>
                <span className="opacity-50 mx-1">•</span>
                <span className="opacity-70">
                  {pendingCount} Awaiting Review
                </span>
              </div>
            </div>

            <div className="text-[10.5px] font-mono font-bold shrink-0">
              {unpaidCount > 0 ? (
                <span
                  className="px-2 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: 'var(--athlon-primary-soft)',
                    color: 'var(--athlon-primary)',
                    borderColor: 'var(--athlon-primary)',
                  }}
                >
                  {unpaidCount} Due
                </span>
              ) : (
                <span
                  className="px-2 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    color: 'var(--athlon-primary)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  All Paid ✓
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── REGISTRATION CARDS (AIRLINE PASS / MATCH TICKET STYLE) ─────────── */}
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border p-4 animate-pulse space-y-3"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-28 rounded-full" style={{ backgroundColor: 'var(--athlon-surface)' }} />
                  <div className="h-5 w-20 rounded-full" style={{ backgroundColor: 'var(--athlon-surface)' }} />
                </div>
                <div className="h-6 w-3/4 rounded-lg" style={{ backgroundColor: 'var(--athlon-surface)' }} />
                <div className="h-14 rounded-xl" style={{ backgroundColor: 'var(--athlon-surface)' }} />
              </div>
            ))}
          </div>
        ) : filteredRegistrations.length > 0 ? (
          <div className="space-y-3.5">
            {filteredRegistrations.map((reg, idx) => {
              const tourn = reg.tournamentDetails;
              const tournUuid = tourn?.tournamentUuid || reg.uuid;
              const isApproved = reg.status === 'APPROVED';
              const isPaid = reg.paymentStatus === 'PAID';
              const isRejected = reg.status === 'REJECTED';
              const sportBadge = getSportBadge(tourn?.sport || 'Badminton');

              return (
                <div
                  key={reg.registrationUuid || reg.uuid || `reg-${idx}`}
                  className="group rounded-2xl border overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {/* Top Subtle Accent Line */}
                  <div
                    className="h-[1.5px] w-full opacity-70"
                    style={{
                      background: 'linear-gradient(90deg, var(--athlon-primary), var(--athlon-primary-light, var(--athlon-primary)), transparent)',
                    }}
                  />

                  {/* 1. Header: Sport & Category Tag + Live Status Pills */}
                  <div className="p-3.5 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        {/* Sport Capsule with Theme Primary Accent */}
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-xs"
                          style={{
                            backgroundColor: 'var(--athlon-primary-soft)',
                            borderColor: 'var(--athlon-border)',
                            color: 'var(--athlon-primary)',
                          }}
                        >
                          <span>{sportBadge.icon}</span>
                          <span>{sportBadge.label}</span>
                        </span>

                        {/* Category Tag */}
                        {reg.category && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider border font-mono"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                              color: 'var(--athlon-text)',
                            }}
                          >
                            {reg.category}
                          </span>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Payment Pill */}
                        <span
                          className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider border flex items-center gap-1"
                          style={{
                            backgroundColor: isPaid ? 'var(--athlon-primary-soft)' : 'var(--athlon-surface)',
                            color: isPaid ? 'var(--athlon-primary)' : 'var(--athlon-text-muted)',
                            borderColor: isPaid ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                          }}
                        >
                          <CreditCard className="w-2.5 h-2.5" />
                          <span>{isPaid ? 'PAID' : 'UNPAID'}</span>
                        </span>

                        {/* Approval Pill */}
                        <span
                          className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider border flex items-center gap-1"
                          style={{
                            backgroundColor: isApproved ? 'var(--athlon-primary-soft)' : 'var(--athlon-surface)',
                            color: isApproved ? 'var(--athlon-primary)' : 'var(--athlon-text-secondary)',
                            borderColor: isApproved ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                          }}
                        >
                          {isApproved ? (
                            <CheckCircle2 className="w-2.5 h-2.5" style={{ color: 'var(--athlon-primary)' }} />
                          ) : isRejected ? (
                            <XCircle className="w-2.5 h-2.5 text-rose-500" />
                          ) : (
                            <Clock className="w-2.5 h-2.5" style={{ color: 'var(--athlon-primary)' }} />
                          )}
                          <span>{isApproved ? 'CONFIRMED' : reg.status || 'PENDING'}</span>
                        </span>
                      </div>
                    </div>

                    {/* 2. Tournament Name */}
                    <div>
                      <Link
                        href={tournUuid ? `/home/tournaments/${tournUuid}` : '#'}
                        className="text-sm sm:text-base font-black uppercase tracking-tight transition-colors flex items-center justify-between gap-1.5 leading-snug group-hover:opacity-90"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <span className="line-clamp-1">{tourn?.name || `Tournament #${reg.tournamentId}`}</span>
                        <ArrowUpRight className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-100" style={{ color: 'var(--athlon-primary)' }} />
                      </Link>

                      {/* Date & Location Line */}
                      <div className="flex items-center gap-2 text-[11px] font-semibold mt-1 opacity-70 flex-wrap">
                        <span className="flex items-center gap-1 shrink-0">
                          <Calendar className="w-3 h-3" style={{ color: 'var(--athlon-primary)' }} />
                          <span>
                            {tourn?.startDate
                              ? new Date(tourn.startDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                              : 'Date TBD'}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{tourn?.location || reg.place || 'Venue TBD'}</span>
                        </span>
                      </div>
                    </div>

                    {/* 3. Team & Players Micro-Capsules */}
                    <div
                      className="rounded-xl p-2.5 border space-y-2"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider opacity-60">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" style={{ color: 'var(--athlon-primary)' }} />
                          <span>{reg.teamName || 'Solo Player'}</span>
                        </span>
                        <span className="font-mono font-bold" style={{ color: 'var(--athlon-primary)' }}>
                          {reg.players?.length || 1} {(reg.players?.length || 1) === 1 ? 'Player' : 'Players'}
                        </span>
                      </div>

                      {/* Players list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {reg.players && reg.players.length > 0 ? (
                          reg.players.map((p, pIdx) => {
                            const avatar = resolvePlayerPhoto(p);
                            const pKey = p.registrationPlayerUuid || `p-${pIdx}-${p.playerName}`;
                            const isBroken = brokenImages[pKey];
                            return (
                              <div
                                key={pKey}
                                className="flex items-center gap-2 p-1.5 rounded-lg border"
                                style={{
                                  backgroundColor: 'var(--athlon-card)',
                                  borderColor: 'var(--athlon-border)',
                                }}
                              >
                                {avatar && !isBroken ? (
                                  <img
                                    src={avatar}
                                    alt=""
                                    onError={() => setBrokenImages((prev) => ({ ...prev, [pKey]: true }))}
                                    className="w-7 h-7 rounded-md object-cover shrink-0 border"
                                    style={{ borderColor: 'var(--athlon-border)' }}
                                  />
                                ) : (
                                  <div
                                    className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 border"
                                    style={{
                                      backgroundColor: 'var(--athlon-primary-soft)',
                                      borderColor: 'var(--athlon-primary)',
                                      color: 'var(--athlon-primary)',
                                    }}
                                  >
                                    {p.playerName?.charAt(0).toUpperCase() || 'P'}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="text-[11.5px] font-black truncate leading-tight" style={{ color: 'var(--athlon-text)' }}>
                                    {p.playerName}
                                  </div>
                                  <div className="text-[9.5px] font-mono opacity-60 truncate flex items-center gap-1 mt-0.5">
                                    <Phone className="w-2.5 h-2.5" />
                                    <span>{p.phoneNumber || 'Contact on file'}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-[11px] opacity-60 italic">
                            Registered by {userEmail || 'Athlete'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 4. Ticket Perforation & Action Deck with Theme Color */}
                    <div className="pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--athlon-border)' }}>
                      <div className="text-[11px] font-mono font-bold" style={{ color: 'var(--athlon-text)' }}>
                        {tourn?.registrationFees != null && tourn.registrationFees > 0 ? (
                          <span>Fee: ₹{Number(tourn.registrationFees).toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-emerald-500 font-bold">Free Entry</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Digital Match Pass Button */}
                        <button
                          onClick={() => setSelectedPass(reg)}
                          className="px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs active:scale-95 transition-all hover:opacity-85"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                            color: 'var(--athlon-text)',
                          }}
                        >
                          <QrCode className="w-3.5 h-3.5" style={{ color: 'var(--athlon-primary)' }} />
                          <span>QR Pass</span>
                        </button>

                        {/* View Tournament Portal with Selected Theme Color */}
                        {tournUuid && (
                          <Link
                            href={`/home/tournaments/${tournUuid}`}
                            className="px-3.5 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-xs active:scale-95 transition-all hover:opacity-90"
                            style={{
                              backgroundColor: 'var(--athlon-primary)',
                              color: 'var(--athlon-primary-foreground, #050807)',
                              boxShadow: '0 2px 8px var(--athlon-primary-glow)',
                            }}
                          >
                            <span>Hub</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div
            className="rounded-2xl border p-8 text-center space-y-3.5 shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div
              className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center border"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-primary)',
              }}
            >
              <Trophy className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-tight" style={{ color: 'var(--athlon-text)' }}>
                {searchQuery || statusFilter !== 'ALL' ? 'No Matching Passes' : 'No Registrations Found'}
              </h3>
              <p className="text-xs opacity-60 max-w-xs mx-auto leading-relaxed">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try clearing search or switching filter tabs above.'
                  : "You haven't entered any tournaments yet. Join exciting championships and compete!"}
              </p>
            </div>

            <Link
              href="/home/tournaments"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                color: 'var(--athlon-primary-foreground, #050807)',
                boxShadow: '0 2px 10px var(--athlon-primary-glow)',
              }}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Explore Tournaments</span>
            </Link>
          </div>
        )}
      </main>

      {/* ── DIGITAL ATHLETE MATCH PASS MODAL ─────────────────────────────────── */}
      {selectedPass && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setSelectedPass(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border p-5 space-y-3.5 text-center animate-in slide-in-from-bottom-4 duration-200"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Drag handle (Mobile) */}
            <div className="w-10 h-1 rounded-full bg-foreground/20 mx-auto sm:hidden mb-1" />

            {/* Top Header */}
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: 'var(--athlon-text)' }}>
                  Athlete Match Day Pass
                </span>
              </div>
              <button
                onClick={() => setSelectedPass(null)}
                className="w-7 h-7 rounded-full border flex items-center justify-center text-xs transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text)',
                }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pass Graphic */}
            <div
              className="p-4 rounded-2xl border space-y-3"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono opacity-60">
                <span>PASS ID: {selectedPass.registrationUuid?.substring(0, 8).toUpperCase() || 'ATH-8842'}</span>
                <span className="text-emerald-500 font-black">● VERIFIED</span>
              </div>

              {/* Tournament Title */}
              <div>
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight" style={{ color: 'var(--athlon-text)' }}>
                  {selectedPass.tournamentDetails?.name || `Tournament #${selectedPass.tournamentId}`}
                </h3>
                <p className="text-[11px] font-bold mt-0.5" style={{ color: 'var(--athlon-primary)' }}>
                  {selectedPass.teamName || 'Solo Player'} {selectedPass.category ? `• ${selectedPass.category}` : ''}
                </p>
              </div>

              {/* QR Mock code */}
              <div className="w-28 h-28 mx-auto rounded-xl p-2 bg-white border flex flex-col items-center justify-center shadow-xs">
                <QrCode className="w-20 h-20 text-black" />
                <span className="text-[7.5px] font-mono text-black font-bold tracking-widest mt-0.5">
                  {selectedPass.registrationUuid?.substring(0, 10).toUpperCase() || 'SCAN AT DESK'}
                </span>
              </div>

              {/* Match Venue & Date */}
              <div className="text-[10.5px] font-semibold opacity-75 space-y-0.5" style={{ color: 'var(--athlon-text-secondary)' }}>
                <div>📍 {selectedPass.tournamentDetails?.location || selectedPass.place || 'Main Arena'}</div>
                <div>
                  📅{' '}
                  {selectedPass.tournamentDetails?.startDate
                    ? new Date(selectedPass.tournamentDetails.startDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                    : 'Scheduled Match'}
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between text-[10px] font-bold opacity-70" style={{ borderColor: 'var(--athlon-border)', color: 'var(--athlon-text-muted)' }}>
                <span>STATUS: {selectedPass.status || 'PENDING'}</span>
                <span>FEE: {selectedPass.paymentStatus || 'UNPAID'}</span>
              </div>
            </div>

            {/* Close CTA */}
            <button
              onClick={() => setSelectedPass(null)}
              className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                color: 'var(--athlon-primary-foreground, #050807)',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
