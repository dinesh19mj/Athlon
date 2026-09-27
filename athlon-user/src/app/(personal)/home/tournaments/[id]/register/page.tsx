'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  User,
  Users,
  ChevronRight,
  Trophy,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Calendar,
  Ticket,
  UserCheck,
  UserPlus,
  Star,
  Zap,
  Camera,
  Upload,
  X,
  BadgeCheck,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Lock,
  IndianRupee,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Tag,
  ArrowRight,
  Navigation,
  Maximize2,
} from 'lucide-react';
import { TournamentService, Tournament, RegistrationService, Registration } from '@/lib/api/tournaments';
import { UserService, UserResponse } from '@/lib/api/user';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { api } from '@/lib/api/client';

interface PlayerCheckState {
  isChecking: boolean;
  isAppUser: boolean | null;
  user: UserResponse | null;
  photo: string | null;
}

export default function RegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentUuid = params.id as string;
  const { userId, userUuid } = useAuthStore();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [step, setStep] = useState(1);
  const [registrationType, setRegistrationType] = useState<'self' | 'someone_else'>('self');
  const [copiedGPay, setCopiedGPay] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

  const categoriesList = useMemo(() => {
    return tournament?.category
      ? tournament.category.split(',').map((c) => c.trim()).filter(Boolean)
      : [];
  }, [tournament?.category]);

  const isTeamSport = useMemo(() => {
    const sport = (tournament?.sport || '').toLowerCase();
    const format = (tournament?.matchFormat || '').toLowerCase();
    const type = (tournament?.tournamentType || '').toLowerCase();

    if (type === 'team_event' || type === 'team_league') return true;

    const teamSports = [
      'cricket',
      'football',
      'soccer',
      'basketball',
      'volleyball',
      'baseball',
      'rugby',
      'hockey',
      'kabaddi',
      'kho kho',
    ];
    if (teamSports.includes(sport)) return true;

    return (
      format.includes('team') ||
      format.includes('side') ||
      format.includes('overs') ||
      format.includes('t20') ||
      format.includes('t10') ||
      format.includes('box cricket') ||
      format.includes('vs') ||
      format.includes('futsal') ||
      format.includes('relay') ||
      format.includes('3x3') ||
      format.includes('5v5') ||
      format.includes('7v7') ||
      format.includes('11v11') ||
      format.includes('8v8') ||
      format.includes('6v6') ||
      format.includes('4v4')
    );
  }, [tournament?.sport, tournament?.matchFormat, tournament?.tournamentType]);

  const isDoubles = useMemo(() => {
    if (isTeamSport) return false;
    const format = (tournament?.matchFormat || '').toLowerCase();
    return format.includes('doubles') || format.includes('pair');
  }, [isTeamSport, tournament?.matchFormat]);

  const validRegistrations = useMemo(
    () => registrations.filter((r) => r.status?.toUpperCase() !== 'REJECTED'),
    [registrations]
  );

  const totalPlayersCount = Number(tournament?.playersCount) || 0;
  const hasCapacityLimit = totalPlayersCount > 0;

  const categoryLimit = useMemo(() => {
    if (categoriesList.length > 0 && totalPlayersCount > 0) {
      return Math.ceil(totalPlayersCount / categoriesList.length);
    }
    return totalPlayersCount || 0;
  }, [categoriesList.length, totalPlayersCount]);

  const categoryCounts = useMemo(() => {
    return categoriesList.reduce((acc, cat) => {
      const count = validRegistrations.filter((reg) => {
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
      acc[cat] = count;
      return acc;
    }, {} as Record<string, number>);
  }, [categoriesList, validRegistrations]);

  const isCategoryLocked = (cat: string) => {
    if (!hasCapacityLimit || categoryLimit <= 0) return false;
    const currentCount = categoryCounts[cat] || 0;
    return currentCount >= categoryLimit;
  };

  useEffect(() => {
    if (tournament?.category && categoriesList.length > 0) {
      if (!selectedCategory || isCategoryLocked(selectedCategory)) {
        const firstAvailable = categoriesList.find((c) => !isCategoryLocked(c));
        if (firstAvailable) {
          setSelectedCategory(firstAvailable);
        } else {
          setSelectedCategory('');
        }
      }
    }
  }, [tournament?.category, categoriesList, categoryCounts, categoryLimit, hasCapacityLimit, selectedCategory]);

  const handleCopyGPay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (tournament?.gpayNumber) {
      navigator.clipboard.writeText(tournament.gpayNumber);
      setCopiedGPay(true);
      setTimeout(() => setCopiedGPay(false), 2500);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
  const qrCodePath = tournament?.upiQrCode ? tournament.upiQrCode.replace(/^\/([a-zA-Z]:)/, '$1') : '';
  const qrCodeUrl = qrCodePath
    ? `${baseUrl}/api/tournament/tournaments/getFile?filePath=${encodeURIComponent(qrCodePath)}`
    : '';

  const [player1, setPlayer1] = useState({ name: '', phone: '' });
  const [player2, setPlayer2] = useState({ name: '', phone: '' });
  const [teamName, setTeamName] = useState('');

  // Player Verification & Photo States
  const [player1Check, setPlayer1Check] = useState<PlayerCheckState>({
    isChecking: false,
    isAppUser: null,
    user: null,
    photo: null,
  });

  const [player2Check, setPlayer2Check] = useState<PlayerCheckState>({
    isChecking: false,
    isAppUser: null,
    user: null,
    photo: null,
  });

  const player1FileInputRef = useRef<HTMLInputElement>(null);
  const player2FileInputRef = useRef<HTMLInputElement>(null);

  // Load Tournament Data & User Profile
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [tournRes, profileRes] = await Promise.all([
          TournamentService.getById(tournamentUuid),
          userUuid
            ? UserService.getUserByUuid(userUuid).catch(() => ({ data: null }))
            : Promise.resolve({ data: null }),
        ]);

        if (tournRes.data) {
          setTournament(tournRes.data);
          if (tournRes.data.tournamentId) {
            try {
              const regRes = await RegistrationService.getByTournament(tournRes.data.tournamentId);
              setRegistrations(regRes.data || []);
            } catch (e) {
              console.error('Failed to load registrations', e);
            }
          }
        }

        if (profileRes?.data) {
          const profile = profileRes.data;
          setUserProfile(profile);
          // Pre-populate Player 1 with logged-in user details
          setPlayer1({
            name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
            phone: profile.phone || '',
          });
          setPlayer1Check({
            isChecking: false,
            isAppUser: true,
            user: profile,
            photo: profile.photo || null,
          });
        }
      } catch (err) {
        console.error('Failed to load tournament/user data', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [tournamentUuid, userUuid]);

  // Handle switching registration type
  useEffect(() => {
    if (registrationType === 'self' && userProfile) {
      setPlayer1({
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
        phone: userProfile.phone || '',
      });
      setPlayer1Check({
        isChecking: false,
        isAppUser: true,
        user: userProfile,
        photo: userProfile.photo || null,
      });
    } else if (registrationType === 'someone_else') {
      setPlayer1({ name: '', phone: '' });
      setPlayer1Check({
        isChecking: false,
        isAppUser: null,
        user: null,
        photo: null,
      });
    }
  }, [registrationType, userProfile]);

  // Phone lookup verification for Player 1
  useEffect(() => {
    if (registrationType === 'self') return;
    const cleanPhone = player1.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setPlayer1Check((prev) => ({ ...prev, isAppUser: null, user: null }));
      return;
    }

    const timer = setTimeout(async () => {
      setPlayer1Check((prev) => ({ ...prev, isChecking: true }));
      try {
        const res: any = await api.get(`/api/user/by-phone/${cleanPhone}`);
        if (res?.data) {
          const u = res.data;
          setPlayer1((prev) => ({
            ...prev,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || prev.name,
          }));
          setPlayer1Check({
            isChecking: false,
            isAppUser: true,
            user: u,
            photo: u.photo || null,
          });
        } else {
          setPlayer1Check((prev) => ({
            ...prev,
            isChecking: false,
            isAppUser: false,
            user: null,
          }));
        }
      } catch {
        setPlayer1Check((prev) => ({
          ...prev,
          isChecking: false,
          isAppUser: false,
          user: null,
        }));
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [player1.phone, registrationType]);

  // Phone lookup verification for Player 2
  useEffect(() => {
    const isTeamEvent = tournament?.tournamentType === 'TEAM_EVENT';
    const isDoubles =
      !isTeamEvent && (tournament?.matchFormat?.toLowerCase().includes('doubles') ?? false);
    if (!isDoubles) return;

    const cleanPhone = player2.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setPlayer2Check((prev) => ({ ...prev, isAppUser: null, user: null }));
      return;
    }

    const timer = setTimeout(async () => {
      setPlayer2Check((prev) => ({ ...prev, isChecking: true }));
      try {
        const res: any = await api.get(`/api/user/by-phone/${cleanPhone}`);
        if (res?.data) {
          const u = res.data;
          setPlayer2((prev) => ({
            ...prev,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || prev.name,
          }));
          setPlayer2Check({
            isChecking: false,
            isAppUser: true,
            user: u,
            photo: u.photo || null,
          });
        } else {
          setPlayer2Check((prev) => ({
            ...prev,
            isChecking: false,
            isAppUser: false,
            user: null,
          }));
        }
      } catch {
        setPlayer2Check((prev) => ({
          ...prev,
          isChecking: false,
          isAppUser: false,
          user: null,
        }));
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [player2.phone, tournament]);

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, playerNum: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (playerNum === 1) {
        setPlayer1Check((prev) => ({ ...prev, photo: base64 }));
      } else {
        setPlayer2Check((prev) => ({ ...prev, photo: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (playerNum: 1 | 2) => {
    if (playerNum === 1) {
      setPlayer1Check((prev) => ({ ...prev, photo: null }));
      if (player1FileInputRef.current) player1FileInputRef.current.value = '';
    } else {
      setPlayer2Check((prev) => ({ ...prev, photo: null }));
      if (player2FileInputRef.current) player2FileInputRef.current.value = '';
    }
  };

  const handleNext = () => setStep((p) => p + 1);
  const handleBack = () => setStep((p) => p - 1);

  const handleSubmit = async () => {
    if (!tournament) return;

    if (hasCapacityLimit && selectedCategory && isCategoryLocked(selectedCategory)) {
      alert(`The category "${selectedCategory}" has reached its maximum team capacity (${categoryLimit} teams). Please select an available category.`);
      return;
    }

    setSubmitting(true);

    const players = [];
    // Player 1
    if (registrationType === 'self' && userProfile && userId && userUuid) {
      players.push({
        playerId: Number(userId),
        playerUuid: userUuid,
        playerName: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
        phoneNumber: userProfile.phone || '',
      });
    } else {
      players.push({
        playerUuid: player1Check.user?.uuid || null,
        playerName: player1.name,
        phoneNumber: player1.phone,
        photo: player1Check.photo || null,
      });
    }

    // Player 2
    if (isDoubles) {
      players.push({
        playerUuid: player2Check.user?.uuid || null,
        playerName: player2.name,
        phoneNumber: player2.phone,
        photo: player2Check.photo || null,
      });
    }

    let finalTeamName = teamName.trim();
    if (!finalTeamName) {
      const baseName = isDoubles ? `${player1.name} & ${player2.name}` : player1.name;
      finalTeamName = selectedCategory ? `${baseName} (${selectedCategory})` : baseName;
    } else if (selectedCategory && !finalTeamName.includes(selectedCategory)) {
      finalTeamName = `${finalTeamName} (${selectedCategory})`;
    }
    if (isTeamSport && userProfile && !finalTeamName) {
      finalTeamName = userProfile.firstName + "'s Team";
    }

    const payload = {
      tournamentId: tournament.tournamentId,
      tournamentUuid: tournament.tournamentUuid,
      primaryContactId: userId ? Number(userId) : null,
      primaryContactUuid: userUuid,
      teamName: finalTeamName,
      place: tournament.location || 'Unknown',
      createdBy: userId ? Number(userId) : null,
      players,
    };

    try {
      await api.post('/api/tournament/registrations/create', payload);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit registration. Please try again.');
      setSubmitting(false);
    }
  };

  // ── SUCCESS STATE ─────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div
          className="max-w-sm w-full rounded-3xl p-8 text-center space-y-6 relative overflow-hidden border shadow-2xl animate-in zoom-in-95 duration-300"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />

          <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-2 shadow-lg shadow-primary/10">
            <Trophy className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">You're Registered!</h2>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Your entry for <span className="text-primary font-bold">{tournament?.name}</span> has been submitted. The organizer will confirm your spot shortly.
            </p>
          </div>

          <div
            className="p-3.5 rounded-2xl border flex items-center gap-3 text-left"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-foreground/80 leading-snug">
              Confirmation notification will be sent once approved by tournament desk.
            </span>
          </div>

          <button
            onClick={() => router.push(`/home/tournaments/${tournamentUuid}`)}
            className="w-full py-3.5 bg-primary text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/25 active:scale-95 transition-all"
          >
            View Tournament Portal
          </button>
        </div>
      </div>
    );
  }

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (loading && !tournament) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-foreground/50">Loading Registration...</p>
      </div>
    );
  }

  // ── ORGANIZER MANAGED STATE ──────────────────────────────────────────────
  if (tournament?.registrationMode === 'ORGANIZER_MANAGED' || tournament?.registrationMode === 'ORGANIZER_MANUAL') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div
          className="max-w-md w-full rounded-3xl p-8 text-center space-y-6 relative overflow-hidden border shadow-2xl"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-foreground tracking-tight">Organizer Managed Event</h2>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Online public registration is not enabled for <span className="text-foreground font-bold">{tournament.name}</span>. All participants and teams are added directly by the organizer.
            </p>
          </div>

          <button
            onClick={() => router.push(`/home/tournaments/${tournamentUuid}`)}
            className="w-full py-3 bg-primary text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all"
          >
            View Tournament Details
          </button>
        </div>
      </div>
    );
  }

  // ── REGISTRATION CLOSED STATE ─────────────────────────────────────────────
  if (tournament?.status === 'REGISTRATION_CLOSED') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div
          className="max-w-sm w-full rounded-3xl p-8 text-center space-y-6 relative overflow-hidden border shadow-2xl"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-foreground tracking-tight">Registration Closed</h2>
            <p className="text-xs text-foreground/60 leading-relaxed">
              The organizer has closed entries for <span className="text-foreground font-bold">{tournament.name}</span>.
            </p>
          </div>

          <button
            onClick={() => router.push(`/home/tournaments/${tournamentUuid}`)}
            className="w-full py-3 bg-surface border border-foreground/10 text-foreground font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all"
          >
            Back to Tournament
          </button>
        </div>
      </div>
    );
  }

  const isFormValid =
    Boolean(player1.name.trim()) &&
    Boolean(player1.phone.trim()) &&
    (!isTeamSport || Boolean(teamName.trim())) &&
    (!isDoubles || (Boolean(player2.name.trim()) && Boolean(player2.phone.trim()))) &&
    (categoriesList.length === 0 || (Boolean(selectedCategory) && !isCategoryLocked(selectedCategory)));

  // ── MAIN RENDER ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground pb-32 selection:bg-primary selection:text-black">
      {/* ── 1. SLEEK FLOATING GLASS HEADER WITH DYNAMIC PROGRESS BAR ────────── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b shadow-xs transition-all"
        style={{
          backgroundColor: 'var(--athlon-navigation, rgba(10, 15, 29, 0.85))',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => (step > 1 ? handleBack() : router.replace(`/home/tournaments/${tournamentUuid}`))}
              className="p-1.5 -ml-1 text-foreground/80 hover:text-foreground rounded-xl hover:bg-foreground/5 active:scale-95 transition-all cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-primary truncate">
                  {step === 1
                    ? isTeamSport
                      ? 'Step 1: Team Setup'
                      : isDoubles
                        ? 'Step 1: Doubles Setup'
                        : 'Step 1: Player Setup'
                    : 'Step 2: Review & Submit'}
                </span>
              </div>
              <span className="text-xs font-black text-foreground truncate max-w-[200px] sm:max-w-xs">
                {tournament?.name}
              </span>
            </div>
          </div>

          {/* Stepper Capsules */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1 ${step === 1
                  ? 'bg-primary text-black border-primary font-black shadow-xs'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
            >
              {step > 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <span>1</span>}
              <span className="hidden sm:inline">Details</span>
            </div>

            <div className="w-3 h-0.5 bg-foreground/15 rounded-full" />

            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1 ${step === 2
                  ? 'bg-primary text-black border-primary font-black shadow-xs'
                  : 'text-foreground/40 border-foreground/10 bg-foreground/5'
                }`}
            >
              <span>2</span>
              <span className="hidden sm:inline">Review</span>
            </div>
          </div>
        </div>

        {/* Top Progress Line */}
        <div className="w-full h-0.5 bg-foreground/10">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </header>

      {/* ── 2. TOURNAMENT COMPACT SUMMARY RIBBON ───────────────────────────── */}
      <div
        className="border-b relative overflow-hidden"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.2 rounded-md bg-primary/15 text-primary text-[9px] font-black uppercase tracking-wider">
                  {tournament?.sport || 'Sports'}
                </span>
                <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">
                  {isTeamSport ? (tournament?.matchFormat || 'Team Event') : isDoubles ? 'Doubles' : 'Singles'}
                </span>
              </div>
              <h2 className="text-xs font-black text-foreground truncate mt-0.5">
                {tournament?.name}
              </h2>
            </div>
          </div>

          <div className="text-right shrink-0 flex flex-col items-end">
            <span className="text-[9px] font-black text-foreground/45 uppercase tracking-wider">
              Entry Fee
            </span>
            <span className="text-sm sm:text-base font-black text-primary font-mono leading-tight">
              {tournament?.registrationFees ? `₹${tournament.registrationFees}` : 'FREE ENTRY'}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-3.5 sm:px-4 py-5 space-y-5">
        {/* ══════════════════════════════════════════════════════════════════════
            STEP 1: DETAILS & PLAYER ENTRY
           ══════════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Title header */}
            <div className="space-y-0.5 px-0.5">
              <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                {isTeamSport
                  ? 'Register Your Team'
                  : isDoubles
                    ? 'Register Doubles Partnership'
                    : 'Player Registration'}
              </h1>
              <p className="text-xs text-foreground/60 font-medium">
                {isTeamSport
                  ? 'Configure team details and primary captain for this event.'
                  : isDoubles
                    ? 'Add player and partner details to secure your bracket spot.'
                    : 'Provide competitor information for tournament registration.'}
              </p>
            </div>

            {/* ── A. DRAW CATEGORY SELECTOR (SLEEK MODERN COMPACT TILES) ──────── */}
            {categoriesList.length > 0 && (
              <div
                className="rounded-3xl border p-4 sm:p-5 space-y-3 relative overflow-hidden shadow-xs"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                        Select Category
                      </h3>
                      <p className="text-[10px] text-foreground/50 font-medium">
                        {hasCapacityLimit
                          ? `Limit of ${categoryLimit} ${isTeamSport ? 'teams' : 'competitors'} per draw`
                          : 'Open draw category'}
                      </p>
                    </div>
                  </div>

                  {selectedCategory && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-primary text-black text-[10px] font-black uppercase tracking-wider shadow-xs">
                      {selectedCategory}
                    </span>
                  )}
                </div>

                {/* All categories full warning */}
                {hasCapacityLimit && categoriesList.every((c) => isCategoryLocked(c)) && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>All categories have reached full capacity.</span>
                  </div>
                )}

                {/* Compact Grid of Modern Category Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {categoriesList.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    const isLocked = isCategoryLocked(cat);
                    const count = categoryCounts[cat] || 0;
                    const remaining = hasCapacityLimit ? Math.max(0, categoryLimit - count) : null;
                    const percent =
                      hasCapacityLimit && categoryLimit > 0
                        ? Math.min(100, Math.round((count / categoryLimit) * 100))
                        : 0;

                    return (
                      <button
                        key={cat}
                        type="button"
                        disabled={isLocked}
                        onClick={() => !isLocked && setSelectedCategory(cat)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-2 active:scale-95 cursor-pointer shadow-2xs ${isLocked
                            ? 'opacity-60 cursor-not-allowed border-red-500/25 bg-red-500/5 text-foreground/50'
                            : isSelected
                              ? 'border-primary ring-2 ring-primary/40 text-foreground font-black'
                              : 'hover:border-foreground/30 text-foreground/80 font-bold'
                          }`}
                        style={{
                          backgroundColor: isLocked
                            ? undefined
                            : isSelected
                              ? 'var(--athlon-surface)'
                              : 'var(--athlon-surface)',
                          borderColor: isLocked
                            ? undefined
                            : isSelected
                              ? 'var(--athlon-primary)'
                              : 'var(--athlon-border)',
                        }}
                      >
                        {/* Top Indicator */}
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="text-xs font-black truncate">{cat}</span>
                          {isLocked ? (
                            <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[8px] font-black uppercase flex items-center gap-0.5 shrink-0 border border-red-500/30">
                              <Lock className="w-2.5 h-2.5" /> Full
                            </span>
                          ) : isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          ) : null}
                        </div>

                        {/* Capacity meter */}
                        <div className="space-y-1 w-full pt-1 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                          {hasCapacityLimit ? (
                            <>
                              <div className="flex items-center justify-between text-[9px] font-mono">
                                <span className={isLocked ? 'text-red-400 font-bold' : 'text-foreground/50 font-semibold'}>
                                  {count}/{categoryLimit}
                                </span>
                                {!isLocked && (
                                  <span className="text-primary font-bold">
                                    {remaining} left
                                  </span>
                                )}
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${isLocked ? 'bg-red-500' : isSelected ? 'bg-primary' : 'bg-foreground/30'
                                    }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-between text-[9px] font-mono">
                              <span className="text-foreground/60 font-semibold">
                                {count} {isTeamSport ? (count === 1 ? 'team' : 'teams') : (count === 1 ? 'entry' : 'entries')}
                              </span>
                              <span className="text-emerald-500 font-bold uppercase tracking-wider text-[8px]">
                                Open
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── B. REGISTRATION TYPE SEGMENTED TOGGLE ───────────────────────── */}
            <div
              className="p-1 rounded-2xl border flex items-center gap-1 shadow-xs"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <button
                type="button"
                onClick={() => setRegistrationType('self')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${registrationType === 'self'
                    ? 'bg-primary text-black font-black shadow-xs'
                    : 'text-foreground/60 hover:text-foreground'
                  }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>I'm Playing</span>
                {registrationType === 'self' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setRegistrationType('someone_else')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${registrationType === 'someone_else'
                    ? 'bg-primary text-black font-black shadow-xs'
                    : 'text-foreground/60 hover:text-foreground'
                  }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Guest</span>
                {registrationType === 'someone_else' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                )}
              </button>
            </div>

            {/* Context Hint */}
            <div
              className="px-3.5 py-2 rounded-xl border flex items-center gap-2.5 text-xs shadow-2xs"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {registrationType === 'self' ? <Star className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
              </div>
              <span className="text-[11px] font-medium text-foreground/70 leading-snug">
                {registrationType === 'self'
                  ? 'Your profile details are pre-filled. Enter your partner details below.'
                  : 'Enter competitor phone numbers. Registered Athlon profiles will auto-sync.'}
              </span>
            </div>

            {/* ── C. TEAM NAME (TEAM EVENT ONLY) ─────────────────────────────── */}
            {isTeamSport && (
              <div
                className="p-4 rounded-3xl border space-y-2 shadow-xs"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <label className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Team Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-xs font-bold focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                  placeholder="e.g. Royal Strikers CC, Chennai Super Kings..."
                />
              </div>
            )}

            {/* ── D. PLAYER 1 (ME / PRIMARY COMPETITOR) CARD ─────────────────── */}
            <div
              className="rounded-3xl border p-4 sm:p-5 space-y-3.5 relative overflow-hidden shadow-xs"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary via-emerald-400 to-primary/40" />

              <div className="flex items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs sm:text-sm text-foreground leading-tight">
                      {isTeamSport
                        ? 'Team Captain'
                        : registrationType === 'self'
                          ? 'Me'
                          : isDoubles
                            ? 'Player 1'
                            : 'Competitor'}
                    </h3>
                    <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider mt-0.5">
                      {isTeamSport ? 'Captain / Manager' : 'Primary Contact'}
                    </p>
                  </div>
                </div>

                {registrationType === 'self' && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}

                {registrationType === 'someone_else' && (
                  <div>
                    {player1Check.isChecking && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verifying
                      </span>
                    )}
                    {!player1Check.isChecking && player1Check.isAppUser === true && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {!player1Check.isChecking && player1Check.isAppUser === false && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Unregistered
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Grouped Field Inputs */}
              <div
                className="rounded-2xl border divide-y overflow-hidden shadow-2xs"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-foreground/50 shrink-0">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Phone</span>
                  </div>
                  <input
                    type="tel"
                    value={player1.phone}
                    onChange={(e) => setPlayer1({ ...player1, phone: e.target.value })}
                    disabled={registrationType === 'self'}
                    className="text-right text-xs font-bold bg-transparent focus:outline-none placeholder:text-foreground/30 disabled:opacity-80 flex-1 min-w-0 font-mono"
                    style={{ color: 'var(--athlon-text)' }}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-foreground/50 shrink-0">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Full Name</span>
                  </div>
                  <input
                    type="text"
                    value={player1.name}
                    onChange={(e) => setPlayer1({ ...player1, name: e.target.value })}
                    disabled={registrationType === 'self'}
                    className="text-right text-xs font-bold bg-transparent focus:outline-none placeholder:text-foreground/30 disabled:opacity-80 flex-1 min-w-0"
                    style={{ color: 'var(--athlon-text)' }}
                    placeholder="Enter athlete name"
                  />
                </div>
              </div>

              {/* Photo Upload when unregistered */}
              {registrationType === 'someone_else' && player1Check.isAppUser === false && (
                <div
                  className="p-3 rounded-2xl border space-y-2.5 animate-in fade-in duration-300"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold text-foreground">Athlete Photo (Optional)</span>
                  </div>
                  <input
                    type="file"
                    ref={player1FileInputRef}
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 1)}
                    className="hidden"
                  />
                  {player1Check.photo ? (
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/20 border border-white/10">
                      <img src={player1Check.photo} alt="Player 1" className="w-9 h-9 rounded-lg object-cover" />
                      <span className="text-xs font-bold text-foreground flex-1 truncate">Photo Attached</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(1)}
                        className="p-1 text-foreground/40 hover:text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => player1FileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 text-xs font-bold text-primary flex items-center justify-center gap-2 hover:bg-primary/10 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Photo
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── E. PLAYER 2 (DOUBLES PARTNER) CARD ─────────────────────────── */}
            {isDoubles && (
              <div
                className="rounded-3xl border p-4 sm:p-5 space-y-3.5 relative overflow-hidden shadow-xs"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500/40" />

                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-foreground leading-tight">
                        Doubles Partner
                      </h3>
                      <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider mt-0.5">
                        Partner in Event
                      </p>
                    </div>
                  </div>

                  <div>
                    {player2Check.isChecking && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Checking
                      </span>
                    )}
                    {!player2Check.isChecking && player2Check.isAppUser === true && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                    {!player2Check.isChecking && player2Check.isAppUser === false && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Unregistered
                      </span>
                    )}
                    {player2Check.isAppUser === null && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
                        Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Grouped Field Inputs for Partner */}
                <div
                  className="rounded-2xl border divide-y overflow-hidden shadow-2xs"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-foreground/50 shrink-0">
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Partner Phone</span>
                    </div>
                    <input
                      type="tel"
                      value={player2.phone}
                      onChange={(e) => setPlayer2({ ...player2, phone: e.target.value })}
                      className="text-right text-xs font-bold bg-transparent focus:outline-none placeholder:text-foreground/30 flex-1 min-w-0 font-mono"
                      style={{ color: 'var(--athlon-text)' }}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-foreground/50 shrink-0">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Partner Name</span>
                    </div>
                    <input
                      type="text"
                      value={player2.name}
                      onChange={(e) => setPlayer2({ ...player2, name: e.target.value })}
                      className="text-right text-xs font-bold bg-transparent focus:outline-none placeholder:text-foreground/30 flex-1 min-w-0"
                      style={{ color: 'var(--athlon-text)' }}
                      placeholder="Partner's full name"
                    />
                  </div>
                </div>

                {/* Photo Upload for Partner */}
                {player2Check.isAppUser === false && (
                  <div
                    className="p-3 rounded-2xl border space-y-2.5 animate-in fade-in duration-300"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-bold text-foreground">Partner Photo (Optional)</span>
                    </div>
                    <input
                      type="file"
                      ref={player2FileInputRef}
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 2)}
                      className="hidden"
                    />
                    {player2Check.photo ? (
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/20 border border-white/10">
                        <img src={player2Check.photo} alt="Player 2" className="w-9 h-9 rounded-lg object-cover" />
                        <span className="text-xs font-bold text-foreground flex-1 truncate">Partner Photo Attached</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(2)}
                          className="p-1 text-foreground/40 hover:text-red-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => player2FileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 text-xs font-bold text-blue-400 flex items-center justify-center gap-2 hover:bg-blue-500/10 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Partner Photo
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 2: REVIEW & CONFIRM (BOARDING PASS STYLE PASS TICKET)
           ══════════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-0.5 px-0.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary mb-1">
                <Sparkles className="w-3 h-3" /> Final Review
              </div>
              <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Confirm Your Entry</h2>
              <p className="text-xs text-foreground/60 font-medium">Verify your registration details before final submission.</p>
            </div>

            {/* Boarding Pass Style Card */}
            <div
              className="rounded-3xl border overflow-hidden shadow-xl relative"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              {/* Ticket Top Strip */}
              <div className="p-4 sm:p-5 border-b border-dashed relative" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg bg-primary text-black text-[9px] font-black uppercase tracking-wider">
                        {tournament?.sport || 'Sports'}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-lg border text-foreground text-[9px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      >
                        {isTeamSport ? (tournament?.matchFormat || 'Team Event') : isDoubles ? 'Doubles' : 'Singles'}
                      </span>
                      {selectedCategory && (
                        <span className="px-2 py-0.5 rounded-lg bg-primary/15 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-wider">
                          {selectedCategory}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-foreground leading-tight">{tournament?.name}</h3>
                    {tournament?.location && (
                      <p className="text-[11px] text-foreground/60 flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        {tournament.location}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-black text-foreground/45 uppercase tracking-wider block">Entry Fee</span>
                    <span className="text-xl font-black text-primary font-mono block mt-0.5">
                      {tournament?.registrationFees ? `₹${tournament.registrationFees}` : 'FREE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="p-4 sm:p-5 space-y-3.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" /> Registered Competitors
                </span>

                <div className="space-y-2">
                  {/* Player 1 summary */}
                  <div
                    className="p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-2xs"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {player1Check.photo ? (
                        <img
                          src={player1Check.photo}
                          alt="Player 1"
                          className="w-9 h-9 rounded-xl object-cover border border-primary/40 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-black text-foreground truncate">
                            {registrationType === 'self' && userProfile
                              ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
                              : player1.name}
                          </p>
                          {(registrationType === 'self' || player1Check.isAppUser) && (
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                          {isTeamSport ? 'Captain' : isDoubles ? 'Player 1' : 'Competitor'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-foreground/60 shrink-0">
                      {registrationType === 'self' && userProfile ? userProfile.phone : player1.phone}
                    </span>
                  </div>

                  {/* Player 2 summary (Doubles) */}
                  {isDoubles && (
                    <div
                      className="p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-2xs"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {player2Check.photo ? (
                          <img
                            src={player2Check.photo}
                            alt="Partner"
                            className="w-9 h-9 rounded-xl object-cover border border-blue-500/40 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-xs font-black text-foreground truncate">{player2.name}</p>
                            {player2Check.isAppUser && (
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Partner</p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-foreground/60 shrink-0">{player2.phone}</span>
                    </div>
                  )}

                  {/* Team Name summary (TEAM_EVENT / Team sport) */}
                  {isTeamSport && teamName && (
                    <div
                      className="p-3 rounded-2xl border flex items-center gap-2.5"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-foreground/45">Team Name</p>
                        <p className="text-xs font-black text-foreground">{teamName}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct UPI Payment Quick Box */}
                {(tournament?.gpayNumber || qrCodeUrl || (tournament?.registrationFees ?? 0) > 0) && (
                  <div
                    className="p-3.5 rounded-2xl border space-y-2.5"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--athlon-border)' }}>
                      <span className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> Direct UPI Settlement
                      </span>
                      <span className="text-xs font-black text-emerald-500 font-mono">
                        {tournament?.registrationFees ? `₹${tournament.registrationFees}` : 'FREE ENTRY'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                      {tournament?.gpayNumber && (
                        <div
                          className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
                          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                        >
                          <div className="min-w-0">
                            <span className="text-[9px] font-black text-foreground/40 uppercase tracking-wider block">GPay Number</span>
                            <span className="text-xs font-black text-foreground font-mono truncate block">{tournament.gpayNumber}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyGPay}
                            className="px-2.5 py-1 rounded-lg bg-primary text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                          >
                            {copiedGPay ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedGPay ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}

                      {qrCodeUrl && (
                        <div
                          onClick={() => setPreviewImage({ src: qrCodeUrl, title: `UPI QR Scanner - ${tournament?.name}` })}
                          className="p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer group hover:border-primary/40 transition-all"
                          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white p-0.5 overflow-hidden border shrink-0">
                              <img src={qrCodeUrl} alt="UPI QR" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <span className="text-[11px] font-black text-foreground block">UPI QR Scanner</span>
                              <span className="text-[9px] text-foreground/45 block">Tap to scan</span>
                            </div>
                          </div>
                          <Maximize2 className="w-3.5 h-3.5 text-foreground/40 group-hover:text-primary transition-colors" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-[10px] text-foreground/40 font-medium">
              By confirming, you agree to the official Athlon tournament guidelines and fair play terms.
            </p>
          </div>
        )}
      </main>

      {/* ── 3. LUXURY STICKY FLOATING REGISTRATION DOCK ─────────────────────── */}
      <div
        className="fixed bottom-0 inset-x-0 z-50 backdrop-blur-2xl border-t shadow-[0_-8px_30px_rgba(0,0,0,0.3)] px-4 py-3"
        style={{
          backgroundColor: 'var(--athlon-navigation, rgba(10, 15, 29, 0.9))',
          borderColor: 'var(--athlon-border)',
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 12px))',
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black text-foreground/50 uppercase tracking-widest leading-none">
              Total Entry Fee
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg sm:text-xl font-black text-primary font-mono leading-none">
                {tournament?.registrationFees ? `₹${tournament.registrationFees}` : 'FREE'}
              </span>
              <span className="text-[10px] text-foreground/40 font-semibold">/ entry</span>
            </div>
          </div>

          {step === 1 ? (
            <button
              disabled={!isFormValid}
              onClick={handleNext}
              className="px-6 py-2.5 bg-primary text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Review Details</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-primary text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Confirm Entry</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── IMAGE ENLARGE / LIGHTBOX MODAL ───────────────────────── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="w-full max-w-2xl flex items-center justify-between pb-3 text-white px-2">
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
                className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="relative max-w-2xl max-h-[82vh] overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage.src}
              alt={previewImage.title}
              className="w-auto h-auto max-w-full max-h-[75vh] object-contain rounded-xl"
            />
          </div>
          <p className="text-white/40 text-xs mt-3">Tap outside or press Close to dismiss</p>
        </div>
      )}
    </div>
  );
}
