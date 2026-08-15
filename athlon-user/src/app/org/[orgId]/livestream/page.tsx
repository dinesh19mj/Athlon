"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, CalendarIcon, MapPinIcon, Loader2Icon, ArrowRightIcon, TrophyIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { TournamentService, Tournament } from "@/lib/api/tournaments";

export default function LiveStreamTournamentsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const router = useRouter();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await TournamentService.getByOrg(orgId);
        if (response && response.data) {
          setTournaments(response.data as Tournament[]);
        }
      } catch (error) {
        console.error("Failed to fetch tournaments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTournaments();
  }, [orgId]);

  return (
    <div className="min-h-screen bg-background pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-card border-b border-border">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-8 py-16 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3 border border-primary/20">
              <Camera className="w-3.5 h-3.5" />
              Live Stream Configuration
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Select Tournament
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Choose a tournament to configure its live stream settings, set up courts, and manage YouTube stream keys.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-10">
        
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-xl border border-border/50">
            {tournaments.length} {tournaments.length === 1 ? 'Tournament' : 'Tournaments'} Available
          </div>
        </div>

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center gap-4">
              <Loader2Icon className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium animate-pulse">Loading tournaments...</p>
            </div>
          ) : tournaments.map((tournament) => (
            <Link
              key={tournament.tournamentUuid}
              href={`/org/${orgId}/livestream/${tournament.tournamentUuid}`}
              className="group flex flex-col bg-card border border-border/60 rounded-[1.5rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(27,156,86,0.2)] hover:border-primary/50 overflow-hidden"
            >
              {/* Poster Header */}
              {tournament.poster ? (
                <div className="w-full relative overflow-hidden bg-secondary aspect-video">
                  <img 
                    src={`http://localhost:5050/api/tournament/tournaments/getFile?filePath=${encodeURIComponent(tournament.poster.startsWith('/') && tournament.poster.includes(':') ? tournament.poster.substring(1) : tournament.poster)}`} 
                    alt={tournament.name} 
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none" />
                  <div className="absolute top-4 right-4 bg-background/40 backdrop-blur-md p-2 rounded-full opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRightIcon className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-xl border ${
                        tournament.status === "ACTIVE"
                          ? "border-primary/40 bg-primary/20 text-primary shadow-[0_0_15px_rgba(27,156,86,0.2)]"
                          : "border-border bg-background/50 text-muted-foreground"
                      }`}
                    >
                      {tournament.status || "DRAFT"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-secondary/80 to-background relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[50px] group-hover:bg-primary/20 transition-colors duration-700" />
                  
                  <div className="absolute top-4 right-4 bg-background/40 backdrop-blur-md p-2 rounded-full opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRightIcon className="w-4 h-4 text-foreground" />
                  </div>

                  <div className="text-muted-foreground/60 font-medium flex flex-col items-center gap-3 relative z-10">
                    <TrophyIcon className="w-10 h-10 opacity-50" />
                    <span className="tracking-wider text-sm uppercase">No Poster</span>
                  </div>
                </div>
              )}

              {/* Details Section */}
              <div className="p-6 flex flex-col flex-grow relative bg-card border-t border-border/40">
                <h3 className="text-xl font-bold text-foreground mb-5 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                  {tournament.name}
                </h3>

                <div className="mt-auto flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1.5 rounded-lg border border-border/50 hover:bg-secondary transition-colors cursor-default">
                    <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {new Date(tournament.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                      {" - "}
                      {new Date(tournament.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1.5 rounded-lg border border-border/50 hover:bg-secondary transition-colors cursor-default">
                    <MapPinIcon className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate max-w-[150px]">{tournament.location}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
