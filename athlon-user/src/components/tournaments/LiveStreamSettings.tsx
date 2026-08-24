'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Save,
  Plus,
  Trash2,
  Edit2,
  Radio,
  Tv,
  Activity,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Layers,
  HelpCircle,
  Video,
  Play,
  ExternalLink,
} from 'lucide-react';
import { TournamentService, StreamConfigService, CourtConfig } from '@/lib/api/tournaments';

interface LiveStreamSettingsProps {
  tournamentId: string;
  tournamentName?: string;
}

export function LiveStreamSettings({ tournamentId, tournamentName }: LiveStreamSettingsProps) {
  const [courts, setCourts] = useState<CourtConfig[]>([]);
  const [editingCourts, setEditingCourts] = useState<Set<number>>(new Set());
  const [showKeys, setShowKeys] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<{ [key: number]: boolean }>({});
  const [savedSuccess, setSavedSuccess] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setIsLoading(true);
        const tRes = await TournamentService.getById(tournamentId);
        if (tRes && tRes.data && tRes.data.tournamentUuid) {
          const fetchedCourts = await StreamConfigService.getByTournament(tRes.data.tournamentUuid);
          if (fetchedCourts && fetchedCourts.length > 0) {
            setCourts(fetchedCourts);
          } else {
            const newId = Date.now();
            setCourts([{ id: newId, name: 'Court 1', streamKey: '', enableStream: false }]);
            setEditingCourts(new Set([newId]));
          }
        }
      } catch (e) {
        console.error('Failed to fetch stream configurations', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfigs();
  }, [tournamentId]);

  const handleUpdateCourt = (id: number, field: keyof CourtConfig, value: any) => {
    setCourts((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleAddCourt = () => {
    const newId = Date.now();
    setCourts((prev) => [
      ...prev,
      { id: newId, name: `Court ${prev.length + 1}`, streamKey: '', enableStream: false },
    ]);
    setEditingCourts((prev) => new Set(prev).add(newId));
  };

  const handleRemoveCourt = (id: number) => {
    if (!confirm('Are you sure you want to remove this court configuration?')) return;
    setCourts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleKeyVisibility = (id: number) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSaveCourt = async (id: number) => {
    try {
      setIsSaving((prev) => ({ ...prev, [id]: true }));
      const tRes = await TournamentService.getById(tournamentId);
      if (tRes && tRes.data && tRes.data.tournamentUuid) {
        const savedCourts = await StreamConfigService.saveConfigs(tRes.data.tournamentUuid, courts);
        setCourts(savedCourts || courts);
        setEditingCourts((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setSavedSuccess((prev) => ({ ...prev, [id]: true }));
        setTimeout(() => {
          setSavedSuccess((prev) => ({ ...prev, [id]: false }));
        }, 2500);
      }
    } catch (e) {
      console.error('Failed to save stream configurations', e);
      alert('Failed to save stream configuration. Please try again.');
    } finally {
      setIsSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSaveAll = async () => {
    try {
      const tRes = await TournamentService.getById(tournamentId);
      if (tRes && tRes.data && tRes.data.tournamentUuid) {
        const savedCourts = await StreamConfigService.saveConfigs(tRes.data.tournamentUuid, courts);
        setCourts(savedCourts || courts);
        setEditingCourts(new Set());
        alert('All court configurations saved successfully!');
      }
    } catch (e) {
      console.error('Failed to save stream configurations', e);
      alert('Failed to save stream configurations.');
    }
  };

  const videoStreamCourtsCount = courts.filter((c) => c.enableStream).length;
  const scoreOnlyCourtsCount = courts.filter((c) => !c.enableStream).length;

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">
          Loading Court Stream Configs...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── TOP HEADER SECTION ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 border border-primary/20 text-primary">
            <Radio className="w-3.5 h-3.5" />
            <span>Court Streaming & Live Scoring Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Court Setup & Stream Keys
          </h2>
          <p className="text-xs font-medium text-foreground/60">
            Configure courts for real-time umpire scoring and optional YouTube/OBS livestream broadcasts.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleAddCourt}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold text-foreground hover:bg-white/5 transition-all shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>Add Court</span>
          </button>

          {courts.length > 1 && (
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save All</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 3-METRIC HIGHLIGHTS STRIP ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className="p-3.5 rounded-2xl border flex items-center gap-3"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/45 block">
              Configured Courts
            </span>
            <span className="text-base font-black text-foreground">{courts.length} Total</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-2xl border flex items-center gap-3"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/45 block">
              YouTube Video + Score
            </span>
            <span className="text-base font-black text-red-400">{videoStreamCourtsCount} Active Streams</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-2xl border flex items-center gap-3"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/45 block">
              Digital Score Only
            </span>
            <span className="text-base font-black text-emerald-400">{scoreOnlyCourtsCount} Scoreboards</span>
          </div>
        </div>
      </div>

      {/* ── COURTS LIST GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {courts.map((court, index) => {
          const isEditing = editingCourts.has(court.id);
          const isKeyVisible = showKeys[court.id];
          const isCourtSaving = isSaving[court.id];
          const isSuccess = savedSuccess[court.id];

          return (
            <div
              key={court.id}
              className="rounded-2xl border p-5 flex flex-col justify-between shadow-md transition-all relative overflow-hidden space-y-4"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: court.enableStream ? 'rgba(239, 68, 68, 0.3)' : 'var(--athlon-border)',
              }}
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  court.enableStream ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-primary'
                }`}
              />

              {/* Court Card Header */}
              <div className="flex items-center justify-between gap-3 pt-1 border-b border-white/[0.06] pb-3.5">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      court.enableStream
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-primary/15 text-primary border border-primary/30'
                    }`}
                  >
                    #{index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={court.name}
                        onChange={(e) => handleUpdateCourt(court.id, 'name', e.target.value)}
                        className="w-full bg-transparent border-b border-primary/50 text-base font-black text-foreground outline-none px-1 py-0.5"
                        placeholder="Court Name..."
                      />
                    ) : (
                      <h3 className="text-base font-black text-foreground truncate">{court.name}</h3>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      court.enableStream
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {court.enableStream ? (
                      <>
                        <Tv className="w-3 h-3" />
                        <span>YouTube Stream</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-3 h-3" />
                        <span>Score Only</span>
                      </>
                    )}
                  </span>

                  {courts.length > 1 && (
                    <button
                      onClick={() => handleRemoveCourt(court.id)}
                      className="p-1.5 text-foreground/40 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors ml-1"
                      title="Remove Court"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Broadcast Mode Segmented Selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/45 block">
                  Broadcast Mode
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {/* Score Only Option */}
                  <button
                    type="button"
                    onClick={() => handleUpdateCourt(court.id, 'enableStream', false)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      !court.enableStream
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-foreground/60'
                    }`}
                  >
                    <Activity
                      className={`w-4 h-4 mt-0.5 shrink-0 ${!court.enableStream ? 'text-primary' : 'text-foreground/40'}`}
                    />
                    <div>
                      <span
                        className={`text-xs font-black block leading-none ${
                          !court.enableStream ? 'text-foreground' : 'text-foreground/70'
                        }`}
                      >
                        Score Only
                      </span>
                      <span className="text-[10px] text-foreground/40 mt-1 block">Live digital scoreboard overlay</span>
                    </div>
                  </button>

                  {/* YouTube Stream Option */}
                  <button
                    type="button"
                    onClick={() => handleUpdateCourt(court.id, 'enableStream', true)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      court.enableStream
                        ? 'border-red-500 bg-red-500/10 shadow-sm'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-foreground/60'
                    }`}
                  >
                    <Tv className={`w-4 h-4 mt-0.5 shrink-0 ${court.enableStream ? 'text-red-400' : 'text-foreground/40'}`} />
                    <div>
                      <span
                        className={`text-xs font-black block leading-none ${
                          court.enableStream ? 'text-red-400' : 'text-foreground/70'
                        }`}
                      >
                        YouTube Video
                      </span>
                      <span className="text-[10px] text-foreground/40 mt-1 block">Camera feed + live score overlay</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Stream Key Field (If YouTube Broadcast Enabled) */}
              {court.enableStream ? (
                <div
                  className="p-3.5 rounded-xl border space-y-2.5"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <Tv className="w-3 h-3" />
                      YouTube Stream Key
                    </span>
                    <span className="text-[10px] text-foreground/40 font-mono">RTMP Server Key</span>
                  </div>

                  <div className="relative">
                    <input
                      type={isKeyVisible ? 'text' : 'password'}
                      value={court.streamKey || ''}
                      onChange={(e) => handleUpdateCourt(court.id, 'streamKey', e.target.value)}
                      placeholder="Paste your YouTube stream key here..."
                      className="w-full pl-3 pr-16 py-2 rounded-lg border text-xs font-mono bg-black/30 border-white/10 text-foreground focus:outline-none focus:border-red-500 transition-colors"
                    />

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleKeyVisibility(court.id)}
                        className="p-1 text-foreground/40 hover:text-foreground transition-colors"
                        title={isKeyVisible ? 'Hide stream key' : 'Show stream key'}
                      >
                        {isKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      {court.streamKey && (
                        <button
                          type="button"
                          onClick={() => handleCopy(court.streamKey || '')}
                          className="p-1 text-foreground/40 hover:text-foreground transition-colors"
                          title="Copy stream key"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-foreground/40 leading-relaxed">
                    Paste this into OBS Studio, Prism Live, or your RTMP broadcaster software to stream this court's camera with the live Athlon scoreboard overlay.
                  </p>
                </div>
              ) : (
                <div
                  className="p-3.5 rounded-xl border flex items-center gap-2.5 text-xs text-foreground/60"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                >
                  <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Audience and players will see real-time point-by-point digital scoreboards for this court without requiring a video stream.
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveCourt(court.id)}
                  disabled={isCourtSaving}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Saved Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isCourtSaving ? 'Saving...' : 'Save Configuration'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── STREAM SETUP GUIDE BOX ───────────────────────────────────── */}
      <div
        className="p-5 rounded-2xl border shadow-md space-y-3"
        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
      >
        <h3 className="text-xs font-black uppercase tracking-widest text-foreground/50 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          How to Stream with OBS & Athlon Score Overlay
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div
            className="p-3 rounded-xl border space-y-1"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
          >
            <span className="font-extrabold text-foreground block">1. Get YouTube Stream Key</span>
            <p className="text-[11px] text-foreground/60 leading-relaxed">
              Create a live stream in YouTube Studio and copy your Stream Key into the court box above.
            </p>
          </div>

          <div
            className="p-3 rounded-xl border space-y-1"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
          >
            <span className="font-extrabold text-foreground block">2. Add Browser Overlay</span>
            <p className="text-[11px] text-foreground/60 leading-relaxed">
              In OBS Studio, add a Browser Source with your Athlon court scoreboard URL.
            </p>
          </div>

          <div
            className="p-3 rounded-xl border space-y-1"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
          >
            <span className="font-extrabold text-foreground block">3. Start Broadcast</span>
            <p className="text-[11px] text-foreground/60 leading-relaxed">
              Start streaming in OBS. The scoreboard will automatically update in real-time as the umpire scores points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
