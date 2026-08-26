'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Trophy,
  Calendar,
  MapPin,
  Users,
  UserPlus,
  Gavel,
  ChevronRight,
  Sparkles,
  Flame,
  Award,
  Clock,
  DollarSign,
  ArrowLeft,
  Share2,
  Phone,
  Layers,
  Swords,
  CheckCircle2,
  Check,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  LogIn,
  Lock,
  Zap,
  Home,
  Building2,
  Radio,
  Maximize2,
  X,
} from 'lucide-react';
import {
  TeamChampionshipService,
  TeamChampionship,
  TeamChampionshipFixture,
  StandingsRow,
} from '@/lib/api/teamChampionship';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function PublicTeamChampionshipPage() {
  const params = useParams();
  const router = useRouter();
  const championshipUuid = params.id as string;

  const [championship, setChampionship] = useState<TeamChampionship | null>(null);
  const [fixtures, setFixtures] = useState<TeamChampionshipFixture[]>([]);
  const [standings, setStandings] = useState<StandingsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'fixtures' | 'standings'>('overview');
  const [copied, setCopied] = useState(false);
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);

  const { isAuthenticated, userUuid } = useAuthStore();

  useEffect(() => {
    if (!championshipUuid) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const champ = await TeamChampionshipService.getById(championshipUuid);
        setChampionship(champ);

        if (champ?.championshipUuid && isAuthenticated) {
          const [fData, sData] = await Promise.allSettled([
            TeamChampionshipService.getFixtures(championshipUuid),
            TeamChampionshipService.getStandings(championshipUuid),
          ]);

          if (fData.status === 'fulfilled' && fData.value) {
            setFixtures(Array.isArray(fData.value) ? fData.value : (fData.value as any)?.data || []);
          }
          if (sData.status === 'fulfilled' && sData.value) {
            setStandings(Array.isArray(sData.value) ? sData.value : (sData.value as any)?.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to load public championship details', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [championshipUuid, isAuthenticated]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getStageMeta = (stage = championship?.stage || 'REGISTRATION_OPEN') => {
    switch (stage) {
      case 'REGISTRATION_OPEN':
        return {
          label: 'Registration Open',
          step: 1,
          badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dotBg: 'bg-emerald-400',
        };
      case 'AUCTION_STAGE':
        return {
          label: 'Auction Live',
          step: 2,
          badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dotBg: 'bg-amber-400',
        };
      case 'LEAGUE_STAGE':
        return {
          label: 'League Stage',
          step: 3,
          badgeBg: 'bg-primary/15 text-primary border-primary/30',
          dotBg: 'bg-primary',
        };
      case 'KNOCKOUT_STAGE':
        return {
          label: 'Knockouts',
          step: 5,
          badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          dotBg: 'bg-purple-400',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          step: 6,
          badgeBg: 'bg-foreground/10 text-foreground/70 border-foreground/20',
          dotBg: 'bg-foreground/50',
        };
      default:
        return {
          label: stage.replace('_', ' '),
          step: 1,
          badgeBg: 'bg-primary/15 text-primary border-primary/30',
          dotBg: 'bg-primary',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-3xl bg-primary/15 border border-primary/30 flex items-center justify-center animate-pulse">
            <Shield className="w-7 h-7 text-primary animate-spin" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary animate-ping" />
        </div>
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-foreground/60">
          Loading Arena...
        </p>
      </div>
    );
  }

  if (!championship) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-5 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/5">
          <Shield className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-foreground">Championship Not Found</h2>
          <p className="text-xs text-foreground/60 max-w-xs mx-auto">
            This championship may have ended, been unpublished, or the link is invalid.
          </p>
        </div>
        <button
          onClick={() => router.push('/tournaments')}
          className="px-6 py-2.5 rounded-2xl bg-primary text-black font-extrabold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          Explore All Tournaments
        </button>
      </div>
    );
  }

  const isRegistrationOpen = (championship.stage || 'REGISTRATION_OPEN') === 'REGISTRATION_OPEN';
  const stageMeta = getStageMeta();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
  const cleanPosterPath = championship.posterUrl
    ? (championship.posterUrl.startsWith('/') && championship.posterUrl.includes(':')
        ? championship.posterUrl.substring(1)
        : championship.posterUrl).replace(/^\/([a-zA-Z]:)/, '$1')
    : '';

  const posterUrl = cleanPosterPath
    ? cleanPosterPath.startsWith('http') || cleanPosterPath.startsWith('data:')
      ? cleanPosterPath
      : `${baseUrl}/api/tournament/team-championship/getFile?filePath=${encodeURIComponent(cleanPosterPath)}`
    : null;

  const startDateFormatted = championship.startDate
    ? new Date(championship.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'TBA';

  const regCloseFormatted = championship.registrationClosingDate
    ? new Date(championship.registrationClosingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'Soon';

  const roadmapSteps = [
    { step: 1, title: 'Registration Open', desc: 'Franchises & player drafts submit entries', stageKey: 'REGISTRATION_OPEN' },
    { step: 2, title: 'Live Player Auction', desc: 'Real-time bidding & squad formation', stageKey: 'AUCTION_STAGE' },
    { step: 3, title: 'Pool Fixture Draw', desc: 'Group distribution & court tie scheduling', stageKey: 'LEAGUE_STAGE' },
    { step: 4, title: 'Lineup & Toss', desc: 'Captains submit order of play & verify toss', stageKey: 'LEAGUE_STAGE' },
    { step: 5, title: 'Match Scoring', desc: 'Point-by-point live digital scoresheet', stageKey: 'LEAGUE_STAGE' },
    { step: 6, title: 'Knockouts & Final', desc: 'Top qualifiers battle for championship cup', stageKey: 'KNOCKOUT_STAGE' },
  ];

  // Auth destination routes
  const teamRegUrl = isAuthenticated
    ? `/home/team-championship/${championship.championshipUuid}/register-team`
    : `/login?redirect=/home/team-championship/${championship.championshipUuid}/register-team`;

  const playerRegUrl = isAuthenticated
    ? `/home/team-championship/${championship.championshipUuid}/register-player`
    : `/login?redirect=/home/team-championship/${championship.championshipUuid}/register-player`;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - EXACT PRESERVED MOBILE EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-32">
        {/* Mobile Top Sticky Bar */}
        <div
          className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-3 flex items-center justify-between"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--athlon-card) 85%, transparent)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl border flex items-center justify-center text-foreground/80 hover:text-foreground active:scale-95 transition-all shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 mx-3 text-center truncate">
            <div className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 shrink-0" />
              <span className="truncate">{championship.sport} Championship</span>
            </div>
            <h2 className="text-xs font-extrabold text-foreground truncate">{championship.name}</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-xl border flex items-center justify-center text-foreground/80 hover:text-foreground active:scale-95 transition-all shadow-sm"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
              title="Share"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {userUuid && userUuid === championship.userUuid && (
              <Link
                href={`/org/${championship.organizerUuid}/team-championship/${championship.championshipUuid}`}
                className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center active:scale-95 transition-all shadow-sm"
                title="Organizer Console"
              >
                <Eye className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 space-y-5">
          {/* Hero Media & Title Card */}
          <div
            className="relative rounded-[26px] overflow-hidden border shadow-xl"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="h-[3px] w-full bg-gradient-to-r from-amber-400 via-primary to-emerald-400" />

            {posterUrl ? (
              <div
                onClick={() => setShowPosterModal(true)}
                className="w-full relative bg-black/70 border-b overflow-hidden cursor-pointer group"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                {/* Blurred Ambient Backdrop */}
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-125 opacity-40 pointer-events-none"
                  style={{ backgroundImage: `url(${posterUrl})` }}
                />

                <div className="w-full relative flex items-center justify-center p-2.5 sm:p-4 min-h-[360px] max-h-[580px]">
                  <img
                    src={posterUrl}
                    alt={`${championship.name} Poster`}
                    className="w-auto h-auto max-w-full max-h-[540px] object-contain rounded-2xl shadow-2xl relative z-10"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-black/40 pointer-events-none z-10" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md flex items-center gap-1.5 ${stageMeta.badgeBg}`}>
                      <span className={`w-2 h-2 rounded-full ${stageMeta.dotBg} animate-pulse`} />
                      {stageMeta.label}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black text-primary bg-black/75 backdrop-blur-md border border-primary/30 shadow-lg">
                        {championship.teamRegistrationFee ? `₹${championship.teamRegistrationFee}/Team` : 'FREE ENTRY'}
                      </span>
                      <button
                        type="button"
                        className="w-7 h-7 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white"
                        title="View Full Poster"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-28 sm:h-36 relative bg-gradient-to-br from-primary/20 via-background to-amber-500/10 p-3.5 flex flex-col justify-between border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md flex items-center gap-1.5 ${stageMeta.badgeBg}`}>
                    <span className={`w-2 h-2 rounded-full ${stageMeta.dotBg} animate-pulse`} />
                    {stageMeta.label}
                  </span>

                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black text-primary bg-primary/10 border border-primary/25">
                    {championship.teamRegistrationFee ? `₹${championship.teamRegistrationFee}/Team` : 'FREE ENTRY'}
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 sm:p-6 relative z-10 space-y-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3" /> {championship.sport} League
                  </span>
                  {championship.auctionMode && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
                      <Gavel className="w-3 h-3" /> {championship.auctionMode.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-foreground leading-snug">
                  {championship.name}
                </h1>

                {championship.description && (
                  <p className="text-xs text-foreground/70 leading-relaxed pt-0.5 line-clamp-3">
                    {championship.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div
                  className="p-2.5 rounded-2xl border flex items-center gap-2.5"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase text-foreground/50">Date</div>
                    <div className="text-xs font-black text-foreground truncate">{startDateFormatted}</div>
                  </div>
                </div>

                <div
                  className="p-2.5 rounded-2xl border flex items-center gap-2.5"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase text-foreground/50">Venue</div>
                    <div className="text-xs font-black text-foreground truncate">
                      {championship.location || championship.venue || 'Kazhakootam'}
                    </div>
                  </div>
                </div>

                <div
                  className="p-2.5 rounded-2xl border flex items-center gap-2.5"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase text-foreground/50">Capacity</div>
                    <div className="text-xs font-black text-foreground truncate">
                      {championship.maxTeams || 6} Teams
                    </div>
                  </div>
                </div>

                <div
                  className="p-2.5 rounded-2xl border flex items-center gap-2.5"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase text-foreground/50">Team Fee</div>
                    <div className="text-xs font-black text-primary font-mono truncate">
                      {championship.teamRegistrationFee ? `₹${championship.teamRegistrationFee}` : 'Free'}
                    </div>
                  </div>
                </div>
              </div>

              {isRegistrationOpen && (
                <div
                  className="p-3 rounded-2xl border flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Flame className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="text-xs font-medium text-foreground/90 truncate">
                      <strong className="text-emerald-400 font-black">Entries Open:</strong> Deadline {regCloseFormatted}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    Active
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Cards */}
          {isRegistrationOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className="p-4 rounded-[22px] border relative overflow-hidden flex flex-col justify-between space-y-3"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {championship.teamRegistrationFee ? `₹${championship.teamRegistrationFee}` : 'Free'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-foreground">Register Team Franchise</h3>
                  <p className="text-[11px] text-foreground/60 mt-0.5 leading-snug">
                    Register your squad (up to {championship.rules?.maxSquadSize || 7} players), assign captain, and compete in the league.
                  </p>
                </div>

                <Link
                  href={teamRegUrl}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
                >
                  {isAuthenticated ? (
                    <>
                      <Users className="w-3.5 h-3.5" />
                      <span>Register Team</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Login to Register Team</span>
                    </>
                  )}
                </Link>
              </div>

              <div
                className="p-4 rounded-[22px] border relative overflow-hidden flex flex-col justify-between space-y-3"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Draft Pool
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-foreground">Join Player Draft Pool</h3>
                  <p className="text-[11px] text-foreground/60 mt-0.5 leading-snug">
                    Register as an individual player to participate in the live player auction and get drafted into a team.
                  </p>
                </div>

                <Link
                  href={playerRegUrl}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold hover:bg-foreground/5 active:scale-[0.98] transition-all text-foreground"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {isAuthenticated ? (
                    <>
                      <UserPlus className="w-3.5 h-3.5 text-primary" />
                      <span>Register as Player</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5 text-primary" />
                      <span>Login to Join Pool</span>
                    </>
                  )}
                </Link>
              </div>
            </div>
          )}

          {/* Mobile Tabs */}
          <div
            className="p-1 rounded-2xl border flex items-center gap-1 overflow-x-auto"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
          >
            {[
              { id: 'overview', label: 'Overview', icon: Info, count: null, locked: false },
              { id: 'fixtures', label: 'Fixtures', icon: Swords, count: isAuthenticated ? fixtures.length : null, locked: !isAuthenticated },
              { id: 'standings', label: 'Standings', icon: Trophy, count: null, locked: !isAuthenticated },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary text-black shadow-md shadow-primary/20 scale-[1.02]'
                      : 'text-foreground/60 hover:text-foreground hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-black/25 text-black font-black' : 'bg-white/10 text-foreground/50'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Tier Categories Bento */}
              <div
                className="p-4 sm:p-5 rounded-[24px] border space-y-3.5"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-foreground">Tier Categories & Quotas</h3>
                      <p className="text-[10px] text-foreground/50">Skill groupings for team player draft</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-foreground/5 border text-foreground/70" style={{ borderColor: 'var(--athlon-border)' }}>
                    {championship.categories?.length || 0} Tiers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {championship.categories?.map((cat) => (
                    <div
                      key={cat.categoryId || cat.name}
                      className="p-3.5 rounded-2xl border relative overflow-hidden flex flex-col justify-between"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/30 text-primary font-black text-xs flex items-center justify-center">
                          {cat.code || cat.name.charAt(0)}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/70">
                          Max {cat.maxPlayers || 12} Players
                        </span>
                      </div>

                      <div>
                        <div className="font-black text-sm text-foreground">{cat.name}</div>
                        <p className="text-[11px] text-foreground/60 mt-0.5 leading-snug">
                          {cat.description || `Category for ${cat.name} grade competitors.`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-Match Schedule */}
              <div
                className="p-4 sm:p-5 rounded-[24px] border space-y-3.5"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Swords className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-foreground">Tie Sub-Match Schedule</h3>
                      <p className="text-[10px] text-foreground/50">Format and points weight for each fixture tie</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-foreground/5 border text-foreground/70" style={{ borderColor: 'var(--athlon-border)' }}>
                    {championship.events?.length || 0} Matches/Tie
                  </span>
                </div>

                <div className="space-y-2">
                  {championship.events?.map((ev, idx) => (
                    <div
                      key={ev.eventId || idx}
                      className="p-3 rounded-2xl border flex items-center justify-between gap-2.5 hover:border-primary/40 transition-all"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-xs font-black text-primary shrink-0">
                          #{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-foreground truncate">{ev.eventName}</div>
                          <div className="text-[10px] text-foreground/60 flex items-center gap-1.5 mt-0.5 truncate">
                            <span className="text-primary font-bold">{ev.categoryName}</span>
                            <span>•</span>
                            <span>{ev.formatName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black bg-primary/15 text-primary border border-primary/30">
                          +{ev.pointsWeight || 1} pt
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmap */}
              <div
                className="p-4 sm:p-5 rounded-[24px] border space-y-4"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">Stage Roadmap</h3>
                    <p className="text-[10px] text-foreground/50">Progression from registration to champion</p>
                  </div>
                </div>

                <div className="space-y-3 relative pl-3.5 before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-foreground/10">
                  {roadmapSteps.map((s) => {
                    const isCurrent = s.step === stageMeta.step;
                    const isPassed = s.step < stageMeta.step;

                    return (
                      <div key={s.step} className="flex items-start gap-3 relative z-10">
                        <div
                          className={`w-6 h-6 rounded-full font-black text-[10px] flex items-center justify-center shrink-0 shadow-sm transition-all ${
                            isPassed
                              ? 'bg-emerald-500 text-black'
                              : isCurrent
                              ? 'bg-primary text-black ring-4 ring-primary/25'
                              : 'bg-foreground/10 text-foreground/60 border border-foreground/10'
                          }`}
                        >
                          {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.step}
                        </div>

                        <div className="min-w-0 pt-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-extrabold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                              {s.title}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[10.5px] text-foreground/60 leading-tight mt-0.5">{s.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Regulations */}
              <div
                className="rounded-[24px] border overflow-hidden"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <button
                  onClick={() => setRulesExpanded(!rulesExpanded)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-foreground/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-foreground">Official Championship Rules</span>
                  </div>
                  {rulesExpanded ? <ChevronUp className="w-4 h-4 text-foreground/50" /> : <ChevronDown className="w-4 h-4 text-foreground/50" />}
                </button>

                {rulesExpanded && (
                  <div className="p-4 pt-0 text-xs text-foreground/75 space-y-2 border-t border-foreground/5">
                    <p>• <strong>Squad Size:</strong> Minimum {championship.rules?.minSquadSize || 7} and Maximum {championship.rules?.maxSquadSize || 7} players per franchise roster.</p>
                    <p>• <strong>Play Mandate:</strong> Every squad member must play at least 1 league sub-match tie.</p>
                    <p>• <strong>Lineup Policy:</strong> Captains submit order of play 30 minutes before match time.</p>
                    <p>• <strong>Substitutions:</strong> Allowed only in case of on-court medical emergencies certified by referee.</p>

                    {championship.contactPhone && (
                      <div className="pt-2 flex items-center gap-1.5 text-primary font-bold">
                        <Phone className="w-3.5 h-3.5" />
                        <span>Contact Organizer: {championship.contactPhone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 2: FIXTURES & MATCHES (Logged-in vs Locked) ── */}
          {activeTab === 'fixtures' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-foreground">Fixtures & Matches</h3>
                <p className="text-[10px] text-foreground/50">Schedule of pool ties and court allocations</p>
              </div>

              {!isAuthenticated ? (
                /* Locked State for Unauthenticated Visitors */
                <div
                  className="p-8 rounded-[24px] border text-center space-y-3.5 shadow-xl"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-12 h-12 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-foreground">Member Login Required</h4>
                    <p className="text-xs text-foreground/60 max-w-xs mx-auto">
                      Log in to view upcoming pool fixtures, tie schedules, and court match allocations.
                    </p>
                  </div>

                  <Link
                    href={`/login?redirect=/home/team-championship/${championship.championshipUuid}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login to View Fixtures</span>
                  </Link>
                </div>
              ) : fixtures.length === 0 ? (
                <div
                  className="py-12 px-4 rounded-[24px] border text-center space-y-2"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Calendar className="w-9 h-9 text-foreground/20 mx-auto" />
                  <p className="text-xs font-bold text-foreground/70">No fixtures published yet</p>
                  <p className="text-[11px] text-foreground/50 max-w-xs mx-auto">
                    Match ties will appear here once the player auction concludes and pool draws are locked.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {fixtures.map((fix) => (
                    <div
                      key={fix.fixtureId}
                      className="p-3.5 rounded-2xl border space-y-2.5"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center justify-between text-[10px] text-foreground/60 border-b pb-2" style={{ borderColor: 'var(--athlon-border)' }}>
                        <span className="font-bold">{fix.roundName || `Round ${fix.roundNumber}`}</span>
                        <span>{fix.scheduledTime ? new Date(fix.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBA'}</span>
                      </div>
                      <div className="flex items-center justify-between font-black text-xs text-foreground">
                        <span>{fix.teamAName || 'Team A'}</span>
                        <span className="text-primary font-mono">{fix.teamAPoints ?? 0} - {fix.teamBPoints ?? 0}</span>
                        <span>{fix.teamBName || 'Team B'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: STANDINGS & POINTS TABLE (Logged-in vs Locked) ── */}
          {activeTab === 'standings' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-foreground">Championship Standings</h3>
                <p className="text-[10px] text-foreground/50">Live points table, tie wins, and net run-rates</p>
              </div>

              {!isAuthenticated ? (
                /* Locked State for Unauthenticated Visitors */
                <div
                  className="p-8 rounded-[24px] border text-center space-y-3.5 shadow-xl"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-12 h-12 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-foreground">Member Login Required</h4>
                    <p className="text-xs text-foreground/60 max-w-xs mx-auto">
                      Log in to view live team leaderboard rankings, pool points, and qualification standings.
                    </p>
                  </div>

                  <Link
                    href={`/login?redirect=/home/team-championship/${championship.championshipUuid}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login to View Standings</span>
                  </Link>
                </div>
              ) : standings.length === 0 ? (
                <div
                  className="py-12 px-4 rounded-[24px] border text-center space-y-2"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Trophy className="w-9 h-9 text-foreground/20 mx-auto" />
                  <p className="text-xs font-bold text-foreground/70">No standings calculated yet</p>
                  <p className="text-[11px] text-foreground/50 max-w-xs mx-auto">
                    Points table will compute automatically as match scoresheets are submitted.
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-2xl border overflow-hidden"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="grid grid-cols-6 gap-1 p-2.5 text-[10px] font-black uppercase text-foreground/50 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                    <span className="col-span-2">Team</span>
                    <span className="text-center">P</span>
                    <span className="text-center">W</span>
                    <span className="text-center">L</span>
                    <span className="text-center text-primary">Pts</span>
                  </div>
                  {standings.map((row, rIdx) => (
                    <div
                      key={row.teamId || rIdx}
                      className="grid grid-cols-6 gap-1 p-3 text-xs font-bold items-center border-b last:border-0"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <span className="col-span-2 text-foreground truncate">{row.teamName}</span>
                      <span className="text-center text-foreground/60">{row.played ?? 0}</span>
                      <span className="text-center text-emerald-400">{row.won ?? 0}</span>
                      <span className="text-center text-red-400">{row.lost ?? 0}</span>
                      <span className="text-center font-black text-primary">{row.points ?? 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-foreground leading-none">ATHLON</span>
                <span
                  className="text-[10px] font-mono font-bold tracking-widest uppercase leading-tight mt-0.5"
                  style={{ color: 'var(--athlon-primary)' }}
                >
                  Championships
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
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
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
                  href={`/login?redirect=/home/team-championship/${championship.championshipUuid}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Join</span>
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
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border backdrop-blur-md flex items-center gap-1.5 ${stageMeta.badgeBg}`}>
                    <span className={`w-2 h-2 rounded-full ${stageMeta.dotBg} animate-pulse`} />
                    {stageMeta.label}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    {championship.sport} Team Championship
                  </span>

                  {championship.auctionMode && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Gavel className="w-3.5 h-3.5" />
                      {championship.auctionMode.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
                  {championship.name}
                </h1>

                {championship.description && (
                  <p className="text-sm text-foreground/70 leading-relaxed max-w-3xl">
                    {championship.description}
                  </p>
                )}

                {/* 4 Hero Counters */}
                <div className="grid grid-cols-4 gap-4 pt-2">
                  <div className="p-3.5 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="text-[10px] font-extrabold uppercase text-foreground/50">Schedule</div>
                    <div className="text-sm font-black text-foreground">{startDateFormatted}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="text-[10px] font-extrabold uppercase text-foreground/50">Location</div>
                    <div className="text-sm font-black text-foreground truncate">{championship.location || 'Venue TBA'}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="text-[10px] font-extrabold uppercase text-foreground/50">Max Teams</div>
                    <div className="text-sm font-black text-foreground">{championship.maxTeams || 6} Franchises</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="text-[10px] font-extrabold uppercase text-foreground/50">Team Fee</div>
                    <div className="text-sm font-black text-primary font-mono">{championship.teamRegistrationFee ? `₹${championship.teamRegistrationFee}` : 'Free'}</div>
                  </div>
                </div>

                {/* Direct CTA Buttons */}
                {isRegistrationOpen && (
                  <div className="flex items-center gap-4 pt-3">
                    <Link
                      href={teamRegUrl}
                      className="px-6 py-3.5 rounded-2xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>{isAuthenticated ? 'Register Team Franchise' : 'Login to Register Team'}</span>
                    </Link>

                    <Link
                      href={playerRegUrl}
                      className="px-6 py-3.5 rounded-2xl border text-xs font-bold text-foreground hover:bg-white/5 active:scale-95 transition-all flex items-center gap-2"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      <span>{isAuthenticated ? 'Join Player Draft Pool' : 'Login to Join Pool'}</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Right Poster */}
              <div className="col-span-4 lg:col-span-4">
                {posterUrl ? (
                  <div
                    onClick={() => setShowPosterModal(true)}
                    className="w-full h-[460px] rounded-[28px] overflow-hidden border shadow-2xl relative group bg-black/70 cursor-pointer flex items-center justify-center p-3"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    {/* Blurred Ambient Backdrop */}
                    <div
                      className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-125 opacity-35 pointer-events-none"
                      style={{ backgroundImage: `url(${posterUrl})` }}
                    />
                    <img
                      src={posterUrl}
                      alt={`${championship.name} Poster`}
                      className="w-auto h-auto max-w-full max-h-full object-contain rounded-xl shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10" />

                    <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-bold px-3.5 py-2 bg-black/65 backdrop-blur-md rounded-xl border border-white/15 z-20">
                      <span className="truncate flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-primary" />
                        {championship.sport} League
                      </span>
                      <span className="flex items-center gap-1.5 text-primary font-mono font-black text-xs">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Click to Expand</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-[460px] rounded-[28px] border flex flex-col items-center justify-center text-center p-6 space-y-3 shadow-lg"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <Shield className="w-16 h-16 text-primary/40" />
                    <span className="text-xs font-black text-foreground/60 uppercase tracking-widest">
                      {championship.sport} League Arena
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Main Content Workspace */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): Roadmap, Tiers, Match Ties, Rules */}
            <div className="col-span-8 space-y-8">
              {/* 1. Stage Roadmap Progression */}
              <div
                className="p-6 rounded-[28px] border space-y-6 shadow-md"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-black text-foreground">Championship Stage Progression</h3>
                  </div>
                  <span className="text-xs text-primary font-bold">Stage {stageMeta.step} of 6</span>
                </div>

                <div className="grid grid-cols-6 gap-2 relative">
                  {roadmapSteps.map((s) => {
                    const isCurrent = s.step === stageMeta.step;
                    const isPassed = s.step < stageMeta.step;
                    return (
                      <div
                        key={s.step}
                        className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between gap-2 transition-all ${
                          isCurrent
                            ? 'bg-primary/15 border-primary/40 scale-105 shadow-md'
                            : isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/25'
                            : 'bg-surface/40 border-foreground/5 opacity-70'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center ${
                            isPassed
                              ? 'bg-emerald-500 text-black'
                              : isCurrent
                              ? 'bg-primary text-black ring-2 ring-primary'
                              : 'bg-foreground/10 text-foreground/60'
                          }`}
                        >
                          {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : s.step}
                        </div>
                        <div className="text-[11px] font-black text-foreground leading-tight line-clamp-2">{s.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Tier Categories & Skill Quotas */}
              <div
                className="p-6 rounded-[28px] border space-y-5 shadow-md"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="text-base font-black text-foreground">Tier Categories & Draft Quotas</h3>
                      <p className="text-xs text-foreground/50">Skill groupings for the live auction draft</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-surface border text-foreground/70" style={{ borderColor: 'var(--athlon-border)' }}>
                    {championship.categories?.length || 0} Tiers Configured
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {championship.categories?.map((cat) => (
                    <div
                      key={cat.categoryId || cat.name}
                      className="p-4 rounded-2xl border space-y-3 flex flex-col justify-between"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 text-primary font-black text-sm flex items-center justify-center">
                          {cat.code || cat.name.charAt(0)}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-foreground/5 text-foreground/70">
                          Max {cat.maxPlayers || 12}
                        </span>
                      </div>

                      <div>
                        <div className="font-black text-sm text-foreground">{cat.name}</div>
                        <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                          {cat.description || `Category for ${cat.name} grade competitors.`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Sub-Match Schedule & Points Weight */}
              <div
                className="p-6 rounded-[28px] border space-y-5 shadow-md"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="flex items-center gap-2.5">
                    <Swords className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-base font-black text-foreground">Tie Sub-Match Schedule</h3>
                      <p className="text-xs text-foreground/50">Format and points weight for each fixture tie</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-surface border text-foreground/70" style={{ borderColor: 'var(--athlon-border)' }}>
                    {championship.events?.length || 0} Matches per Tie
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {championship.events?.map((ev, idx) => (
                    <div
                      key={ev.eventId || idx}
                      className="p-4 rounded-2xl border flex items-center justify-between gap-3"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-xs font-black text-primary shrink-0">
                          #{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-xs text-foreground truncate">{ev.eventName}</div>
                          <div className="text-[11px] text-foreground/60 flex items-center gap-1.5 mt-0.5">
                            <span className="text-primary font-bold">{ev.categoryName}</span>
                            <span>•</span>
                            <span>{ev.formatName}</span>
                          </div>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-primary/15 text-primary border border-primary/30 shrink-0">
                        +{ev.pointsWeight || 1} pt
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Official Championship Regulations */}
              <div
                className="p-6 rounded-[28px] border space-y-4 shadow-md text-xs"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-2.5 border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-black text-foreground">Official Regulations & Rules</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-foreground/75 leading-relaxed">
                  <div className="p-3.5 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                    <strong className="text-foreground font-black block">Squad Composition:</strong>
                    Minimum {championship.rules?.minSquadSize || 7} and Maximum {championship.rules?.maxSquadSize || 7} players per team.
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                    <strong className="text-foreground font-black block">Play Mandate:</strong>
                    Every squad player must play at least 1 league sub-match tie.
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                    <strong className="text-foreground font-black block">Lineup Deadline:</strong>
                    Captains must lock their order of play 30 minutes before match time.
                  </div>
                  <div className="p-3.5 rounded-2xl border bg-surface/50 space-y-1" style={{ borderColor: 'var(--athlon-border)' }}>
                    <strong className="text-foreground font-black block">Substitutions:</strong>
                    Emergency medical replacements only with referee certification.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Summary Box & Organizer Info */}
            <div className="col-span-4 space-y-6">
              {/* Registration Box */}
              {isRegistrationOpen && (
                <div
                  className="p-6 rounded-[28px] border space-y-5 shadow-xl relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                    <Flame className="w-4 h-4 animate-bounce" />
                    <span>Registration Center</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl border bg-surface/50 space-y-2" style={{ borderColor: 'var(--athlon-border)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-foreground">Team Franchise</span>
                        <span className="text-xs font-mono font-black text-primary">
                          {championship.teamRegistrationFee ? `₹${championship.teamRegistrationFee}` : 'Free'}
                        </span>
                      </div>
                      <Link
                        href={teamRegUrl}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Register Franchise</span>
                      </Link>
                    </div>

                    <div className="p-4 rounded-2xl border bg-surface/50 space-y-2" style={{ borderColor: 'var(--athlon-border)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-foreground">Player Draft</span>
                        <span className="text-xs font-mono font-black text-amber-400">Auction Pool</span>
                      </div>
                      <Link
                        href={playerRegUrl}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold hover:bg-white/5 active:scale-95 transition-all text-foreground"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <UserPlus className="w-3.5 h-3.5 text-primary" />
                        <span>Join Player Pool</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Competition Specifications */}
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
                    <span className="text-foreground/50 font-medium">Championship:</span>
                    <span className="font-bold text-foreground text-right truncate max-w-[200px]">{championship.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-foreground/50 font-medium">Sport:</span>
                    <span className="font-bold text-foreground">{championship.sport} League</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-foreground/50 font-medium">Venue:</span>
                    <span className="font-bold text-emerald-400">{championship.location || 'Venue TBA'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-foreground/50 font-medium">Auction Format:</span>
                    <span className="font-bold text-foreground">{championship.auctionMode?.replace('_', ' ') || 'Direct Draft'}</span>
                  </div>

                  {championship.contactPhone && (
                    <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--athlon-border)' }}>
                      <span className="text-foreground/50 font-medium">Contact:</span>
                      <a href={`tel:${championship.contactPhone}`} className="font-mono font-bold text-primary hover:underline">
                        {championship.contactPhone}
                      </a>
                    </div>
                  )}
                </div>
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
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-black text-foreground text-sm tracking-wide">ATHLON TEAM CHAMPIONSHIPS</span>
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
              <p>Team Franchise Championship & Live Auction Engine.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* ── FULLSCREEN POSTER LIGHTBOX MODAL ─────────────────────────────── */}
      {showPosterModal && posterUrl && (
        <div
          onClick={() => setShowPosterModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
          >
            <button
              onClick={() => setShowPosterModal(false)}
              className="absolute -top-12 right-0 sm:-right-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all shadow-lg"
              aria-label="Close poster"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={posterUrl}
              alt={`${championship.name} Full Poster`}
              className="max-h-[85vh] max-w-full w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
