"use client";

import React, { useState, useEffect, use } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { TournamentService, Tournament } from "@/lib/api/tournaments";
import { LiveStreamSettings } from "@/components/tournaments/LiveStreamSettings";

export default function TournamentLiveStreamPage({ params }: { params: Promise<{ orgId: string, tournamentId: string }> }) {
  const resolvedParams = use(params);
  const orgId = resolvedParams.orgId;
  const tournamentId = resolvedParams.tournamentId;
  const router = useRouter();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await TournamentService.getById(tournamentId);
        if (response && response.data) {
          setTournament(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch tournament details:", error);
      }
      setIsLoading(false);
    };
    fetchTournament();
  }, [tournamentId]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading configurations...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <button 
        onClick={() => router.push(`/org/${orgId}/livestream`)}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tournaments
      </button>

      <LiveStreamSettings 
        tournamentId={tournamentId} 
        tournamentName={tournament?.name} 
      />

    </div>
  );
}
