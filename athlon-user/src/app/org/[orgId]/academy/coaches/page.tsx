'use client';

import { Activity, Plus, MoreVertical, Star } from 'lucide-react';
import Link from 'next/link';

export default function CoachesPage() {
  const coaches = [
    { id: 1, name: 'Vikram Singh', role: 'Head Coach', rating: 4.9, active: true },
    { id: 2, name: 'Priya Sharma', role: 'Assistant Coach', rating: 4.7, active: true },
    { id: 3, name: 'Rahul Desai', role: 'Fitness Trainer', rating: 4.8, active: false },
  ];

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col">
      <div className="p-6 border-b border-foreground/10 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Coaches</h1>
          <p className="text-foreground/50 text-xs font-bold mt-1">Manage academy coaching staff</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-[#F97316] text-foreground shadow-[0_4px_20px_rgba(168,85,247,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 hide-scrollbar">
        {coaches.map((coach) => (
          <div key={coach.id} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-4 shadow-xl flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F97316] to-purple-900 p-[2px]">
                  <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                    <span className="text-[#F97316] font-bold">{coach.name.charAt(0)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{coach.name}</h3>
                  <p className="text-xs text-foreground/50">{coach.role}</p>
                </div>
              </div>
              <button className="text-foreground/40 hover:text-foreground p-1"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="flex justify-between items-center bg-background/50 rounded-xl p-2.5">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-foreground">{coach.rating}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${coach.active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-foreground/5 text-foreground/40 border border-foreground/10'}`}>
                {coach.active ? 'Active' : 'Off-Duty'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
