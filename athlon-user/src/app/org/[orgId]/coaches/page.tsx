'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Search, Plus, Filter, MoreVertical, Star, Activity, Award, UserPlus, Phone } from 'lucide-react';

const MOCK_COACHES = [
  { id: '1', name: 'Vikram Singh', sport: 'Badminton', level: 'Head Coach', activeBatches: 4, rating: 4.8, status: 'Active', phone: '+91 98765 43210' },
  { id: '2', name: 'Priya Patel', sport: 'Tennis', level: 'Senior Coach', activeBatches: 3, rating: 4.9, status: 'Active', phone: '+91 87654 32109' },
  { id: '3', name: 'Amit Kumar', sport: 'Badminton', level: 'Assistant Coach', activeBatches: 2, rating: 4.5, status: 'On Leave', phone: '+91 76543 21098' },
  { id: '4', name: 'Rohan Sharma', sport: 'Swimming', level: 'Senior Coach', activeBatches: 5, rating: 4.7, status: 'Active', phone: '+91 65432 10987' },
];

export default function CoachesPage() {
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const [searchTerm, setSearchTerm] = useState('');

  if (!org) return null;

  const filteredCoaches = MOCK_COACHES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.sport.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Coaching Staff</h1>
          <p className="text-foreground/50 font-medium mt-1">Manage coaches, monitor performance, and assign batches for {org.name}.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
            <UserPlus className="w-4 h-4" /> Add Coach
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-foreground/5 p-4 rounded-2xl shadow-sm">
          <div className="text-foreground/50 text-xs font-bold uppercase tracking-widest mb-1">Total Coaches</div>
          <div className="text-2xl font-black text-foreground">12</div>
        </div>
        <div className="bg-surface border border-foreground/5 p-4 rounded-2xl shadow-sm">
          <div className="text-green-500/80 text-xs font-bold uppercase tracking-widest mb-1">Active Batches</div>
          <div className="text-2xl font-black text-foreground">24</div>
        </div>
        <div className="bg-surface border border-foreground/5 p-4 rounded-2xl shadow-sm">
          <div className="text-yellow-500/80 text-xs font-bold uppercase tracking-widest mb-1">Avg Rating</div>
          <div className="text-2xl font-black text-foreground flex items-center gap-2">
            4.8 <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          </div>
        </div>
        <div className="bg-surface border border-foreground/5 p-4 rounded-2xl shadow-sm">
          <div className="text-blue-500/80 text-xs font-bold uppercase tracking-widest mb-1">On Leave</div>
          <div className="text-2xl font-black text-foreground">2</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface border border-foreground/5 rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search coaching staff by name or sport..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-foreground/10 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoaches.map((coach) => (
          <div key={coach.id} className="bg-surface border border-foreground/5 rounded-[24px] p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            
            {/* Status Badge */}
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[10px] font-black uppercase tracking-widest ${
              coach.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
            }`}>
              {coach.status}
            </div>

            <div className="flex items-start gap-4 mb-6 mt-2">
              <div className="w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground font-bold text-xl shrink-0">
                {coach.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground leading-tight mb-1">{coach.name}</h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/50">
                  <Award className="w-3.5 h-3.5" /> {coach.level}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background border border-foreground/5 rounded-xl p-3">
                <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Sport</div>
                <div className="font-bold text-sm text-foreground">{coach.sport}</div>
              </div>
              <div className="bg-background border border-foreground/5 rounded-xl p-3">
                <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Batches</div>
                <div className="font-bold text-sm text-foreground">{coach.activeBatches} Active</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-foreground/10">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-sm text-foreground">{coach.rating}</span>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors" title="Contact">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors" title="Options">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            
          </div>
        ))}
      </div>
      
      {filteredCoaches.length === 0 && (
        <div className="bg-surface border border-foreground/5 rounded-2xl p-12 text-center">
          <div className="text-foreground/40 font-medium">No coaches found.</div>
        </div>
      )}
      
    </div>
  );
}