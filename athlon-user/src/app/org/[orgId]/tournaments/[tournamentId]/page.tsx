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
  IndianRupee,
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
  Tag,
  User,
  ZoomIn,
  X,
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
  RegistrationPlayer,
  Match,
  CourtConfig,
} from '@/lib/api/tournaments';
import { UserService } from '@/lib/api/user';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { ManualBracketBuilder } from '@/components/tournaments/ManualBracketBuilder';
import { LeagueDrawBuilder } from '@/components/tournaments/LeagueDrawBuilder';
import { PooledKnockoutBuilder } from '@/components/tournaments/PooledKnockoutBuilder';
import { PlayoffMatchmakerModal } from '@/components/tournaments/PlayoffMatchmakerModal';
import { StandingsTable, PoolStanding } from '@/components/tournaments/StandingsTable';
import { BracketViewer } from '@/components/tournaments/BracketViewer';
import { LiveStreamSettings } from '@/components/tournaments/LiveStreamSettings';
import { MatchSetupSettings } from '@/components/tournaments/MatchSetupSettings';
import { TeamEventControlRoom } from '@/components/tournaments/teamevent/TeamEventControlRoom';
import { TournamentWinnersPodium } from '@/components/tournaments/TournamentWinnersPodium';
import * as htmlToImage from 'html-to-image';

interface TournamentDashboardPageProps {
  params: Promise<{ orgId: string; tournamentId: string }>;
}

export default function TournamentDashboardPage({ params }: TournamentDashboardPageProps) {
  const router = useRouter();
  const routeParams = useParams();
  const [unwrappedParams, setUnwrappedParams] = useState<{ orgId: string; tournamentId: string } | null>(null);

  useEffect(() => {
    params.then(setUnwrappedParams);
  }, [params]);

  const orgId = unwrappedParams?.orgId || (routeParams?.orgId as string) || '';
  const tournamentId = unwrappedParams?.tournamentId || (routeParams?.tournamentId as string) || '';

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
  const [selectedDrawSize, setSelectedDrawSize] = useState<number>(32);
  const [isManualBuilderActive, setIsManualBuilderActive] = useState(false);
  const [isLeagueBuilderActive, setIsLeagueBuilderActive] = useState(false);
  const [isPooledBuilderActive, setIsPooledBuilderActive] = useState(false);
  const [showPlayoffModal, setShowPlayoffModal] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');
  const [isGeneratingPlayoffs, setIsGeneratingPlayoffs] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [assigningCourt, setAssigningCourt] = useState<number | null>(null);
  const [selectedTeamEventMatch, setSelectedTeamEventMatch] = useState<Match | null>(null);
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [matchesMobileFilter, setMatchesMobileFilter] = useState<'ALL' | 'LIVE' | 'SCHEDULED' | 'COMPLETED'>('ALL');
  const [copied, setCopied] = useState(false);
  const [playerPhotos, setPlayerPhotos] = useState<Record<string, string>>({});
  const [previewPhotoModal, setPreviewPhotoModal] = useState<{
    url: string;
    playerName: string;
    teamName: string;
    phone?: string;
    regUuid: string;
    status: string;
  } | null>(null);

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

  const resolveRegistrationCategory = (reg: any) => {
    if (reg.category) return reg.category;
    if (reg.categoryName) return reg.categoryName;
    if (reg.teamName) {
      const match = reg.teamName.match(/\(([^)]+)\)$/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    if (tournament?.category && !tournament.category.includes(',')) {
      return tournament.category.trim();
    }
    return null;
  };

  const resolveCleanTeamName = (reg: any) => {
    if (!reg.teamName) return 'Unnamed Team';
    return reg.teamName.replace(/\s*\([^)]+\)$/, '').trim() || reg.teamName;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!tournamentId) return;
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
            .catch(() => { });
        }, 4000);
        return () => clearInterval(interval);
      } else if (activeTab === 'standings' && (tournament.tournamentType === 'LEAGUE' || tournament.tournamentType === 'TEAM_EVENT' || tournament.tournamentType === 'TEAM_LEAGUE')) {
        DrawService.getStandings(tournament.tournamentUuid)
          .then((sRes) => {
            if (sRes) setStandings(sRes.data || sRes || []);
          })
          .catch(() => { });

        const interval = setInterval(() => {
          DrawService.getStandings(tournament.tournamentUuid!)
            .then((sRes) => {
              if (sRes) setStandings(sRes.data || sRes || []);
            })
            .catch(() => { });
        }, 4000);
        return () => clearInterval(interval);
      }
    }
  }, [tournament?.tournamentUuid, activeTab]);

  useEffect(() => {
    const fetchMissingPlayerPhotos = async () => {
      const phonesToFetch: string[] = [];
      registrations.forEach((reg) => {
        reg.players?.forEach((p) => {
          if (p.phoneNumber && !playerPhotos[p.phoneNumber] && !p.photo && !p.photoUrl) {
            phonesToFetch.push(p.phoneNumber);
          }
        });
      });

      if (phonesToFetch.length === 0) return;

      const newPhotos: Record<string, string> = {};
      await Promise.all(
        phonesToFetch.map(async (phone) => {
          try {
            const res = await UserService.getUserByPhone(phone);
            if (res?.data?.photo) {
              newPhotos[phone] = UserService.getPhotoUrl(res.data.photo);
            }
          } catch {
            // ignore lookup errors
          }
        })
      );

      if (Object.keys(newPhotos).length > 0) {
        setPlayerPhotos((prev) => ({ ...prev, ...newPhotos }));
      }
    };

    if (registrations.length > 0) {
      fetchMissingPlayerPhotos();
    }
  }, [registrations]);

  const resolvePlayerPhoto = (p: RegistrationPlayer): string => {
    const direct =
      p.photo ||
      p.photoUrl ||
      p.avatar ||
      p.profilePic ||
      p.userPhoto ||
      (p as any).image ||
      (p as any).profileImage;

    if (direct) {
      if (direct.startsWith('http') || direct.startsWith('data:') || direct.startsWith('/')) {
        return direct;
      }
      return UserService.getPhotoUrl(direct);
    }

    if (p.phoneNumber && playerPhotos[p.phoneNumber]) {
      return playerPhotos[p.phoneNumber];
    }

    // High quality athlete avatar representation
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.playerName)}&backgroundColor=0ea5e9,10b981,8b5cf6,f59e0b`;
  };

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

      if (tournament.tournamentType === 'KNOCKOUT' || !tournament.tournamentType) {
        const approved = approvedRegistrations;
        const totalTeams = approved.length;
        const drawSize = selectedDrawSize;
        const totalPairings = drawSize / 2;
        const totalByes = Math.max(0, drawSize - totalTeams);

        // Shuffle teams
        const shuffled = [...approved].sort(() => Math.random() - 0.5);
        let teamIdx = 0;

        // Choose totalByes distinct matches to receive exactly 1 BYE
        const matchIndices = Array.from({ length: totalPairings }, (_, i) => i).sort(() => Math.random() - 0.5);
        const byeMatchIndices = new Set(matchIndices.slice(0, totalByes));

        const pairings = Array.from({ length: totalPairings }, (_, i) => {
          if (byeMatchIndices.has(i)) {
            const team = shuffled[teamIdx++];
            return {
              slotIndex: i + 1,
              teamAUuid: team ? team.registrationUuid || team.uuid : null,
              teamBUuid: null,
              isTeamABye: false,
              isTeamBBye: true,
            };
          } else {
            const teamA = shuffled[teamIdx++];
            const teamB = shuffled[teamIdx++];
            return {
              slotIndex: i + 1,
              teamAUuid: teamA ? teamA.registrationUuid || teamA.uuid : null,
              teamBUuid: teamB ? teamB.registrationUuid || teamB.uuid : null,
              isTeamABye: false,
              isTeamBBye: false,
            };
          }
        });

        await DrawService.generateManualDraw(tournament.tournamentUuid, {
          drawType: 'KNOCKOUT',
          drawSize: drawSize,
          totalByes: totalByes,
          pairings: pairings,
        });
      } else {
        await DrawService.generateDraw(tournament.tournamentUuid, tournament?.tournamentType || 'KNOCKOUT');
      }

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
      navigator.share({ title: tournament?.name, url: publicUrl }).catch(() => { });
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
  const validRegistrations = useMemo(
    () => registrations.filter((r) => r.status?.toUpperCase() !== 'REJECTED'),
    [registrations]
  );
  const approvedRegistrations = useMemo(
    () => registrations.filter((r) => r.status === 'APPROVED'),
    [registrations]
  );
  const approvedAndPaidTeams = useMemo(
    () => registrations.filter((r) => r.status === 'APPROVED' && r.paymentStatus === 'PAID'),
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

  const filteredTeams = useMemo(() => {
    return approvedAndPaidTeams.filter((reg) => {
      if (
        teamSearch &&
        !reg.teamName?.toLowerCase().includes(teamSearch.toLowerCase()) &&
        !reg.players?.some((p) => p.playerName.toLowerCase().includes(teamSearch.toLowerCase()))
      ) {
        return false;
      }
      return true;
    });
  }, [approvedAndPaidTeams, teamSearch]);

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
    { id: 'registrations', label: 'Registrations', icon: Users, badge: validRegistrations.length },
    { id: 'teams', label: 'Teams', icon: ShieldCheck, badge: approvedAndPaidTeams.length },
    { id: 'draws', label: 'Draws & Brackets', icon: Swords, badge: matches.length > 0 ? matches.length : undefined },
    ...(tournament?.tournamentType === 'LEAGUE' || tournament?.tournamentType === 'TEAM_EVENT' || tournament?.tournamentType === 'TEAM_LEAGUE' ? [{ id: 'standings', label: 'Standings', icon: Trophy }] : []),
    { id: 'livestream', label: 'Live Stream', icon: Radio },
    { id: 'match setup', label: 'Match Setup', icon: Sliders },
    { id: 'matches', label: 'Matches', icon: Play, badge: liveMatches.length > 0 ? 'LIVE' : undefined },
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
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${tournament.visibility === 'PUBLIC'
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

            {/* Quick Actions Group - Horizontal & Compact on Mobile */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleToggleRegistration}
                disabled={isUpdatingStatus}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border font-black text-[10.5px] uppercase tracking-wider transition-all shadow-sm active:scale-95 whitespace-nowrap ${tournament.status === 'REGISTRATION_CLOSED'
                  ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-red-500/15 text-red-500 dark:text-red-400 border-red-500/30 hover:bg-red-500/25'
                  }`}
              >
                {tournament.status === 'REGISTRATION_CLOSED' ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 shrink-0" />
                    <span>Reopen Registration</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Close Registration</span>
                  </>
                )}
              </button>

              {tournament.status === 'REGISTRATION_CLOSED' && matches.length === 0 && (
                <button
                  onClick={() => setShowDrawModal(true)}
                  disabled={isGeneratingDraw}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-black font-black text-[10.5px] uppercase tracking-wider shadow-md shadow-primary/20 active:scale-95 transition-all whitespace-nowrap"
                >
                  <Swords className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                  <span>Generate Draw</span>
                </button>
              )}

              {matches.length > 0 && (
                <button
                  onClick={() => setActiveTab('match setup')}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-black font-black text-[10.5px] uppercase tracking-wider shadow-md shadow-primary/20 active:scale-95 transition-all whitespace-nowrap"
                >
                  <Sliders className="w-3.5 h-3.5 shrink-0" />
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
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider border-b-2 -mb-px transition-all shrink-0 ${isSelected
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground/50 hover:text-foreground hover:border-white/20'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${tab.badge === 'LIVE'
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

            {/* 4-Bento Metric Cards - MOBILE DEDICATED STYLISH VIEW */}
            <div className="block lg:hidden">
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Registrations Card */}
                <div
                  onClick={() => setActiveTab('registrations')}
                  className="p-3.5 rounded-2xl border shadow-sm flex flex-col justify-between gap-2.5 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/50 truncate">
                      Registrations
                    </span>
                  </div>

                  <div>
                    <div className="text-xl font-black text-foreground font-mono leading-none">
                      {validRegistrations.length}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                        {approvedRegistrations.length} Approved
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 dark:text-amber-400">
                        {pendingRegistrations.length} Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Revenue Collected Card */}
                <div
                  className="p-3.5 rounded-2xl border shadow-sm flex flex-col justify-between gap-2.5 relative overflow-hidden"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                      <IndianRupee className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/50 truncate">
                      Revenue
                    </span>
                  </div>

                  <div>
                    <div className="text-xl font-black text-emerald-500 dark:text-emerald-400 font-mono leading-none">
                      ₹{totalRevenue}
                    </div>
                    <div className="mt-2 text-[9px] font-medium text-foreground/60 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded-md bg-foreground/5 font-bold">
                        {paidRegistrations.length}/{validRegistrations.length} Teams Paid
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Matches Fixture Card */}
                <div
                  onClick={() => setActiveTab('matches')}
                  className="p-3.5 rounded-2xl border shadow-sm flex flex-col justify-between gap-2.5 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/50 truncate">
                      Fixtures
                    </span>
                  </div>

                  <div>
                    <div className="text-xl font-black text-foreground font-mono leading-none flex items-center gap-2">
                      <span>{matches.length}</span>
                      {liveMatches.length > 0 && (
                        <span className="flex items-center gap-1 text-[8.5px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          {liveMatches.length} LIVE
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-[9px] font-bold text-foreground/60">
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                        {completedMatches.length} Completed
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Court & Live Stream Card */}
                <div
                  onClick={() => setActiveTab('livestream')}
                  className="p-3.5 rounded-2xl border shadow-sm flex flex-col justify-between gap-2.5 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400">
                      <Tv className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/50 truncate">
                      Streams
                    </span>
                  </div>

                  <div>
                    <div className="text-xl font-black text-foreground font-mono leading-none">
                      {courts.length} <span className="text-xs font-bold text-foreground/50 font-sans">Courts</span>
                    </div>
                    <div className="mt-2 text-[9px] font-medium text-foreground/60">
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-500 dark:text-purple-400 font-bold">
                        {courts.filter((c) => c.streamKey).length} Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Bento Metric Cards - DESKTOP VIEW */}
            <div className="hidden lg:grid grid-cols-4 gap-4">
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
                  <div className="text-2xl sm:text-3xl font-black text-foreground">{validRegistrations.length}</div>
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
                    <IndianRupee className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">₹{totalRevenue}</div>
                  <div className="text-[11px] font-medium text-foreground/50 mt-1">
                    {paidRegistrations.length} of {validRegistrations.length} teams paid
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
              {/* Competition Summary Card - STYLISH MODERN DESIGN */}
              <div
                className="lg:col-span-2 p-4 sm:p-5 rounded-2xl border shadow-sm space-y-3.5 relative overflow-hidden"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                {/* Header with Live Badge */}
                <div className="flex items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xs font-black uppercase tracking-wider text-foreground truncate">
                        Summary
                      </h2>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {tournament.sport || 'Sports'} • {tournament.tournamentType || 'Tournament'}
                  </span>
                </div>

                {/* 4-Item Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. Dates & Schedule */}
                  <div
                    className="p-3 rounded-xl border flex items-start gap-3 transition-all hover:border-primary/40 group"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/50 block">
                        Dates & Schedule
                      </span>
                      <p className="text-xs font-black text-foreground mt-0.5 font-mono truncate">
                        {new Date(tournament.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        {new Date(tournament.startDate).toDateString() !== new Date(tournament.endDate).toDateString() && (
                          <span> - {new Date(tournament.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                      </p>
                      {tournament.registrationClosingDate && (
                        <div className="inline-flex items-center gap-1 text-[9.5px] font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md mt-1.5 border border-red-500/20">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate">Closes: {new Date(tournament.registrationClosingDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Venue Location */}
                  <div
                    className="p-3 rounded-xl border flex items-start gap-3 transition-all hover:border-amber-500/40 group"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-105 transition-transform">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/50 block">
                        Venue Location
                      </span>
                      <p className="text-xs font-black text-foreground mt-0.5 truncate">
                        {tournament.location || 'Location TBA'}
                      </p>
                      {tournament.mapLink && (
                        <a
                          href={tournament.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[9.5px] font-black text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md mt-1.5 transition-colors border border-primary/20"
                        >
                          <span>Open Google Maps</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 3. Format & Category */}
                  <div
                    className="p-3 rounded-xl border flex items-start gap-3 transition-all hover:border-purple-500/40 group"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/50 block">
                        Format & Category
                      </span>
                      <p className="text-xs font-black text-foreground mt-0.5 truncate">
                        {tournament.matchFormat || tournament.tournamentType}
                      </p>
                      <div className="inline-flex items-center gap-1 text-[9.5px] font-bold text-foreground/70 bg-foreground/5 px-2 py-0.5 rounded-md mt-1.5 border border-foreground/10">
                        <Tag className="w-2.5 h-2.5 text-purple-400" />
                        <span className="truncate">Category: {tournament.category || 'Open'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Organizer Contact */}
                  <div
                    className="p-3 rounded-xl border flex items-start gap-3 transition-all hover:border-emerald-500/40 group"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/50 block">
                        Organizer Contact
                      </span>
                      <p className="text-xs font-black text-foreground mt-0.5 font-mono truncate">
                        {tournament.contactPhone || 'No contact provided'}
                      </p>
                      {tournament.contactPhone && (
                        <a
                          href={`tel:${tournament.contactPhone}`}
                          className="inline-flex items-center gap-1 text-[9.5px] font-black text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md mt-1.5 transition-colors border border-emerald-500/20"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>Call Organizer</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional Rules & Description */}
                {tournament.description && (
                  <div className="pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                      <FileText className="w-3 h-3 text-primary" />
                      <span>Tournament Rules & Description</span>
                    </div>
                    <p className="text-xs text-foreground/75 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-primary/30">
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
                    {validRegistrations.length} Total
                  </span>
                </div>
                <p className="text-xs text-foreground/50 font-medium mt-0.5">
                  Review player entries, approve players, and confirm fee payments.
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border ${isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm font-black'
                          : 'text-foreground/60 hover:text-foreground hover:bg-white/[0.04]'
                          }`}
                        style={!isSelected ? { backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' } : {}}
                      >
                        <span>{f.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-black/20 text-primary-foreground' : 'bg-white/5 text-foreground/40'
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border ${isSelected
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm font-black'
                          : 'text-foreground/60 hover:text-foreground hover:bg-white/[0.04]'
                          }`}
                        style={!isSelected ? { backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' } : {}}
                      >
                        <span>{f.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-black/20 text-white' : 'bg-white/5 text-foreground/40'
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
                      className="rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between shadow-sm transition-all hover:border-primary/40 relative overflow-hidden gap-3"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      {/* Top Accent Line */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${isApproved ? 'bg-emerald-500' : isRejected ? 'bg-red-500' : 'bg-primary'
                          }`}
                      />

                      {/* Header */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black text-foreground truncate">{resolveCleanTeamName(reg)}</h4>
                            {resolveRegistrationCategory(reg) ? (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider truncate">
                                  <Tag className="w-2.5 h-2.5 text-primary shrink-0" />
                                  {resolveRegistrationCategory(reg)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[9.5px] font-bold text-foreground/50 uppercase tracking-wider block truncate mt-0.5">
                                General Entry
                              </span>
                            )}
                          </div>

                          {/* Status Badges in flex row */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider border ${isApproved
                                ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border-emerald-500/30'
                                : isRejected
                                  ? 'bg-red-500/15 text-red-500 dark:text-red-400 border-red-500/30'
                                  : 'bg-primary/15 text-primary border-primary/30'
                                }`}
                            >
                              {reg.status}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider border ${isPaid
                                ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30'
                                }`}
                            >
                              {isPaid ? 'PAID' : 'UNPAID'}
                            </span>
                          </div>
                        </div>

                        {/* Players Roster (Compact Rows) */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[9px] font-extrabold uppercase text-foreground/40 px-0.5">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-primary" />
                              Player ({reg.players?.length || 0})
                            </span>
                            <span className="text-foreground/40 lowercase">tap photo to view</span>
                          </div>

                          {reg.players && reg.players.length > 0 ? (
                            <div className="space-y-1.5">
                              {reg.players.map((p, pIdx) => {
                                const formattedPhotoUrl = resolvePlayerPhoto(p);
                                const hasRealPhoto =
                                  !!(p.photo || p.photoUrl || p.avatar || p.profilePic || p.userPhoto || (p.phoneNumber && playerPhotos[p.phoneNumber]));

                                return (
                                  <div
                                    key={pIdx}
                                    className="flex items-center justify-between py-1.5 px-2.5 rounded-xl border text-xs gap-2.5 transition-all hover:border-primary/40 group"
                                    style={{
                                      backgroundColor: 'var(--athlon-surface)',
                                      borderColor: 'var(--athlon-border-subtle)',
                                    }}
                                  >
                                    {/* Left: Player Avatar / Photo */}
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <div
                                        onClick={() => {
                                          setPreviewPhotoModal({
                                            url: formattedPhotoUrl,
                                            playerName: p.playerName,
                                            teamName: reg.teamName,
                                            phone: p.phoneNumber,
                                            regUuid,
                                            status: reg.status,
                                          });
                                        }}
                                        className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-primary/30 relative flex items-center justify-center transition-all cursor-pointer shadow-sm group-hover:scale-105 hover:ring-2 hover:ring-primary/40 bg-black/20"
                                        title="Tap to verify athlete photo"
                                      >
                                        <img
                                          src={formattedPhotoUrl}
                                          alt={p.playerName}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.playerName)}`;
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                          <ZoomIn className="w-3 h-3 text-white" />
                                        </div>
                                      </div>

                                      {/* Player details */}
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1">
                                          <span className="font-bold text-xs text-foreground truncate">{p.playerName}</span>
                                          {hasRealPhoto && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Photo verified" />
                                          )}
                                        </div>
                                        {p.phoneNumber && (
                                          <span className="text-[10px] font-mono text-foreground/50 block truncate">{p.phoneNumber}</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right: Quick Verify Eye Button */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewPhotoModal({
                                          url: formattedPhotoUrl,
                                          playerName: p.playerName,
                                          teamName: reg.teamName,
                                          phone: p.phoneNumber,
                                          regUuid,
                                          status: reg.status,
                                        })
                                      }
                                      className="p-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors shrink-0"
                                      title="Verify photo"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[11px] text-foreground/40 italic">Single entry / No players listed</p>
                          )}
                        </div>
                      </div>

                      {/* Action Footer - Single Horizontal Compact Row */}
                      <div className="pt-2 border-t flex items-center gap-1.5" style={{ borderColor: 'var(--athlon-border)' }}>
                        {/* 1. Payment Action */}
                        {!isPaid ? (
                          <button
                            onClick={() => handlePaymentUpdate(regUuid, 'PAID')}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 font-black text-[10.5px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
                            title="Mark as Paid"
                          >
                            <IndianRupee className="w-3 h-3 shrink-0" />
                            <span>Mark Paid</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePaymentUpdate(regUuid, 'PENDING')}
                            className="flex-1 py-1.5 px-2 rounded-xl border text-foreground/60 font-bold text-[10.5px] hover:text-foreground transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                            title="Mark as Unpaid"
                          >
                            <IndianRupee className="w-3 h-3 shrink-0" />
                            <span>Unpaid</span>
                          </button>
                        )}

                        {/* 2. Approve Action */}
                        {!isApproved && (
                          <button
                            onClick={() => handleApprove(regUuid)}
                            className="py-1.5 px-2.5 rounded-xl bg-emerald-500 text-white font-black text-[10.5px] uppercase tracking-wider hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
                            title="Approve Registration"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* 3. Reject Action */}
                        {!isRejected && (
                          <button
                            onClick={() => handleReject(regUuid)}
                            className="py-1.5 px-2.5 rounded-xl bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/30 font-black text-[10.5px] uppercase tracking-wider hover:bg-red-500/25 transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
                            title="Reject Registration"
                          >
                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Reject</span>
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

        {/* TEAMS TAB (Approved & Paid Teams) */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-foreground tracking-tight">Confirmed Teams</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
                    {approvedAndPaidTeams.length} Verified
                  </span>
                </div>
                <p className="text-xs text-foreground/50 font-medium mt-0.5">
                  Official players of approved and paid teams ready for draws and match fixtures.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search team or athlete..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-surface border focus:outline-none focus:border-primary/50 text-foreground transition-all"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                />
                {teamSearch && (
                  <button
                    onClick={() => setTeamSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Empty State */}
            {approvedAndPaidTeams.length === 0 ? (
              <div
                className="py-16 px-4 rounded-3xl border text-center max-w-lg mx-auto space-y-4"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-foreground">No Confirmed Teams Yet</h4>
                  <p className="text-xs text-foreground/50 max-w-sm mx-auto">
                    Teams will appear here once their registration is <span className="text-emerald-400 font-bold">APPROVED</span> and marked as <span className="text-emerald-400 font-bold">PAID</span>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('registrations')}
                  className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider shadow-sm hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Manage Registrations</span>
                </button>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div
                className="py-12 px-4 rounded-2xl border text-center"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <p className="text-xs text-foreground/50">No confirmed teams matching "{teamSearch}"</p>
              </div>
            ) : (
              /* Teams Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredTeams.map((reg, tIdx) => {
                  const regUuid = reg.registrationUuid || reg.uuid;

                  return (
                    <div
                      key={regUuid || tIdx}
                      className="rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between shadow-sm transition-all hover:border-emerald-500/40 relative overflow-hidden gap-3"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      {/* Top Accent Line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

                      {/* Card Header */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 text-[10px] font-black flex items-center justify-center font-mono">
                                #{tIdx + 1}
                              </span>
                              <h4 className="text-sm font-black text-foreground truncate">{resolveCleanTeamName(reg)}</h4>
                            </div>
                            {resolveRegistrationCategory(reg) ? (
                              <div className="flex items-center gap-1.5 mt-1 ml-6.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider truncate">
                                  <Tag className="w-2.5 h-2.5 text-primary shrink-0" />
                                  {resolveRegistrationCategory(reg)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[9.5px] font-bold text-foreground/50 uppercase tracking-wider block truncate mt-0.5 ml-6.5">
                                General Entry
                              </span>
                            )}
                          </div>

                          {/* Confirmed Verified Badges */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
                              PAID
                            </span>
                          </div>
                        </div>

                        {/* Athletes / Players Roster */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[9px] font-extrabold uppercase text-foreground/40 px-0.5">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-emerald-500" />
                              Player ({reg.players?.length || 0})
                            </span>
                            <span className="text-foreground/40 lowercase">tap photo to view</span>
                          </div>

                          {reg.players && reg.players.length > 0 ? (
                            <div className="space-y-1.5">
                              {reg.players.map((p, pIdx) => {
                                const formattedPhotoUrl = resolvePlayerPhoto(p);
                                const hasRealPhoto =
                                  !!(p.photo || p.photoUrl || p.avatar || p.profilePic || p.userPhoto || (p.phoneNumber && playerPhotos[p.phoneNumber]));

                                return (
                                  <div
                                    key={pIdx}
                                    className="flex items-center justify-between py-1.5 px-2.5 rounded-xl border text-xs gap-2.5 transition-all hover:border-emerald-500/30 group"
                                    style={{
                                      backgroundColor: 'var(--athlon-surface)',
                                      borderColor: 'var(--athlon-border-subtle)',
                                    }}
                                  >
                                    {/* Left: Athlete Avatar / Photo */}
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <div
                                        onClick={() => {
                                          setPreviewPhotoModal({
                                            url: formattedPhotoUrl,
                                            playerName: p.playerName,
                                            teamName: reg.teamName,
                                            phone: p.phoneNumber,
                                            regUuid,
                                            status: reg.status,
                                          });
                                        }}
                                        className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-emerald-500/30 relative flex items-center justify-center transition-all cursor-pointer shadow-sm group-hover:scale-105 hover:ring-2 hover:ring-emerald-500/40 bg-black/20"
                                        title="Tap to view athlete photo"
                                      >
                                        <img
                                          src={formattedPhotoUrl}
                                          alt={p.playerName}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.playerName)}`;
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                          <ZoomIn className="w-3 h-3 text-white" />
                                        </div>
                                      </div>

                                      {/* Athlete Details */}
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1">
                                          <span className="font-bold text-xs text-foreground truncate">{p.playerName}</span>
                                          {hasRealPhoto && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Photo verified" />
                                          )}
                                        </div>
                                        {p.phoneNumber && (
                                          <span className="text-[10px] font-mono text-foreground/50 block truncate">{p.phoneNumber}</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* View Photo Eye Button */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewPhotoModal({
                                          url: formattedPhotoUrl,
                                          playerName: p.playerName,
                                          teamName: reg.teamName,
                                          phone: p.phoneNumber,
                                          regUuid,
                                          status: reg.status,
                                        })
                                      }
                                      className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 transition-colors shrink-0"
                                      title="View photo"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[11px] text-foreground/40 italic">Single entry / No players listed</p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-2 border-t flex items-center justify-between text-[10px] text-foreground/50 font-medium" style={{ borderColor: 'var(--athlon-border)' }}>
                        <span>Entry Status: <strong className="text-emerald-500">Confirmed</strong></span>
                        <span className="font-mono">
                          {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Verified'}
                        </span>
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
                initialDrawSize={selectedDrawSize}
                playerPhotos={playerPhotos}
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
            ) : isPooledBuilderActive ? (
              <PooledKnockoutBuilder
                tournamentUuid={tournament.tournamentUuid!}
                registrations={approvedRegistrations}
                categoryName={selectedCategoryTab !== 'ALL' ? selectedCategoryTab : undefined}
                tournament={tournament}
                onComplete={() => {
                  setIsPooledBuilderActive(false);
                  MatchService.getByTournament(tournament.tournamentUuid!).then((m) => setMatches(m || []));
                }}
                onCancel={() => setIsPooledBuilderActive(false)}
              />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-xl font-black text-foreground">Tournament Fixture</h3>
                    <p className="text-xs text-foreground/50 font-medium">
                      View, export, or generate brackets for registered players and teams.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {matches.length === 0 ? (
                      tournament.status === 'REGISTRATION_CLOSED' ? (
                        <button
                          onClick={() => {
                            const approvedCount = approvedRegistrations.length;
                            const recommended = Math.max(4, Math.pow(2, Math.ceil(Math.log2(approvedCount || 2))));
                            setSelectedDrawSize(recommended);
                            setShowDrawModal(true);
                          }}
                          disabled={isGeneratingDraw}
                          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <Swords className="w-4 h-4 shrink-0" />
                          <span>{isGeneratingDraw ? 'Generating...' : 'Generate Draw'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setModalDialog({
                              open: true,
                              kind: 'confirm-info',
                              title: 'Close Registration to Generate Draw',
                              message: 'Registration must be closed before generating the tournament draw. Would you like to close registration now?',
                              confirmLabel: 'Close Registration',
                              resolver: (confirmed) => {
                                if (confirmed) handleToggleRegistration();
                              },
                            });
                          }}
                          className="px-4 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider text-foreground/50 hover:text-foreground hover:border-red-500/40 transition-all flex items-center gap-1.5"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                          title="Close registration first to generate draw"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Generate Draw (Locked)</span>
                        </button>
                      )
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        {matches.some((m) => m.poolId != null) && !matches.some((m) => m.poolId == null) && (
                          <button
                            onClick={() => setShowPlayoffModal(true)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs uppercase tracking-wider hover:opacity-90 shadow-md flex items-center gap-1.5"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>Generate Championship Stage</span>
                          </button>
                        )}

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
                      playerPhotos={playerPhotos}
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
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3.5">
                      <Swords className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-foreground mb-1">No Draw Generated Yet</h4>
                    <p className="text-xs text-foreground/50 max-w-sm mb-6">
                      {tournament.status === 'REGISTRATION_CLOSED'
                        ? 'Registration is closed. You can now launch automatic seeding or use the manual bracket builder.'
                        : 'Registration is currently open. Once you close registration, draw generation will be unlocked.'}
                    </p>

                    {tournament.status === 'REGISTRATION_CLOSED' ? (
                      <button
                        onClick={() => {
                          const approvedCount = approvedRegistrations.length;
                          const recommended = Math.max(4, Math.pow(2, Math.ceil(Math.log2(approvedCount || 2))));
                          setSelectedDrawSize(recommended);
                          setShowDrawModal(true);
                        }}
                        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Swords className="w-4 h-4" />
                        <span>Create Tournament Draw</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleToggleRegistration}
                        disabled={isUpdatingStatus}
                        className="px-5 py-2.5 rounded-xl bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/30 font-black text-xs uppercase tracking-wider hover:bg-red-500/25 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Close Registration to Unlock</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Draw Choice Modal */}
                {showDrawModal && (() => {
                  const approvedCount = approvedRegistrations.length;
                  const recommended = Math.max(4, Math.pow(2, Math.ceil(Math.log2(approvedCount || 4))));
                  const activeDrawSize = selectedDrawSize >= approvedCount ? selectedDrawSize : recommended;
                  const modalByes = Math.max(0, activeDrawSize - approvedCount);
                  const modalR1Matches = Math.max(0, approvedCount - (activeDrawSize / 2));
                  const directR2Teams = modalByes;

                  return (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-150">
                      <div
                        className="rounded-t-[28px] sm:rounded-3xl border w-full max-w-lg shadow-2xl p-5 sm:p-7 space-y-4 sm:space-y-5 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
                        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                      >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b pb-3.5" style={{ borderColor: 'var(--athlon-border)' }}>
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                              <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight truncate">
                                Tournament Draw Setup
                              </h3>
                              <p className="text-[11px] sm:text-xs text-foreground/50 font-medium">
                                Configure bracket size & fixture generation
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowDrawModal(false)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-foreground/60 transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Auto-Calculated Bracket Size Card */}
                        <div
                          className="p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-sm"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                              <Trophy className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-sm sm:text-base text-foreground">
                                  {activeDrawSize} Draw Bracket
                                </span>
                                {approvedCount === activeDrawSize ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    Perfect Bracket (0 Byes)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
                                    {modalByes} Byes Needed
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] sm:text-xs text-foreground/50 mt-0.5 truncate">
                                Automatically configured for {approvedCount} registered teams
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Live Math Calculation Summary Card */}
                        <div
                          className="p-2.5 sm:p-3.5 rounded-2xl border grid grid-cols-3 gap-1.5 sm:gap-2 text-center"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                        >
                          <div className="p-2 rounded-xl bg-black/25 flex flex-col justify-center">
                            <span className="text-[9px] sm:text-[10px] font-black uppercase text-foreground/40 block leading-tight">
                              Total Byes
                            </span>
                            <span className="text-sm sm:text-base font-black text-emerald-400 font-mono block my-0.5">
                              {modalByes} Byes
                            </span>
                            <span className="text-[8.5px] sm:text-[9.5px] text-foreground/50 leading-tight">
                              Skip to R2
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-black/25 flex flex-col justify-center">
                            <span className="text-[9px] sm:text-[10px] font-black uppercase text-foreground/40 block leading-tight">
                              Round 1
                            </span>
                            <span className="text-sm sm:text-base font-black text-amber-400 font-mono block my-0.5">
                              {modalR1Matches} Matches
                            </span>
                            <span className="text-[8.5px] sm:text-[9.5px] text-foreground/50 leading-tight">
                              {modalR1Matches * 2} Teams play
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-black/25 flex flex-col justify-center">
                            <span className="text-[9px] sm:text-[10px] font-black uppercase text-foreground/40 block leading-tight">
                              Direct R2
                            </span>
                            <span className="text-sm sm:text-base font-black text-blue-400 font-mono block my-0.5">
                              {directR2Teams} Teams
                            </span>
                            <span className="text-[8.5px] sm:text-[9.5px] text-foreground/50 leading-tight">
                              Advance direct
                            </span>
                          </div>
                        </div>

                        {/* Step 2: Choose Method */}
                        <div className="space-y-2 sm:space-y-2.5">
                          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-foreground/70 block">
                            2. Choose Draw Method:
                          </span>

                          <button
                            onClick={handleGenerateDraw}
                            className="w-full p-3 sm:p-3.5 rounded-2xl border text-left hover:border-primary transition-all flex items-start gap-3 group active:scale-[0.99]"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border-subtle)',
                            }}
                          >
                            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                <span className="font-black text-xs sm:text-sm text-foreground">
                                  Automatic Draw
                                </span>
                                {modalByes > 0 && (
                                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                                    {modalByes} Byes
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] sm:text-xs text-foreground/50 leading-relaxed block">
                                Balanced seeding placing {modalByes} byes automatically for a {activeDrawSize}-draw bracket.
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={handleManualDraw}
                            className="w-full p-3 sm:p-3.5 rounded-2xl border text-left hover:border-primary transition-all flex items-start gap-3 group active:scale-[0.99]"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border-subtle)',
                            }}
                          >
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                              <Sliders className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-black text-xs sm:text-sm text-foreground block mb-0.5">
                                Manual Fixture Builder with Wheel Spinner
                              </span>
                              <span className="text-[11px] sm:text-xs text-foreground/50 leading-relaxed block">
                                Custom position teams and byes into bracket slots with live wheel spinner randomizer.
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setShowDrawModal(false);
                              setIsPooledBuilderActive(true);
                            }}
                            className="w-full p-3 sm:p-3.5 rounded-2xl border text-left hover:border-primary transition-all flex items-start gap-3 group active:scale-[0.99]"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border-subtle)',
                            }}
                          >
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                              <Swords className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-black text-xs sm:text-sm text-foreground block mb-0.5">
                                Multi-Pool Knockout Setup
                              </span>
                              <span className="text-[11px] sm:text-xs text-foreground/50 leading-relaxed block">
                                Divide teams into pools with mini-knockout brackets leading to Championship Playoffs.
                              </span>
                            </div>
                          </button>

                          {(tournament.tournamentType === 'LEAGUE' || tournament.tournamentType === 'TEAM_EVENT') && (
                            <button
                              onClick={handleLeagueDraw}
                              className="w-full p-3 sm:p-3.5 rounded-2xl border text-left hover:border-primary transition-all flex items-start gap-3 group active:scale-[0.99]"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border-subtle)',
                              }}
                            >
                              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                <Layers className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-black text-xs sm:text-sm text-foreground block mb-0.5">League Pool Setup</span>
                                <span className="text-[11px] sm:text-xs text-foreground/50 leading-relaxed block">
                                  Configure pools, round-robin stages, and team allocations.
                                </span>
                              </div>
                            </button>
                          )}
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => setShowDrawModal(false)}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border text-xs font-bold text-foreground/60 hover:text-foreground text-center"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Playoff Matchmaker Modal */}
                {showPlayoffModal && (() => {
                  const poolMatches = matches.filter(m => m.poolId != null);
                  const regMap = new Map(approvedRegistrations.map(r => [r.registrationId || r.id, r]));
                  const qualifiersList: any[] = [];
                  const poolsListMap = new Map<number, string>();

                  poolMatches.forEach(m => {
                    if (m.poolId && m.poolName) poolsListMap.set(m.poolId, m.poolName);
                  });

                  poolsListMap.forEach((pName, pId) => {
                    const pMatches = poolMatches.filter(m => m.poolId === pId);
                    const finalMatch = pMatches.find(m => !m.nextMatchUuid) || pMatches[pMatches.length - 1];
                    if (finalMatch && finalMatch.winnerRegistrationId) {
                      const winner = regMap.get(finalMatch.winnerRegistrationId);
                      if (winner) {
                        qualifiersList.push({
                          registrationId: winner.registrationId || winner.id,
                          registrationUuid: winner.registrationUuid || winner.uuid,
                          teamName: winner.teamName || winner.players?.[0]?.playerName || 'Team',
                          poolId: pId,
                          poolName: pName,
                          rank: 1
                        });
                      }
                      const runnerUpId = finalMatch.winnerRegistrationId === finalMatch.teamARegistrationId
                        ? finalMatch.teamBRegistrationId
                        : finalMatch.teamARegistrationId;
                      if (runnerUpId && regMap.has(runnerUpId)) {
                        const runnerUp = regMap.get(runnerUpId)!;
                        qualifiersList.push({
                          registrationId: runnerUp.registrationId || runnerUp.id,
                          registrationUuid: runnerUp.registrationUuid || runnerUp.uuid,
                          teamName: runnerUp.teamName || runnerUp.players?.[0]?.playerName || 'Team',
                          poolId: pId,
                          poolName: pName,
                          rank: 2
                        });
                      }
                    }
                  });

                  const poolsArr = Array.from(poolsListMap.entries()).map(([poolId, poolName]) => ({ poolId, poolName }));

                  return (
                    <PlayoffMatchmakerModal
                      tournamentUuid={tournament.tournamentUuid!}
                      categoryName={selectedCategoryTab !== 'ALL' ? selectedCategoryTab : undefined}
                      pools={poolsArr}
                      qualifiers={qualifiersList.length > 0 ? qualifiersList : approvedRegistrations.slice(0, 8).map((r, i) => ({
                        registrationId: r.registrationId || r.id,
                        registrationUuid: r.registrationUuid || r.uuid,
                        teamName: r.teamName || r.players?.[0]?.playerName || 'Team',
                        poolId: i % 2 + 1,
                        poolName: `Pool ${String.fromCharCode(65 + (i % 2))}`,
                        rank: (i % 2) + 1
                      }))}
                      onClose={() => setShowPlayoffModal(false)}
                      onSuccess={() => {
                        setShowPlayoffModal(false);
                        MatchService.getByTournament(tournament.tournamentUuid!).then((m) => setMatches(m || []));
                      }}
                    />
                  );
                })()}
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
            {/* DESKTOP HEADER (hidden on mobile) */}
            <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

            {/* MOBILE HEADER & ACTION CONTROL (visible on mobile only) */}
            <div className="block lg:hidden space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                  <Radio className="w-3 h-3 text-primary animate-pulse" /> Live Match Center
                </span>
                <span className="text-[11px] font-bold text-text-muted">
                  {matches.filter((m) => m.teamARegistrationUuid != null || m.teamBRegistrationUuid != null).length} Matches
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground tracking-tight">Match Schedule & Live Status</h3>
                <p className="text-[11px] text-text-muted font-medium">
                  Assigned courts, umpires, match times & live scoring
                </p>
              </div>

              {/* 2-Button Action Bar */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setActiveTab('match setup')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-transform"
                >
                  <Sliders className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Match Setup</span>
                </button>
                <button
                  onClick={fetchMatches}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border/70 bg-surface text-foreground font-bold text-xs hover:bg-surface-raised active:scale-[0.98] transition-transform"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Quick Filter Chips */}
              {(() => {
                const totalList = matches.filter((m) => m.teamARegistrationUuid != null || m.teamBRegistrationUuid != null);
                const liveCount = totalList.filter((m) => m.status === 'LIVE' || m.status === 'IN_PROGRESS').length;
                const compCount = totalList.filter((m) => m.status === 'COMPLETED').length;
                const schedCount = totalList.length - liveCount - compCount;

                return (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
                    <button
                      onClick={() => setMatchesMobileFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
                        matchesMobileFilter === 'ALL'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-surface border border-border/60 text-text-muted hover:text-foreground'
                      }`}
                    >
                      All ({totalList.length})
                    </button>
                    {liveCount > 0 && (
                      <button
                        onClick={() => setMatchesMobileFilter('LIVE')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 transition-colors ${
                          matchesMobileFilter === 'LIVE'
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'bg-red-500/10 border border-red-500/25 text-red-400'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                        Live ({liveCount})
                      </button>
                    )}
                    <button
                      onClick={() => setMatchesMobileFilter('SCHEDULED')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
                        matchesMobileFilter === 'SCHEDULED'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-surface border border-border/60 text-text-muted hover:text-foreground'
                      }`}
                    >
                      Scheduled ({schedCount})
                    </button>
                    <button
                      onClick={() => setMatchesMobileFilter('COMPLETED')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
                        matchesMobileFilter === 'COMPLETED'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-surface border border-border/60 text-text-muted hover:text-foreground'
                      }`}
                    >
                      Completed ({compCount})
                    </button>
                  </div>
                );
              })()}
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
              <>
                {/* 1. DESKTOP VIEW (hidden lg:grid) - Untouched & fully intact */}
                <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                            className={`absolute top-0 left-0 right-0 h-1 ${isLive ? 'bg-red-500 animate-pulse' : isCompleted ? 'bg-emerald-500' : 'bg-primary'
                              }`}
                          />

                          {/* Match Top Info */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between gap-2 mb-2 pt-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                                Match #{idx + 1} {match.roundName ? `· ${match.roundName}` : ''}
                              </span>

                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${isLive
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
                                    ? new Date(match.scheduledTime).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
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

                {/* 2. MOBILE VIEW (block lg:hidden) - Redesigned ultra-sleek layout */}
                <div className="block lg:hidden space-y-3.5">
                  {[...matches]
                    .filter((m) => m.teamARegistrationUuid != null || m.teamBRegistrationUuid != null)
                    .filter((m) => {
                      if (matchesMobileFilter === 'LIVE') return m.status === 'LIVE' || m.status === 'IN_PROGRESS';
                      if (matchesMobileFilter === 'COMPLETED') return m.status === 'COMPLETED';
                      if (matchesMobileFilter === 'SCHEDULED') return m.status !== 'COMPLETED' && m.status !== 'LIVE' && m.status !== 'IN_PROGRESS';
                      return true;
                    })
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
                      const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
                      const isCompleted = match.status === 'COMPLETED';
                      const assignedCourt = courts.find((c) => c.id === match.courtId);
                      const isReady = !isCompleted && !isLive && !!match.courtId && !!match.umpirePhone;

                      return (
                        <div
                          key={match.uuid || idx}
                          className="rounded-2xl border border-border/80 bg-gradient-to-b from-surface/95 to-surface/75 backdrop-blur-md p-4 shadow-lg relative overflow-hidden space-y-3"
                        >
                          {/* Top Accent Strip */}
                          <div
                            className={`absolute top-0 left-0 right-0 h-1 ${
                              isLive
                                ? 'bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 animate-pulse'
                                : isCompleted
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : isReady
                                ? 'bg-gradient-to-r from-primary to-emerald-400'
                                : 'bg-border/80'
                            }`}
                          />

                          {/* Card Header Row */}
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[10px] font-black uppercase tracking-wider text-primary px-2 py-0.5 rounded-md bg-primary/15 border border-primary/25 shrink-0">
                                MATCH #{idx + 1}
                              </span>
                              {match.roundName && (
                                <span className="text-[9px] font-extrabold text-text-muted bg-surface px-2 py-0.5 rounded-md border border-border/60 uppercase tracking-wide truncate">
                                  {match.roundName}
                                </span>
                              )}
                            </div>

                            {/* Status Chip */}
                            {isLive ? (
                              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/35 animate-pulse shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                                LIVE
                              </span>
                            ) : isCompleted ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 shrink-0">
                                COMPLETED
                              </span>
                            ) : isReady ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/35 shrink-0">
                                READY
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface border border-border/80 text-text-muted shrink-0">
                                SCHEDULED
                              </span>
                            )}
                          </div>

                          {/* Match Info Micro-Bar */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-text-muted bg-background/50 border border-border/50 rounded-xl p-2.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <span className="truncate font-semibold text-foreground">
                                {match.scheduledTime
                                  ? new Date(match.scheduledTime).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })
                                  : 'Time TBA'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 min-w-0">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate font-semibold text-foreground">
                                {assignedCourt ? assignedCourt.name : 'Court TBA'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-border/30 min-w-0">
                              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate text-[10px]">
                                {match.umpirePhone ? (
                                  <span className="text-foreground font-semibold">
                                    Umpire: <span className="font-mono text-emerald-400">{match.umpirePhone}</span>
                                  </span>
                                ) : (
                                  <span className="text-text-muted italic">Umpire: Not Assigned</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Teams Duel Card */}
                          <div className="bg-background/80 border border-border/60 rounded-xl p-3 space-y-2">
                            {/* Team A */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex items-center -space-x-2 shrink-0">
                                  {teamA?.players && teamA.players.length > 0 ? (
                                    teamA.players.slice(0, 2).map((p, pIdx) => (
                                      <img
                                        key={pIdx}
                                        src={resolvePlayerPhoto(p)}
                                        alt={p.playerName}
                                        className="w-7 h-7 rounded-full object-cover border-2 border-surface bg-surface-raised shadow-sm"
                                      />
                                    ))
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-[10px] font-black">
                                      {teamA ? teamA.teamName.substring(0, 2).toUpperCase() : '?'}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-xs font-black truncate leading-tight ${teamA ? 'text-foreground' : 'text-text-muted italic'}`}>
                                    {teamA ? teamA.teamName : 'TBD (Winner)'}
                                  </p>
                                  {teamA?.players && teamA.players.length > 0 && (
                                    <p className="text-[10px] text-text-muted truncate font-medium">
                                      {teamA.players.map(p => p.playerName).join(' & ')}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {isCompleted && match.winnerRegistrationUuid === (teamA?.registrationUuid || teamA?.uuid) && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                  WINNER
                                </span>
                              )}
                            </div>

                            {/* Minimal VS Divider */}
                            <div className="flex items-center gap-2 my-0.5">
                              <div className="h-px flex-1 bg-border/40" />
                              <span className="text-[8px] font-black text-primary/80 uppercase tracking-widest px-1.5 py-0.5 rounded bg-surface border border-border/60">
                                VS
                              </span>
                              <div className="h-px flex-1 bg-border/40" />
                            </div>

                            {/* Team B */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex items-center -space-x-2 shrink-0">
                                  {teamB?.players && teamB.players.length > 0 ? (
                                    teamB.players.slice(0, 2).map((p, pIdx) => (
                                      <img
                                        key={pIdx}
                                        src={resolvePlayerPhoto(p)}
                                        alt={p.playerName}
                                        className="w-7 h-7 rounded-full object-cover border-2 border-surface bg-surface-raised shadow-sm"
                                      />
                                    ))
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-[10px] font-black">
                                      {teamB ? teamB.teamName.substring(0, 2).toUpperCase() : '?'}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-xs font-black truncate leading-tight ${teamB ? 'text-foreground' : 'text-text-muted italic'}`}>
                                    {teamB ? teamB.teamName : 'TBD (Winner)'}
                                  </p>
                                  {teamB?.players && teamB.players.length > 0 && (
                                    <p className="text-[10px] text-text-muted truncate font-medium">
                                      {teamB.players.map(p => p.playerName).join(' & ')}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {isCompleted && match.winnerRegistrationUuid === (teamB?.registrationUuid || teamB?.uuid) && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                  WINNER
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-1">
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
                                className="w-full py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/35 font-extrabold text-xs uppercase tracking-wider hover:bg-red-500/30 transition-all flex items-center justify-center gap-1.5 animate-pulse"
                              >
                                <Radio className="w-3.5 h-3.5" />
                                <span>View Live Score</span>
                              </button>
                            ) : isCompleted ? (
                              <button
                                onClick={() => router.push(`/live-score/${match.uuid}`)}
                                className="w-full py-2.5 rounded-xl border border-border bg-surface text-foreground hover:bg-surface-raised font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5 text-primary" />
                                <span>View Scorecard</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setActiveTab('match setup')}
                                className="w-full py-2.5 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
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
              </>
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
              className={`h-1 w-full ${modalDialog.kind === 'alert-error' || modalDialog.kind === 'confirm-danger'
                ? 'bg-red-500'
                : 'bg-emerald-500'
                }`}
            />

            <div className="p-6 space-y-4">
              {/* Icon + Title */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${modalDialog.kind === 'alert-error' || modalDialog.kind === 'confirm-danger'
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
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:opacity-90 ${modalDialog.kind === 'alert-error' || modalDialog.kind === 'confirm-danger'
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

      {/* ── Athlete Photo Verification Modal ──────────────── */}
      {previewPhotoModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setPreviewPhotoModal(null)}
          />

          <div
            className="relative w-full max-w-sm sm:max-w-md rounded-3xl border shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground truncate">
                    Athlete Photo Verification
                  </h3>
                  <p className="text-[10.5px] text-foreground/50 truncate">{previewPhotoModal.teamName}</p>
                </div>
              </div>

              <button
                onClick={() => setPreviewPhotoModal(null)}
                className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/70 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Athlete Photo Large Display */}
            <div className="p-5 flex flex-col items-center text-center space-y-4">
              <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-xl relative bg-black/20 flex items-center justify-center">
                <img
                  src={previewPhotoModal.url}
                  alt={previewPhotoModal.playerName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h4 className="text-lg font-black text-foreground">{previewPhotoModal.playerName}</h4>
                {previewPhotoModal.phone && (
                  <p className="text-xs font-mono text-foreground/50 mt-0.5">{previewPhotoModal.phone}</p>
                )}
              </div>

              {/* Verification Action Buttons */}
              {(() => {
                const modalReg = registrations.find(
                  (r) => (r.registrationUuid || r.uuid) === previewPhotoModal.regUuid
                );
                const isModalApproved = modalReg ? modalReg.status === 'APPROVED' : previewPhotoModal.status === 'APPROVED';
                const isModalRejected = modalReg ? modalReg.status === 'REJECTED' : previewPhotoModal.status === 'REJECTED';

                return (
                  <div className="w-full grid grid-cols-2 gap-2.5 pt-2">
                    <button
                      disabled={isModalRejected}
                      onClick={() => {
                        handleReject(previewPhotoModal.regUuid);
                        setPreviewPhotoModal(null);
                      }}
                      className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${isModalRejected
                        ? 'bg-red-500/10 text-red-500/60 border border-red-500/20 cursor-default'
                        : 'bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/30 hover:bg-red-500/25 active:scale-95'
                        }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{isModalRejected ? 'Rejected' : 'Reject'}</span>
                    </button>

                    <button
                      disabled={isModalApproved}
                      onClick={() => {
                        handleApprove(previewPhotoModal.regUuid);
                        setPreviewPhotoModal(null);
                      }}
                      className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${isModalApproved
                        ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 active:scale-95'
                        }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isModalApproved ? 'Approved' : 'Approve'}</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
