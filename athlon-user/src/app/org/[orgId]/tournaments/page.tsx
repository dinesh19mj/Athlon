"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusIcon, CalendarIcon, MapPinIcon, TrophyIcon, SearchIcon, ArrowRightIcon, Loader2Icon, PhoneIcon, TagIcon, TicketIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { TournamentService, Tournament } from "@/lib/api/tournaments";

export default function TournamentsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("all");
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

  const filteredTournaments = tournaments.filter((t) => {
    if (activeTab === "all") return true;
    return (t.visibility || "PRIVATE").toLowerCase() === activeTab;
  });

  return (
    <div className="min-h-screen bg-background pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-card border-b border-border">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1B9C56]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-[#1B9C56]/5 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-8 py-16 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B9C56]/10 text-[#1B9C56] text-xs font-semibold mb-3 border border-[#1B9C56]/20">
              <TrophyIcon className="w-3.5 h-3.5" />
              Tournament Management
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Tournaments
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Organize, schedule, and launch your competitions. View detailed analytics and manage your public and private events seamlessly.
            </p>
          </div>
          
          <div className="flex flex-row gap-4 items-center shrink-0">
            <button
              onClick={() => router.push(`/org/${orgId}/categories`)}
              className="group relative flex items-center gap-2 bg-secondary/80 backdrop-blur-sm text-foreground px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-secondary transition-all hover:scale-105 active:scale-95 border border-border/50 shadow-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <TagIcon className="w-4 h-4 relative z-10 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="relative z-10">Category</span>
            </button>

            <button
              onClick={() => router.push(`/org/${orgId}/tournaments/create`)}
              className="group relative flex items-center gap-2 bg-[#1B9C56] text-black px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#158045] transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(27,156,86,0.5)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <PlusIcon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Tournament</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-10">
        
        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* Glassmorphic Tabs */}
          <div className="flex p-1.5 bg-secondary/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-inner">
            {["all", "public", "private"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab
                    ? "text-black shadow-md scale-100"
                    : "text-muted-foreground hover:text-foreground scale-95 hover:scale-100"
                }`}
              >
                {activeTab === tab && (
                  <div className="absolute inset-0 bg-[#1B9C56] rounded-xl -z-10 animate-in zoom-in-95 duration-200" />
                )}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-xl border border-border/50">
            Showing {filteredTournaments.length} {filteredTournaments.length === 1 ? 'Tournament' : 'Tournaments'}
          </div>
        </div>

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center gap-4">
              <Loader2Icon className="w-10 h-10 text-[#1B9C56] animate-spin" />
              <p className="text-muted-foreground font-medium animate-pulse">Loading your tournaments...</p>
            </div>
          ) : filteredTournaments.map((tournament) => (
            <Link
              key={tournament.tournamentUuid}
              href={`/org/${orgId}/tournaments/${tournament.tournamentUuid}`}
              className="group flex flex-col bg-card border border-border/60 rounded-[1.5rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(27,156,86,0.2)] hover:border-[#1B9C56]/50 overflow-hidden"
            >
              {/* Poster Header */}
              {tournament.poster ? (
                <div className="w-full relative overflow-hidden bg-secondary">
                  <img 
                    src={`http://localhost:5050/api/tournament/tournaments/getFile?filePath=${encodeURIComponent(tournament.poster.startsWith('/') && tournament.poster.includes(':') ? tournament.poster.substring(1) : tournament.poster)}`} 
                    alt={tournament.name} 
                    className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none" />
                  <div className="absolute top-4 right-4 bg-background/40 backdrop-blur-md p-2 rounded-full opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRightIcon className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-xl ${
                        tournament.visibility === "PUBLIC"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                          : "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                      }`}
                    >
                      {tournament.visibility || "PRIVATE"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-xl border ${
                        tournament.status === "ACTIVE"
                          ? "border-[#1B9C56]/40 bg-[#1B9C56]/20 text-[#1B9C56] shadow-[0_0_15px_rgba(27,156,86,0.2)]"
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
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#1B9C56]/10 rounded-full blur-[50px] group-hover:bg-[#1B9C56]/20 transition-colors duration-700" />
                  
                  <div className="absolute top-4 right-4 bg-background/40 backdrop-blur-md p-2 rounded-full opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRightIcon className="w-4 h-4 text-foreground" />
                  </div>

                  <div className="text-muted-foreground/60 font-medium flex flex-col items-center gap-3 relative z-10">
                    <TrophyIcon className="w-10 h-10 opacity-50" />
                    <span className="tracking-wider text-sm uppercase">No Poster</span>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-xl ${
                        tournament.visibility === "PUBLIC"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                      }`}
                    >
                      {tournament.visibility || "PRIVATE"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                        tournament.status === "ACTIVE"
                          ? "border-[#1B9C56]/30 bg-[#1B9C56]/10 text-[#1B9C56]"
                          : "border-border bg-secondary text-muted-foreground"
                      }`}
                    >
                      {tournament.status || "DRAFT"}
                    </span>
                  </div>
                </div>
              )}

              {/* Details Section */}
              <div className="p-6 flex flex-col flex-grow relative bg-card border-t border-border/40">
                <h3 className="text-xl font-bold text-foreground mb-5 group-hover:text-[#1B9C56] transition-colors leading-snug line-clamp-2">
                  {tournament.name}
                </h3>

                <div className="mt-auto flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1.5 rounded-lg border border-border/50 hover:bg-secondary transition-colors cursor-default">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#1B9C56]" />
                    <span>
                      {new Date(tournament.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                      {" - "}
                      {new Date(tournament.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1.5 rounded-lg border border-border/50 hover:bg-secondary transition-colors cursor-default">
                    <MapPinIcon className="w-3.5 h-3.5 text-[#1B9C56]" />
                    <span className="truncate max-w-[150px]">{tournament.location}</span>
                  </div>

                  {/* MATCH FORMATS */}
                  {(tournament as any).matchFormat && (tournament as any).matchFormat.split(',').map((format: string, i: number) => (
                    <div key={`format-${i}`} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1.5 rounded-lg border border-border/50 hover:bg-secondary transition-colors cursor-default">
                      <TrophyIcon className="w-3.5 h-3.5 text-[#1B9C56]" />
                      <span>{format.trim()}</span>
                    </div>
                  ))}

                  {/* CATEGORIES */}
                  {(tournament as any).category && (tournament as any).category.split(',').map((cat: string, i: number) => (
                    <div key={`cat-${i}`} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1.5 rounded-lg border border-border/50 hover:bg-secondary transition-colors cursor-default">
                      <TagIcon className="w-3.5 h-3.5 text-[#1B9C56]" />
                      <span className="capitalize">{cat.trim().toLowerCase()}</span>
                    </div>
                  ))}

                  {(tournament as any).contactPhone && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1.5 rounded-lg border border-border/50 hover:bg-secondary transition-colors cursor-default">
                      <PhoneIcon className="w-3.5 h-3.5 text-[#1B9C56]" />
                      <span>{(tournament as any).contactPhone}</span>
                    </div>
                  )}

                  {(tournament as any).registrationFees !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground bg-[#1B9C56]/10 px-2.5 py-1.5 rounded-lg border border-[#1B9C56]/20 shadow-sm cursor-default">
                      <TicketIcon className="w-3.5 h-3.5 text-[#1B9C56]" />
                      <span>
                        {(tournament as any).registrationFees === 0 
                          ? "Free Entry" 
                          : `₹${(tournament as any).registrationFees}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && filteredTournaments.length === 0 && (
          <div className="mt-12 py-24 px-6 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm rounded-[2rem] border border-dashed border-border/80 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1B9C56]/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6 relative z-10 shadow-inner">
              <SearchIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-3 relative z-10">No Tournaments Found</h3>
            <p className="text-muted-foreground max-w-md text-center mb-8 relative z-10 leading-relaxed">
              {activeTab === 'all' 
                ? "You haven't created any tournaments yet. Get started by setting up your first competition!"
                : `There are no ${activeTab} tournaments available right now. Switch tabs or create a new one.`}
            </p>
            
            <button
              onClick={() => router.push(`/org/${orgId}/tournaments/create`)}
              className="relative z-10 flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-bold hover:bg-muted-foreground transition-all hover:scale-105 active:scale-95"
            >
              <PlusIcon className="w-5 h-5" />
              Create Your First Tournament
            </button>
          </div>
        )}
      </div>
    </div>
  );
}