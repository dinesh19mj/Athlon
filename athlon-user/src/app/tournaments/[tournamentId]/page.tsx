'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Trophy,
  ActivityIcon,
  FileText,
  Phone,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Share2,
  Tag,
  Play,
  Layers,
  Table,
  Ticket,
  Home,
  Building2,
  Radio,
  Check,
  LogIn,
  Shield,
  Flame,
  QrCode,
  Maximize2,
  Copy,
  X,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import {
  TournamentService,
  MatchService,
  RegistrationService,
  DrawService,
  Tournament,
  Match,
  Registration,
} from '@/lib/api/tournaments';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { BracketViewer } from '@/components/tournaments/BracketViewer';
import { StandingsTable, PoolStanding } from '@/components/tournaments/StandingsTable';
import { TournamentWinnersPodium } from '@/components/tournaments/TournamentWinnersPodium';

export default function PublicTournamentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentUuid = params.tournamentId as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [standings, setStandings] = useState<PoolStanding[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'brackets' | 'standings' | 'matches'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedGPay, setCopiedGPay] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleCopyGPay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (tournament?.gpayNumber) {
      navigator.clipboard.writeText(tournament.gpayNumber);
      setCopiedGPay(true);
      setTimeout(() => setCopiedGPay(false), 2500);
    }
  };

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        setLoading(true);
        const res = await TournamentService.getById(tournamentUuid);
        if (res.data) {
          const tData = res.data;
          setTournament(tData);

          // Fetch registrations
          if (tData.tournamentId) {
            try {
              const rRes = await RegistrationService.getByTournament(tData.tournamentId);
              setRegistrations(rRes.data || []);
            } catch (e) {
              console.error('Failed to load registrations', e);
            }
          }

          // Fetch matches
          try {
            const mRes = await MatchService.getByTournament(tData.tournamentUuid);
            setMatches(mRes || []);
          } catch (e) {
            console.error('Failed to load matches', e);
          }

          // Fetch standings if League or Team Event
          if (
            tData.tournamentType === 'LEAGUE' ||
            tData.tournamentType === 'TEAM_EVENT' ||
            tData.tournamentType === 'TEAM_LEAGUE'
          ) {
            try {
              const sRes = await DrawService.getStandings(tData.tournamentUuid);
              setStandings(sRes.data || sRes || []);
            } catch (e) {
              console.error('Failed to load standings', e);
            }
          }
        } else {
          setError('Tournament not found');
        }
      } catch (err: any) {
        console.error('Failed to load tournament details', err);
        setError('Could not load tournament details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTournamentData();
  }, [tournamentUuid]);

  // Periodic poll when on matches, brackets, or standings tab
  useEffect(() => {
    if (!tournament?.tournamentUuid) return;

    if (activeTab === 'matches' || activeTab === 'brackets') {
      const interval = setInterval(() => {
        MatchService.getByTournament(tournament.tournamentUuid!)
          .then((mRes) => {
            if (mRes) setMatches(mRes);
          })
          .catch(() => {});
      }, 5000);
      return () => clearInterval(interval);
    }

    if (
      activeTab === 'standings' &&
      (tournament.tournamentType === 'LEAGUE' ||
        tournament.tournamentType === 'TEAM_EVENT' ||
        tournament.tournamentType === 'TEAM_LEAGUE')
    ) {
      const interval = setInterval(() => {
        DrawService.getStandings(tournament.tournamentUuid!)
          .then((sRes) => {
            if (sRes) setStandings(sRes.data || sRes || []);
          })
          .catch(() => {});
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [tournament?.tournamentUuid, activeTab]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: tournament?.name || 'Tournament Details',
          url: window.location.href,
        })
        .catch((err) => console.log('Share dismissed', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-foreground/60 font-bold tracking-widest uppercase text-xs">Loading tournament details...</p>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-foreground/30">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Tournament Not Found</h1>
        <p className="text-foreground/60 text-sm mb-6 max-w-sm">
          {error || 'The tournament you are looking for does not exist or has been removed.'}
        </p>
        <button
          onClick={() => router.push('/tournaments')}
          className="px-6 py-3 bg-surface border border-white/10 rounded-xl font-bold text-sm hover:border-primary transition-colors text-foreground"
        >
          Browse Tournaments
        </button>
      </div>
    );
  }

  // Parse dates & times
  const parseDateTime = (isoStr: string) => {
    if (!isoStr) return { dateStr: 'TBA', timeStr: '' };
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return { dateStr: isoStr, timeStr: '' };
      const dateStr = d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const timeStr =
        hours !== 0 || minutes !== 0 ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      return { dateStr, timeStr };
    } catch {
      return { dateStr: isoStr, timeStr: '' };
    }
  };

  const startInfo = parseDateTime(tournament.startDate);
  const endInfo = parseDateTime(tournament.endDate);

  const isTeamEvent = tournament.tournamentType === 'TEAM_EVENT' || tournament.tournamentType === 'TEAM_LEAGUE';
  const isLeague =
    tournament.tournamentType === 'LEAGUE' ||
    tournament.tournamentType === 'TEAM_EVENT' ||
    tournament.tournamentType === 'TEAM_LEAGUE';

  const isRegistrationClosed = tournament.status === 'REGISTRATION_CLOSED';

  // Parse categories list
  const categoriesList = tournament.category
    ? tournament.category.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  const validRegistrations = registrations.filter(
    (r) => r.status?.toUpperCase() !== 'REJECTED'
  );

  const totalPlayersCount = tournament.playersCount || 0;
  const categoryLimit =
    categoriesList.length > 0 && totalPlayersCount > 0
      ? Math.ceil(totalPlayersCount / categoriesList.length)
      : totalPlayersCount || 16;

  const getCategoryRegisteredCount = (cat: string) => {
    return validRegistrations.filter((reg) => {
      if (reg.teamName) {
        const match = reg.teamName.match(/\(([^)]+)\)$/) || reg.teamName.match(/\[([^\]]+)\]$/);
        if (match && match[1]?.trim().toLowerCase() === cat.trim().toLowerCase()) {
          return true;
        }
      }
      if (reg.place && reg.place.trim().toLowerCase() === cat.trim().toLowerCase()) {
        return true;
      }
      return false;
    }).length;
  };

  const getStatusBadge = () => {
    if (tournament.status === 'COMPLETED' || tournament.status === 'FINISHED') {
      return { label: 'MATCH FINISHED • COMPLETED', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    }
    if (tournament.status === 'REGISTRATION_CLOSED') {
      return { label: 'REGISTRATION CLOSED', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    }
    const now = new Date().getTime();
    const start = new Date(tournament.startDate).getTime();
    const end = new Date(tournament.endDate).getTime();
    if (!isNaN(start) && !isNaN(end)) {
      if (now >= start && now <= end) {
        return { label: 'LIVE / ONGOING', color: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' };
      }
      if (now > end) {
        return { label: 'MATCH FINISHED • COMPLETED', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      }
    }
    return { label: tournament.status || 'UPCOMING', color: 'bg-primary/20 text-primary border-primary/30' };
  };

  const statusBadge = getStatusBadge();

  // Poster URL handling
  const posterPath = tournament.poster ? tournament.poster.replace(/^\/([a-zA-Z]:)/, '$1') : '';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
  const posterUrl = posterPath
    ? `${baseUrl}/api/tournament/tournaments/getFile?filePath=${encodeURIComponent(posterPath)}`
    : '';

  // UPI QR Code URL handling
  const qrCodePath = tournament.upiQrCode ? tournament.upiQrCode.replace(/^\/([a-zA-Z]:)/, '$1') : '';
  const qrCodeUrl = qrCodePath
    ? `${baseUrl}/api/tournament/tournaments/getFile?filePath=${encodeURIComponent(qrCodePath)}`
    : '';

  const registerHref = isAuthenticated
    ? `/home/tournaments/${tournamentUuid}/register`
    : `/login?redirect=/tournaments/${tournamentUuid}`;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - 100% UNTOUCHED ORIGINAL DESIGN
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-32">
        {/* Top Sticky Header */}
        <header
          className="sticky top-0 z-50 flex items-center justify-between px-4 py-3.5 backdrop-blur-xl border-b"
          style={{
            backgroundColor: 'var(--athlon-navigation)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-1 text-foreground/80 hover:text-foreground rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold uppercase tracking-wider text-foreground">Tournament Details</span>
          </div>

          <button
            onClick={handleShare}
            className="p-2 text-foreground/70 hover:text-foreground rounded-full hover:bg-white/5 transition-colors text-xs font-semibold flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </header>

        <main className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-6 pt-4">
          {/* HERO SECTION */}
          <div
            className="rounded-[24px] overflow-hidden border relative shadow-2xl"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {posterUrl ? (
              <div
                onClick={() => setPreviewImage({ src: posterUrl, title: `${tournament.name} Poster` })}
                className="w-full h-56 sm:h-72 relative bg-black/40 border-b border-white/10 cursor-pointer group overflow-hidden"
              >
                <img
                  src={posterUrl}
                  alt={`${tournament.name} Poster`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-transparent to-black/20 pointer-events-none" />
                <div
                  className="absolute top-3.5 right-3.5 z-20 px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all pointer-events-none"
                  style={{ backgroundColor: 'rgba(10, 15, 29, 0.85)' }}
                >
                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                  <span className="text-white">Click to Enlarge</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-32 relative bg-gradient-to-br from-primary/20 via-surface to-background border-b border-white/10 flex items-center justify-center">
                <Trophy className="w-14 h-14 text-primary/30" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[90px] rounded-full pointer-events-none" />
              </div>
            )}

            <div className="p-5 sm:p-7 relative z-10 space-y-4">
              {/* Badges Row */}
              <div className="flex items-center flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-primary/15 border border-primary/30 text-primary text-xs font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {tournament.sport || 'Sports'}
                </span>

                <span
                  className="px-2.5 py-1 rounded-lg border text-foreground text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  {isTeamEvent ? 'Team League' : isLeague ? 'League' : 'Knockout'}
                </span>

                {tournament.matchFormat && (
                  <span
                    className="px-2.5 py-1 rounded-lg border text-foreground text-xs font-bold uppercase tracking-wider"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    {tournament.matchFormat}
                  </span>
                )}

                {/* Category Badges */}
                {categoriesList.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg border text-primary text-xs font-black uppercase tracking-wider flex items-center gap-1"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <Tag className="w-3 h-3 text-primary" />
                    {cat}
                  </span>
                ))}

                <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-black uppercase tracking-wider ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>

                {tournament.visibility && (
                  <span
                    className="px-2 py-1 rounded-lg border text-text-muted text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    {tournament.visibility}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black leading-tight text-foreground tracking-tight">
                {tournament.name}
              </h1>

              {/* Location & Date Line */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-foreground/80 pt-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {startInfo.dateStr}
                    {startInfo.dateStr !== endInfo.dateStr && ` — ${endInfo.dateStr}`}
                  </span>
                </div>

                {tournament.location && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{tournament.location}</span>
                  </div>
                )}
              </div>

              {/* Prominent Hero Register CTA */}
              {!isRegistrationClosed && tournament.status !== 'COMPLETED' && tournament.status !== 'FINISHED' && (
                <div className="pt-2">
                  <button
                    onClick={() => router.push(registerHref)}
                    className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{isAuthenticated ? (isTeamEvent ? 'Register Your Team' : 'Register for Tournament') : 'Login to Register'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── INTERACTIVE TAB NAVIGATION ──────────────────────────────── */}
          <div
            className="flex items-center p-1 rounded-2xl border gap-1 overflow-x-auto"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-foreground/50 hover:text-foreground hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('brackets')}
              className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'brackets'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-foreground/50 hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bracket & Fixture</span>
            </button>

            {isLeague && (
              <button
                onClick={() => setActiveTab('standings')}
                className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'standings'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-foreground/50 hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Standings</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('matches')}
              className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'matches'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-foreground/50 hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Matches ({matches.length})</span>
            </button>
          </div>

          {/* ── OVERVIEW TAB ────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Winners Podium when tournament is completed */}
              <TournamentWinnersPodium
                matches={matches}
                registrations={validRegistrations}
                tournamentName={tournament.name}
              />

              {/* 4-BENTO METRICS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  className="rounded-2xl p-4 border flex flex-col justify-between gap-1 shadow-md"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-foreground/50 uppercase tracking-widest">Entry Fee</span>
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-lg font-black text-primary">
                    {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'FREE'}
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 border flex flex-col justify-between gap-1 shadow-md"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-foreground/50 uppercase tracking-widest">Format</span>
                    <ActivityIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-sm font-black text-foreground truncate">
                    {isTeamEvent ? 'Team League' : tournament.tournamentType || 'Knockout'}
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 border flex flex-col justify-between gap-1 shadow-md"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-foreground/50 uppercase tracking-widest">Registrations</span>
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-sm font-black text-foreground">
                    {validRegistrations.length} {tournament.playersCount ? `/ ${tournament.playersCount}` : 'Entries'}
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 border flex flex-col justify-between gap-1 shadow-md"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-foreground/50 uppercase tracking-widest">Sport</span>
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-sm font-black text-foreground truncate">
                    {tournament.sport || 'Badminton'}
                  </div>
                </div>
              </div>

              {/* CATEGORIES & MATCH FORMAT */}
              {(categoriesList.length > 0 || tournament.matchFormat) && (
                <div
                  className="rounded-2xl p-5 border shadow-md space-y-3"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <h2 className="text-xs font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    Tournament Categories &amp; Match Format
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {categoriesList.length > 0 && (
                      <div
                        className="p-3.5 rounded-xl border flex flex-col gap-2"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                      >
                        <span className="text-[10px] font-extrabold text-foreground/45 uppercase tracking-wider">
                          Categories ({categoriesList.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {categoriesList.map((cat, idx) => {
                            const count = getCategoryRegisteredCount(cat);
                            const isFull = totalPlayersCount > 0 && count >= categoryLimit;
                            return (
                              <span
                                key={idx}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                                  isFull
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-primary/10 border-primary/20 text-primary'
                                }`}
                              >
                                {isFull ? (
                                  <Lock className="w-3 h-3 text-red-400 shrink-0" />
                                ) : (
                                  <Tag className="w-3 h-3 text-primary shrink-0" />
                                )}
                                <span>{cat}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isFull ? 'bg-red-500/20 text-red-300' : 'bg-primary/15 text-primary'}`}>
                                  {count}{totalPlayersCount > 0 ? `/${categoryLimit}` : ' Teams'}{isFull ? ' • Full' : ''}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {tournament.matchFormat && (
                      <div
                        className="p-3.5 rounded-xl border flex flex-col gap-1 justify-center"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                      >
                        <span className="text-[10px] font-extrabold text-foreground/45 uppercase tracking-wider">
                          Match Format
                        </span>
                        <span className="text-sm font-black text-foreground">{tournament.matchFormat}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SCHEDULE DETAILS */}
              <div
                className="rounded-2xl p-5 border shadow-md space-y-3"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <h2 className="text-xs font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Schedule & Timings
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div
                    className="p-3.5 rounded-xl border flex flex-col gap-1"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                  >
                    <span className="text-[10px] font-extrabold text-foreground/45 uppercase tracking-wider">Tournament Starts</span>
                    <span className="text-sm font-bold text-foreground">{startInfo.dateStr}</span>
                    {startInfo.timeStr && <span className="text-xs text-primary font-mono font-bold">{startInfo.timeStr}</span>}
                  </div>

                  <div
                    className="p-3.5 rounded-xl border flex flex-col gap-1"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                  >
                    <span className="text-[10px] font-extrabold text-foreground/45 uppercase tracking-wider">Tournament Ends</span>
                    <span className="text-sm font-bold text-foreground">{endInfo.dateStr}</span>
                    {endInfo.timeStr && <span className="text-xs text-foreground/60 font-mono font-bold">{endInfo.timeStr}</span>}
                  </div>
                </div>

                {tournament.registrationClosingDate && (
                  <div
                    className="p-3.5 rounded-xl border flex items-center justify-between gap-3 bg-amber-500/5 border-amber-500/20 text-amber-400"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400/70">Registration Deadline</span>
                        <span className="text-xs font-bold text-foreground">
                          {parseDateTime(tournament.registrationClosingDate).dateStr}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* TEAM EVENT CATEGORIES (if Team Event) */}
              {isTeamEvent && tournament.teamEventCategories && (
                <div
                  className="rounded-2xl p-5 border shadow-md space-y-3"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <h2 className="text-xs font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Team Event Categories &amp; Lineup Format
                  </h2>
                  {(() => {
                    try {
                      const parsed = typeof tournament.teamEventCategories === 'string'
                        ? JSON.parse(tournament.teamEventCategories)
                        : tournament.teamEventCategories;
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {parsed.map((cat: any, idx: number) => (
                              <div
                                key={cat.id || idx}
                                className="p-3 rounded-xl border flex items-center justify-between gap-2"
                                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                              >
                                <div>
                                  <span className="text-xs font-black text-foreground block">{cat.name || `Category ${idx + 1}`}</span>
                                  <span className="text-[10px] text-primary font-bold uppercase">{cat.matchFormat}</span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-foreground/60">
                                  {cat.playersRequired} Player{cat.playersRequired !== 1 ? 's' : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                    } catch {}
                    return null;
                  })()}
                </div>
              )}

              {/* DESCRIPTION */}
              {tournament.description && (
                <div
                  className="rounded-2xl p-5 border shadow-md space-y-3"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <h2 className="text-xs font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    About Tournament
                  </h2>
                  <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-line">
                    {tournament.description}
                  </p>
                </div>
              )}

              {/* PAYMENT & UPI DETAILS CARD */}
              {(tournament.gpayNumber || qrCodeUrl || (tournament.registrationFees !== undefined && tournament.registrationFees > 0)) && (
                <div
                  className="rounded-2xl p-5 border shadow-md space-y-4"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-xs font-black text-foreground uppercase tracking-wider">Payment &amp; Registration Fee</h2>
                        <p className="text-[10px] text-foreground/50">Transfer entry fee via UPI / GPay to confirm spot</p>
                      </div>
                    </div>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'FREE ENTRY'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* GPay Number Box */}
                    {tournament.gpayNumber && (
                      <div
                        className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0 font-mono">
                            UPI
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-extrabold text-foreground/45 uppercase tracking-wider block">GPay / UPI Number</span>
                            <span className="text-sm font-black text-foreground font-mono truncate block">{tournament.gpayNumber}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyGPay}
                          className="px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                          title="Copy GPay number"
                        >
                          {copiedGPay ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedGPay ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}

                    {/* QR Code Box */}
                    {qrCodeUrl && (
                      <div
                        onClick={() => setPreviewImage({ src: qrCodeUrl, title: `UPI QR Scanner - ${tournament.name}` })}
                        className="p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer group hover:border-primary/40 transition-all"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white p-1 border border-foreground/10 shrink-0 shadow-sm relative group-hover:scale-105 transition-transform">
                            <img src={qrCodeUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-foreground flex items-center gap-1">
                              <QrCode className="w-3.5 h-3.5 text-primary" />
                              UPI Scanner QR
                            </span>
                            <span className="text-[10px] text-foreground/50 block mt-0.5">Click / Tap to enlarge &amp; scan</span>
                          </div>
                        </div>
                        <span className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/15 group-hover:text-primary transition-colors text-foreground/40">
                          <Maximize2 className="w-4 h-4" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VENUE & CONTACT */}
              <div
                className="rounded-2xl p-5 border shadow-md space-y-3"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <h2 className="text-xs font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Venue & Contact
                </h2>

                {tournament.location && (
                  <div
                    className="p-3.5 rounded-xl border flex items-start gap-3"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                  >
                    <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col flex-1">
                      <span className="text-[10px] font-extrabold text-foreground/45 uppercase tracking-wider">Venue Location</span>
                      <span className="text-xs sm:text-sm font-bold text-foreground mt-0.5">{tournament.location}</span>
                      {tournament.mapLink && (
                        <a
                          href={tournament.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {tournament.contactPhone && (
                  <div
                    className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold text-foreground/45 uppercase tracking-wider">Organizer Contact</span>
                        <span className="text-xs sm:text-sm font-bold text-foreground font-mono">{tournament.contactPhone}</span>
                      </div>
                    </div>

                    <a
                      href={`tel:${tournament.contactPhone}`}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                    >
                      Call
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── BRACKETS & FIXTURE TAB ──────────────────────────────────── */}
          {activeTab === 'brackets' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-foreground">Bracket & Tournament Fixture</h3>
                  <p className="text-xs text-foreground/50 font-medium">
                    Official tournament elimination tree and bracket pathways.
                  </p>
                </div>
              </div>

              {matches.length > 0 ? (
                <div className="space-y-6">
                  <BracketViewer
                    matches={matches}
                    registrations={validRegistrations}
                    tournamentType={tournament.tournamentType}
                    tournamentName={tournament.name || 'tournament'}
                  />
                </div>
              ) : (
                <div
                  className="py-20 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center p-6"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Layers className="w-12 h-12 text-foreground/30 mb-3" />
                  <h4 className="text-base font-bold text-foreground mb-1">No Brackets Generated Yet</h4>
                  <p className="text-xs text-foreground/50 max-w-sm">
                    Tournament bracket and fixtures will appear here once the organizer publishes the draw.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STANDINGS & POINTS TABLE TAB ────────────────────────────── */}
          {activeTab === 'standings' && isLeague && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {standings.length > 0 ? (
                <StandingsTable standings={standings} />
              ) : (
                <div
                  className="py-20 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center p-6"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Trophy className="w-12 h-12 text-foreground/30 mb-3" />
                  <h4 className="text-base font-bold text-foreground mb-1">No Standings Yet</h4>
                  <p className="text-xs text-foreground/50 max-w-sm">
                    Pool points and qualification standings will be updated in real-time as matches are played.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── MATCHES TAB ─────────────────────────────────────────────── */}
          {activeTab === 'matches' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-foreground">Match Schedule & Results</h3>
                  <p className="text-xs text-foreground/50 font-medium">
                    Live scores, court assignments, and set points.
                  </p>
                </div>
              </div>

              {matches.filter((m) => m.teamARegistrationUuid != null || m.teamBRegistrationUuid != null).length === 0 ? (
                <div
                  className="py-20 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center p-6"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Play className="w-12 h-12 text-foreground/30 mb-3" />
                  <h4 className="text-base font-bold text-foreground mb-1">No Matches Scheduled Yet</h4>
                  <p className="text-xs text-foreground/50 max-w-sm">
                    Match schedule and live set scoring will appear here once fixtures are drawn.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matches
                    .filter((m) => m.teamARegistrationUuid != null || m.teamBRegistrationUuid != null)
                    .map((match, idx) => {
                      const teamA = registrations.find(
                        (r) => r.registrationUuid === match.teamARegistrationUuid || r.uuid === match.teamARegistrationUuid
                      );
                      const teamB = registrations.find(
                        (r) => r.registrationUuid === match.teamBRegistrationUuid || r.uuid === match.teamBRegistrationUuid
                      );
                      const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
                      const isCompleted = match.status === 'COMPLETED';

                      const teamAName = teamA?.teamName || match.teamAName || 'Team A';
                      const teamBName = teamB?.teamName || match.teamBName || 'Team B';

                      return (
                        <div
                          key={match.uuid || idx}
                          className="rounded-2xl border p-5 flex flex-col justify-between shadow-md relative overflow-hidden transition-all hover:border-primary/50"
                          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                        >
                          {/* Top Accent */}
                          <div
                            className={`absolute top-0 left-0 right-0 h-1 ${
                              isLive ? 'bg-red-500 animate-pulse' : isCompleted ? 'bg-emerald-500' : 'bg-primary'
                            }`}
                          />

                          <div>
                            {/* Round and Status */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-foreground/60 border border-white/10">
                                {match.roundName || `Round ${match.roundNumber || 1}`}
                              </span>

                              {isLive ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> LIVE
                                </span>
                              ) : isCompleted ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                                  Completed
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-white/5 text-foreground/50 text-[10px] font-bold uppercase tracking-wider">
                                  Scheduled
                                </span>
                              )}
                            </div>

                            {/* Teams & Scores */}
                            <div
                              className="p-3 rounded-xl border space-y-2 mb-3"
                              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[180px]">
                                  {teamAName}
                                </span>
                                <span className="text-sm font-black font-mono text-primary">
                                  {match.setScores ? match.setScores.split(',')[0] || '0' : '0'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--athlon-border-subtle)' }}>
                                <span className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[180px]">
                                  {teamBName}
                                </span>
                                <span className="text-sm font-black font-mono text-primary">
                                  {match.setScores ? match.setScores.split(',')[1] || '0' : '0'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Match Footer */}
                          <div className="flex items-center justify-between text-[11px] text-foreground/50 pt-2 border-t" style={{ borderColor: 'var(--athlon-border-subtle)' }}>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {match.scheduledTime
                                ? new Date(match.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'TBD'}
                            </span>

                            {match.courtName && (
                              <span className="font-bold text-foreground/70">
                                {match.courtName}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Sticky Bottom Registration Bar */}
        <div
          className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-xl border-t z-50 shadow-2xl"
          style={{
            backgroundColor: 'var(--athlon-navigation)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-foreground/50 uppercase tracking-widest">Entry Fee</span>
              <span className="text-lg font-black text-primary">
                {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'FREE'}
              </span>
            </div>

            {tournament.status === 'COMPLETED' || tournament.status === 'FINISHED' ? (
              <button
                disabled
                className="px-8 py-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg opacity-90 cursor-not-allowed flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Tournament Finished
              </button>
            ) : isRegistrationClosed ? (
              <button
                disabled
                className="px-8 py-3.5 bg-red-500/15 border border-red-500/30 text-red-400 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg cursor-not-allowed opacity-90"
              >
                Registration Closed
              </button>
            ) : (
              <button
                onClick={() => router.push(registerHref)}
                className="px-8 py-3.5 bg-primary text-primary-foreground font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
              >
                {isAuthenticated ? (isTeamEvent ? 'Register Your Team' : 'Register for Tournament') : 'Login to Register'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Desktop Top Navbar */}
        <header
          className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-background/85 transition-all duration-300"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  border: '1px solid var(--athlon-border)',
                }}
              >
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-foreground leading-none">ATHLON</span>
                <span
                  className="text-[10px] font-mono font-bold tracking-widest uppercase leading-tight mt-0.5"
                  style={{ color: 'var(--athlon-primary)' }}
                >
                  Tournaments
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 bg-surface/40 p-1.5 rounded-2xl border border-foreground/5 backdrop-blur-md">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Home className="w-4 h-4 text-primary" />
                <span>Home</span>
              </Link>
              <Link
                href="/tournaments"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
                style={{ color: 'var(--athlon-primary)' }}
              >
                <Trophy className="w-4 h-4 text-primary" />
                <span>Tournaments</span>
              </Link>
              <Link
                href="/academies"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Academies</span>
              </Link>
              <Link
                href="/live-score"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <span>Live Arena</span>
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              {isAuthenticated ? (
                <Link
                  href="/home"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span>My Portal</span>
                </Link>
              ) : (
                <Link
                  href={`/login?redirect=/tournaments/${tournamentUuid}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Desktop Hero Section */}
        <section
          className="relative w-full border-b overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
            <div className="grid grid-cols-12 gap-8 items-center">
              {/* Left Info */}
              <div className="col-span-8 space-y-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border backdrop-blur-md flex items-center gap-1.5 ${statusBadge.color}`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {statusBadge.label}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {tournament.sport || 'Sports'}
                  </span>

                  <span
                    className="px-3 py-1 rounded-full border text-foreground text-xs font-bold uppercase tracking-wider"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    {isTeamEvent ? 'Team League' : isLeague ? 'League' : 'Knockout'}
                  </span>

                  {tournament.matchFormat && (
                    <span
                      className="px-3 py-1 rounded-full border text-foreground text-xs font-bold uppercase tracking-wider"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      {tournament.matchFormat}
                    </span>
                  )}

                  {categoriesList.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full border text-primary text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      {cat}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
                  {tournament.name}
                </h1>

                {/* 4 Hero Counters */}
                <div className="grid grid-cols-4 gap-4 pt-2">
                  <div className="p-3.5 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="text-[10px] font-extrabold uppercase text-foreground/50">Schedule</div>
                    <div className="text-sm font-black text-foreground">{startInfo.dateStr}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="text-[10px] font-extrabold uppercase text-foreground/50">Venue</div>
                    <div className="text-sm font-black text-foreground truncate">{tournament.location || 'Location TBA'}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="text-[10px] font-extrabold uppercase text-foreground/50">Entries</div>
                    <div className="text-sm font-black text-foreground">
                      {validRegistrations.length} {tournament.playersCount ? `/ ${tournament.playersCount}` : 'Players'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="text-[10px] font-extrabold uppercase text-foreground/50">Entry Fee</div>
                    <div className="text-sm font-black text-primary font-mono">{tournament.registrationFees ? `₹${tournament.registrationFees}` : 'FREE'}</div>
                  </div>
                </div>

                {/* Direct CTA Buttons */}
                {!isRegistrationClosed && tournament.status !== 'COMPLETED' && tournament.status !== 'FINISHED' && (
                  <div className="flex items-center gap-4 pt-3">
                    <button
                      onClick={() => router.push(registerHref)}
                      className="px-6 py-3.5 rounded-2xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>{isAuthenticated ? (isTeamEvent ? 'Register Your Team' : 'Register for Tournament') : 'Login to Register'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Poster */}
              <div className="col-span-4">
                {posterUrl ? (
                  <div
                    onClick={() => setPreviewImage({ src: posterUrl, title: `${tournament.name} Poster` })}
                    className="w-full h-72 rounded-[28px] overflow-hidden border shadow-2xl relative group cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <img src={posterUrl} alt={tournament.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="px-3.5 py-2 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1.5 shadow-lg">
                        <Maximize2 className="w-4 h-4" />
                        Click to Enlarge Poster
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-72 rounded-[28px] border flex flex-col items-center justify-center text-center p-6 space-y-3"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <Trophy className="w-16 h-16 text-primary/40" />
                    <span className="text-xs font-black text-foreground/60 uppercase tracking-widest">{tournament.sport || 'Badminton'} Arena</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Main Content Workspace */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          {/* Tab Navigation Strip */}
          <div
            className="flex items-center p-1.5 rounded-2xl border gap-2 mb-8"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-foreground/50 hover:text-foreground hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('brackets')}
              className={`py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'brackets'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-foreground/50 hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Bracket & Fixture</span>
            </button>

            {isLeague && (
              <button
                onClick={() => setActiveTab('standings')}
                className={`py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeTab === 'standings'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-foreground/50 hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Standings</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('matches')}
              className={`py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'matches'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-foreground/50 hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Matches ({matches.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): Tab Content */}
            <div className="col-span-8 space-y-8">
              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Winners Podium when tournament is completed */}
                  <TournamentWinnersPodium
                    matches={matches}
                    registrations={registrations}
                    tournamentName={tournament.name}
                  />

                  {/* About Tournament */}
                  {tournament.description && (
                    <div
                      className="p-6 rounded-[28px] border space-y-3 shadow-md"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center gap-2.5 border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-black text-foreground">About Tournament</h3>
                      </div>
                      <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-line">
                        {tournament.description}
                      </p>
                    </div>
                  )}

                  {/* Schedule Details */}
                  <div
                    className="p-6 rounded-[28px] border space-y-4 shadow-md"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center gap-2.5 border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="text-base font-black text-foreground">Schedule & Timings</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className="p-4 rounded-2xl border flex flex-col gap-1"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      >
                        <span className="text-[10px] font-extrabold text-foreground/45 uppercase tracking-wider">Tournament Starts</span>
                        <span className="text-sm font-bold text-foreground">{startInfo.dateStr}</span>
                        {startInfo.timeStr && <span className="text-xs text-primary font-mono font-bold">{startInfo.timeStr}</span>}
                      </div>

                      <div
                        className="p-4 rounded-2xl border flex flex-col gap-1"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      >
                        <span className="text-[10px] font-extrabold text-foreground/45 uppercase tracking-wider">Tournament Ends</span>
                        <span className="text-sm font-bold text-foreground">{endInfo.dateStr}</span>
                        {endInfo.timeStr && <span className="text-xs text-foreground/60 font-mono font-bold">{endInfo.timeStr}</span>}
                      </div>
                    </div>

                    {tournament.registrationClosingDate && (
                      <div
                        className="p-4 rounded-2xl border flex items-center justify-between gap-3 bg-amber-500/5 border-amber-500/20 text-amber-400"
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-5 h-5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400/70">Registration Deadline</span>
                            <span className="text-sm font-bold text-foreground">
                              {parseDateTime(tournament.registrationClosingDate).dateStr}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Team Event Categories */}
                  {isTeamEvent && tournament.teamEventCategories && (
                    <div
                      className="p-6 rounded-[28px] border space-y-4 shadow-md"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center gap-2.5 border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                        <Layers className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-black text-foreground">Team Event Categories & Lineup Format</h3>
                      </div>
                      {(() => {
                        try {
                          const parsed =
                            typeof tournament.teamEventCategories === 'string'
                              ? JSON.parse(tournament.teamEventCategories)
                              : tournament.teamEventCategories;
                          if (Array.isArray(parsed) && parsed.length > 0) {
                            return (
                              <div className="grid grid-cols-2 gap-3">
                                {parsed.map((cat: any, idx: number) => (
                                  <div
                                    key={cat.id || idx}
                                    className="p-4 rounded-2xl border flex items-center justify-between gap-2"
                                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                                  >
                                    <div>
                                      <span className="text-xs font-black text-foreground block">{cat.name || `Category ${idx + 1}`}</span>
                                      <span className="text-[10px] text-primary font-bold uppercase">{cat.matchFormat}</span>
                                    </div>
                                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-foreground/70">
                                      {cat.playersRequired} Player{cat.playersRequired !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                        } catch {}
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* ── BRACKETS TAB ── */}
              {activeTab === 'brackets' && (
                <div className="space-y-6">
                  {matches.length > 0 ? (
                    <div className="p-6 rounded-[28px] border shadow-md" style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}>
                      <BracketViewer
                        matches={matches}
                        registrations={registrations}
                        tournamentType={tournament.tournamentType}
                        tournamentName={tournament.name || 'tournament'}
                      />
                    </div>
                  ) : (
                    <div
                      className="py-20 text-center rounded-[28px] border border-dashed flex flex-col items-center justify-center p-6"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <Layers className="w-14 h-14 text-foreground/30 mb-3" />
                      <h4 className="text-lg font-bold text-foreground mb-1">No Brackets Generated Yet</h4>
                      <p className="text-xs text-foreground/50 max-w-sm">
                        Tournament bracket and fixtures will appear here once the organizer publishes the draw.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── STANDINGS TAB ── */}
              {activeTab === 'standings' && isLeague && (
                <div className="space-y-6">
                  {standings.length > 0 ? (
                    <div className="p-6 rounded-[28px] border shadow-md" style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}>
                      <StandingsTable standings={standings} />
                    </div>
                  ) : (
                    <div
                      className="py-20 text-center rounded-[28px] border border-dashed flex flex-col items-center justify-center p-6"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <Trophy className="w-14 h-14 text-foreground/30 mb-3" />
                      <h4 className="text-lg font-bold text-foreground mb-1">No Standings Yet</h4>
                      <p className="text-xs text-foreground/50 max-w-sm">
                        Pool points and qualification standings will be updated in real-time as matches are played.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── MATCHES TAB ── */}
              {activeTab === 'matches' && (
                <div className="space-y-6">
                  {matches.filter((m) => m.teamARegistrationUuid != null || m.teamBRegistrationUuid != null).length === 0 ? (
                    <div
                      className="py-20 text-center rounded-[28px] border border-dashed flex flex-col items-center justify-center p-6"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <Play className="w-14 h-14 text-foreground/30 mb-3" />
                      <h4 className="text-lg font-bold text-foreground mb-1">No Matches Scheduled Yet</h4>
                      <p className="text-xs text-foreground/50 max-w-sm">
                        Match schedule and live set scoring will appear here once fixtures are drawn.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {matches
                        .filter((m) => m.teamARegistrationUuid != null || m.teamBRegistrationUuid != null)
                        .map((match, idx) => {
                          const teamA = registrations.find(
                            (r) => r.registrationUuid === match.teamARegistrationUuid || r.uuid === match.teamARegistrationUuid
                          );
                          const teamB = registrations.find(
                            (r) => r.registrationUuid === match.teamBRegistrationUuid || r.uuid === match.teamBRegistrationUuid
                          );
                          const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
                          const isCompleted = match.status === 'COMPLETED';

                          const teamAName = teamA?.teamName || match.teamAName || 'Team A';
                          const teamBName = teamB?.teamName || match.teamBName || 'Team B';

                          return (
                            <div
                              key={match.uuid || idx}
                              className="rounded-2xl border p-5 flex flex-col justify-between shadow-md relative overflow-hidden transition-all hover:border-primary/50"
                              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                            >
                              <div
                                className={`absolute top-0 left-0 right-0 h-1 ${
                                  isLive ? 'bg-red-500 animate-pulse' : isCompleted ? 'bg-emerald-500' : 'bg-primary'
                                }`}
                              />

                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/5 text-foreground/60 border border-white/10">
                                    {match.roundName || `Round ${match.roundNumber || 1}`}
                                  </span>

                                  {isLive ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> LIVE
                                    </span>
                                  ) : isCompleted ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                                      Completed
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-foreground/50 text-[10px] font-bold uppercase tracking-wider">
                                      Scheduled
                                    </span>
                                  )}
                                </div>

                                <div
                                  className="p-3.5 rounded-xl border space-y-2 mb-3"
                                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[180px]">
                                      {teamAName}
                                    </span>
                                    <span className="text-sm font-black font-mono text-primary">
                                      {match.setScores ? match.setScores.split(',')[0] || '0' : '0'}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--athlon-border)' }}>
                                    <span className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[180px]">
                                      {teamBName}
                                    </span>
                                    <span className="text-sm font-black font-mono text-primary">
                                      {match.setScores ? match.setScores.split(',')[1] || '0' : '0'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-foreground/50 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {match.scheduledTime
                                    ? new Date(match.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : 'TBD'}
                                </span>

                                {match.courtName && (
                                  <span className="font-bold text-foreground/70">{match.courtName}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column (4 cols): Registration Card & Specs */}
            <div className="col-span-4 space-y-6">
              {/* Registration Bento Box */}
              <div
                className="p-6 rounded-[28px] border space-y-5 shadow-xl relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-foreground/50">Registration Status</span>
                  <span className="text-base font-black text-primary font-mono">
                    {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'FREE ENTRY'}
                  </span>
                </div>

                {tournament.status === 'COMPLETED' || tournament.status === 'FINISHED' ? (
                  <button
                    disabled
                    className="w-full py-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs uppercase tracking-wider rounded-2xl opacity-90 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Tournament Finished
                  </button>
                ) : isRegistrationClosed ? (
                  <button
                    disabled
                    className="w-full py-3.5 bg-red-500/15 border border-red-500/30 text-red-400 font-black text-xs uppercase tracking-wider rounded-2xl cursor-not-allowed opacity-90"
                  >
                    Registration Closed
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(registerHref)}
                    className="w-full py-3.5 bg-primary text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{isAuthenticated ? (isTeamEvent ? 'Register Your Team' : 'Register for Tournament') : 'Login to Register'}</span>
                  </button>
                )}
              </div>

              {/* Payment & UPI Details Box */}
              {(tournament.gpayNumber || qrCodeUrl || (tournament.registrationFees !== undefined && tournament.registrationFees > 0)) && (
                <div
                  className="p-6 rounded-[28px] border space-y-4 shadow-md text-xs"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Payment &amp; Fees</h3>
                    </div>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'FREE ENTRY'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {tournament.gpayNumber && (
                      <div
                        className="p-3 rounded-xl border flex items-center justify-between gap-2"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                      >
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-foreground/45 block">GPay / UPI Number</span>
                          <span className="text-xs font-black text-foreground font-mono">{tournament.gpayNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyGPay}
                          className="px-2.5 py-1 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          {copiedGPay ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedGPay ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}

                    {qrCodeUrl && (
                      <div
                        onClick={() => setPreviewImage({ src: qrCodeUrl, title: `UPI QR Scanner - ${tournament.name}` })}
                        className="p-3 rounded-xl border flex items-center gap-3 cursor-pointer group hover:border-primary/40 transition-all"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white p-1 border border-foreground/10 shrink-0 shadow-sm relative group-hover:scale-105 transition-transform">
                          <img src={qrCodeUrl} alt="UPI QR Scanner" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-black text-foreground flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-primary" />
                            UPI QR Scanner
                          </span>
                          <span className="text-[10px] text-foreground/50 block mt-0.5">Click to enlarge QR</span>
                        </div>
                        <Maximize2 className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tournament Specifications */}
              <div
                className="p-6 rounded-[28px] border space-y-4 shadow-md text-xs"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                  <Trophy className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Competition Details</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/50 font-medium">Tournament:</span>
                    <span className="font-bold text-foreground text-right truncate max-w-[200px]">{tournament.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-foreground/50 font-medium">Sport:</span>
                    <span className="font-bold text-foreground">{tournament.sport || 'Badminton'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-foreground/50 font-medium">Format:</span>
                    <span className="font-bold text-foreground">{isTeamEvent ? 'Team League' : tournament.tournamentType || 'Knockout'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-foreground/50 font-medium">Capacity:</span>
                    <span className="font-bold text-foreground">
                      {validRegistrations.length} {tournament.playersCount ? `/ ${tournament.playersCount}` : 'Entries'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Venue & Organizer Contact */}
              <div
                className="p-6 rounded-[28px] border space-y-4 shadow-md text-xs"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Venue & Organizer</h3>
                </div>

                {tournament.location && (
                  <div className="space-y-1.5">
                    <span className="text-foreground/50 font-medium block">Location:</span>
                    <div className="font-bold text-foreground">{tournament.location}</div>
                    {tournament.mapLink && (
                      <a
                        href={tournament.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline pt-1"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {tournament.contactPhone && (
                  <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <span className="text-foreground/50 font-medium">Organizer Contact:</span>
                    <a href={`tel:${tournament.contactPhone}`} className="font-mono font-bold text-primary hover:underline">
                      {tournament.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Desktop Footer */}
        <footer
          className="mt-20 border-t pt-12 pb-10 text-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="font-black text-foreground text-sm tracking-wide">ATHLON TOURNAMENTS</span>
              </div>

              <div className="flex items-center gap-8 text-foreground/60 font-medium">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <Link href="/tournaments" className="hover:text-primary transition-colors">Tournaments</Link>
                <Link href="/academies" className="hover:text-primary transition-colors">Academies</Link>
                <Link href="/live-score" className="hover:text-primary transition-colors">Live Scoring</Link>
                <Link href="/login" className="hover:text-primary transition-colors">Organizer Hub</Link>
              </div>
            </div>

            <div className="border-t pt-6 flex items-center justify-between text-foreground/40 text-[11px]" style={{ borderColor: 'var(--athlon-border)' }}>
              <p>© 2026 Athlon Sports Platform. All rights reserved.</p>
              <p>Tournament Brackets, Standings & Real-Time Scoring.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* ── IMAGE ENLARGE / LIGHTBOX MODAL ───────────────────────── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="w-full max-w-4xl flex items-center justify-between pb-3 text-white px-2">
            <span className="text-sm font-black truncate max-w-[80%]">{previewImage.title}</span>
            <div className="flex items-center gap-2">
              <a
                href={previewImage.src}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs font-bold"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Original</span>
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="relative max-w-4xl max-h-[82vh] overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage.src}
              alt={previewImage.title}
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
          <p className="text-white/40 text-xs mt-3">Click anywhere outside or press Close to dismiss</p>
        </div>
      )}
    </div>
  );
}
