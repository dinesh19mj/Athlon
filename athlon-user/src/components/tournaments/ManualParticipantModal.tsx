'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  User,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Phone,
  MapPin,
  Sparkles,
  Loader2,
  ChevronDown,
  UserPlus,
  Check,
  BadgeCheck,
} from 'lucide-react';
import { Registration, RegistrationService } from '@/lib/api/tournaments';
import { UserService, UserResponse } from '@/lib/api/user';

export interface CategoryOption {
  id?: number | string;
  categoryId?: number;
  categoryUuid?: string;
  uuid?: string;
  name?: string;
  categoryName?: string;
  sportType?: string;
}

interface ManualParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reg: Registration) => void;
  tournamentId: number;
  tournamentUuid: string;
  sportType?: string;
  matchFormat?: string;
  categories: CategoryOption[];
  defaultCategoryId?: number;
  editingRegistration?: Registration | null;
  currentUserId?: number;
  initialMode?: 'INDIVIDUAL' | 'TEAM';
}

interface VerifiedPlayerInfo {
  user?: UserResponse | null;
  isVerifying: boolean;
  isVerified: boolean;
  error?: string | null;
}

export function ManualParticipantModal({
  isOpen,
  onClose,
  onSuccess,
  tournamentId,
  tournamentUuid,
  sportType = 'BADMINTON',
  matchFormat = '',
  categories,
  defaultCategoryId,
  editingRegistration,
  currentUserId,
  initialMode = 'INDIVIDUAL',
}: ManualParticipantModalProps) {
  const isEditing = !!editingRegistration;

  const [entryType, setEntryType] = useState<'INDIVIDUAL' | 'TEAM'>(initialMode);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [teamName, setTeamName] = useState('');
  const [place, setPlace] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'MIXED' | 'OTHER' | ''>('');

  // Single player fields
  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [singlePlayerVerification, setSinglePlayerVerification] = useState<VerifiedPlayerInfo>({
    user: null,
    isVerifying: false,
    isVerified: false,
    error: null,
  });

  // Team player fields (for doubles or team entries)
  const [teamPlayers, setTeamPlayers] = useState<{ id: string; name: string; phone: string }[]>([
    { id: '1', name: '', phone: '' },
    { id: '2', name: '', phone: '' },
  ]);
  const [teamPlayerVerifications, setTeamPlayerVerifications] = useState<Record<string, VerifiedPlayerInfo>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine if the current sport or category is badminton / racquet sport
  const isRacquetSport = useMemo(() => {
    const s = (sportType || '').toUpperCase();
    const selectedCat = categories.find((c) => (c.categoryId || c.id) === Number(selectedCategoryId));
    const catSport = (selectedCat?.sportType || '').toUpperCase();
    const check = s || catSport;
    return (
      check.includes('BADMINTON') ||
      check.includes('TENNIS') ||
      check.includes('SQUASH') ||
      check.includes('PICKLEBALL') ||
      check.includes('TABLE_TENNIS') ||
      check.includes('PADEL') ||
      !check
    );
  }, [sportType, categories, selectedCategoryId]);

  // Check if selected category name or match format indicates Doubles (e.g. "Men's Doubles", "Mixed Doubles", "MD", "WD", "XD")
  const isDoublesFormat = useMemo(() => {
    const mf = (matchFormat || '').toUpperCase();
    const selectedCat = categories.find((c) => (c.categoryId || c.id) === Number(selectedCategoryId));
    const catName = (selectedCat?.categoryName || selectedCat?.name || '').toUpperCase();
    const combined = `${mf} ${catName}`;
    return (
      combined.includes('DOUBLE') ||
      combined.includes('PAIR') ||
      combined.includes('MIXED') ||
      combined.includes('XD') ||
      combined.includes('MD') ||
      combined.includes('WD') ||
      combined.includes('MENS DOUBLES') ||
      combined.includes("MEN'S DOUBLES") ||
      combined.includes('WOMENS DOUBLES') ||
      combined.includes("WOMEN'S DOUBLES")
    );
  }, [matchFormat, categories, selectedCategoryId]);

  // Check if selected category name or match format indicates Singles
  const isSingleFormat = useMemo(() => {
    const mf = (matchFormat || '').toUpperCase();
    const selectedCat = categories.find((c) => (c.categoryId || c.id) === Number(selectedCategoryId));
    const catName = (selectedCat?.categoryName || selectedCat?.name || '').toUpperCase();
    const combined = `${mf} ${catName}`;
    return (
      !isDoublesFormat && (
        combined.includes('SINGLE') ||
        combined.includes('SOLO') ||
        combined.includes('INDIVIDUAL') ||
        combined.includes('MS') ||
        combined.includes('WS') ||
        combined.includes('MENS SINGLES') ||
        combined.includes("MEN'S SINGLES") ||
        combined.includes('WOMENS SINGLES') ||
        combined.includes("WOMEN'S SINGLES")
      )
    );
  }, [matchFormat, categories, selectedCategoryId, isDoublesFormat]);

  // Determine effective entry type: automatically locked to TEAM for doubles format
  const effectiveEntryType = useMemo(() => {
    if (isDoublesFormat) return 'TEAM';
    if (isSingleFormat) return 'INDIVIDUAL';
    return entryType;
  }, [isDoublesFormat, isSingleFormat, entryType]);

  // Sync entryType automatically with category / matchFormat when opening or switching category
  useEffect(() => {
    if (!isEditing) {
      if (isDoublesFormat) {
        setEntryType('TEAM');
      } else if (isSingleFormat) {
        setEntryType('INDIVIDUAL');
      }
    }
  }, [isDoublesFormat, isSingleFormat, isEditing]);

  // Phone number verification helper
  const verifyPhone = useCallback(async (phone: string): Promise<UserResponse | null> => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return null;
    try {
      const res = await UserService.getUserByPhone(cleanPhone);
      const user = (res as any)?.data || (res as any);
      if (user && (user.uuid || user.userId || user.firstName)) {
        return user;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Single player phone change handler with live Athlon verification
  const handleSinglePhoneChange = async (value: string) => {
    setPlayerPhone(value);
    const clean = value.replace(/\D/g, '');

    if (clean.length < 10) {
      setSinglePlayerVerification({ user: null, isVerifying: false, isVerified: false, error: null });
      return;
    }

    setSinglePlayerVerification((prev) => ({ ...prev, isVerifying: true, error: null }));
    const user = await verifyPhone(clean);

    if (user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setSinglePlayerVerification({ user, isVerifying: false, isVerified: true, error: null });
      if (!playerName.trim() || playerName === 'Guest Player') {
        setPlayerName(fullName);
      }
      if (!place && (user.city || user.district || user.state)) {
        setPlace(user.city || user.district || user.state || '');
      }
    } else {
      setSinglePlayerVerification({ user: null, isVerifying: false, isVerified: false, error: null });
    }
  };

  // Team player phone change handler with live Athlon verification
  const handleTeamPlayerPhoneChange = async (id: string, value: string) => {
    handlePlayerChange(id, 'phone', value);
    const clean = value.replace(/\D/g, '');

    if (clean.length < 10) {
      setTeamPlayerVerifications((prev) => ({
        ...prev,
        [id]: { user: null, isVerifying: false, isVerified: false, error: null },
      }));
      return;
    }

    setTeamPlayerVerifications((prev) => ({
      ...prev,
      [id]: { user: null, isVerifying: true, isVerified: false, error: null },
    }));

    const user = await verifyPhone(clean);

    if (user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setTeamPlayerVerifications((prev) => ({
        ...prev,
        [id]: { user, isVerifying: false, isVerified: true, error: null },
      }));
      // Auto-populate name if slot is currently empty
      setTeamPlayers((prev) =>
        prev.map((p) => (p.id === id && (!p.name.trim() || p.name === 'Guest Player') ? { ...p, name: fullName } : p))
      );
    } else {
      setTeamPlayerVerifications((prev) => ({
        ...prev,
        [id]: { user: null, isVerifying: false, isVerified: false, error: null },
      }));
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    setSinglePlayerVerification({ user: null, isVerifying: false, isVerified: false, error: null });
    setTeamPlayerVerifications({});

    if (editingRegistration) {
      const reg = editingRegistration;
      const isTeam = (reg.players && reg.players.length > 1) || reg.teamName?.includes('/');
      setEntryType(isTeam ? 'TEAM' : 'INDIVIDUAL');
      setSelectedCategoryId(reg.categoryId || defaultCategoryId || (categories[0]?.categoryId || categories[0]?.id as number) || '');
      setTeamName(reg.teamName || '');
      setPlace(reg.place || '');
      setGender((reg.gender as any) || '');

      if (reg.players && reg.players.length > 0) {
        if (reg.players.length === 1 && !isTeam) {
          setPlayerName(reg.players[0].playerName || reg.teamName || '');
          const phone = reg.players[0].phoneNumber || '';
          setPlayerPhone(phone);
          if (phone.replace(/\D/g, '').length >= 10) {
            handleSinglePhoneChange(phone);
          }
        } else {
          setTeamPlayers(
            reg.players.map((p, idx) => ({
              id: String(idx + 1),
              name: p.playerName || '',
              phone: p.phoneNumber || '',
            }))
          );
          reg.players.forEach((p, idx) => {
            const phone = p.phoneNumber || '';
            if (phone.replace(/\D/g, '').length >= 10) {
              handleTeamPlayerPhoneChange(String(idx + 1), phone);
            }
          });
        }
      } else {
        setPlayerName(reg.teamName || '');
        setPlayerPhone('');
      }
    } else {
      const initialCatId = defaultCategoryId || (categories[0]?.categoryId || categories[0]?.id as number) || '';
      setSelectedCategoryId(initialCatId);
      
      const selectedCat = categories.find((c) => (c.categoryId || c.id) === Number(initialCatId));
      const catName = (selectedCat?.categoryName || selectedCat?.name || '').toUpperCase();
      const mf = (matchFormat || '').toUpperCase();
      const combined = `${mf} ${catName}`;
      const isDoubles = (
        combined.includes('DOUBLE') ||
        combined.includes('PAIR') ||
        combined.includes('MIXED') ||
        combined.includes('XD') ||
        combined.includes('MD') ||
        combined.includes('WD') ||
        combined.includes('MENS DOUBLES') ||
        combined.includes("MEN'S DOUBLES") ||
        combined.includes('WOMENS DOUBLES') ||
        combined.includes("WOMEN'S DOUBLES")
      );

      setEntryType(isDoubles ? 'TEAM' : initialMode);
      setTeamName('');
      setPlace('');
      setGender('');
      setPlayerName('');
      setPlayerPhone('');
      setTeamPlayers([
        { id: '1', name: '', phone: '' },
        { id: '2', name: '', phone: '' },
      ]);
    }
  }, [isOpen, editingRegistration, defaultCategoryId, categories, initialMode, matchFormat]);

  if (!isOpen) return null;

  const handleAddPlayerSlot = () => {
    setTeamPlayers((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', phone: '' },
    ]);
  };

  const handleRemovePlayerSlot = (id: string) => {
    if (isRacquetSport && entryType === 'TEAM' && teamPlayers.length <= 2) return;
    if (teamPlayers.length <= 1) return;
    setTeamPlayers((prev) => prev.filter((p) => p.id !== id));
    setTeamPlayerVerifications((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handlePlayerChange = (id: string, field: 'name' | 'phone', value: string) => {
    setTeamPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const chosenCat = categories.find(
      (c) => (c.categoryId || c.id) === Number(selectedCategoryId)
    );

    let finalTeamName = '';
    let playersPayload: { playerName: string; phoneNumber?: string }[] = [];

    if (effectiveEntryType === 'INDIVIDUAL') {
      if (!playerName.trim()) {
        setErrorMessage('Please enter the player name.');
        return;
      }
      finalTeamName = playerName.trim();
      playersPayload = [
        {
          playerName: playerName.trim(),
          phoneNumber: playerPhone.trim() || undefined,
        },
      ];
    } else {
      // Doubles or Team entry
      const validPlayers = teamPlayers.filter((p) => p.name.trim().length > 0);

      if (isRacquetSport) {
        // For Badminton / Racquet doubles: derive team name automatically
        if (validPlayers.length < 2) {
          setErrorMessage('Please enter both Player 1 and Player 2 for Doubles entry.');
          return;
        }
        finalTeamName = `${validPlayers[0].name.trim()} / ${validPlayers[1].name.trim()}`;
        playersPayload = validPlayers.map((p) => ({
          playerName: p.name.trim(),
          phoneNumber: p.phone.trim() || undefined,
        }));
      } else {
        // Team Sports (Cricket, Football, Volleyball etc.)
        if (!teamName.trim()) {
          setErrorMessage('Please enter the team/club name.');
          return;
        }
        if (validPlayers.length === 0) {
          setErrorMessage('Please enter at least one player name in the team roster.');
          return;
        }
        finalTeamName = teamName.trim();
        playersPayload = validPlayers.map((p) => ({
          playerName: p.name.trim(),
          phoneNumber: p.phone.trim() || undefined,
        }));
      }
    }

    try {
      setIsSubmitting(true);

      const resolvedPlace =
        place.trim() ||
        singlePlayerVerification.user?.city ||
        teamPlayerVerifications['1']?.user?.city ||
        teamPlayerVerifications['2']?.user?.city ||
        'Local';

      const catId = chosenCat ? (chosenCat.categoryId || chosenCat.id) : (selectedCategoryId ? Number(selectedCategoryId) : null);
      const catUuid = chosenCat ? (chosenCat.categoryUuid || chosenCat.uuid) : null;
      const catName = chosenCat ? (chosenCat.categoryName || chosenCat.name) : null;

      const payload: any = {
        tournamentId: tournamentId,
        tournamentUuid: tournamentUuid,
        categoryId: catId,
        categoryUuid: catUuid,
        category: catName,
        teamName: finalTeamName,
        place: resolvedPlace,
        gender: gender || null,
        status: 'APPROVED',
        paymentStatus: 'PAID',
        registrationSource: 'ORGANIZER_MANUAL',
        createdBy: currentUserId || null,
        players: playersPayload,
      };

      let result: Registration;
      if (isEditing && editingRegistration?.uuid) {
        const res = await RegistrationService.updateRegistration(editingRegistration.uuid, payload, currentUserId);
        result = res.data;
      } else {
        const res = await RegistrationService.createRegistration(payload);
        result = res.data;
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      console.error('Failed to save manual participant', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save participant. Please check the details.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-card border-t sm:border border-foreground/10 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-300">
        
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-primary/5">
          <div className="w-10 h-1.5 rounded-full bg-foreground/20" />
        </div>

        {/* Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-foreground/10 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-sm">
              {effectiveEntryType === 'INDIVIDUAL' ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-foreground truncate">
                  {isEditing
                    ? 'Edit Participant Entry'
                    : isRacquetSport
                    ? effectiveEntryType === 'INDIVIDUAL'
                      ? 'Add Player (Singles Entry)'
                      : 'Add Doubles Pair Entry'
                    : 'Add Participant (Manual Entry)'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 shrink-0">
                  Organizer Entry
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-foreground/60 mt-0.5 line-clamp-1 sm:line-clamp-none">
                {isRacquetSport
                  ? effectiveEntryType === 'TEAM'
                    ? 'Enter Player 1 and Player 2 phone numbers to check and link Athlon user profiles.'
                    : 'Enter player phone number to check and link existing Athlon user profile.'
                  : 'Automatically approved & ready for draws and fixture generation.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 text-red-500 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
          {/* Format / Entry Type Toggle - only shown when format is not strictly defined */}
          {!isEditing && !isDoublesFormat && !isSingleFormat && (
            <div>
              <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1.5 sm:mb-2">
                {isRacquetSport ? 'Match Format' : 'Entry Type'}
              </label>

              {/* Mobile Segmented Pill Style */}
              <div className="grid grid-cols-2 p-1 bg-surface border border-foreground/10 rounded-2xl sm:hidden">
                <button
                  type="button"
                  onClick={() => setEntryType('INDIVIDUAL')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                    effectiveEntryType === 'INDIVIDUAL'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{isRacquetSport ? 'Single' : 'Single'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('TEAM')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                    effectiveEntryType === 'TEAM'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isRacquetSport ? 'Doubles' : 'Team'}</span>
                </button>
              </div>

              {/* Desktop Buttons */}
              <div className="hidden sm:grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEntryType('INDIVIDUAL')}
                  className={`py-3 px-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    effectiveEntryType === 'INDIVIDUAL'
                      ? 'bg-primary/15 text-primary border-primary shadow-sm'
                      : 'text-foreground/60 hover:text-foreground border-foreground/10 bg-card'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{isRacquetSport ? 'Single Player' : 'Single Player'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('TEAM')}
                  className={`py-3 px-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    effectiveEntryType === 'TEAM'
                      ? 'bg-primary/15 text-primary border-primary shadow-sm'
                      : 'text-foreground/60 hover:text-foreground border-foreground/10 bg-card'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{isRacquetSport ? 'Doubles Pair' : 'Team / Doubles'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tournament Category Selector */}
          {categories.length > 0 && (
            <div>
              <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1.5 sm:mb-2">
                Tournament Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    const newCatId = Number(e.target.value);
                    setSelectedCategoryId(newCatId);
                    if (!isEditing) {
                      const selectedCat = categories.find((c) => (c.categoryId || c.id) === newCatId);
                      const catName = (selectedCat?.categoryName || selectedCat?.name || '').toUpperCase();
                      const mf = (matchFormat || '').toUpperCase();
                      const combined = `${mf} ${catName}`;
                      if (
                        combined.includes('DOUBLE') ||
                        combined.includes('PAIR') ||
                        combined.includes('MIXED') ||
                        combined.includes('XD') ||
                        combined.includes('MD') ||
                        combined.includes('WD') ||
                        combined.includes('MENS DOUBLES') ||
                        combined.includes("MEN'S DOUBLES") ||
                        combined.includes('WOMENS DOUBLES') ||
                        combined.includes("WOMEN'S DOUBLES")
                      ) {
                        setEntryType('TEAM');
                      } else if (
                        catName.includes('SINGLE') ||
                        catName.includes('MS') ||
                        catName.includes('WS') ||
                        catName.includes('SOLO')
                      ) {
                        setEntryType('INDIVIDUAL');
                      }
                    }
                  }}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-2xl sm:rounded-xl border border-foreground/15 text-xs sm:text-sm font-semibold text-foreground bg-surface sm:bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer shadow-sm"
                  required
                >
                  {categories.map((c) => {
                    const catId = c.categoryId || c.id;
                    const catName = c.categoryName || c.name || `Category ${catId}`;
                    return (
                      <option key={catId} value={catId}>
                        {catName} {c.sportType ? `(${c.sportType})` : ''}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────────
              CASE 1: SINGLE PLAYER (Badminton / Racquet / Individual)
              ─────────────────────────────────────────────────────────────────── */}
          {effectiveEntryType === 'INDIVIDUAL' ? (
            <div className="space-y-3.5 sm:space-y-4">
              {/* Phone Number with Athlon Live Verification */}
              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                    Player Phone Number <span className="text-foreground/40 lowercase">(Athlon ID Check)</span>
                  </label>
                  {singlePlayerVerification.isVerifying && (
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Checking Athlon...</span>
                    </span>
                  )}
                  {singlePlayerVerification.isVerified && (
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      <span>Athlon Verified</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="tel"
                    value={playerPhone}
                    onChange={(e) => handleSinglePhoneChange(e.target.value)}
                    placeholder="Enter 10-digit phone number"
                    maxLength={14}
                    className={`w-full pl-10 pr-10 py-3 rounded-2xl sm:rounded-xl border text-xs sm:text-sm font-semibold text-foreground bg-surface sm:bg-card focus:outline-none transition-all placeholder:text-foreground/30 shadow-sm ${
                      singlePlayerVerification.isVerified
                        ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'border-foreground/15 focus:border-primary focus:ring-1 focus:ring-primary'
                    }`}
                  />
                  {singlePlayerVerification.isVerified && (
                    <CheckCircle2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                  )}
                </div>
                {singlePlayerVerification.isVerified && singlePlayerVerification.user && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 animate-in fade-in duration-200">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                      {singlePlayerVerification.user.firstName?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-foreground truncate">
                        {singlePlayerVerification.user.firstName} {singlePlayerVerification.user.lastName}
                      </div>
                      <div className="text-[10px] text-foreground/60 truncate">
                        Registered Athlon Player • {singlePlayerVerification.user.city || singlePlayerVerification.user.district || 'Athlon Verified'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Player Full Name */}
              <div>
                <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1.5 sm:mb-2">
                  Player Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter player's full name"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl sm:rounded-xl border border-foreground/15 text-xs sm:text-sm font-semibold text-foreground bg-surface sm:bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/30 shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Place / Origin & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1.5 sm:mb-2">
                    City / Club / Place (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input
                      type="text"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="e.g. Bangalore, Lions Club"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl sm:rounded-xl border border-foreground/15 text-xs sm:text-sm font-semibold text-foreground bg-surface sm:bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/30 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1.5 sm:mb-2">
                    Gender (Optional)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { value: 'MALE', label: 'Male' },
                      { value: 'FEMALE', label: 'Female' },
                      { value: 'MIXED', label: 'Mixed' },
                    ].map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setGender(gender === g.value ? '' : (g.value as any))}
                        className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                          gender === g.value
                            ? 'bg-primary/20 text-primary border-primary font-black shadow-sm'
                            : 'text-foreground/70 hover:text-foreground border-foreground/10 bg-surface sm:bg-card'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : isRacquetSport ? (
            /* ───────────────────────────────────────────────────────────────────
               CASE 2: BADMINTON / RACQUET DOUBLES PAIR (No Team Name Input)
               ─────────────────────────────────────────────────────────────────── */
            <div className="space-y-4">
              {/* Doubles Header Info */}
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black text-foreground">Doubles Pair Details</span>
                </div>
                <span className="text-[10px] font-bold text-foreground/60">
                  Team name is automatically derived as (Player 1 / Player 2)
                </span>
              </div>

              {/* Player 1 & Player 2 Cards */}
              {[0, 1].map((idx) => {
                const player = teamPlayers[idx] || { id: String(idx + 1), name: '', phone: '' };
                const verification = teamPlayerVerifications[player.id];
                const isVerified = verification?.isVerified;
                const isVerifying = verification?.isVerifying;

                return (
                  <div
                    key={player.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all shadow-sm space-y-3 ${
                      isVerified
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-foreground/10 bg-surface/80 sm:bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-foreground">
                          {idx === 0 ? 'Player 1 (Lead)' : 'Player 2 (Partner)'} <span className="text-red-500">*</span>
                        </span>
                      </div>
                      {isVerifying && (
                        <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Checking Athlon...</span>
                        </span>
                      )}
                      {isVerified && (
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3" />
                          <span>Athlon Verified</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Phone Input with Athlon Check */}
                      <div>
                        <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                          <input
                            type="tel"
                            value={player.phone}
                            onChange={(e) => handleTeamPlayerPhoneChange(player.id, e.target.value)}
                            placeholder="10-digit phone"
                            maxLength={14}
                            className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-xs font-semibold text-foreground bg-card focus:outline-none transition-all placeholder:text-foreground/30 ${
                              isVerified
                                ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                                : 'border-foreground/15 focus:border-primary'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Name Input */}
                      <div>
                        <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => handlePlayerChange(player.id, 'name', e.target.value)}
                            placeholder={`Enter player ${idx + 1} name`}
                            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-foreground/15 text-xs font-semibold text-foreground bg-card focus:outline-none focus:border-primary placeholder:text-foreground/30"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {isVerified && verification?.user && (
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-foreground/80 flex items-center justify-between">
                        <span className="font-bold">
                          {verification.user.firstName} {verification.user.lastName}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-black">
                          {verification.user.city || 'Athlon Verified'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* City / Club (Optional) */}
              <div>
                <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1.5 sm:mb-2">
                  Place / Club (Optional)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="text"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="e.g. Smashers Academy, Bangalore"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl sm:rounded-xl border border-foreground/15 text-xs sm:text-sm font-semibold text-foreground bg-surface sm:bg-card focus:outline-none focus:border-primary placeholder:text-foreground/30 shadow-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ───────────────────────────────────────────────────────────────────
               CASE 3: TEAM SPORTS (Cricket, Football, Volleyball, etc.)
               ─────────────────────────────────────────────────────────────────── */
            <div className="space-y-3.5 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1.5 sm:mb-2">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Smashers Club A"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl sm:rounded-xl border border-foreground/15 text-xs sm:text-sm font-semibold text-foreground bg-surface sm:bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/30 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1.5 sm:mb-2">
                    Place / Origin (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input
                      type="text"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="e.g. Chennai"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl sm:rounded-xl border border-foreground/15 text-xs sm:text-sm font-semibold text-foreground bg-surface sm:bg-card focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Team Players Roster */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                    Roster Players ({teamPlayers.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPlayerSlot}
                    className="text-xs font-black text-primary hover:underline flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Player Slot</span>
                  </button>
                </div>

                {/* Micro Cards */}
                <div className="space-y-2.5">
                  {teamPlayers.map((player, idx) => {
                    const verification = teamPlayerVerifications[player.id];
                    const isVerified = verification?.isVerified;
                    const isVerifying = verification?.isVerifying;

                    return (
                      <div
                        key={player.id}
                        className={`p-3.5 rounded-2xl border transition-all space-y-2.5 shadow-sm ${
                          isVerified
                            ? 'border-emerald-500/40 bg-emerald-500/5'
                            : 'border-foreground/10 bg-surface/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-[11px] font-black uppercase tracking-wider text-foreground/80">
                              Player {idx + 1} {idx === 0 ? '(Captain / Lead)' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isVerifying && (
                              <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Checking...</span>
                              </span>
                            )}
                            {isVerified && (
                              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3" />
                                <span>Verified</span>
                              </span>
                            )}
                            {teamPlayers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePlayerSlot(player.id)}
                                className="text-red-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="relative">
                            <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                            <input
                              type="tel"
                              value={player.phone}
                              onChange={(e) => handleTeamPlayerPhoneChange(player.id, e.target.value)}
                              placeholder="Phone number (Athlon lookup)"
                              maxLength={14}
                              className="w-full pl-8 pr-3 py-2 rounded-xl border border-foreground/15 text-xs font-semibold text-foreground bg-card focus:outline-none focus:border-primary placeholder:text-foreground/30 shadow-inner"
                            />
                          </div>
                          <div className="relative">
                            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                            <input
                              type="text"
                              value={player.name}
                              onChange={(e) => handlePlayerChange(player.id, 'name', e.target.value)}
                              placeholder={`Full Name ${idx === 0 ? '*' : '(Optional)'}`}
                              className="w-full pl-8 pr-3 py-2 rounded-xl border border-foreground/15 text-xs font-semibold text-foreground bg-card focus:outline-none focus:border-primary placeholder:text-foreground/30 shadow-inner"
                              required={idx === 0}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleAddPlayerSlot}
                    className="w-full py-2.5 rounded-2xl border border-dashed border-primary/40 text-primary hover:bg-primary/5 text-xs font-black flex items-center justify-center gap-1.5 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add Another Player</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Notice */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-[11px] text-foreground/70 leading-relaxed">
              <strong className="text-primary font-bold">Manual Entry Guaranteed:</strong> This participant will be registered directly with status <span className="text-primary font-bold">APPROVED</span> and payment <span className="text-primary font-bold">PAID</span>.
            </div>
          </div>

          {/* Action Buttons: Sticky Bottom Bar on Mobile & Clean Right-Aligned on Desktop */}
          <div className="pt-2 sm:pt-2 flex items-center justify-end gap-2.5 sm:gap-3 sticky bottom-0 -mx-4 -mb-4 p-4 sm:p-0 sm:m-0 bg-card/95 backdrop-blur-md sm:bg-transparent border-t border-foreground/10 sm:border-t-0 z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-3 sm:py-2.5 rounded-2xl sm:rounded-xl border border-foreground/15 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] sm:flex-initial px-5 sm:px-6 py-3 sm:py-2.5 rounded-2xl sm:rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Update Entry' : 'Add Participant'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
