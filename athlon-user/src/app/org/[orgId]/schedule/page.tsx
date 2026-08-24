'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const MOCK_SCHEDULE = [
  { id: '1', title: 'Morning Advanced Batch', time: '06:00 AM - 08:00 AM', coach: 'Coach Vikram', court: 'Court 1', type: 'Training', capacity: '12/15' },
  { id: '2', title: 'Beginner Kids Session', time: '04:00 PM - 05:30 PM', coach: 'Coach Priya', court: 'Court 3', type: 'Class', capacity: '20/20' },
  { id: '3', title: 'Elite Sparing', time: '06:00 PM - 08:00 PM', coach: 'Coach Amit', court: 'Court 1 & 2', type: 'Match Practice', capacity: '8/10' },
  { id: '4', title: 'Fitness & Conditioning', time: '08:00 PM - 09:00 PM', coach: 'Coach Vikram', court: 'Gym Area', type: 'Fitness', capacity: '15/25' },
];

export default function SchedulePage() {
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const [selectedDate, setSelectedDate] = useState('Today, 12 Aug');

  if (!org) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Schedule & Training</h1>
          <p className="text-foreground/50 font-medium mt-1">Manage classes, batches, and court allocations for {org.name}.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Create Session
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-foreground/5 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground/70" />
          </button>
          <div className="flex items-center gap-2 font-black text-lg text-foreground min-w-[140px] justify-center">
            <CalendarIcon className="w-5 h-5 text-primary" />
            {selectedDate}
          </div>
          <button className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors">
            <ChevronRight className="w-5 h-5 text-foreground/70" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-foreground/5 text-xs font-bold text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-colors">Month</button>
          <button className="px-4 py-2 rounded-lg bg-foreground text-xs font-bold text-background shadow-sm">Week</button>
          <button className="px-4 py-2 rounded-lg bg-foreground/5 text-xs font-bold text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-colors">Day</button>
          <div className="w-px h-6 bg-foreground/10 mx-2"></div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/10 text-xs font-bold text-foreground/70 hover:bg-foreground/5 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>

      {/* Schedule Timeline / List */}
      <div className="grid grid-cols-1 gap-4">
        {MOCK_SCHEDULE.map((session) => (
          <div key={session.id} className="bg-surface border border-foreground/5 rounded-[24px] p-6 flex flex-col md:flex-row md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow group">
            
            {/* Time Block */}
            <div className="md:w-48 shrink-0 flex flex-col justify-center border-l-4 border-primary pl-4">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-1">Time</span>
              <div className="font-black text-foreground">{session.time.split(' - ')[0]}</div>
              <div className="text-sm font-medium text-foreground/60">{session.time.split(' - ')[1]}</div>
            </div>

            {/* Details Block */}
            <div className="flex-grow flex flex-col justify-center border-t md:border-t-0 md:border-l border-foreground/10 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500">
                  {session.type}
                </span>
                {session.capacity.split('/')[0] === session.capacity.split('/')[1] && (
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500">
                    Full
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-foreground mb-3">{session.title}</h3>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-foreground/70">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-foreground/40" /> {session.coach}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-foreground/40" /> {session.court}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-foreground/40" /> {session.capacity} Booked
                </div>
              </div>
            </div>

            {/* Actions Block */}
            <div className="shrink-0 flex md:flex-col gap-2 border-t md:border-t-0 border-foreground/10 pt-4 md:pt-0">
              <button className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.08] text-sm font-bold text-foreground transition-colors border border-transparent hover:border-foreground/10">
                Edit Details
              </button>
              <button className="flex-1 md:flex-none px-4 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary/10 transition-colors">
                View Roster
              </button>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
