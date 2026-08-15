"use client";

import React, { useState, useEffect } from "react";
import { Camera, Save, Plus, Trash2, Edit2, Wifi, WifiOff, PlayCircle, Activity } from "lucide-react";

import { TournamentService } from "@/lib/api/tournaments";
import { StreamConfigService, CourtConfig } from "@/lib/api/tournaments";

interface LiveStreamSettingsProps {
  tournamentId: string;
  tournamentName?: string;
}

export function LiveStreamSettings({ tournamentId, tournamentName }: LiveStreamSettingsProps) {
  const [courts, setCourts] = useState<CourtConfig[]>([]);
  const [editingCourts, setEditingCourts] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setIsLoading(true);
        const tRes = await TournamentService.getById(tournamentId);
        if (tRes && tRes.data && tRes.data.tournamentUuid) {
          const fetchedCourts = await StreamConfigService.getByTournament(tRes.data.tournamentUuid);
          if (fetchedCourts.length > 0) {
            setCourts(fetchedCourts);
          } else {
            const newId = Date.now();
            setCourts([{ id: newId, name: 'Court 1', streamKey: '', enableStream: false }]);
            setEditingCourts(new Set([newId]));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfigs();
  }, [tournamentId]);

  const handleUpdateCourt = (id: number, field: keyof CourtConfig, value: any) => {
    setCourts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleAddCourt = () => {
    const newId = Date.now();
    setCourts(prev => [
      ...prev,
      { id: newId, name: `Court ${prev.length + 1}`, streamKey: '', enableStream: false }
    ]);
    setEditingCourts(prev => new Set(prev).add(newId));
  };

  const handleRemoveCourt = (id: number) => {
    setCourts(prev => prev.filter(c => c.id !== id));
  };

  const handleEditCourt = (id: number) => {
    setEditingCourts(prev => new Set(prev).add(id));
  };

  const handleSaveCourt = async (id: number) => {
    try {
      const tRes = await TournamentService.getById(tournamentId);
      if (tRes && tRes.data && tRes.data.tournamentUuid) {
        const savedCourts = await StreamConfigService.saveConfigs(tRes.data.tournamentUuid, courts);
        setCourts(savedCourts); 
        setEditingCourts(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save stream configurations.");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading configurations...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3 border border-primary/20">
            <Camera className="w-3.5 h-3.5" />
            Live Stream & Scoring Setup
          </div>
          {tournamentName && (
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              {tournamentName}
            </h1>
          )}
          <p className="text-text-muted mt-2">Configure courts for live scoring and optional YouTube streaming.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddCourt}
            className="bg-surface hover:bg-background border border-border text-foreground font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Court
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courts.map((court, index) => {
          const isEditing = editingCourts.has(court.id);
          
          return (
            <div key={court.id} className="bg-surface-elevated border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-xl relative overflow-hidden group">
              {/* Accent Line - changes color based on stream mode */}
              <div className={`absolute top-0 left-0 w-1 h-full ${court.enableStream ? 'bg-red-500/70' : 'bg-primary/50'}`}></div>
              
              {/* Header */}
              <div className="flex flex-col gap-3 border-b border-border/50 pb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm shrink-0">
                      {index + 1}
                    </span>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={court.name}
                        onChange={(e) => handleUpdateCourt(court.id, 'name', e.target.value)}
                        className="bg-transparent border-none text-lg font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 min-w-0 w-full"
                        placeholder="Court Name"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-foreground px-1 truncate">{court.name}</h3>
                    )}
                  </div>

                  <button 
                    onClick={() => handleRemoveCourt(court.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    title="Remove Court"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Mode Badge - separate row */}
                <div className="pl-11">
                  {court.enableStream ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
                      <PlayCircle className="w-3 h-3" />
                      Video + Score
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                      <Activity className="w-3 h-3" />
                      Score Only
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4 pt-2">
                {/* YouTube Broadcast Toggle */}
                {isEditing && (
                  <div className="flex items-center justify-between p-3 bg-background/50 border border-border/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {court.enableStream ? (
                        <Wifi className="w-4 h-4 text-red-400" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-text-muted" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">YouTube Broadcast</p>
                        <p className="text-[11px] text-text-muted">
                          {court.enableStream ? 'Video stream + live score overlay' : 'Live score updates only'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateCourt(court.id, 'enableStream', !court.enableStream)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        court.enableStream ? 'bg-red-500' : 'bg-border'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          court.enableStream ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Stream Key - only shown if broadcast is enabled */}
                {court.enableStream && (
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">YouTube Stream Key</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={court.streamKey}
                        onChange={e => handleUpdateCourt(court.id, 'streamKey', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground outline-none focus:border-primary transition-colors font-mono text-sm"
                        placeholder="xxxx-xxxx-xxxx-xxxx-xxxx"
                      />
                    ) : (
                      <div className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 text-foreground font-mono text-sm opacity-80 truncate">
                        {court.streamKey || 'No stream key configured'}
                      </div>
                    )}
                  </div>
                )}

                {/* Score Only Info - shown when broadcast is disabled and not editing */}
                {!court.enableStream && !isEditing && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                    <Activity className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-xs text-text-muted">This court is configured for <span className="text-primary font-semibold">live score only</span>. Audience will see a digital scoreboard.</p>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-border/50">
                {isEditing ? (
                  <button 
                    onClick={() => handleSaveCourt(court.id)}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" /> Save Configuration
                  </button>
                ) : (
                  <button 
                    onClick={() => handleEditCourt(court.id)}
                    className="w-full py-3 bg-surface hover:bg-background text-foreground font-semibold rounded-lg border border-border transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-5 h-5" /> Edit Configuration
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {courts.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-background/50 border border-dashed border-border/50 rounded-2xl">
            <Camera className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium mb-4">No courts configured yet</p>
            <button 
              onClick={handleAddCourt}
              className="bg-primary text-black px-4 py-2 rounded-lg font-bold shadow-md shadow-primary/20"
            >
              Add Your First Court
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
