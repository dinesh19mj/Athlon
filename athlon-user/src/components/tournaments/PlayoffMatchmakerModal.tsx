'use client';

import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  Swords, 
  Shuffle, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Registration, DrawService } from '@/lib/api/tournaments';

interface PlayoffMatchmakerModalProps {
  tournamentUuid: string;
  categoryName?: string;
  pools: { poolId: number; poolName: string }[];
  qualifiers: {
    registrationId: number;
    registrationUuid: string;
    teamName: string;
    poolId: number;
    poolName: string;
    rank: number; // 1 = Winner, 2 = Runner-up
  }[];
  onClose: () => void;
  onSuccess: () => void;
}

export function PlayoffMatchmakerModal({
  tournamentUuid,
  categoryName,
  pools,
  qualifiers,
  onClose,
  onSuccess,
}: PlayoffMatchmakerModalProps) {
  const [mode, setMode] = useState<'STANDARD_CROSS' | 'CUSTOM_MANUAL' | 'RANDOM_LOTTERY'>('STANDARD_CROSS');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For Custom Matchmaker: Pairings list
  // e.g. 8 qualifiers -> 4 quarter-final matches
  const matchCount = Math.max(2, Math.floor(qualifiers.length / 2));
  const [customPairings, setCustomPairings] = useState<{
    matchOrder: number;
    teamAId: number | null;
    teamBId: number | null;
  }[]>(() => {
    return Array.from({ length: matchCount }, (_, i) => ({
      matchOrder: i + 1,
      teamAId: null,
      teamBId: null,
    }));
  });

  const handleSetTeam = (matchIndex: number, slot: 'teamAId' | 'teamBId', regId: number | null) => {
    setCustomPairings(prev => {
      const copy = [...prev];
      copy[matchIndex] = { ...copy[matchIndex], [slot]: regId };
      return copy;
    });
  };

  const handleGeneratePlayoffs = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      let payload: any = {
        categoryName,
        pairingMode: mode,
      };

      if (mode === 'CUSTOM_MANUAL') {
        // Validate all slots filled
        const incomplete = customPairings.some(p => p.teamAId === null || p.teamBId === null);
        if (incomplete) {
          setError('Please assign all team slots in the custom matchmaker.');
          setIsGenerating(false);
          return;
        }

        payload.customPairings = customPairings.map(p => ({
          matchOrder: p.matchOrder,
          player1RegistrationId: p.teamAId,
          player2RegistrationId: p.teamBId,
        }));
      }

      await DrawService.generatePooledPlayoffs(tournamentUuid, payload);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Failed to generate championship playoffs.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0F131C] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Championship Playoff Matchmaker
                {categoryName && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
                    {categoryName}
                  </span>
                )}
              </h2>
              <p className="text-xs text-white/50">Configure how advancing pool qualifiers face off in the final knockout bracket.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Playoff Seeding Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setMode('STANDARD_CROSS')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  mode === 'STANDARD_CROSS'
                    ? 'border-primary bg-primary/10 text-white shadow-sm'
                    : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white'
                }`}
              >
                <div className="font-bold text-sm text-white">Standard Cross-Seed</div>
                <p className="text-[11px] text-white/40 mt-1">A1 vs B2, C1 vs D2, B1 vs A2, D1 vs C2</p>
              </button>

              <button
                type="button"
                onClick={() => setMode('CUSTOM_MANUAL')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  mode === 'CUSTOM_MANUAL'
                    ? 'border-primary bg-primary/10 text-white shadow-sm'
                    : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white'
                }`}
              >
                <div className="font-bold text-sm text-white">Custom Matchmaker</div>
                <p className="text-[11px] text-white/40 mt-1">Organizer manually pairs each match slot</p>
              </button>

              <button
                type="button"
                onClick={() => setMode('RANDOM_LOTTERY')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  mode === 'RANDOM_LOTTERY'
                    ? 'border-primary bg-primary/10 text-white shadow-sm'
                    : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white'
                }`}
              >
                <div className="font-bold text-sm text-white">Blind Lottery</div>
                <p className="text-[11px] text-white/40 mt-1">Random draw among all qualifiers</p>
              </button>
            </div>
          </div>

          {/* Mode Details */}
          {mode === 'STANDARD_CROSS' && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Automatic Balanced Cross-Seeding
              </div>
              <p className="text-white/60 leading-relaxed text-xs">
                Teams from the same pool are positioned on opposite sides of the championship bracket so they can only meet again in the Grand Final.
              </p>
              <div className="grid grid-cols-2 gap-2 text-white/70 font-mono text-xs pt-1">
                <div className="p-2 bg-black/40 rounded-lg border border-white/5">Match 1: Pool A #1 vs Pool B #2</div>
                <div className="p-2 bg-black/40 rounded-lg border border-white/5">Match 2: Pool C #1 vs Pool D #2</div>
                <div className="p-2 bg-black/40 rounded-lg border border-white/5">Match 3: Pool B #1 vs Pool A #2</div>
                <div className="p-2 bg-black/40 rounded-lg border border-white/5">Match 4: Pool D #1 vs Pool C #2</div>
              </div>
            </div>
          )}

          {mode === 'CUSTOM_MANUAL' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Custom Match Slot Assignments</span>
                <span className="text-[11px] text-white/40">{qualifiers.length} Qualified Teams Available</span>
              </div>

              <div className="space-y-3">
                {customPairings.map((pair, idx) => (
                  <div key={pair.matchOrder} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                    <span className="w-16 font-mono font-bold text-primary shrink-0">Match {idx + 1}</span>

                    {/* Team A Select */}
                    <select
                      value={pair.teamAId || ''}
                      onChange={(e) => handleSetTeam(idx, 'teamAId', e.target.value ? Number(e.target.value) : null)}
                      className="flex-1 bg-[#07090E] border border-white/15 rounded-lg px-3 py-2 text-white outline-none focus:border-primary truncate"
                    >
                      <option value="">Select Team A...</option>
                      {qualifiers.map(q => (
                        <option key={q.registrationId} value={q.registrationId}>
                          {q.poolName} ({q.rank === 1 ? 'Winner' : 'Runner-up'}) - {q.teamName}
                        </option>
                      ))}
                    </select>

                    <span className="text-white/40 font-bold shrink-0">VS</span>

                    {/* Team B Select */}
                    <select
                      value={pair.teamBId || ''}
                      onChange={(e) => handleSetTeam(idx, 'teamBId', e.target.value ? Number(e.target.value) : null)}
                      className="flex-1 bg-[#07090E] border border-white/15 rounded-lg px-3 py-2 text-white outline-none focus:border-primary truncate"
                    >
                      <option value="">Select Team B...</option>
                      {qualifiers.map(q => (
                        <option key={q.registrationId} value={q.registrationId}>
                          {q.poolName} ({q.rank === 1 ? 'Winner' : 'Runner-up'}) - {q.teamName}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGeneratePlayoffs}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Swords className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Launch Championship Stage'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
