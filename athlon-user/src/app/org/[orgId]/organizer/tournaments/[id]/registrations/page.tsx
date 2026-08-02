'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search, CheckCircle2, Clock, Download } from 'lucide-react';

const mockRegistrations = [
  { 
    id: 'REG-001', 
    category: "Men's Singles", 
    date: 'Oct 01, 2024', 
    status: 'Paid', 
    amount: '₹500',
    players: [
      { name: 'Arjun M', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }
    ]
  },
  { 
    id: 'REG-002', 
    category: "Men's Singles", 
    date: 'Oct 02, 2024', 
    status: 'Pending', 
    amount: '₹500',
    players: [
      { name: 'Siva K', photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop' }
    ]
  },
  { 
    id: 'REG-003', 
    category: "Men's Singles", 
    date: 'Oct 02, 2024', 
    status: 'Paid', 
    amount: '₹500',
    players: [
      { name: 'Rahul R', photo: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop' }
    ]
  },
  { 
    id: 'REG-005', 
    category: "Mixed Doubles", 
    date: 'Oct 03, 2024', 
    status: 'Paid', 
    amount: '₹800',
    players: [
      { name: 'Priya S', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
      { name: 'Rahul R', photo: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop' }
    ]
  },
  { 
    id: 'REG-006', 
    category: "Men's Doubles", 
    date: 'Oct 04, 2024', 
    status: 'Pending', 
    amount: '₹800',
    players: [
      { name: 'Vikram S', photo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' },
      { name: 'Arjun M', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }
    ]
  },
];

export default function TournamentRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [registrations, setRegistrations] = useState(mockRegistrations);
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  const togglePaymentStatus = (regId: string) => {
    setRegistrations(registrations.map(reg => {
      if (reg.id === regId) {
        return { ...reg, status: reg.status === 'Paid' ? 'Pending' : 'Paid' };
      }
      return reg;
    }));
  };

  const filteredRegistrations = registrations.filter(reg => 
    filter === 'All' ? true : reg.status === filter
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col h-full pb-24 md:pb-0">
      
      {/* Header */}
      <header className="p-4 md:px-8 md:py-6 border-b border-foreground/5 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/organizer/tournaments/${id}`} className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide">Registrations</h1>
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Manage entries & fees</span>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-foreground/40" />
              </div>
              <input 
                type="text" 
                placeholder="Search player name or ID..." 
                className="w-full bg-surface border border-foreground/10 rounded-xl py-2 pl-9 pr-4 text-sm font-bold focus:outline-none focus:border-[#1B9C56] transition-colors"
              />
            </div>
            <button className="flex items-center justify-center p-2 md:px-4 md:py-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shrink-0">
              <Download className="w-4 h-4" /> <span className="hidden md:inline ml-2">Export CSV</span>
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['All', 'Paid', 'Pending'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors shrink-0 ${
                  filter === f 
                    ? 'bg-[#1B9C56] text-black shadow-md' 
                    : 'bg-surface border border-foreground/10 text-foreground/60 hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content (Cards Grid) */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        
        {filteredRegistrations.length === 0 && (
          <div className="p-8 text-center text-foreground/50 font-bold bg-surface border border-foreground/10 rounded-2xl">
            No registrations found matching the filter.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredRegistrations.map((reg) => (
            <div key={reg.id} className="bg-surface border border-foreground/10 rounded-2xl overflow-hidden hover:border-[#1B9C56]/50 transition-colors group flex flex-col">
              
              {/* Card Header (Category & Date) */}
              <div className="bg-foreground/5 p-4 flex justify-between items-center border-b border-foreground/5">
                <span className="text-xs font-black uppercase tracking-widest text-foreground/70">{reg.category}</span>
                <span className="text-[10px] font-bold text-foreground/40">{reg.date}</span>
              </div>

              {/* Card Body (Players) */}
              <div className="p-5 flex-1 flex flex-col gap-4 justify-center relative">
                <div className="absolute top-2 right-4 text-[10px] font-black text-foreground/20 uppercase tracking-widest">
                  {reg.id}
                </div>
                
                {reg.players.length === 1 ? (
                  /* Single Player Layout */
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-foreground/10 mb-3 relative">
                      <Image src={reg.players[0].photo} alt={reg.players[0].name} fill className="object-cover" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight">{reg.players[0].name}</h3>
                  </div>
                ) : (
                  /* Doubles / Multiple Players Layout */
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-center -space-x-4">
                      {reg.players.map((player, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-full overflow-hidden border-2 border-surface relative z-10 hover:z-20 transition-transform hover:scale-110">
                          <Image src={player.photo} alt={player.name} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <h3 className="text-base font-black tracking-tight">
                        {reg.players.map(p => p.name).join(' & ')}
                      </h3>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer (Amount & Toggle) */}
              <div className="p-4 border-t border-foreground/5 flex items-center justify-between bg-background/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-0.5">Amount</span>
                  <span className="text-sm font-black text-foreground/80">{reg.amount}</span>
                </div>
                
                <button 
                  onClick={() => togglePaymentStatus(reg.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                    reg.status === 'Paid' 
                      ? 'bg-[#1B9C56] text-black shadow-[0_4px_15px_rgba(27,156,86,0.3)]' 
                      : 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                  }`}
                >
                  {reg.status === 'Paid' ? (
                    <><CheckCircle2 className="w-4 h-4" /> Paid</>
                  ) : (
                    <><Clock className="w-4 h-4" /> Pending</>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
