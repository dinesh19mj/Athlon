'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Registration, RegistrationService } from '@/lib/api/tournaments';

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
  categories: CategoryOption[];
  defaultCategoryId?: number;
  editingRegistration?: Registration | null;
  currentUserId?: number;
  initialMode?: 'INDIVIDUAL' | 'TEAM';
}

export function ManualParticipantModal({
  isOpen,
  onClose,
  onSuccess,
  tournamentId,
  tournamentUuid,
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

  // Team player fields (for doubles or team entries)
  const [teamPlayers, setTeamPlayers] = useState<{ id: string; name: string; phone: string }[]>([
    { id: '1', name: '', phone: '' },
    { id: '2', name: '', phone: '' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    if (editingRegistration) {
      const reg = editingRegistration;
      const isTeam = reg.players && reg.players.length > 1;
      setEntryType(isTeam ? 'TEAM' : 'INDIVIDUAL');
      setSelectedCategoryId(reg.categoryId || defaultCategoryId || (categories[0]?.categoryId || categories[0]?.id as number) || '');
      setTeamName(reg.teamName || '');
      setPlace(reg.place || '');
      setGender((reg.gender as any) || '');

      if (reg.players && reg.players.length > 0) {
        if (reg.players.length === 1) {
          setPlayerName(reg.players[0].playerName || reg.teamName || '');
          setPlayerPhone(reg.players[0].phoneNumber || '');
        } else {
          setTeamPlayers(
            reg.players.map((p, idx) => ({
              id: String(idx + 1),
              name: p.playerName || '',
              phone: p.phoneNumber || '',
            }))
          );
        }
      } else {
        setPlayerName(reg.teamName || '');
        setPlayerPhone('');
      }
    } else {
      setEntryType(initialMode);
      setSelectedCategoryId(defaultCategoryId || (categories[0]?.categoryId || categories[0]?.id as number) || '');
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
  }, [isOpen, editingRegistration, defaultCategoryId, categories, initialMode]);

  if (!isOpen) return null;

  const handleAddPlayerSlot = () => {
    setTeamPlayers((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', phone: '' },
    ]);
  };

  const handleRemovePlayerSlot = (id: string) => {
    if (teamPlayers.length <= 2) return;
    setTeamPlayers((prev) => prev.filter((p) => p.id !== id));
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

    if (entryType === 'INDIVIDUAL') {
      if (!playerName.trim()) {
        setErrorMessage('Please enter the participant/player name.');
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
      if (!teamName.trim()) {
        setErrorMessage('Please enter the team/club name.');
        return;
      }
      const validPlayers = teamPlayers.filter((p) => p.name.trim().length > 0);
      if (validPlayers.length === 0) {
        setErrorMessage('Please enter at least one player name in the team.');
        return;
      }
      finalTeamName = teamName.trim();
      playersPayload = validPlayers.map((p) => ({
        playerName: p.name.trim(),
        phoneNumber: p.phone.trim() || undefined,
      }));
    }

    try {
      setIsSubmitting(true);

      const payload: any = {
        tournamentId: tournamentId,
        tournamentUuid: tournamentUuid,
        categoryId: chosenCat ? (chosenCat.categoryId || chosenCat.id) : (selectedCategoryId || null),
        categoryUuid: chosenCat ? (chosenCat.categoryUuid || chosenCat.uuid) : null,
        teamName: finalTeamName,
        place: place.trim() || null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-card border border-foreground/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-foreground/10 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
              {entryType === 'INDIVIDUAL' ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-foreground">
                  {isEditing ? 'Edit Participant Entry' : 'Add Participant (Manual Entry)'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                  Organizer Entry
                </span>
              </div>
              <p className="text-xs text-foreground/60 mt-0.5">
                Automatically approved &amp; ready for draws and fixture generation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 text-red-500 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Entry Type Toggle (if not editing) */}
          {!isEditing && (
            <div>
              <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-2">
                Entry Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEntryType('INDIVIDUAL')}
                  className={`py-3 px-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    entryType === 'INDIVIDUAL'
                      ? 'bg-primary/15 text-primary border-primary shadow-sm'
                      : 'text-foreground/60 hover:text-foreground border-foreground/10 bg-card'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Single Player</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('TEAM')}
                  className={`py-3 px-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    entryType === 'TEAM'
                      ? 'bg-primary/15 text-primary border-primary shadow-sm'
                      : 'text-foreground/60 hover:text-foreground border-foreground/10 bg-card'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Team / Doubles</span>
                </button>
              </div>
            </div>
          )}

          {/* Category Selector */}
          {categories.length > 0 && (
            <div>
              <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-2">
                Tournament Category <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-foreground/15 text-sm font-semibold text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
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
            </div>
          )}

          {/* Single Player Details */}
          {entryType === 'INDIVIDUAL' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-2">
                  Player Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-foreground/40" />
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter player's full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-foreground/15 text-sm font-semibold text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/30"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-foreground/40" />
                    <input
                      type="tel"
                      value={playerPhone}
                      onChange={(e) => setPlayerPhone(e.target.value)}
                      placeholder="Contact phone"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-foreground/15 text-sm font-semibold text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-2">
                    City / Club / Place (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-foreground/40" />
                    <input
                      type="text"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="e.g. Bangalore, Lions Club"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-foreground/15 text-sm font-semibold text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/30"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-2">
                  Gender (Optional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' },
                    { value: 'OTHER', label: 'Other' },
                  ].map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGender(gender === g.value ? '' : (g.value as any))}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        gender === g.value
                          ? 'bg-primary/20 text-primary border-primary font-black'
                          : 'text-foreground/70 hover:text-foreground border-foreground/10 bg-card'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Team Details */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-2">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 absolute left-3.5 top-3.5 text-foreground/40" />
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Smashers Club A"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-foreground/15 text-sm font-semibold text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-2">
                    Place / Origin (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-foreground/40" />
                    <input
                      type="text"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="e.g. Chennai"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-foreground/15 text-sm font-semibold text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/30"
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
                    className="text-xs font-black text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Player Slot</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {teamPlayers.map((player, idx) => (
                    <div
                      key={player.id}
                      className="p-3 rounded-2xl border border-foreground/10 bg-card/60 flex items-center gap-2"
                    >
                      <span className="w-6 h-6 rounded-lg bg-foreground/5 text-foreground/60 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => handlePlayerChange(player.id, 'name', e.target.value)}
                        placeholder={`Player ${idx + 1} Name`}
                        className="flex-1 px-3 py-2 rounded-xl border border-foreground/15 text-xs font-semibold text-foreground bg-card focus:outline-none focus:border-primary placeholder:text-foreground/30"
                        required={idx === 0}
                      />
                      <input
                        type="tel"
                        value={player.phone}
                        onChange={(e) => handlePlayerChange(player.id, 'phone', e.target.value)}
                        placeholder="Phone (opt)"
                        className="w-28 sm:w-36 px-3 py-2 rounded-xl border border-foreground/15 text-xs font-semibold text-foreground bg-card focus:outline-none focus:border-primary placeholder:text-foreground/30"
                      />
                      {teamPlayers.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePlayerSlot(player.id)}
                          className="w-8 h-8 rounded-xl text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Notice */}
          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-[11px] text-foreground/70 leading-relaxed">
              <strong className="text-primary font-bold">Manual Entry Guaranteed:</strong> This participant will be registered directly with status <span className="text-primary font-bold">APPROVED</span> and payment <span className="text-primary font-bold">PAID</span>.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-foreground/15 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Update Participant' : 'Add Participant'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
