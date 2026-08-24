'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Play,
  Trash2,
  Trophy,
  Activity,
  Plus,
  Clock,
  CheckCircle2,
  Flame,
  Swords,
  ChevronRight,
} from 'lucide-react';
import { usePracticeMatchStore, PracticeMatchRecord } from '@/lib/store/usePracticeMatchStore';

interface PracticeMatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PracticeMatchDrawer({ isOpen, onClose }: PracticeMatchDrawerProps) {
  const router = useRouter();
  const { records, removeRecord, clearAll } = usePracticeMatchStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const activeMatches = records.filter((r) => r.status === 'live');
  const pastMatches = records.filter((r) => r.status === 'completed');

  const handleResume = (record: PracticeMatchRecord) => {
    onClose();
    router.push(record.liveRoute);
  };

  const handleStartNew = () => {
    onClose();
    router.push('/match-setup');
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div
        className="relative z-10 w-full max-w-lg rounded-t-[32px] border-t border-border bg-[#0e1626] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col"
        style={{
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Drag Handle */}
        <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-white/20" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Local Match Records</h2>
              <p className="text-[11px] text-foreground/50">Stored directly on this device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-foreground/60 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 hide-scrollbar">
          {/* Active Live Match Section */}
          {activeMatches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 pl-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-wider text-red-400">
                  Active Match In Progress
                </span>
              </div>
              <div className="space-y-2">
                {activeMatches.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-surface to-red-500/5 border border-red-500/30 flex items-center justify-between gap-3 shadow-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/30">
                          {m.sport}
                        </span>
                        <span className="text-[11px] text-foreground/40 font-medium">
                          {m.category} • {formatTime(m.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-foreground truncate">
                        {m.teamALabel} <span className="text-red-400 font-extrabold">VS</span> {m.teamBLabel}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResume(m)}
                        className="px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-500/30 transition-transform active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </button>
                      <button
                        onClick={() => removeRecord(m.id)}
                        className="p-2 rounded-xl hover:bg-white/10 text-foreground/40 hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Matches Section */}
          <div>
            <div className="flex items-center justify-between mb-2 pl-1 pr-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Recent Practice Matches ({pastMatches.length})
              </span>
              {records.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[11px] font-bold text-red-400/80 hover:text-red-400 transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>

            {records.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-2xl bg-surface/40 border border-white/5 flex flex-col items-center justify-center gap-2">
                <Swords className="w-8 h-8 text-foreground/20" />
                <p className="text-sm font-semibold text-foreground/60">No local matches recorded yet</p>
                <p className="text-xs text-foreground/40 max-w-xs">
                  Quick matches started from the bottom bar will be saved here on your device.
                </p>
              </div>
            ) : pastMatches.length === 0 && activeMatches.length > 0 ? (
              <p className="text-xs text-foreground/40 italic pl-1">No completed practice matches yet.</p>
            ) : (
              <div className="space-y-2">
                {pastMatches.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-surface/60 border border-white/5 hover:border-white/10 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-foreground/70 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                          {m.sport}
                        </span>
                        <span className="text-[10px] text-foreground/40 font-medium">
                          {formatDate(m.createdAt)} at {formatTime(m.createdAt)}
                        </span>
                        {m.winner && (
                          <span className="px-1.5 py-0.2 rounded bg-green-500/10 text-green-400 text-[9px] font-bold">
                            Winner: Team {m.winner}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-foreground/90 truncate">
                        {m.teamALabel} vs {m.teamBLabel}
                      </div>
                      {(m.scoreA || m.scoreB) && (
                        <div className="text-[11px] font-mono text-primary mt-0.5">
                          Score: {m.scoreA || '0'} - {m.scoreB || '0'}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeRecord(m.id)}
                      className="p-2 rounded-lg hover:bg-white/10 text-foreground/30 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={handleStartNew}
            className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Setup New Quick Match</span>
          </button>
        </div>
      </div>
    </div>
  );
}
