import Link from 'next/link';
import { Calendar, MapPin, CheckCircle2, ArrowLeft, Trophy } from 'lucide-react';

const registeredTournaments = [
  {
    id: 1,
    name: 'Summer Smash 2024',
    date: 'Oct 15 - Oct 17, 2024',
    location: 'Chennai Sports Club',
    category: "Men's Singles",
    registrationDate: 'Oct 01, 2024',
    status: 'Confirmed',
    amountPaid: '₹500',
  },
  {
    id: 2,
    name: 'Weekend Warriors Open',
    date: 'Dec 12 - Dec 13, 2024',
    location: 'Bangalore Arena',
    category: "Men's Singles",
    registrationDate: 'Sep 25, 2024',
    status: 'Confirmed',
    amountPaid: '₹250',
  }
];

export default function RegisteredTournamentsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* Header */}
      <header className="p-4 md:px-8 md:py-6 border-b border-foreground/5 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/player" className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide">Registered</h1>
        </div>
        <p className="text-foreground/50 font-bold text-sm ml-10">Track the tournaments you've signed up for.</p>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-4 mt-2">
        {registeredTournaments.length > 0 ? (
          registeredTournaments.map((tournament) => (
            <div key={tournament.id} className="bg-surface border border-foreground/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#1B9C56]/50 transition-colors group">
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-[#1B9C56]/10 text-[#1B9C56] border border-[#1B9C56]/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {tournament.status}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 bg-foreground/5 px-2 py-1 rounded-md border border-foreground/5">
                    {tournament.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-black uppercase tracking-tight mb-3 group-hover:text-[#1B9C56] transition-colors">
                  {tournament.name}
                </h3>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-foreground/60">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {tournament.date}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {tournament.location}</div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center justify-between md:items-end pt-4 md:pt-0 border-t border-foreground/5 md:border-none shrink-0 md:min-w-[150px]">
                <div className="flex flex-col md:items-end">
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Registered On</span>
                  <span className="text-sm font-bold text-foreground/80">{tournament.registrationDate}</span>
                </div>
                <div className="hidden md:block h-px w-full bg-foreground/5 my-3" />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Fee Paid</span>
                  <span className="text-sm font-bold text-[#1B9C56]">{tournament.amountPaid}</span>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="bg-surface/50 border border-foreground/5 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <Trophy className="w-12 h-12 text-foreground/20 mb-4" />
            <h3 className="text-lg font-black uppercase tracking-widest text-foreground/70 mb-2">No Registrations Yet</h3>
            <p className="text-xs font-bold text-foreground/40 max-w-sm mb-6">You haven't registered for any tournaments. Browse the events page to find your next challenge.</p>
            <Link href="/player/tournaments" className="px-6 py-3 bg-[#1B9C56] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform">
              Find Tournaments
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
