'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Trophy, ActivityIcon, FileText, Phone, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { TournamentService, Tournament } from '@/lib/api/tournaments';

export default function PersonalTournamentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentUuid = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await TournamentService.getById(tournamentUuid);
        if (res.data) {
          setTournament(res.data);
        } else {
          setError("Tournament not found");
        }
      } catch (err: any) {
        console.error("Failed to load tournament details", err);
        setError("Could not load tournament details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [tournamentUuid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1B9C56] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-foreground/50 font-bold tracking-widest uppercase text-sm">Loading details...</p>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Trophy className="w-16 h-16 text-foreground/20 mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Tournament Not Found</h1>
        <p className="text-foreground/50 text-sm mb-6 max-w-sm">{error || "The tournament you are looking for does not exist or has been removed."}</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-surface border border-foreground/10 rounded-xl font-bold text-sm hover:border-[#1B9C56] transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const startDate = new Date(tournament.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const endDate = new Date(tournament.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  // Handle Windows paths that might accidentally have a leading slash (e.g. /C:\...)
  const posterPath = tournament.poster ? tournament.poster.replace(/^\/([a-zA-Z]:)/, '$1') : '';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
  const posterUrl = `${baseUrl}/api/tournament/tournaments/getFile?filePath=${encodeURIComponent(posterPath)}`;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-[#1B9C56] selection:text-black">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-foreground hover:text-[#1B9C56] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold uppercase tracking-wider ml-2 truncate">Tournament Details</h1>
      </header>

      <main className="w-full max-w-2xl mx-auto px-4 flex flex-col gap-6 pt-6">
        
        {/* HERO SECTION */}
        <div className="bg-surface border border-foreground/10 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {tournament.poster && (
            <div className="w-full h-48 md:h-64 relative bg-foreground/5 border-b border-foreground/10">
              <img 
                src={posterUrl} 
                alt={`${tournament.name} Poster`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
            </div>
          )}

          {!tournament.poster && (
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1B9C56]/10 blur-[80px] rounded-full pointer-events-none" />
          )}
          
          <div className="p-6 md:p-8 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-[#1B9C56]/20 text-[#1B9C56] border border-[#1B9C56]/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                {tournament.sport}
              </span>
              <span className="px-3 py-1 bg-foreground/5 text-foreground/70 border border-foreground/10 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <ActivityIcon className="w-3 h-3" />
                {tournament.tournamentType === 'TEAM_EVENT' ? 'Team League' : 'Knockout'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black leading-tight text-foreground mb-4">
              {tournament.name}
            </h1>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 text-foreground/80">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-semibold">{startDate} - {endDate}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground/80">
                <MapPin className="w-5 h-5 text-orange-400 shrink-0" />
                <span className="text-sm font-semibold">{tournament.location || 'Location TBD'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface border border-foreground/10 rounded-2xl p-5 flex flex-col gap-2">
            <DollarSign className="w-6 h-6 text-purple-400 mb-1" />
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Entry Fee</span>
            <span className="text-lg font-black text-foreground">
              {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'Free'}
            </span>
          </div>

          <div className="bg-surface border border-foreground/10 rounded-2xl p-5 flex flex-col gap-2">
            <Users className="w-6 h-6 text-blue-400 mb-1" />
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Match Format</span>
            <div className="flex flex-wrap gap-1">
              {tournament.matchFormat ? tournament.matchFormat.split(',').map((format, i) => (
                <span key={i} className="text-xs font-bold text-foreground bg-background px-2 py-0.5 rounded border border-foreground/10">
                  {format.trim()}
                </span>
              )) : (
                <span className="text-sm font-bold text-foreground">-</span>
              )}
            </div>
          </div>
        </div>

        {/* CATEGORIES SECTION */}
        <div className="bg-surface border border-foreground/10 rounded-2xl p-6">
          <h2 className="text-xs font-black text-foreground/50 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#1B9C56]" />
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {tournament.category ? tournament.category.split(',').map((cat, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-background border border-foreground/10 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B9C56]" />
                <span className="text-sm font-bold text-foreground">{cat.trim()}</span>
              </div>
            )) : (
              <span className="text-sm text-foreground/50">No categories specified</span>
            )}
          </div>
        </div>

        {/* ABOUT / DESCRIPTION */}
        {tournament.description && (
          <div className="bg-surface border border-foreground/10 rounded-2xl p-6">
            <h2 className="text-xs font-black text-foreground/50 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1B9C56]" />
              About Tournament
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {tournament.description}
            </p>
          </div>
        )}

        {/* CONTACT INFO */}
        {(tournament.contactPhone || tournament.mapLink) && (
          <div className="bg-surface border border-foreground/10 rounded-2xl p-6">
            <h2 className="text-xs font-black text-foreground/50 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#1B9C56]" />
              Contact & Location
            </h2>
            <div className="flex flex-col gap-3">
              {tournament.contactPhone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background border border-foreground/10 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-foreground/70" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{tournament.contactPhone}</span>
                </div>
              )}
              {tournament.mapLink && (
                <a href={tournament.mapLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-background border border-foreground/10 flex items-center justify-center group-hover:border-[#1B9C56] transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-foreground/70 group-hover:text-[#1B9C56]" />
                  </div>
                  <span className="text-sm font-bold text-[#1B9C56] group-hover:underline">View on Map</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Sticky Registration Bar */}
        <div className="fixed bottom-20 md:bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-foreground/10 z-50">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Entry Fee</span>
              <span className="text-lg font-black text-[#1B9C56]">
                {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'Free'}
              </span>
            </div>
            <button className="px-8 py-3 bg-[#1B9C56] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_5px_20px_rgba(27,156,86,0.3)] hover:scale-[1.02] active:scale-95 transition-transform">
              Register Now
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
