"use client";

import React, { useState, useEffect, use } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { TournamentService, Tournament } from "@/lib/api/tournaments";
import { MatchSetupSettings } from "@/components/tournaments/MatchSetupSettings";

export default function MatchSetupPage({ params }: { params: Promise<{ orgId: string, tournamentId: string }> }) {
  const resolvedParams = use(params);
  const orgId = resolvedParams.orgId;
  const tournamentId = resolvedParams.tournamentId;
  const router = useRouter();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const tRes = await TournamentService.getById(tournamentId);
        if (tRes && tRes.data) {
          setTournament(tRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch match setup data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tournamentId]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading matches...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <button 
        onClick={() => router.push(`/org/${orgId}/match-setup`)}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tournaments
      </button>

      <div>
        <h1 className="text-3xl font-bold text-foreground">{tournament?.name} - Match Setup</h1>
        <p className="text-text-muted mt-2">Assign courts and umpires to all scheduled matches.</p>
      </div>

      <MatchSetupSettings tournamentId={tournamentId} />

    </div>
  );
}
