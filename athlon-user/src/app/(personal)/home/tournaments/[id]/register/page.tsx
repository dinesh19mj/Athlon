'use client';

import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
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
  const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [step, setStep] = useState(1);
  const [registrationType, setRegistrationType] = useState<'self' | 'someone_else'>('self');

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

  useEffect(() => {
    const init = async () => {
      try {
        const [tRes, uRes] = await Promise.all([
          TournamentService.getById(tournamentUuid),
          userUuid ? UserService.getUserByUuid(userUuid) : Promise.resolve(null),
        ]);
        if (tRes.data) setTournament(tRes.data);
        if (uRes?.data) setUserProfile(uRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [tournamentUuid, userUuid]);

  // Pre-fill user data if self registration
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
        photo: null,
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

  // ── Debounced Phone Lookup for Player 1 (when For Others) ──────────────
  useEffect(() => {
    if (registrationType !== 'someone_else') return;

    const cleaned = player1.phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) {
      setPlayer1Check((prev) => ({ ...prev, isChecking: false, isAppUser: null, user: null }));
      return;
    }

    setPlayer1Check((prev) => ({ ...prev, isChecking: true }));
    const timer = setTimeout(async () => {
      try {
        const res = await UserService.getUserByPhone(cleaned);
        if (res && res.data && res.data.uuid) {
          setPlayer1Check((prev) => ({
            ...prev,
            isChecking: false,
            isAppUser: true,
            user: res.data,
          }));
          // Pre-fill name if empty
          if (!player1.name) {
            setPlayer1((prev) => ({
              ...prev,
              name: `${res.data.firstName || ''} ${res.data.lastName || ''}`.trim(),
            }));
          }
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

  // ── Debounced Phone Lookup for Player 2 (Doubles Partner) ──────────────
  useEffect(() => {
    const isTeam = tournament?.tournamentType === 'TEAM_EVENT';
    const isDoub = !isTeam && (tournament?.matchFormat?.toLowerCase() || '').includes('doubles');
    if (!isDoub) return;

    const cleaned = player2.phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) {
      setPlayer2Check((prev) => ({ ...prev, isChecking: false, isAppUser: null, user: null }));
      return;
    }

    setPlayer2Check((prev) => ({ ...prev, isChecking: true }));
    const timer = setTimeout(async () => {
      try {
        const res = await UserService.getUserByPhone(cleaned);
        if (res && res.data && res.data.uuid) {
          setPlayer2Check((prev) => ({
            ...prev,
            isChecking: false,
            isAppUser: true,
            user: res.data,
          }));
          // Pre-fill partner name if empty
          if (!player2.name) {
            setPlayer2((prev) => ({
              ...prev,
              name: `${res.data.firstName || ''} ${res.data.lastName || ''}`.trim(),
            }));
          }
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

  const isTeamEvent = tournament?.tournamentType === 'TEAM_EVENT';
  const matchFormatStr = tournament?.matchFormat?.toLowerCase() || '';
  const isDoubles = !isTeamEvent && matchFormatStr.includes('doubles');

  const handleSubmit = async () => {
    if (!tournament) return;
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

    let finalTeamName = teamName;
    if (!finalTeamName) {
      finalTeamName = isDoubles ? `${player1.name} & ${player2.name}` : player1.name;
    }
    if (isTeamEvent && userProfile && !finalTeamName) {
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
          className="max-w-sm w-full rounded-3xl p-8 text-center space-y-6 relative overflow-hidden border shadow-2xl"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />

          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
            <Trophy className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">You're Registered!</h2>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Your entry for <span className="text-primary font-bold">{tournament?.name}</span> has been submitted. The organizer will confirm your spot shortly.
            </p>
          </div>

          <div
            className="p-4 rounded-2xl border flex items-center gap-3 text-left"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-medium text-foreground/70">
              You will receive a notification once the organizer approves your registration.
            </span>
          </div>

          <button
            onClick={() => router.push('/home/tournaments')}
            className="w-full py-3.5 bg-primary text-primary-foreground font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Browse More Tournaments
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

  // ── REGISTRATION CLOSED STATE ───────────────────────────────────────────────
  if (tournament?.status === 'REGISTRATION_CLOSED') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div
          className="max-w-sm w-full rounded-3xl p-8 text-center space-y-6 relative overflow-hidden border shadow-2xl"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />

          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2 text-red-400">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Registration Closed</h2>
            <p className="text-sm text-foreground/60 leading-relaxed">
              The organizer has closed entries for <span className="text-foreground font-bold">{tournament.name}</span>. New registrations are no longer being accepted.
            </p>
          </div>

          <button
            onClick={() => router.push(`/home/tournaments/${tournamentUuid}`)}
            className="w-full py-3.5 bg-surface border border-foreground/10 hover:border-primary/50 text-foreground font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg transition-all"
          >
            Back to Tournament
          </button>
        </div>
      </div>
    );
  }

  const totalSteps = 2;

  // ── MAIN RENDER ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-72 bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* ── STICKY HEADER ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-2xl"
        style={{ backgroundColor: 'var(--athlon-navigation)', borderColor: 'var(--athlon-border)' }}
      >
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => (step > 1 ? handleBack() : router.push(`/home/tournaments/${tournamentUuid}`))}
            className="p-2 rounded-xl text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Tournament Entry</p>
            <p className="text-sm font-black text-foreground truncate">{tournament?.name}</p>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${i + 1 === step
                  ? 'w-5 h-2 bg-primary'
                  : i + 1 < step
                    ? 'w-2 h-2 bg-primary/50'
                    : 'w-2 h-2 bg-white/10'
                  }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* ── TOURNAMENT MINI BANNER ─────────────────────────────────────── */}
      <div
        className="border-b"
        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Trophy className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-foreground truncate">{tournament?.name}</p>
            <div className="flex items-center gap-3 flex-wrap">
              {tournament?.location && (
                <span className="text-[10px] text-foreground/50 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {tournament.location}
                </span>
              )}
              {tournament?.startDate && (
                <span className="text-[10px] text-foreground/50 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(tournament.startDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Entry Fee</p>
            <p className="text-sm font-black text-primary">
              {tournament?.registrationFees ? `₹${tournament.registrationFees}` : 'FREE'}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6 pb-24">
        {/* ── STEP 1: Player Details ──────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* Section heading */}
            <div className="space-y-1">
              <h2 className="text-xl font-black text-foreground tracking-tight">
                {isTeamEvent ? 'Register Your Team' : isDoubles ? 'Register Your Doubles Pair' : 'Player Details'}
              </h2>
              <p className="text-xs text-foreground/55 font-medium">
                {isTeamEvent
                  ? 'Enter your team name and owner details to claim your spot.'
                  : isDoubles
                    ? 'Add both players to register your doubles partnership.'
                    : 'Who will be competing in this tournament?'}
              </p>
            </div>

            {/* ── Registration type selector ──────────────────────────── */}
            <div
              className="p-1.5 rounded-2xl border grid grid-cols-2 gap-1"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <button
                onClick={() => setRegistrationType('self')}
                className={`relative py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2.5 ${registrationType === 'self'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-black'
                  : 'text-foreground/50 hover:text-foreground hover:bg-white/[0.04]'
                  }`}
              >
                <UserCheck className={`w-4 h-4 ${registrationType === 'self' ? 'text-primary-foreground' : 'text-foreground/40'}`} />
                <span>I'm Playing</span>
                {registrationType === 'self' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background" />
                )}
              </button>

              <button
                onClick={() => setRegistrationType('someone_else')}
                className={`relative py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2.5 ${registrationType === 'someone_else'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-black'
                  : 'text-foreground/50 hover:text-foreground hover:bg-white/[0.04]'
                  }`}
              >
                <UserPlus className={`w-4 h-4 ${registrationType === 'someone_else' ? 'text-primary-foreground' : 'text-foreground/40'}`} />
                <span>For Others</span>
                {registrationType === 'someone_else' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-background" />
                )}
              </button>
            </div>

            {/* Context hint */}
            <div
              className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
            >
              {registrationType === 'self' ? (
                <>
                  <Star className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-foreground/60">
                    Your profile details have been pre-filled. Enter your doubles partner details below.
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-foreground/60">
                    Enter the phone numbers. If registered on Athlon, details will auto-sync; otherwise, you can attach their player photo.
                  </span>
                </>
              )}
            </div>

            {/* ── Team Name (TEAM_EVENT only) ────────────────────────── */}
            {isTeamEvent && (
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/45 flex items-center gap-1.5 pl-1">
                  <Users className="w-3 h-3" />
                  Team Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                  placeholder="e.g. The Smashers"
                />
              </div>
            )}

            {/* ── Primary Player Card (Me / Player 1) ─────────────────── */}
            <div
              className="rounded-2xl border p-5 space-y-5 relative overflow-hidden"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/50" />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground">
                    {isTeamEvent
                      ? 'Team Owner / Captain'
                      : registrationType === 'self'
                        ? 'Me'
                        : isDoubles
                          ? 'Player 1'
                          : 'Player'}
                  </h3>
                  <p className="text-[10px] text-foreground/45 font-medium">Primary registration contact</p>
                </div>

                {registrationType === 'self' && (
                  <span className="ml-auto px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}

                {registrationType === 'someone_else' && (
                  <div className="ml-auto">
                    {player1Check.isChecking && (
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                      </span>
                    )}
                    {!player1Check.isChecking && player1Check.isAppUser === true && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {!player1Check.isChecking && player1Check.isAppUser === false && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Unregistered
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/45 pl-0.5 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={player1.phone}
                    onChange={(e) => setPlayer1({ ...player1, phone: e.target.value })}
                    disabled={registrationType === 'self'}
                    className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border-subtle)',
                      color: 'var(--athlon-text)',
                    }}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/45 pl-0.5 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={player1.name}
                    onChange={(e) => setPlayer1({ ...player1, name: e.target.value })}
                    disabled={registrationType === 'self'}
                    className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border-subtle)',
                      color: 'var(--athlon-text)',
                    }}
                    placeholder="Full name"
                  />
                </div>
              </div>

              {/* ── Photo Upload Provision for Player 1 (When Unregistered) ── */}
              {registrationType === 'someone_else' && player1Check.isAppUser === false && (
                <div
                  className="p-4 rounded-xl border space-y-3 animate-in fade-in duration-300"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="text-xs font-black text-foreground block">Player Photo (ID & Scorecard)</span>
                        <span className="text-[10px] text-foreground/50">
                          Since this athlete is not registered on Athlon, upload their photo.
                        </span>
                      </div>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={player1FileInputRef}
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 1)}
                    className="hidden"
                  />

                  {player1Check.photo ? (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 border border-white/10">
                      <img
                        src={player1Check.photo}
                        alt="Player 1"
                        className="w-12 h-12 rounded-xl object-cover border border-primary/40 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-foreground block truncate">Photo Attached</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Ready for Scorecard Display</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => player1FileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-colors"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(1)}
                          className="p-1.5 text-foreground/40 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => player1FileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border border-dashed border-white/20 hover:border-primary/50 bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-center gap-2 text-xs font-bold text-foreground/75 hover:text-foreground transition-all"
                    >
                      <Upload className="w-4 h-4 text-primary" />
                      <span>Upload Player 1 Photo (Optional)</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Partner Card (Doubles only) ────────────────────────── */}
            {isDoubles && (
              <div
                className="rounded-2xl border p-5 space-y-5 relative overflow-hidden"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500/50" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-foreground">Doubles Partner</h3>
                    <p className="text-[10px] text-foreground/45 font-medium">Your partner in this event</p>
                  </div>

                  <div className="ml-auto">
                    {player2Check.isChecking && (
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                      </span>
                    )}
                    {!player2Check.isChecking && player2Check.isAppUser === true && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {!player2Check.isChecking && player2Check.isAppUser === false && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Unregistered
                      </span>
                    )}
                    {player2Check.isAppUser === null && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
                        Required
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/45 pl-0.5 flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> Partner's Phone
                    </label>
                    <input
                      type="tel"
                      value={player2.phone}
                      onChange={(e) => setPlayer2({ ...player2, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-blue-500 transition-all placeholder:text-foreground/30"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border-subtle)',
                        color: 'var(--athlon-text)',
                      }}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/45 pl-0.5 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Partner's Full Name
                    </label>
                    <input
                      type="text"
                      value={player2.name}
                      onChange={(e) => setPlayer2({ ...player2, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-blue-500 transition-all placeholder:text-foreground/30"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border-subtle)',
                        color: 'var(--athlon-text)',
                      }}
                      placeholder="Partner's full name"
                    />
                  </div>
                </div>

                {/* ── Photo Upload Provision for Player 2 (When Unregistered) ── */}
                {player2Check.isAppUser === false && (
                  <div
                    className="p-4 rounded-xl border space-y-3 animate-in fade-in duration-300"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="text-xs font-black text-foreground block">Partner Photo (ID & Scorecard)</span>
                          <span className="text-[10px] text-foreground/50">
                            Partner is not an Athlon app user. Upload their photo for referee & scorecard verification.
                          </span>
                        </div>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={player2FileInputRef}
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 2)}
                      className="hidden"
                    />

                    {player2Check.photo ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 border border-white/10">
                        <img
                          src={player2Check.photo}
                          alt="Player 2"
                          className="w-12 h-12 rounded-xl object-cover border border-blue-500/40 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-foreground block truncate">Partner Photo Attached</span>
                          <span className="text-[10px] text-emerald-400 font-bold">Ready for Scorecard Display</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => player2FileInputRef.current?.click()}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(2)}
                            className="p-1.5 text-foreground/40 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => player2FileInputRef.current?.click()}
                        className="w-full py-3 px-4 rounded-xl border border-dashed border-white/20 hover:border-blue-500/50 bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-center gap-2 text-xs font-bold text-foreground/75 hover:text-foreground transition-all"
                      >
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span>Upload Partner Photo (Optional)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Continue button ────────────────────────────────────── */}
            <button
              disabled={
                !player1.name ||
                !player1.phone ||
                (isTeamEvent && !teamName) ||
                (isDoubles && (!player2.name || !player2.phone))
              }
              onClick={handleNext}
              className="w-full py-4 bg-primary text-primary-foreground font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              Review & Confirm
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ── STEP 2: Review ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 border border-primary/20 text-primary mb-1">
                <Sparkles className="w-3 h-3" />
                Final Review
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tight">Confirm Your Entry</h2>
              <p className="text-xs text-foreground/55 font-medium">Review your registration details before submitting.</p>
            </div>

            {/* Tournament ticket preview */}
            <div
              className="rounded-2xl border overflow-hidden shadow-lg"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              {/* Ticket header */}
              <div className="p-5 border-b border-dashed relative" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="absolute -left-3 bottom-[-12px] w-6 h-6 rounded-full bg-background border border-white/5 z-10" />
                <div className="absolute -right-3 bottom-[-12px] w-6 h-6 rounded-full bg-background border border-white/5 z-10" />

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-wider">
                        {tournament?.sport || 'Sports'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-foreground/60 border border-white/10 text-[10px] font-bold uppercase tracking-wider">
                        {isTeamEvent ? 'Team Event' : isDoubles ? 'Doubles' : 'Singles'}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-foreground leading-tight">{tournament?.name}</h3>
                    {tournament?.location && (
                      <p className="text-xs text-foreground/50 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tournament.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Entry Fee</p>
                    <p className="text-2xl font-black text-primary">
                      {tournament?.registrationFees ? `₹${tournament.registrationFees}` : 'FREE'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket body */}
              <div className="p-5 space-y-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/40 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Registered Players
                </p>

                <div className="space-y-2.5">
                  {/* Player 1 */}
                  <div
                    className="flex items-center justify-between p-3.5 rounded-xl border gap-3"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                  >
                    <div className="flex items-center gap-3">
                      {player1Check.photo ? (
                        <img
                          src={player1Check.photo}
                          alt="Player 1"
                          className="w-9 h-9 rounded-xl object-cover border border-primary/40 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                          {isTeamEvent ? (
                            <ShieldCheck className="w-4 h-4 text-primary" />
                          ) : (
                            <User className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-black text-foreground leading-none">
                            {registrationType === 'self' && userProfile
                              ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
                              : player1.name}
                          </p>
                          {(registrationType === 'self' || player1Check.isAppUser) && (
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">
                          {isTeamEvent ? 'Captain' : isDoubles ? 'Player 1' : 'Player'}
                          {player1Check.photo && ' · Photo Attached'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-foreground/50">
                      {registrationType === 'self' && userProfile ? userProfile.phone : player1.phone}
                    </span>
                  </div>

                  {/* Player 2 (Doubles) */}
                  {isDoubles && (
                    <div
                      className="flex items-center justify-between p-3.5 rounded-xl border gap-3"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                    >
                      <div className="flex items-center gap-3">
                        {player2Check.photo ? (
                          <img
                            src={player2Check.photo}
                            alt="Partner"
                            className="w-9 h-9 rounded-xl object-cover border border-blue-500/40 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-blue-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-black text-foreground leading-none">{player2.name}</p>
                            {player2Check.isAppUser && (
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">
                            Partner {player2Check.photo && '· Photo Attached'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-foreground/50">{player2.phone}</span>
                    </div>
                  )}

                  {/* Team Name (TEAM_EVENT) */}
                  {isTeamEvent && teamName && (
                    <div
                      className="p-3.5 rounded-xl border flex items-center gap-3"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <Ticket className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40">Team Name</p>
                        <p className="text-sm font-black text-foreground">{teamName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-primary text-primary-foreground font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm & Submit Registration
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-foreground/35 font-medium">
              By confirming, you agree to the tournament's terms and conditions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
