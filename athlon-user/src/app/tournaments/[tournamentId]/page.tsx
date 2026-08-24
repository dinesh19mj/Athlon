'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  DollarSign,
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

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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

          // Fetch standings if League
          if (tData.tournamentType === 'LEAGUE') {
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

    if (activeTab === 'standings' && tournament.tournamentType === 'LEAGUE') {
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
        .catch(() => {});
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

  const isTeamEvent = tournament.tournamentType === 'TEAM_EVENT';
  const isLeague = tournament.tournamentType === 'LEAGUE';

  const isRegistrationClosed = tournament.status === 'REGISTRATION_CLOSED';

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

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
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
            <div className="w-full h-56 sm:h-72 relative bg-black/40 border-b border-white/10">
              <img
                src={posterUrl}
                alt={`${tournament.name} Poster`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-transparent to-black/20" />
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

              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-foreground/80 text-xs font-bold uppercase tracking-wider">
                {isTeamEvent ? 'Team League' : isLeague ? 'League' : 'Knockout'}
              </span>

              <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-black uppercase tracking-wider ${statusBadge.color}`}>
                {statusBadge.label}
              </span>

              {tournament.visibility && (
                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-foreground/60 text-[10px] font-bold uppercase tracking-wider">
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
              registrations={registrations}
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
                  <DollarSign className="w-4 h-4 text-emerald-400" />
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
                  {registrations.length} {tournament.playersCount ? `/ ${tournament.playersCount}` : 'Entries'}
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
                  registrations={registrations}
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

          {isRegistrationClosed ? (
            <button
              disabled
              className="px-8 py-3.5 bg-red-500/15 border border-red-500/30 text-red-400 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg cursor-not-allowed opacity-90"
            >
              Registration Closed
            </button>
          ) : (
            <button
              onClick={() => {
                if (isAuthenticated) {
                  router.push(`/home/tournaments/${tournamentUuid}/register`);
                } else {
                  router.push(`/login?redirect=/tournaments/${tournamentUuid}`);
                }
              }}
              className="px-8 py-3.5 bg-primary text-primary-foreground font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
            >
              {isAuthenticated ? 'Register for Tournament' : 'Login to Register'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
