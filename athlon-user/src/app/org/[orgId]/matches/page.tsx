'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Search, Plus, Filter, Calendar, MapPin, Clock, Trophy, MoreVertical, Shield } from 'lucide-react';

const MOCK_MATCHES = [
  { id: '1', title: 'Internal Sparring - Advanced', date: 'Aug 14, 2026', time: '17:00', court: 'Court 1', type: 'Friendly', status: 'Upcoming', player1: 'Aarav Patel', player2: 'Riya Sharma', score: null },
  { id: '2', title: 'Weekend Challenge', date: 'Aug 15, 2026', time: '10:00', court: 'Court 2', type: 'Challenge', status: 'Upcoming', player1: 'Kabir Singh', player2: 'Aryan Reddy', score: null },
  { id: '3', title: 'Monthly Assessment Match', date: 'Aug 10, 2026', time: '16:00', court: 'Center Court', type: 'Ranked', status: 'Completed', player1: 'Riya Sharma', player2: 'Neha Gupta', score: '2-1 (21-15, 18-21, 21-19)' },
  { id: '4', title: 'Exhibition Game', date: 'Aug 08, 2026', time: '18:30', court: 'Court 1', type: 'Friendly', status: 'Completed', player1: 'Vikram Singh (Coach)', player2: 'Aryan Reddy', score: '2-0 (21-10, 21-12)' },
];

export default function MatchesPage() {
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Completed'>('Upcoming');
  const [searchTerm, setSearchTerm] = useState('');

  if (!org) return null;

  const filteredMatches = MOCK_MATCHES.filter(m => 
    m.status === activeTab && 
    (m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     m.player1.toLowerCase().includes(searchTerm.toLowerCase()) || 
     m.player2.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Friendly Matches</h1>
          <p className="text-foreground/50 font-medium mt-1">Schedule and monitor internal matches and challenges for {org.name}.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B9C56] text-black text-sm font-black tracking-wide hover:bg-[#158045] transition-colors shadow-lg shadow-[#1B9C56]/20">
            <Plus className="w-4 h-4" /> Schedule Match
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Custom Tabs */}
        <div className="flex bg-surface border border-foreground/5 p-1 rounded-xl w-full sm:w-auto shrink-0 shadow-sm">
          <button 
            onClick={() => setActiveTab('Upcoming')}
            className={`flex-1 sm:px-8 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'Upcoming' ? 'bg-background text-foreground shadow border border-foreground/5' : 'text-foreground/50 hover:text-foreground'
            }`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setActiveTab('Completed')}
            className={`flex-1 sm:px-8 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'Completed' ? 'bg-background text-foreground shadow border border-foreground/5' : 'text-foreground/50 hover:text-foreground'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-grow max-w-md w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search matches or players..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-foreground/5 rounded-xl pl-12 pr-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMatches.map((match) => (
          <div key={match.id} className="bg-surface border border-foreground/5 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            
            {/* Match Header */}
            <div className="p-5 border-b border-foreground/5 bg-foreground/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                  match.type === 'Ranked' ? 'bg-purple-500/10 text-purple-500' : 
                  match.type === 'Challenge' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {match.type}
                </span>
                <h3 className="font-bold text-foreground text-sm">{match.title}</h3>
              </div>
              <button className="text-foreground/40 hover:text-foreground transition-colors p-1">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Match Content */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
                
                {/* Player 1 */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center text-foreground font-black text-xl mb-3 shadow-inner">
                    {match.player1.charAt(0)}
                  </div>
                  <div className="font-bold text-foreground text-center">{match.player1}</div>
                </div>

                {/* VS Badge & Score */}
                <div className="flex flex-col items-center justify-center px-4 shrink-0 relative z-10">
                  {match.status === 'Completed' ? (
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#1B9C56] mb-1">{match.score?.split(' ')[0]}</div>
                      <div className="text-xs font-bold text-foreground/50">{match.score?.split(' ')[1]}</div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-background border border-foreground/10 flex items-center justify-center text-foreground/40 font-black italic text-sm shadow-sm">
                      VS
                    </div>
                  )}
                </div>

                {/* Player 2 */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center text-foreground font-black text-xl mb-3 shadow-inner">
                    {match.player2.charAt(0)}
                  </div>
                  <div className="font-bold text-foreground text-center">{match.player2}</div>
                </div>
                
              </div>
            </div>

            {/* Match Footer */}
            <div className="p-4 bg-background border-t border-foreground/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {match.date}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {match.time}</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {match.court}</div>
              </div>
              
              {match.status === 'Upcoming' && (
                <button className="px-4 py-1.5 rounded-lg bg-[#1B9C56]/10 text-[#1B9C56] text-xs font-black uppercase tracking-widest hover:bg-[#1B9C56]/20 transition-colors">
                  Start Match
                </button>
              )}
            </div>
            
          </div>
        ))}
      </div>
      
      {filteredMatches.length === 0 && (
        <div className="bg-surface border border-foreground/5 rounded-[24px] p-12 text-center shadow-sm">
          <Trophy className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No Matches Found</h3>
          <p className="text-foreground/50 text-sm">There are no {activeTab.toLowerCase()} matches matching your criteria.</p>
        </div>
      )}
      
    </div>
  );
}