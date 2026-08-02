'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Users, Trophy, ChevronRight, CheckCircle2 } from 'lucide-react';

const mockTournament = {
  id: 1,
  name: 'Summer Smash 2024',
  date: 'Oct 15 - Oct 17, 2024',
  location: 'Chennai Sports Club',
  categories: ['Men\'s Singles', 'Women\'s Singles', 'Mixed Doubles'],
  prizePool: '₹50,000',
  registrations: '120/150',
  entryFee: 500,
  description: 'Join the biggest badminton tournament of the summer! Open to all skill levels. Exciting prizes and merchandise for all participants.'
};

export default function PlayerTournamentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setIsRegistered(true);
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center p-8">
        <div className="bg-surface border border-foreground/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#1B9C56]" />
          <div className="w-20 h-20 bg-[#1B9C56]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#1B9C56]" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Registration Confirmed!</h2>
          <p className="text-foreground/50 mb-8">
            You have successfully registered for {mockTournament.name} in {selectedCategory}.
          </p>
          <Link 
            href="/player/tournaments"
            className="block w-full py-3 bg-[#1B9C56] text-black font-black uppercase tracking-wide rounded-xl hover:scale-105 active:scale-95 transition-transform"
          >
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* Header Banner */}
      <div className="relative h-48 md:h-64 bg-foreground/5">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
        <Link href="/player/tournaments" className="absolute top-6 left-4 md:left-8 z-20 p-2 bg-background/50 backdrop-blur-md border border-foreground/10 rounded-full text-foreground/70 hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <main className="max-w-3xl mx-auto px-4 md:px-8 -mt-24 relative z-20">
        
        {/* Tournament Info */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#1B9C56]/20 text-[#1B9C56] px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-[#1B9C56]/30">
              Registering
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">{mockTournament.name}</h1>
          <p className="text-foreground/60 text-sm leading-relaxed mb-6">
            {mockTournament.description}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface border border-foreground/10 rounded-xl p-4">
              <Calendar className="w-5 h-5 text-[#1B9C56] mb-2" />
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm font-bold truncate">{mockTournament.date}</p>
            </div>
            <div className="bg-surface border border-foreground/10 rounded-xl p-4">
              <MapPin className="w-5 h-5 text-[#1B9C56] mb-2" />
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm font-bold truncate">{mockTournament.location}</p>
            </div>
            <div className="bg-surface border border-foreground/10 rounded-xl p-4">
              <Trophy className="w-5 h-5 text-[#1B9C56] mb-2" />
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Prize Pool</p>
              <p className="text-sm font-bold truncate">{mockTournament.prizePool}</p>
            </div>
            <div className="bg-surface border border-foreground/10 rounded-xl p-4">
              <Users className="w-5 h-5 text-[#1B9C56] mb-2" />
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Entries</p>
              <p className="text-sm font-bold truncate">{mockTournament.registrations}</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-surface border border-foreground/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-xl font-black uppercase tracking-wide mb-6 flex items-center gap-2">
            Registration Form <ChevronRight className="w-5 h-5 text-[#1B9C56]" />
          </h2>

          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Category Selection */}
            <div>
              <label className="block text-xs font-black text-foreground/50 uppercase tracking-widest mb-3">
                Select Category
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {mockTournament.categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                      selectedCategory === cat 
                        ? 'bg-[#1B9C56]/10 border-[#1B9C56] text-[#1B9C56]'
                        : 'bg-background border-foreground/10 text-foreground/70 hover:border-foreground/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Doubles Partner Input (Conditional) */}
            {selectedCategory.includes('Doubles') && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-black text-foreground/50 uppercase tracking-widest mb-2">
                  Partner Name / ID
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter your partner's name or Athlon ID"
                  className="w-full bg-background border border-foreground/10 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#1B9C56] transition-colors"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-foreground/50 uppercase tracking-widest mb-2">
                  Player Name
                </label>
                <input 
                  type="text" 
                  defaultValue="Alex Johnson"
                  disabled
                  className="w-full bg-foreground/5 border border-transparent rounded-xl py-3 px-4 text-sm font-bold text-foreground/50 cursor-not-allowed"
                />
                <p className="text-[10px] text-foreground/40 mt-1">Loaded from your profile</p>
              </div>
              <div>
                <label className="block text-xs font-black text-foreground/50 uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  required
                  placeholder="+91 "
                  className="w-full bg-background border border-foreground/10 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#1B9C56] transition-colors"
                />
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mt-8 pt-6 border-t border-foreground/10">
              <button 
                type="submit"
                disabled={!selectedCategory}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-base font-black uppercase tracking-widest transition-all ${
                  selectedCategory 
                    ? 'bg-[#1B9C56] text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(27,156,86,0.3)]'
                    : 'bg-foreground/5 text-foreground/30 cursor-not-allowed'
                }`}
              >
                Register
              </button>
            </div>

          </form>
        </div>

      </main>
    </div>
  );
}
