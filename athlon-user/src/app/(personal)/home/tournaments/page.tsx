import Link from 'next/link';
import { Calendar, MapPin, Users, Trophy, ArrowRight, Search, Filter } from 'lucide-react';

const mockTournaments = [
  {
    id: 1,
    name: 'Summer Smash 2024',
    date: 'Oct 15 - Oct 17, 2024',
    location: 'Chennai Sports Club',
    categories: ['Men\'s Singles', 'Women\'s Singles', 'Mixed Doubles'],
    prizePool: '₹50,000',
    registrations: '120/150',
    status: 'Registering',
    lastDate: 'Oct 10, 2024',
  },
  {
    id: 2,
    name: 'State Level Badminton Championship',
    date: 'Nov 05 - Nov 07, 2024',
    location: 'Kochi Indoor Stadium',
    categories: ['Men\'s Doubles', 'Women\'s Doubles'],
    prizePool: '₹1,00,000',
    registrations: '45/64',
    status: 'Registering',
    lastDate: 'Oct 25, 2024',
  },
  {
    id: 3,
    name: 'Weekend Warriors Open',
    date: 'Dec 12 - Dec 13, 2024',
    location: 'Bangalore Arena',
    categories: ['Men\'s Singles'],
    prizePool: '₹25,000',
    registrations: '64/64',
    status: 'Full',
    lastDate: 'Dec 01, 2024',
  }
];

export default function TournamentsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* Header */}
      <header className="p-4 md:px-8 md:py-6 border-b border-foreground/5 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wide">Tournaments</h1>
            <p className="text-foreground/50 font-bold mt-1 text-sm">Find and register for upcoming events.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-foreground/40" />
              </div>
              <input 
                type="text" 
                placeholder="Search tournaments..." 
                className="w-full bg-background border border-foreground/10 rounded-xl py-2 pl-9 pr-4 text-sm font-bold focus:outline-none focus:border-[#1B9C56] transition-colors"
              />
            </div>
            <button className="p-2 border border-foreground/10 rounded-xl hover:bg-foreground/5 transition-colors shrink-0">
              <Filter className="w-5 h-5 text-foreground/70" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockTournaments.map((tournament) => (
            <div key={tournament.id} className="bg-surface border border-foreground/10 rounded-2xl overflow-hidden hover:border-[#1B9C56]/50 transition-colors group flex flex-col">
              
              {/* Card Banner */}
              <div className="h-32 bg-foreground/5 relative flex items-end p-4">
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                <div className="relative z-10 w-full flex justify-between items-end">
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-background/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-foreground/10">
                      {tournament.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#1B9C56] bg-[#1B9C56]/10 px-2 py-1 rounded text-xs font-bold border border-[#1B9C56]/20">
                    <Trophy className="w-3.5 h-3.5" /> {tournament.prizePool}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-[#1B9C56] transition-colors">{tournament.name}</h3>
                
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-start gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-foreground/40 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">{tournament.date}</p>
                      <p className="text-xs text-foreground/50 mt-0.5">Closes: {tournament.lastDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-foreground/40 shrink-0 mt-0.5" />
                    <p className="font-bold text-foreground/70">{tournament.location}</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Users className="w-4 h-4 text-foreground/40 shrink-0 mt-0.5" />
                    <p className="font-bold text-foreground/70">{tournament.registrations} Registered</p>
                  </div>
                </div>

                {/* Categories Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {tournament.categories.map(cat => (
                    <span key={cat} className="text-[10px] font-bold text-foreground/60 bg-foreground/5 px-2 py-1 rounded">
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Action */}
                {tournament.status === 'Full' ? (
                  <button 
                    disabled
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wide transition-all bg-foreground/5 text-foreground/30 cursor-not-allowed"
                  >
                    Registration Closed
                  </button>
                ) : (
                  <Link 
                    href={`/player/tournaments/${tournament.id}`}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wide transition-all bg-[#1B9C56] text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_5px_20px_rgba(27,156,86,0.2)]"
                  >
                    View & Register <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
