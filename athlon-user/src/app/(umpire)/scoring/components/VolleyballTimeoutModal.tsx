import React, { useState, useEffect } from 'react';
import { useVolleyballStore, Team } from '../../../../lib/store/useVolleyballStore';
import { X } from 'lucide-react';

interface VolleyballTimeoutModalProps {
  matchId: string;
  isOpen: boolean;
  onClose: () => void;
  team: Team;
}

export default function VolleyballTimeoutModal({ matchId, isOpen, onClose, team }: VolleyballTimeoutModalProps) {
  const store = useVolleyballStore();
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(30);
      store.addTimeout(team);
    }
  }, [isOpen, team]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const teamName = team === 'A' ? store.config?.teamA : store.config?.teamB;
  const timeoutsUsed = team === 'A' ? store.timeoutsA : store.timeoutsB;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2C2C2E] border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-sm font-black text-white/90">
            timeout — {teamName}
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="text-7xl font-black text-white tracking-tighter tabular-nums">
            0:{timeLeft.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-white/50 font-bold">
            timeout {timeoutsUsed} of 2 · set {store.currentSet}
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#1C1C1E] border border-white/10 text-white/70 py-4 rounded-xl text-sm font-bold hover:bg-[#2C2C2E] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white text-black py-4 rounded-xl text-sm font-black hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            End Timeout
          </button>
        </div>
      </div>
    </div>
  );
}
