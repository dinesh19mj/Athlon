"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Users, Shield, Check, Swords, Clock } from "lucide-react";
import Link from "next/link";
import {
  TeamChampionshipService,
  TeamChampionship,
  TeamChampionshipFixture,
  TeamChampionshipSubMatch,
  ChampionshipSquadPlayer,
} from "@/lib/api/teamChampionship";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function CaptainLineupSubmissionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const championshipUuid = params.id as string;
  const fixtureId = searchParams.get("fixtureId");
  const teamId = searchParams.get("teamId");

  const router = useRouter();
  const { userId } = useAuthStore();

  const [fixture, setFixture] = useState<TeamChampionshipFixture | null>(null);
  const [subMatches, setSubMatches] = useState<TeamChampionshipSubMatch[]>([]);
  const [squad, setSquad] = useState<ChampionshipSquadPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Player assignments: subMatchId -> playerId[]
  const [assignments, setAssignments] = useState<Record<number, number[]>>({});

  useEffect(() => {
    if (!fixtureId || !teamId) return;

    Promise.all([
      TeamChampionshipService.getFixtureDetail(Number(fixtureId)),
      TeamChampionshipService.getTeamSquad(Number(teamId)),
    ])
      .then(([fixRes, squadRes]) => {
        setFixture(fixRes.fixture);
        setSubMatches(fixRes.subMatches || []);
        setSquad(squadRes || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fixtureId, teamId]);

  const handleSelectPlayer = (subMatchId: number, playerIndex: number, selectedPlayerId: number) => {
    setAssignments((prev) => {
      const current = prev[subMatchId] ? [...prev[subMatchId]] : [];
      current[playerIndex] = selectedPlayerId;
      return { ...prev, [subMatchId]: current };
    });
  };

  const handleSubmitLineup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixtureId || !teamId) return;

    const entries: any[] = [];
    for (const sm of subMatches) {
      const pIds = assignments[sm.subMatchId] || [];
      pIds.forEach((pId, idx) => {
        const playerObj = squad.find((s) => s.playerId === pId);
        if (playerObj) {
          entries.push({
            eventId: sm.eventId,
            eventName: sm.eventName,
            playerId: playerObj.playerId,
            playerName: playerObj.playerName,
            playerPosition: idx + 1,
            isSubstitute: false,
          });
        }
      });
    }

    try {
      setSubmitting(true);
      await TeamChampionshipService.submitLineup({
        fixtureId: Number(fixtureId),
        teamId: Number(teamId),
        submittedByUserId: userId ? Number(userId) : undefined,
        entries,
      });

      alert("Lineup submitted successfully!");
      router.back();
    } catch (err: any) {
      alert(err.message || "Failed to submit lineup");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !fixture) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-primary selection:text-black">
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-8 py-4 flex items-center gap-3"
        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-foreground/10 hover:bg-foreground/5 transition-all text-foreground/70"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-sm sm:text-base font-black text-foreground">Submit Team Lineup</h1>
          <p className="text-[11px] font-medium text-foreground/50">
            {fixture.teamAName} vs {fixture.teamBName}
          </p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6">
        <form
          onSubmit={handleSubmitLineup}
          className="rounded-3xl border p-6 space-y-6 shadow-xl"
          style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
        >
          <div className="border-b pb-4" style={{ borderColor: "var(--athlon-border-subtle)" }}>
            <h3 className="text-sm font-black text-foreground">Assign Squad Players to Competition Matches</h3>
            <p className="text-xs text-foreground/60 mt-1">
              Select eligible players from your squad for each sub-match event.
            </p>
          </div>

          {/* Sub-Match Assignment Cards */}
          <div className="space-y-4">
            {subMatches.map((sm) => {
              const assigned = assignments[sm.subMatchId] || [];
              const isDoubles = sm.eventName.toLowerCase().includes("doubles");
              const requiredCount = isDoubles ? 2 : 1;

              return (
                <div
                  key={sm.subMatchId}
                  className="p-4 rounded-2xl border space-y-3"
                  style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-primary uppercase">
                      Match #{sm.orderSequence} • {sm.eventName}
                    </span>
                    <span className="text-[10px] font-bold text-foreground/40 uppercase">
                      {requiredCount} Player{requiredCount > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: requiredCount }).map((_, slotIdx) => (
                      <div key={slotIdx}>
                        <label className="block text-[10px] font-bold uppercase text-foreground/50 mb-1">
                          Player #{slotIdx + 1}
                        </label>
                        <select
                          required
                          value={assigned[slotIdx] || ""}
                          onChange={(e) =>
                            handleSelectPlayer(sm.subMatchId, slotIdx, Number(e.target.value))
                          }
                          className="w-full px-3 py-2 rounded-xl border bg-background text-xs font-bold text-foreground outline-none focus:border-primary"
                          style={{ borderColor: "var(--athlon-border)" }}
                        >
                          <option value="">Select Squad Player...</option>
                          {squad.map((sp) => (
                            <option key={sp.playerId} value={sp.playerId}>
                              {sp.playerName} ({sp.categoryName || "Open"})
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-primary text-primary-foreground font-black text-sm rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 disabled:opacity-40"
          >
            {submitting ? "Submitting..." : "Submit Lineup to Organizer"}
          </button>
        </form>
      </main>
    </div>
  );
}
