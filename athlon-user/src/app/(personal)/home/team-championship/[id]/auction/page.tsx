"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Gavel, Flame, Coins, Users, Shield, Clock, Plus } from "lucide-react";
import Link from "next/link";
import {
  AuctionService,
  AuctionState,
  AuctionPlayer,
  AuctionTeamSummary,
  AuctionBid,
} from "@/lib/api/auction";
import { TeamChampionshipService, TeamChampionship } from "@/lib/api/teamChampionship";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function TeamOwnerAuctionArenaPage() {
  const params = useParams();
  const championshipUuid = params.id as string;
  const router = useRouter();
  const { userId } = useAuthStore();

  const [championship, setChampionship] = useState<TeamChampionship | null>(null);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [auctionTeams, setAuctionTeams] = useState<AuctionTeamSummary[]>([]);
  const [selectedMyTeamId, setSelectedMyTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);

  const loadData = async () => {
    try {
      const champ = await TeamChampionshipService.getById(championshipUuid);
      setChampionship(champ);

      if (champ?.championshipId) {
        const state = await AuctionService.getState(champ.championshipId);
        setAuctionState(state);

        const teams = await AuctionService.getTeams(champ.championshipId);
        setAuctionTeams(teams || []);

        if (teams && teams.length > 0 && !selectedMyTeamId) {
          setSelectedMyTeamId(teams[0].team.teamId);
        }
      }
    } catch (err) {
      console.error("Failed to load auction arena", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [championshipUuid]);

  const myTeamSummary = auctionTeams.find((at) => at.team.teamId === selectedMyTeamId);
  const currencyLabel = auctionState?.config?.currencySymbolOrLabel || "pts";

  const handlePlaceBid = async (increment: number) => {
    if (!championship?.championshipId || !auctionState?.activePlayer || !selectedMyTeamId) return;

    try {
      setPlacingBid(true);
      const current = auctionState.currentBid || auctionState.activePlayer.basePrice;
      const nextBid = current + increment;
      await AuctionService.placeBid(
        championship.championshipId,
        auctionState.activePlayer.auctionPlayerId,
        selectedMyTeamId,
        nextBid,
        userId ? Number(userId) : undefined
      );
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to place bid");
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading || !championship) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-black">
      {/* Top Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-8 py-3.5 flex items-center justify-between"
        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/tournaments`}
            className="p-2 rounded-xl border border-foreground/10 hover:bg-foreground/5 transition-all text-foreground/70"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE AUCTION
              </span>
              <h1 className="text-sm sm:text-base font-black text-foreground">{championship.name}</h1>
            </div>
          </div>
        </div>

        {/* Team Selector & Purse Badge */}
        {myTeamSummary && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-foreground/50 hidden sm:inline">My Purse:</span>
            <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-xs">
              {myTeamSummary.team.remainingBudget} {currencyLabel}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Active Player Card */}
        {auctionState?.activePlayer ? (
          <div
            className="rounded-3xl border p-6 sm:p-8 space-y-6 shadow-2xl bg-gradient-to-br from-primary/15 via-transparent to-transparent"
            style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-primary">On the Floor Now</span>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-0.5">
                  {auctionState.activePlayer.playerName}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase">
                    {auctionState.activePlayer.categoryName || "Category"}
                  </span>
                  <span className="text-xs text-foreground/60">
                    Eligible: <strong>{auctionState.activePlayer.eligibleFormats || "All"}</strong>
                  </span>
                </div>
              </div>

              {/* Live Countdown Timer */}
              <div
                className="p-4 rounded-2xl border text-center self-start sm:self-center"
                style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block">
                  Time Left
                </span>
                <span className="text-3xl font-black text-amber-400 font-mono">
                  {auctionState.remainingTimerSeconds}s
                </span>
              </div>
            </div>

            {/* Current High Bid & Leader */}
            <div
              className="p-5 rounded-2xl border grid grid-cols-2 gap-4"
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-foreground/40 block">Current High Bid</span>
                <span className="text-2xl sm:text-3xl font-black text-primary">
                  {auctionState.currentBid} {currencyLabel}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-foreground/40 block">Leading Team</span>
                <span className="text-base sm:text-lg font-black text-foreground">
                  {auctionState.winningTeamName || "No Bids Yet"}
                </span>
              </div>
            </div>

            {/* 1-Tap Quick Bidding Buttons */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-foreground/70 block">
                Tap to Place Bid for {myTeamSummary?.team.teamName || "Your Team"}
              </span>

              <div className="grid grid-cols-3 gap-3">
                {[
                  auctionState.config?.bidIncrement || 500,
                  (auctionState.config?.bidIncrement || 500) * 2,
                  (auctionState.config?.bidIncrement || 500) * 5,
                ].map((inc, idx) => (
                  <button
                    key={idx}
                    disabled={placingBid}
                    onClick={() => handlePlaceBid(inc)}
                    className="py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm sm:text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 disabled:opacity-40"
                  >
                    +{inc} {currencyLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="p-12 rounded-3xl border border-dashed text-center space-y-3"
            style={{ borderColor: "var(--athlon-border)" }}
          >
            <Gavel className="w-12 h-12 text-foreground/20 mx-auto" />
            <h3 className="text-base font-black text-foreground uppercase">Waiting for Organizer to Call Player</h3>
            <p className="text-xs text-foreground/40">The next auction call will appear here live in real time.</p>
          </div>
        )}

        {/* Live Bid History Feed */}
        <div
          className="rounded-3xl border p-6 space-y-4"
          style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
        >
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground/80">Live Bid Activity Feed</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto hide-scrollbar">
            {auctionState?.recentBids?.map((bid) => (
              <div
                key={bid.bidId}
                className="p-3 rounded-xl border flex items-center justify-between text-xs"
                style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border-subtle)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-bold text-foreground">{bid.teamName}</span>
                </div>
                <span className="font-black text-primary">
                  {bid.bidAmount} {currencyLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
