'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Search,
  Trophy,
  Users,
  Calendar,
  MapPin,
  Phone,
  Ticket,
  Activity,
  Download,
  Loader2,
  Sparkles,
  Settings,
  Share2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Radio,
  Sliders,
  DollarSign,
  Layers,
  ChevronRight,
  RefreshCw,
  Eye,
  Plus,
  BarChart3,
  Swords,
  Tv,
  Lock,
  Unlock,
  Trash2,
  AlertCircle,
  ChevronDown,
  FileImage,
  FileText,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import {
  TournamentService,
  RegistrationService,
  DrawService,
  MatchService,
  StreamConfigService,
  Tournament,
  Registration,
  Match,
  CourtConfig,
} from '@/lib/api/tournaments';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { ManualBracketBuilder } from '@/components/tournaments/ManualBracketBuilder';
import { LeagueDrawBuilder } from '@/components/tournaments/LeagueDrawBuilder';
import { BracketViewer } from '@/components/tournaments/BracketViewer';
import { StandingsTable, PoolStanding } from '@/components/tournaments/StandingsTable';
import { LiveStreamSettings } from '@/components/tournaments/LiveStreamSettings';
import { MatchSetupSettings } from '@/components/tournaments/MatchSetupSettings';
import { TeamEventControlRoom } from '@/components/tournaments/teamevent/TeamEventControlRoom';
import { TournamentWinnersPodium } from '@/components/tournaments/TournamentWinnersPodium';
import * as htmlToImage from 'html-to-image';

export default function TournamentDashboardPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const tournamentId = params.tournamentId as string;
  const router = useRouter();
  const { userId } = useAuthStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<PoolStanding[]>([]);
  const [courts, setCourts] = useState<CourtConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingDraw, setIsGeneratingDraw] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [isManualBuilderActive, setIsManualBuilderActive] = useState(false);
  const [isLeagueBuilderActive, setIsLeagueBuilderActive] = useState(false);
  const [isGeneratingPlayoffs, setIsGeneratingPlayoffs] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [assigningCourt, setAssigningCourt] = useState<number | null>(null);
  const [selectedTeamEventMatch, setSelectedTeamEventMatch] = useState<Match | null>(null);
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [copied, setCopied] = useState(false);

  // ── In-page modal dialog (replaces browser alert / confirm) ────────────────
  type ModalKind = 'alert-error' | 'alert-info' | 'confirm-danger' | 'confirm-info';
  const [modalDialog, setModalDialog] = useState<{
    open: boolean;
    kind: ModalKind;
    title: string;
    message: string;
    confirmLabel?: string;
    resolver?: (ok: boolean) => void;
  } | null>(null);

  const showAlert = (title: string, message: string, kind: 'alert-error' | 'alert-info' = 'alert-error') =>
    new Promise<void>((resolve) =>
      setModalDialog({ open: true, kind, title, message, confirmLabel: 'OK', resolver: () => resolve() })
    );

  const showConfirm = (title: string, message: string, confirmLabel = 'Confirm', kind: 'confirm-danger' | 'confirm-info' = 'confirm-danger') =>
    new Promise<boolean>((resolve) =>
      setModalDialog({ open: true, kind, title, message, confirmLabel, resolver: resolve })
    );

  const closeModal = (ok: boolean) => {
    modalDialog?.resolver?.(ok);
    setModalDialog(null);
  };

  const fetchMatches = async () => {
    if (tournament?.tournamentUuid) {
      try {
        const mRes = await MatchService.getByTournament(tournament.tournamentUuid);
        if (mRes) setMatches(mRes);
      } catch (err) {
        console.error('Failed to fetch matches', err);
      }
    }
  };

  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const captureFullElement = async (el: HTMLElement): Promise<string> => {
    const savedStates: {
      el: HTMLElement;
      overflow: string;
      overflowX: string;
      overflowY: string;
      maxWidth: string;
      width: string;
    }[] = [];

    const allDescendants = [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))];
    allDescendants.forEach((item) => {
      const style = window.getComputedStyle(item);
      const isScrollable =
        style.overflowX === 'auto' ||
        style.overflowX === 'scroll' ||
        style.overflow === 'auto' ||
        style.overflow === 'scroll' ||
        item.scrollWidth > item.clientWidth;

      if (isScrollable) {
        savedStates.push({
          el: item,
          overflow: item.style.overflow,
          overflowX: item.style.overflowX,
          overflowY: item.style.overflowY,
          maxWidth: item.style.maxWidth,
          width: item.style.width,
        });

        item.style.overflow = 'visible';
        item.style.overflowX = 'visible';
        item.style.overflowY = 'visible';
        item.style.maxWidth = 'none';
        if (item.scrollWidth > 0) {
          item.style.width = `${Math.max(item.scrollWidth, item.offsetWidth)}px`;
        }
      }
    });

    const fullWidth = Math.max(el.scrollWidth, el.offsetWidth, 1100);
    const fullHeight = Math.max(el.scrollHeight, el.offsetHeight);

    try {
      const dataUrl = await htmlToImage.toPng(el, {
        backgroundColor: '#0a0a0a',
        pixelRatio: 2,
        width: fullWidth,
        height: fullHeight,
        canvasWidth: fullWidth * 2,
        canvasHeight: fullHeight * 2,
        style: {
          padding: '24px',
          width: `${fullWidth}px`,
          height: 'auto',
          maxWidth: 'none',
          transform: 'none',
          boxSizing: 'border-box',
        },
      });
      return dataUrl;
    } finally {
      savedStates.forEach(({ el: item, overflow, overflowX, overflowY, maxWidth, width }) => {
        item.style.overflow = overflow;
        item.style.overflowX = overflowX;
        item.style.overflowY = overflowY;
        item.style.maxWidth = maxWidth;
        item.style.width = width;
      });
    }
  };

  const handleDownloadPng = async () => {
    const bracketElement = document.getElementById('bracket-capture-area');
    if (!bracketElement) return;

    try {
      setIsDownloading(true);
      const dataUrl = await captureFullElement(bracketElement);
      const link = document.createElement('a');
      link.download = `${tournament?.name || 'athlon-tournament'}-fixture.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download fixture PNG', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    const bracketElement = document.getElementById('bracket-capture-area');
    if (!bracketElement) return;

    try {
      setIsDownloading(true);
      const dataUrl = await captureFullElement(bracketElement);

      const { jsPDF } = await import('jspdf');
      const imgEl = new window.Image();
      imgEl.src = dataUrl;
      await new Promise<void>((res) => {
        imgEl.onload = () => res();
      });

      const imgWidthPx = imgEl.width / 2;
      const imgHeightPx = imgEl.height / 2;
      const pxToMm = 0.264583;
      const imgWidthMm = imgWidthPx * pxToMm;
      const imgHeightMm = imgHeightPx * pxToMm;

      const isLandscape = imgWidthMm > imgHeightMm;
      const pageWidth = isLandscape ? 297 : 210;
      const pageHeight = isLandscape ? 210 : 297;
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const scale = usableWidth / imgWidthMm;
      const finalW = usableWidth;
      const finalH = imgHeightMm * scale;

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      if (finalH <= pageHeight - margin * 2) {
        const yOffset = (pageHeight - finalH) / 2;
        pdf.addImage(dataUrl, 'PNG', margin, yOffset, finalW, finalH);
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = imgEl.width;
        canvas.height = imgEl.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(imgEl, 0, 0);

        const usableHeightMm = pageHeight - margin * 2;
        const usableHeightPx = (usableHeightMm / pxToMm / scale) * 2;
        const sliceWidthPx = imgEl.width;
        let sliceTop = 0;
        let pageIndex = 0;

        while (sliceTop < imgEl.height) {
          const sliceH = Math.min(usableHeightPx, imgEl.height - sliceTop);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = sliceWidthPx;
          sliceCanvas.height = sliceH;
          const sliceCtx = sliceCanvas.getContext('2d')!;
          sliceCtx.drawImage(canvas, 0, sliceTop, sliceWidthPx, sliceH, 0, 0, sliceWidthPx, sliceH);

          const sliceDataUrl = sliceCanvas.toDataURL('image/png');
          const sliceHeightMm = (sliceH / 2) * pxToMm * scale;

          if (pageIndex > 0) pdf.addPage();
          pdf.addImage(sliceDataUrl, 'PNG', margin, margin, finalW, sliceHeightMm);

          sliceTop += sliceH;
          pageIndex++;
        }
      }

      pdf.save(`${tournament?.name || 'athlon-tournament'}-fixture.pdf`);
    } catch (err) {
      console.error('Failed to download fixture PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const tRes = await TournamentService.getById(tournamentId);
        const tData = tRes.data;
        if (tData) {
          setTournament(tData);
          if (tData.tournamentId) {
            try {
              const rRes = await RegistrationService.getByTournament(tData.tournamentId);
              setRegistrations(rRes.data || []);
            } catch (e) {
              console.error('Failed to load registrations', e);
            }
          }
          if (tData.tournamentUuid) {
            try {
              const mRes = await MatchService.getByTournament(tData.tournamentUuid);
              setMatches(mRes || []);
            } catch (e) {
              console.error('Failed to load matches', e);
            }

            try {
              const fetchedCourts = await StreamConfigService.getByTournament(tData.tournamentUuid);
              setCourts(fetchedCourts || []);
            } catch (e) {
              console.error('Failed to load courts', e);
            }

            if (tData.tournamentType === 'LEAGUE' || tData.tournamentType === 'TEAM_EVENT' || tData.tournamentType === 'TEAM_LEAGUE') {
              try {
                const sRes = await DrawService.getStandings(tData.tournamentUuid);
                setStandings(sRes.data || sRes || []);
              } catch (e) {
                console.error('Failed to load standings', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load tournament data', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [tournamentId]);

  useEffect(() => {
    if (tournament?.tournamentUuid) {
      if (activeTab === 'draws' || activeTab === 'matches') {
        const interval = setInterval(() => {
          MatchService.getByTournament(tournament.tournamentUuid!)
            .then((mRes) => {
              if (mRes) setMatches(mRes);
            })
            .catch(() => {});
        }, 4000);
        return () => clearInterval(interval);
      } else if (activeTab === 'standings' && (tournament.tournamentType === 'LEAGUE' || tournament.tournamentType === 'TEAM_EVENT' || tournament.tournamentType === 'TEAM_LEAGUE')) {
        DrawService.getStandings(tournament.tournamentUuid)
          .then((sRes) => {
            if (sRes) setStandings(sRes.data || sRes || []);
          })
          .catch(() => {});

        const interval = setInterval(() => {
          DrawService.getStandings(tournament.tournamentUuid!)
            .then((sRes) => {
              if (sRes) setStandings(sRes.data || sRes || []);
            })
            .catch(() => {});
        }, 4000);
        return () => clearInterval(interval);
      }
    }
  }, [tournament?.tournamentUuid, activeTab]);

  const handleApprove = async (regUuid: string) => {
    try {
      await RegistrationService.updateStatus(regUuid, 'APPROVED', Number(userId));
      setRegistrations((prev) =>
        prev.map((r) => (r.registrationUuid === regUuid || r.uuid === regUuid ? { ...r, status: 'APPROVED' } : r))
      );
    } catch (error) {
      console.error('Failed to approve registration', error);
    }
  };

  const handleReject = async (regUuid: string) => {
    try {
      await RegistrationService.updateStatus(regUuid, 'REJECTED', Number(userId));
      setRegistrations((prev) =>
        prev.map((r) => (r.registrationUuid === regUuid || r.uuid === regUuid ? { ...r, status: 'REJECTED' } : r))
      );
    } catch (error) {
      console.error('Failed to reject registration', error);
    }
  };

  const handlePaymentUpdate = async (regUuid: string, status: string) => {
    try {
      await RegistrationService.updatePaymentStatus(regUuid, status, Number(userId));
      setRegistrations((prev) =>
        prev.map((r) =>
          r.registrationUuid === regUuid || r.uuid === regUuid ? { ...r, paymentStatus: status } : r
        )
      );
    } catch (error) {
      console.error('Failed to update payment status', error);
    }
  };

  const handleGenerateDraw = async () => {
    try {
      setIsGeneratingDraw(true);
      if (!tournament?.tournamentUuid) throw new Error('Missing tournament UUID');
      await DrawService.generateDraw(tournament.tournamentUuid, tournament?.tournamentType || 'KNOCKOUT');
      const mRes = await MatchService.getByTournament(tournament.tournamentUuid);
      setMatches(mRes || []);
      setActiveTab('draws');
    } catch (error) {
      console.error('Failed to generate draw', error);
      await showAlert('Draw Generation Failed', 'Failed to generate draw. Please check your setup and try again.');
    } finally {
      setIsGeneratingDraw(false);
      setShowDrawModal(false);
    }
  };

  const handleDeleteDraw = async () => {
    if (!tournament?.tournamentUuid) return;
    const ok = await showConfirm(
      'Delete Draw',
      'Are you sure you want to delete this draw? This action cannot be undone.',
      'Yes, Delete'
    );
    if (!ok) return;
    try {
      await DrawService.deleteDraw(tournament.tournamentUuid);
      setMatches([]);
    } catch (error) {
      console.error('Failed to delete draw', error);
      await showAlert('Delete Failed', 'Failed to delete draw. Please try again.');
    }
  };

  const handleGeneratePlayoffs = async () => {
    if (!tournament?.tournamentUuid) return;
    try {
      setIsGeneratingPlayoffs(true);
      await DrawService.generateLeaguePlayoffs(tournament.tournamentUuid);
      const mRes = await MatchService.getByTournament(tournament.tournamentUuid);
      setMatches(mRes || []);
    } catch (error: any) {
      console.error('Failed to generate playoffs', error);
      const errorMsg = error?.data || error?.message || error?.response?.data || 'Failed to generate playoffs. Please try again.';
      await showAlert('Playoffs Generation Failed', typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setIsGeneratingPlayoffs(false);
    }
  };

  const handleManualDraw = () => {
    setShowDrawModal(false);
    setIsManualBuilderActive(true);
  };

  const handleLeagueDraw = () => {
    setShowDrawModal(false);
    setIsLeagueBuilderActive(true);
  };

  const handleShare = () => {
    const publicUrl = `${window.location.origin}/tournaments/${tournament?.tournamentUuid || tournamentId}`;
    if (navigator.share) {
      navigator.share({ title: tournament?.name, url: publicUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleToggleRegistration = async () => {
    if (!tournament?.tournamentUuid) return;
    const isClosed = tournament.status === 'REGISTRATION_CLOSED';
    const newStatus = isClosed ? 'ACTIVE' : 'REGISTRATION_CLOSED';

    const ok = await showConfirm(
      isClosed ? 'Reopen Registration' : 'Close Registration',
      isClosed
        ? 'Reopen registrations for this tournament? Users will be able to register again.'
        : 'Close registrations for this tournament? Users will no longer be able to register on the home and public pages.',
      isClosed ? 'Yes, Reopen' : 'Yes, Close',
      isClosed ? 'confirm-info' : 'confirm-danger'
    );
    if (!ok) return;

    try {
      setIsUpdatingStatus(true);
      await TournamentService.updateStatus(tournament.tournamentUuid, newStatus);
      setTournament((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      console.error('Failed to update tournament registration status', err);
      await showAlert('Update Failed', 'Failed to update registration status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Metrics computation
  const approvedRegistrations = useMemo(
    () => registrations.filter((r) => r.status === 'APPROVED'),
    [registrations]
  );
  const pendingRegistrations = useMemo(
    () => registrations.filter((r) => r.status === 'PENDING'),
    [registrations]
  );
  const paidRegistrations = useMemo(
    () => registrations.filter((r) => r.paymentStatus === 'PAID'),
    [registrations]
  );
  const totalRevenue = useMemo(() => {
    const fee = tournament?.registrationFees || 0;
    return paidRegistrations.length * fee;
  }, [tournament, paidRegistrations]);

  const liveMatches = useMemo(() => matches.filter((m) => m.status === 'LIVE'), [matches]);
  const completedMatches = useMemo(() => matches.filter((m) => m.status === 'COMPLETED'), [matches]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (
        registrationSearch &&
        !reg.teamName?.toLowerCase().includes(registrationSearch.toLowerCase()) &&
        !reg.players?.some((p) => p.playerName.toLowerCase().includes(registrationSearch.toLowerCase()))
      ) {
        return false;
      }
      if (approvalFilter !== 'ALL' && reg.status !== approvalFilter) return false;
      if (paymentFilter !== 'ALL' && reg.paymentStatus !== paymentFilter) return false;
      return true;
    });
  }, [registrations, registrationSearch, approvalFilter, paymentFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-xs font-black tracking-widest uppercase text-foreground/50">Loading Tournament Control Center</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-6 text-center">
        <Trophy className="w-12 h-12 text-foreground/30 mb-3" />
        <h2 className="text-xl font-bold mb-2">Tournament Not Found</h2>
        <p className="text-xs text-foreground/50 mb-6">The tournament record could not be loaded.</p>
        <Link
          href={`/org/${orgId}/tournaments`}
          className="px-5 py-2.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl"
        >
          Back to Tournaments
        </Link>
      </div>
    );
  }

  const isTeamEvent = tournament.tournamentType === 'TEAM_EVENT';

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'registrations', label: 'Registrations', icon: Users, badge: registrations.length },
    { id: 'draws', label: 'Draws & Brackets', icon: Swords, badge: matches.length > 0 ? matches.length : undefined },
    ...(tournament?.tournamentType === 'LEAGUE' || tournament?.tournamentType === 'TEAM_EVENT' || tournament?.tournamentType === 'TEAM_LEAGUE' ? [{ id: 'standings', label: 'Standings', icon: Trophy }] : []),
    { id: 'matches', label: 'Matches', icon: Play, badge: liveMatches.length > 0 ? 'LIVE' : undefined },
    { id: 'livestream', label: 'Live Stream', icon: Radio },
    { id: 'match setup', label: 'Match Setup', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-black">
      {/* ── TOP HERO BANNER ────────────────────────────────────────────── */}
      <div className="relative border-b overflow-hidden" style={{ borderColor: 'var(--athlon-border)' }}>
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0 relative z-10">
          {/* Top Navigation & Action Row */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <Link
              href={`/org/${orgId}/tournaments`}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground/60 hover:text-primary transition-colors py-1.5 px-2.5 sm:px-3 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Tournaments</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={handleShare}
                title="Share Public Link"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
              >
                <Share2 className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share Public Link'}</span>
                <span className="sm:hidden">{copied ? 'Copied!' : 'Share'}</span>
              </button>

              <Link
                href={`/tournaments/${tournament.tournamentUuid || tournamentId}`}
                target="_blank"
                title="View Public Page"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold text-primary hover:bg-primary/10 transition-all"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Public Page</span>
                <span className="sm:hidden">Public</span>
              </Link>
            </div>
          </div>

          {/* Tournament Title & Status Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6">
            <div className="space-y-2.5 max-w-3xl">
              {/* Badges */}
              <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-primary/15 border border-primary/30 text-primary text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {tournament.sport || 'Sports'}
                </span>

                <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-foreground/80 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  {isTeamEvent ? 'Team League' : tournament.tournamentType === 'LEAGUE' ? 'League' : 'Knockout'}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                    tournament.visibility === 'PUBLIC'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {tournament.visibility || 'PRIVATE'}
                </span>

                {tournament.status === 'COMPLETED' || tournament.status === 'FINISHED' ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 bg-primary/20 text-primary border-primary/30">
                    <Trophy className="w-3 h-3" /> Match Finished • Completed
                  </span>
                ) : tournament.status === 'REGISTRATION_CLOSED' ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 bg-red-500/20 text-red-400 border-red-500/30">
                    <Lock className="w-3 h-3" /> Registration Closed
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                    <Unlock className="w-3 h-3" /> Registration Open
                  </span>
                )}

                {liveMatches.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    {liveMatches.length} Live
                  </span>
                )}
              </div>

              {/* Tournament Name */}
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
                {tournament.name}
              </h1>

              {/* Location & Dates */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-foreground/75 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    {new Date(tournament.startDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    -{' '}
                    {new Date(tournament.endDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {tournament.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{tournament.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{tournament.registrationFees ? `₹${tournament.registrationFees} Entry` : 'Free Entry'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Group */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleToggleRegistration}
                disabled={isUpdatingStatus}
                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
                  tournament.status === 'REGISTRATION_CLOSED'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                }`}
              >
                {tournament.status === 'REGISTRATION_CLOSED' ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Reopen Registration</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Close Registration</span>
                  </>
                )}
              </button>

              {matches.length === 0 ? (
                <button
                  onClick={() => setShowDrawModal(true)}
                  disabled={isGeneratingDraw}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                  <Swords className="w-4 h-4 stroke-[2.5]" />
                  <span>Generate Draw</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('match setup')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Match Setup</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 border-t scrollbar-none"
            style={{ borderColor: 'var(--athlon-border-subtle)' }}
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider border-b-2 -mb-px transition-all shrink-0 ${
                    isSelected
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground/50 hover:text-foreground hover:border-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        tab.badge === 'LIVE'
                          ? 'bg-red-500 text-white animate-pulse'
                          : isSelected
                          ? 'bg-primary/20 text-primary'
                          : 'bg-white/10 text-foreground/60'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN TAB CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Tournament Podium when finished */}
            <TournamentWinnersPodium
              matches={matches}
              registrations={registrations}
              tournamentName={tournament.name}
            />

            {/* 4-Bento Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Registrations */}
              <div
                onClick={() => setActiveTab('registrations')}
                className="p-5 rounded-2xl border shadow-md flex flex-col justify-between gap-3 cursor-pointer hover:border-primary/50 transition-all group"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/50">
                    Registrations
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-foreground">{registrations.length}</div>
                  <div className="text-[11px] font-medium text-foreground/50 mt-1 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{approvedRegistrations.length} Approved</span>
                    <span>·</span>
                    <span className="text-amber-400 font-bold">{pendingRegistrations.length} Pending</span>
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div
                className="p-5 rounded-2xl border shadow-md flex flex-col justify-between gap-3"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/50">
                    Revenue Collected
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">₹{totalRevenue}</div>
                  <div className="text-[11px] font-medium text-foreground/50 mt-1">
                    {paidRegistrations.length} of {registrations.length} teams paid
                  </div>
                </div>
              </div>

              {/* Total Matches */}
              <div
                onClick={() => setActiveTab('matches')}
                className="p-5 rounded-2xl border shadow-md flex flex-col justify-between gap-3 cursor-pointer hover:border-primary/50 transition-all group"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/50">
                    Matches Fixture
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-foreground">{matches.length}</div>
                  <div className="text-[11px] font-medium text-foreground/50 mt-1 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{completedMatches.length} Completed</span>
                    {liveMatches.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-red-400 font-bold animate-pulse">{liveMatches.length} Live</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Courts & Live Stream */}
              <div
                onClick={() => setActiveTab('livestream')}
                className="p-5 rounded-2xl border shadow-md flex flex-col justify-between gap-3 cursor-pointer hover:border-primary/50 transition-all group"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/50">
                    Court & Live Stream
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <Tv className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-foreground">
                    {courts.length} <span className="text-sm font-bold text-foreground/50">Courts</span>
                  </div>
                  <div className="text-[11px] font-medium text-foreground/50 mt-1">
                    {courts.filter((c) => c.streamKey).length} Stream Channels Ready
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tournament Summary Card */}
              <div
                className="lg:col-span-2 p-6 rounded-2xl border shadow-md space-y-4"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <h2 className="text-xs font-black uppercase tracking-widest text-foreground/50 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Competition Summary
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div
                    className="p-4 rounded-xl border flex items-start gap-3"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                  >
                    <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40">
                        Dates & Schedule
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
                        {new Date(tournament.startDate).toLocaleDateString()} -{' '}
                        {new Date(tournament.endDate).toLocaleDateString()}
                      </p>
                      {tournament.registrationClosingDate && (
                        <p className="text-[11px] text-red-400 font-semibold mt-1">
                          Closes: {new Date(tournament.registrationClosingDate).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl border flex items-start gap-3"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                  >
                    <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40">
                        Venue Location
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
                        {tournament.location || 'Location TBA'}
                      </p>
                      {tournament.mapLink && (
                        <a
                          href={tournament.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline mt-1"
                        >
                          <span>Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl border flex items-start gap-3"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                  >
                    <Trophy className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40">
                        Format & Category
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
                        {tournament.matchFormat || tournament.tournamentType}
                      </p>
                      <p className="text-[11px] text-foreground/60 font-medium mt-0.5">
                        Category: {tournament.category || 'Open'}
                      </p>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl border flex items-start gap-3"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                  >
                    <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40">
                        Organizer Contact
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
                        {tournament.contactPhone || 'No contact provided'}
                      </p>
                      {tournament.contactPhone && (
                        <a
                          href={`tel:${tournament.contactPhone}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:underline mt-1"
                        >
                          <span>Call Organizer</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {tournament.description && (
                  <div className="pt-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40 block mb-1">
                      Tournament Rules & Description
                    </span>
                    <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed whitespace-pre-wrap">
                      {tournament.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Fast Operations Checklist */}
              <div
                className="p-6 rounded-2xl border shadow-md space-y-4 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="space-y-3">
                  <h2 className="text-xs font-black uppercase tracking-widest text-foreground/50 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" />
                    Control Actions
                  </h2>

                  <div className="space-y-2">
                    <Link
                      href={`/home/tournaments/${tournament.tournamentUuid || tournamentId}/register`}
                      className="w-full flex items-center justify-between p-3 rounded-xl border text-left hover:border-primary/50 transition-all text-xs font-bold group"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <UserPlus className="w-4 h-4 text-primary" />
                        <span>{isTeamEvent ? 'Register a New Team' : 'Register a Player / Team'}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-foreground/40 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <button
                      onClick={() => setActiveTab('registrations')}
                      className="w-full flex items-center justify-between p-3 rounded-xl border text-left hover:border-primary/50 transition-all text-xs font-bold"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Review Registrations ({pendingRegistrations.length} Pending)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-foreground/40" />
                    </button>

                    <button
                      onClick={() => {
                        if (matches.length === 0) setShowDrawModal(true);
                        else setActiveTab('draws');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl border text-left hover:border-primary/50 transition-all text-xs font-bold"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Swords className="w-4 h-4 text-primary" />
                        <span>{matches.length === 0 ? 'Generate Bracket Draw' : 'View Fixture Brackets'}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-foreground/40" />
                    </button>

                    <button
                      onClick={() => setActiveTab('match setup')}
                      className="w-full flex items-center justify-between p-3 rounded-xl border text-left hover:border-primary/50 transition-all text-xs font-bold"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sliders className="w-4 h-4 text-primary" />
                        <span>Configure Match & Scoring Rules</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-foreground/40" />
                    </button>

                    <button
                      onClick={() => setActiveTab('livestream')}
                      className="w-full flex items-center justify-between p-3 rounded-xl border text-left hover:border-primary/50 transition-all text-xs font-bold"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Radio className="w-4 h-4 text-primary" />
                        <span>Setup OBS / Stream RTMP Keys</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-foreground/40" />
                    </button>
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl border mt-4 text-xs space-y-2"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                >
                  <span className="font-extrabold text-foreground block">Need Public Tournament URL?</span>
                  <p className="text-[11px] text-foreground/60 leading-relaxed">
                    Share the registration link with your players so they can register their teams directly.
                  </p>
                  <button
                    onClick={handleShare}
                    className="w-full py-2 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {copied ? 'Link Copied!' : 'Copy Shareable Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REGISTRATIONS TAB */}
        {activeTab === 'registrations' && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-foreground">Team & Player Registrations</h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black">
                    {registrations.length} Total
                  </span>
                </div>
                <p className="text-xs text-foreground/50 font-medium mt-0.5">
                  Review roster entries, approve players, and confirm fee payments.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/home/tournaments/${tournament.tournamentUuid || tournamentId}/register`}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isTeamEvent ? '+ Register a Team' : '+ Add Registration'}</span>
                </Link>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                  title="Share Registration Link"
                >
                  <Share2 className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Controls */}
            <div
              className="p-3.5 sm:p-4 rounded-2xl border space-y-3.5 shadow-md"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by team name or player name..."
                  value={registrationSearch}
                  onChange={(e) => setRegistrationSearch(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border-subtle)',
                    color: 'var(--athlon-text)',
                  }}
                />
                {registrationSearch && (
                  <button
                    onClick={() => setRegistrationSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Status Filter Row */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/45">
                    Approval Status
                  </span>
                  {(approvalFilter !== 'ALL' || paymentFilter !== 'ALL' || registrationSearch) && (
                    <button
                      onClick={() => {
                        setApprovalFilter('ALL');
                        setPaymentFilter('ALL');
                        setRegistrationSearch('');
                      }}
                      className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'ALL', label: 'All Status', count: registrations.length },
                    { id: 'APPROVED', label: 'Approved', count: approvedRegistrations.length },
                    { id: 'PENDING', label: 'Pending', count: pendingRegistrations.length },
                    { id: 'REJECTED', label: 'Rejected', count: registrations.filter((r) => r.status === 'REJECTED').length },
                  ].map((f) => {
                    const isSelected = approvalFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setApprovalFilter(f.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm font-black'
                            : 'text-foreground/60 hover:text-foreground hover:bg-white/[0.04]'
                        }`}
                        style={!isSelected ? { backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' } : {}}
                      >
                        <span>{f.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected ? 'bg-black/20 text-primary-foreground' : 'bg-white/5 text-foreground/40'
                          }`}
                        >
                          {f.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Filter Row */}
              <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/45 block">
                  Payment Status
                </span>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'ALL', label: 'All Payments', count: registrations.length },
                    { id: 'PAID', label: 'Paid', count: paidRegistrations.length },
                    { id: 'PENDING', label: 'Unpaid', count: registrations.length - paidRegistrations.length },
                  ].map((f) => {
                    const isSelected = paymentFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setPaymentFilter(f.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm font-black'
                            : 'text-foreground/60 hover:text-foreground hover:bg-white/[0.04]'
                        }`}
                        style={!isSelected ? { backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' } : {}}
                      >
                        <span>{f.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected ? 'bg-black/20 text-white' : 'bg-white/5 text-foreground/40'
                          }`}
                        >
                          {f.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Registrations List Grid */}
            {filteredRegistrations.length === 0 ? (
              <div
                className="py-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center p-6"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                  <Users className="w-7 h-7" />
                </div>
                <h4 className="text-base font-black text-foreground mb-1">No Registrations Found</h4>
                <p className="text-xs text-foreground/50 max-w-sm mb-4 leading-relaxed">
                  {registrationSearch || approvalFilter !== 'ALL' || paymentFilter !== 'ALL'
                    ? 'No player entries match the current search or filters.'
                    : 'Share the tournament link with players so they can register for your competition.'}
                </p>
                {registrationSearch || approvalFilter !== 'ALL' || paymentFilter !== 'ALL' ? (
                  <button
                    onClick={() => {
                      setApprovalFilter('ALL');
                      setPaymentFilter('ALL');
                      setRegistrationSearch('');
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-foreground text-xs font-bold rounded-xl transition-colors"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    <Link
                      href={`/home/tournaments/${tournament.tournamentUuid || tournamentId}/register`}
                      className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isTeamEvent ? 'Register First Team' : 'Add First Registration'}</span>
                    </Link>
                    <button
                      onClick={handleShare}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-foreground text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copied ? 'Link Copied!' : 'Share Registration Link'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredRegistrations.map((reg, rIdx) => {
                  const regUuid = reg.registrationUuid || reg.uuid;
                  const isApproved = reg.status === 'APPROVED';
                  const isRejected = reg.status === 'REJECTED';
                  const isPaid = reg.paymentStatus === 'PAID';

                  return (
                    <div
                      key={regUuid || rIdx}
                      className="rounded-2xl border p-4 sm:p-5 flex flex-col justify-between shadow-md transition-all hover:border-primary/40 relative overflow-hidden"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      {/* Top Accent Line */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${
                          isApproved ? 'bg-emerald-500' : isRejected ? 'bg-red-500' : 'bg-primary'
                        }`}
                      />

                      {/* Header */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3 pt-1">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm sm:text-base font-black text-foreground truncate">{reg.teamName}</h4>
                            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block truncate">
                              {tournament.category || 'Open Category'}
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                isApproved
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isRejected
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-primary/20 text-primary border border-primary/30'
                              }`}
                            >
                              {reg.status}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                isPaid
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {isPaid ? 'PAID' : 'UNPAID'}
                            </span>
                          </div>
                        </div>

                        {/* Players Roster */}
                        <div className="space-y-2 mb-4">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Roster Players ({reg.players?.length || 0})
                          </span>

                          {reg.players && reg.players.length > 0 ? (
                            <div className="space-y-1.5">
                              {reg.players.map((p, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="flex items-center justify-between p-2 rounded-lg border text-xs gap-2"
                                  style={{
                                    backgroundColor: 'var(--athlon-surface)',
                                    borderColor: 'var(--athlon-border-subtle)',
                                  }}
                                >
                                  <span className="font-bold text-foreground truncate">{p.playerName}</span>
                                  {p.phoneNumber && (
                                    <span className="text-[11px] font-mono text-foreground/50 shrink-0">{p.phoneNumber}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-foreground/40 italic">Single entry / No players listed</p>
                          )}
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="pt-3 border-t border-white/[0.06] space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {!isApproved && (
                            <button
                              onClick={() => handleApprove(regUuid)}
                              className="py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold text-xs hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}
                          {!isRejected && (
                            <button
                              onClick={() => handleReject(regUuid)}
                              className="py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-extrabold text-xs hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>

                        {!isPaid ? (
                          <button
                            onClick={() => handlePaymentUpdate(regUuid, 'PAID')}
                            className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                          >
                            Confirm Payment (Mark as Paid)
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePaymentUpdate(regUuid, 'PENDING')}
                            className="w-full py-2 rounded-xl border text-foreground/60 font-bold text-xs hover:text-foreground transition-colors"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border-subtle)',
                            }}
                          >
                            Mark as Unpaid
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* DRAWS TAB */}
        {activeTab === 'draws' && (
          <div className="space-y-6">
            {isManualBuilderActive ? (
              <ManualBracketBuilder
                tournamentUuid={tournament.tournamentUuid!}
                registrations={approvedRegistrations}
                onComplete={() => {
                  setIsManualBuilderActive(false);
                  MatchService.getByTournament(tournament.tournamentUuid!).then((m) => setMatches(m || []));
                }}
                onCancel={() => setIsManualBuilderActive(false)}
              />
            ) : isLeagueBuilderActive ? (
              <LeagueDrawBuilder
                tournamentUuid={tournament.tournamentUuid!}
                registrations={approvedRegistrations}
                onComplete={() => {
                  setIsLeagueBuilderActive(false);
                  MatchService.getByTournament(tournament.tournamentUuid!).then((m) => setMatches(m || []));
                }}
                onCancel={() => setIsLeagueBuilderActive(false)}
              />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-xl font-black text-foreground">Bracket & Tournament Fixture</h3>
                    <p className="text-xs text-foreground/50 font-medium">
                      View, export, or generate brackets for registered players and teams.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {matches.length === 0 ? (
                      <button
                        onClick={() => setShowDrawModal(true)}
                        disabled={isGeneratingDraw}
                        className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        {isGeneratingDraw ? 'Generating...' : 'Generate Draw'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        {(tournament.tournamentType === 'LEAGUE' || tournament.tournamentType === 'TEAM_EVENT') &&
                          !matches.some((m) => m.poolId == null) && (
                            <button
                              onClick={handleGeneratePlayoffs}
                              disabled={isGeneratingPlayoffs}
                              className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-bold text-xs hover:opacity-90 transition-opacity"
                            >
                              {isGeneratingPlayoffs ? 'Generating Playoffs...' : 'Generate Playoffs'}
                            </button>
                          )}

                        <div className="relative inline-block">
                          <button
                            onClick={() => setShowDownloadMenu((prev) => !prev)}
                            disabled={isDownloading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold text-foreground hover:bg-white/5 transition-all"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                            }}
                            title="Download full tournament fixture"
                          >
                            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <Download className="w-3.5 h-3.5 text-primary" />}
                            <span>Download All</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>

                          {showDownloadMenu && (
                            <div
                              className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl border p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
                              style={{
                                backgroundColor: 'var(--athlon-card)',
                                borderColor: 'var(--athlon-border)',
                              }}
                            >
                              <button
                                onClick={() => {
                                  setShowDownloadMenu(false);
                                  handleDownloadPng();
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-foreground hover:bg-white/5 hover:text-primary transition-all group"
                              >
                                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                  <FileImage className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex flex-col">
                                  <span>Download PNG</span>
                                  <span className="text-[10px] text-foreground/40 font-medium">Image format</span>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  setShowDownloadMenu(false);
                                  handleDownloadPdf();
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-foreground hover:bg-white/5 hover:text-red-400 transition-all group"
                              >
                                <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
                                  <FileText className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex flex-col">
                                  <span>Download PDF</span>
                                  <span className="text-[10px] text-foreground/40 font-medium">Print document</span>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleDeleteDraw}
                          className="px-4 py-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 font-bold text-xs hover:bg-red-500/25 transition-colors"
                        >
                          Delete Draw
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {matches.length > 0 ? (
                  <div
                    id="bracket-capture-area"
                    className="space-y-6"
                  >
                    <BracketViewer
                      matches={matches}
                      registrations={registrations}
                      tournamentType={tournament.tournamentType}
                      tournamentName={tournament.name || 'tournament'}
                      onMatchClick={(match) => {
                        if (tournament.tournamentType === 'TEAM_EVENT') {
                          setSelectedTeamEventMatch(match);
                        } else if (match.status === 'COMPLETED' || match.status === 'LIVE') {
                          router.push(`/live-score/${match.uuid}`);
                        } else {
                          setActiveTab('match setup');
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="py-20 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center p-6"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <Swords className="w-12 h-12 text-foreground/30 mb-3" />
                    <h4 className="text-base font-bold text-foreground mb-1">No Draw Generated Yet</h4>
                    <p className="text-xs text-foreground/50 max-w-sm mb-6">
                      Once you have reviewed player registrations, launch automatic seeding or use the manual bracket builder.
                    </p>
                    <button
                      onClick={() => setShowDrawModal(true)}
                      className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
                    >
                      Create Tournament Draw
                    </button>
                  </div>
                )}

                {/* Draw Choice Modal */}
                {showDrawModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div
                      className="rounded-3xl border p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <h3 className="text-lg font-black text-foreground">Select Draw Generation Method</h3>
                      <p className="text-xs text-foreground/60 leading-relaxed">
                        Choose how you would like to seed brackets and schedule matches for this tournament.
                      </p>

                      <div className="space-y-3 pt-2">
                        <button
                          onClick={handleGenerateDraw}
                          className="w-full p-4 rounded-2xl border text-left hover:border-primary transition-all flex items-start gap-3 group"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border-subtle)',
                          }}
                        >
                          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-black text-sm text-foreground block mb-0.5">Automatic Draw</span>
                            <span className="text-xs text-foreground/50 leading-normal block">
                              Randomized & balanced seeding based on approved tournament registrations.
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={handleManualDraw}
                          className="w-full p-4 rounded-2xl border text-left hover:border-primary transition-all flex items-start gap-3 group"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border-subtle)',
                          }}
                        >
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                            <Sliders className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-black text-sm text-foreground block mb-0.5">Manual Bracket Builder</span>
                            <span className="text-xs text-foreground/50 leading-normal block">
                              Custom seed and position specific players or teams into individual bracket slots.
                            </span>
                          </div>
                        </button>

                        {(tournament.tournamentType === 'LEAGUE' || tournament.tournamentType === 'TEAM_EVENT') && (
                          <button
                            onClick={handleLeagueDraw}
                            className="w-full p-4 rounded-2xl border text-left hover:border-primary transition-all flex items-start gap-3 group"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border-subtle)',
                            }}
                          >
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                              <Layers className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-black text-sm text-foreground block mb-0.5">League Pool Setup</span>
                              <span className="text-xs text-foreground/50 leading-normal block">
                                Configure pools, round-robin stages, and team allocations.
                              </span>
                            </div>
                          </button>
                        )}
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setShowDrawModal(false)}
                          className="px-4 py-2 text-xs font-bold text-foreground/60 hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* STANDINGS TAB */}
        {activeTab === 'standings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-black text-foreground">League Standings & Points Table</h3>
                <p className="text-xs text-foreground/50 font-medium">
                  Real-time pool standings calculated from played match set scores.
                </p>
              </div>

              {!matches.some((m) => m.poolId == null) ? (
                <button
                  onClick={handleGeneratePlayoffs}
                  disabled={isGeneratingPlayoffs}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
                >
                  {isGeneratingPlayoffs ? 'Generating Playoffs...' : 'Generate Playoffs'}
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('draws')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider hover:bg-emerald-500/25 transition-all flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5" /> View Playoff Bracket
                </button>
              )}
            </div>

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
                  Play and score pool matches to automatically compute points, sets won, and qualification standings.
                </p>
              </div>
            )}
          </div>
        )}

        {/* MATCHES TAB */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-foreground">Match Schedule & Live Status</h3>
                <p className="text-xs text-foreground/50 font-medium">
                  View assigned courts, assigned umpires, match schedules, and real-time live set points.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('match setup')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Match Setup</span>
                </button>
                <button
                  onClick={fetchMatches}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold text-foreground/75 hover:text-foreground transition-colors"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Matches</span>
                </button>
              </div>
            </div>

            {matches.filter((m) => m.teamARegistrationUuid != null || m.teamBRegistrationUuid != null).length === 0 ? (
              <div
                className="py-20 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center p-6"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <Play className="w-12 h-12 text-foreground/30 mb-3" />
                <h4 className="text-base font-bold text-foreground mb-1">No Matches Scheduled</h4>
                <p className="text-xs text-foreground/50 max-w-sm mb-6">
                  Matches will appear here after you generate the tournament bracket draw.
                </p>
                <button
                  onClick={() => setActiveTab('draws')}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider"
                >
                  Go to Draws & Brackets
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...matches]
                  .filter((m) => m.teamARegistrationUuid != null || m.teamBRegistrationUuid != null)
                  .sort((a, b) => {
                    const isACompleted = a.status === 'COMPLETED';
                    const isBCompleted = b.status === 'COMPLETED';
                    if (!isACompleted && isBCompleted) return -1;
                    if (isACompleted && !isBCompleted) return 1;
                    const isALive = a.status === 'LIVE' || a.status === 'IN_PROGRESS';
                    const isBLive = b.status === 'LIVE' || b.status === 'IN_PROGRESS';
                    if (isALive && !isBLive) return -1;
                    if (!isALive && isBLive) return 1;
                    const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : (a.matchDate ? new Date(a.matchDate).getTime() : Infinity);
                    const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : (b.matchDate ? new Date(b.matchDate).getTime() : Infinity);
                    if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeA - timeB;
                    return (typeof a.id === 'number' ? a.id : 0) - (typeof b.id === 'number' ? b.id : 0);
                  })
                  .map((match, idx) => {
                    const teamA = registrations.find(
                      (r) => r.registrationUuid === match.teamARegistrationUuid || r.uuid === match.teamARegistrationUuid
                    );
                    const teamB = registrations.find(
                      (r) => r.registrationUuid === match.teamBRegistrationUuid || r.uuid === match.teamBRegistrationUuid
                    );
                    const isLive = match.status === 'LIVE';
                    const isCompleted = match.status === 'COMPLETED';
                    const assignedCourt = courts.find((c) => c.id === match.courtId);

                    return (
                      <div
                        key={match.uuid || idx}
                        className="rounded-2xl border p-5 flex flex-col justify-between shadow-md transition-all hover:border-primary/50 relative overflow-hidden"
                        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                      >
                        {/* Top Accent Strip */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-1 ${
                            isLive ? 'bg-red-500 animate-pulse' : isCompleted ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                        />

                        {/* Match Top Info */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between gap-2 mb-2 pt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                              Match #{idx + 1} {match.roundName ? `· ${match.roundName}` : ''}
                            </span>

                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                isLive
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                                  : isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-white/10 text-foreground/60 border border-white/10'
                              }`}
                            >
                              {match.status || 'SCHEDULED'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-foreground/60 font-medium pt-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="truncate">
                                {match.scheduledTime
                                  ? new Date(match.scheduledTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'Time TBA'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate">{assignedCourt ? assignedCourt.name : 'No Court'}</span>
                            </div>

                            <div className="flex items-center gap-1.5 truncate col-span-2 text-[11px] pt-1 mt-0.5 border-t border-white/5">
                              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">
                                {match.umpirePhone ? (
                                  <span className="text-foreground/85 font-semibold">Umpire: <span className="font-mono text-emerald-400">{match.umpirePhone}</span></span>
                                ) : (
                                  <span className="text-amber-400/80 italic font-medium">Umpire: Not Assigned</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Teams Box */}
                        <div className="space-y-2 mb-5">
                          {/* Team A */}
                          <div
                            className="flex items-center justify-between p-3 rounded-xl border text-xs font-bold"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border-subtle)',
                            }}
                          >
                            <span className={`truncate ${!teamA ? 'text-foreground/40 italic' : 'text-foreground'}`}>
                              {teamA ? teamA.teamName : 'TBD'}
                            </span>
                            {isCompleted && match.winnerRegistrationUuid === (teamA?.registrationUuid || teamA?.uuid) && (
                              <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                                WINNER
                              </span>
                            )}
                          </div>

                          <div className="text-center text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                            VS
                          </div>

                          {/* Team B */}
                          <div
                            className="flex items-center justify-between p-3 rounded-xl border text-xs font-bold"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border-subtle)',
                            }}
                          >
                            <span className={`truncate ${!teamB ? 'text-foreground/40 italic' : 'text-foreground'}`}>
                              {teamB ? teamB.teamName : 'TBD'}
                            </span>
                            {isCompleted && match.winnerRegistrationUuid === (teamB?.registrationUuid || teamB?.uuid) && (
                              <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                                WINNER
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                          {tournament.tournamentType === 'TEAM_EVENT' ? (
                            <button
                              onClick={() => setSelectedTeamEventMatch(match)}
                              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
                            >
                              <Play className="w-3.5 h-3.5 fill-current stroke-0" />
                              <span>Team Tie Control</span>
                            </button>
                          ) : isLive ? (
                            <button
                              onClick={() => router.push(`/live-score/${match.uuid}`)}
                              className="w-full py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs uppercase tracking-wider hover:bg-red-500/30 transition-all flex items-center justify-center gap-1.5 animate-pulse"
                            >
                              <Radio className="w-3.5 h-3.5" />
                              <span>View Live Score</span>
                            </button>
                          ) : isCompleted ? (
                            <button
                              onClick={() => router.push(`/live-score/${match.uuid}`)}
                              className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-primary" />
                              <span>View Scorecard</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveTab('match setup')}
                              className="w-full py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>{match.umpirePhone ? 'Manage in Match Setup' : 'Assign Umpire & Court'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* LIVESTREAM TAB */}
        {activeTab === 'livestream' && (
          <div className="space-y-6">
            <LiveStreamSettings tournamentId={tournamentId} tournamentName={tournament.name} />
          </div>
        )}

        {/* MATCH SETUP TAB */}
        {activeTab === 'match setup' && (
          <div className="space-y-6">
            <MatchSetupSettings tournamentId={tournamentId} />
          </div>
        )}
      </div>

      {/* Team Event Modal */}
      {selectedTeamEventMatch && (
        <TeamEventControlRoom
          match={selectedTeamEventMatch}
          registrations={registrations}
          onClose={() => setSelectedTeamEventMatch(null)}
          onUpdate={fetchMatches}
        />
      )}

      {/* ── In-page modal dialog (alert / confirm) ──────────────── */}
      {modalDialog?.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => (modalDialog.kind.startsWith('alert') ? closeModal(false) : undefined)}
          />

          {/* Dialog */}
          <div
            className="relative w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            {/* Top accent */}
            <div
              className={`h-1 w-full ${
                modalDialog.kind === 'alert-error' || modalDialog.kind === 'confirm-danger'
                  ? 'bg-red-500'
                  : 'bg-emerald-500'
              }`}
            />

            <div className="p-6 space-y-4">
              {/* Icon + Title */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    modalDialog.kind === 'alert-error' || modalDialog.kind === 'confirm-danger'
                      ? 'bg-red-500/15 text-red-400'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}
                >
                  {modalDialog.kind === 'alert-error' || modalDialog.kind === 'confirm-danger' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                <div className="space-y-1 pt-0.5">
                  <h3 className="text-sm font-black text-foreground tracking-tight">{modalDialog.title}</h3>
                  <p className="text-xs text-foreground/60 leading-relaxed">{modalDialog.message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                {/* Cancel — only shown for confirm dialogs */}
                {(modalDialog.kind === 'confirm-danger' || modalDialog.kind === 'confirm-info') && (
                  <button
                    onClick={() => closeModal(false)}
                    className="flex-1 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider text-foreground/70 hover:text-foreground transition-colors"
                    style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
                  >
                    Cancel
                  </button>
                )}

                {/* Primary action */}
                <button
                  onClick={() => closeModal(true)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:opacity-90 ${
                    modalDialog.kind === 'alert-error' || modalDialog.kind === 'confirm-danger'
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  }`}
                >
                  {modalDialog.confirmLabel || 'OK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
