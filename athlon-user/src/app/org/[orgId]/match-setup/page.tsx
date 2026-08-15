"use client";

import React, { useState, useEffect, use } from "react";
import { Trophy, Calendar, Users, ArrowRight, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { TournamentService, Tournament } from "@/lib/api/tournaments";

export default function MatchSetupTournamentsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const resolvedParams = use(params);
  const orgId = resolvedParams.orgId;
  const router = useRouter();
  
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await TournamentService.getByOrg(orgId);
        if (response && response.data) {
          setTournaments(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch tournaments:", error);
      }
      setIsLoading(false);
    };
    fetchTournaments();
  }, [orgId]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3 border border-primary/20">
            <ClipboardList className="w-3.5 h-3.5" />
            Match Setup
          </div>
          <h1 className="text-3xl font-bold text-foreground">Select a Tournament</h1>
          <p className="text-text-muted mt-2">Choose a tournament to assign courts and umpires to matches.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">Loading tournaments...</div>
      ) : tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-dashed border-border rounded-xl">
          <Trophy className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground">No Tournaments Found</p>
          <p className="text-text-muted">Create a tournament first to setup matches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <div 
              key={tournament.tournamentUuid}
              onClick={() => router.push(`/org/${orgId}/match-setup/${tournament.tournamentUuid}`)}
              className="bg-surface-elevated border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 cursor-pointer transition-all group flex flex-col h-full relative overflow-hidden"
            >
              {/* Premium Gradient Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${
                    tournament.status === 'PUBLISHED' ? 'bg-success/10 text-success border border-success/20' : 
                    tournament.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                    'bg-surface text-text-muted border border-border'
                  }`}>
                    {tournament.status}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2 relative z-10 group-hover:text-primary transition-colors">
                {tournament.name}
              </h3>
              
              <div className="flex items-center gap-3 text-sm text-text-muted mb-6 relative z-10">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(tournament.startDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {tournament.sport}</span>
              </div>

              <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between relative z-10">
                <span className="text-sm font-semibold text-text-muted group-hover:text-foreground transition-colors">
                  Setup Matches
                </span>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
