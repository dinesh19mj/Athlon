"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, PlayIcon, SearchIcon, TrophyIcon, UsersIcon, CalendarIcon, MapPinIcon, PhoneIcon, TicketIcon, InfoIcon, ActivityIcon } from "lucide-react";
import Link from "next/link";
import { TournamentService, RegistrationService, Tournament, Registration } from "@/lib/api/tournaments";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function TournamentDashboardPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const tournamentId = params.tournamentId as string;
  const router = useRouter();
  const { userId } = useAuthStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const tRes = await TournamentService.getById(tournamentId);
        const tData = tRes.data;
        if (tData) {
          setTournament(tData);
          if (tData.tournamentId) {
            const rRes = await RegistrationService.getByTournament(tData.tournamentId);
            setRegistrations(rRes.data || []);
          }
        }
      } catch (error) {
        console.error("Failed to load tournament data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [tournamentId]);

  const handleApprove = async (regUuid: string) => {
    try {
      await RegistrationService.updateStatus(regUuid, "APPROVED", userId);
      setRegistrations(prev => prev.map(r => (r.registrationUuid === regUuid || r.uuid === regUuid) ? { ...r, status: "APPROVED" } : r));
    } catch (error) {
      console.error("Failed to approve registration", error);
    }
  };

  const handleReject = async (regUuid: string) => {
    try {
      await RegistrationService.updateStatus(regUuid, "REJECTED", userId);
      setRegistrations(prev => prev.map(r => (r.registrationUuid === regUuid || r.uuid === regUuid) ? { ...r, status: "REJECTED" } : r));
    } catch (error) {
      console.error("Failed to reject registration", error);
    }
  };

  const handlePaymentUpdate = async (regUuid: string, status: string) => {
    try {
      await RegistrationService.updatePaymentStatus(regUuid, status, userId);
      setRegistrations(prev => prev.map(r => (r.registrationUuid === regUuid || r.uuid === regUuid) ? { ...r, paymentStatus: status } : r));
    } catch (error) {
      console.error("Failed to update payment status", error);
    }
  };

  const matches: any[] = []; // Matches are a future integration

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background text-white/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm tracking-widest uppercase font-medium">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-white/50">
        <h2 className="text-xl font-bold mb-4">Tournament Not Found</h2>
        <Link href={`/org/${orgId}/tournaments`} className="text-primary hover:underline">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Page Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-8 pt-6">
          <Link
            href={`/org/${orgId}/tournaments`}
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Tournaments
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold uppercase tracking-wide">
                  {tournament.visibility}
                </span>
                <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-semibold uppercase tracking-wide">
                  {tournament.status}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {tournament.name}
              </h1>
              <p className="text-text-muted mt-2 flex items-center gap-2">
                <SearchIcon className="w-4 h-4" />
                {tournament.location}
              </p>
            </div>

            <div className="flex gap-4">
              <button className="px-6 py-2.5 bg-surface-elevated text-foreground border border-border rounded-lg font-medium hover:bg-border transition-colors">
                Settings
              </button>
              <button className="px-6 py-2.5 bg-primary text-black rounded-lg font-bold hover:opacity-90 transition-opacity">
                Publish
              </button>
            </div>
          </div>
          {/* Navigation Tabs */}
          <div className="flex gap-8 mt-8 overflow-x-auto whitespace-nowrap" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {["overview", "registrations", "draws", "matches"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-foreground hover:border-border"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-8 pt-8">

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Registrations Card */}
              <div className="bg-surface rounded-xl p-5 border border-border border-l-4 border-l-primary flex flex-col justify-center items-start shadow-sm hover:border-primary/30 transition-colors">
                <p className="text-xs font-semibold text-text-muted mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                  <UsersIcon className="w-3.5 h-3.5 text-primary" /> Registrations
                </p>
                <p className="text-3xl font-black text-foreground">{registrations.length}</p>
              </div>

              {/* Matches Completed Card */}
              <div className="bg-surface rounded-xl p-5 border border-border border-l-4 border-l-primary flex flex-col justify-center items-start shadow-sm hover:border-primary/30 transition-colors">
                <p className="text-xs font-semibold text-text-muted mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                  <TrophyIcon className="w-3.5 h-3.5 text-primary" /> Matches
                </p>
                <p className="text-3xl font-black text-foreground">0</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "registrations" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-semibold">Team Registrations</h3>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search teams..."
                  className="w-full sm:w-72 pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              {registrations.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  No registrations found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {registrations.map((reg, rIdx) => (
                    <div key={reg.registrationUuid || reg.uuid || rIdx} className="group relative bg-surface-elevated overflow-hidden border border-border rounded-2xl p-6 flex flex-col hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">

                      {/* Premium Accent Line */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

                      {/* Header Section */}
                      <div className="flex justify-between items-start mb-5 pb-5 border-b border-border/50">
                        <div className="flex gap-4">
                          <div>
                            <h4 className="font-bold text-foreground text-xl tracking-tight mb-0.5">{reg.teamName}</h4>
                            <span className="text-xs font-medium text-text-muted uppercase tracking-widest">{tournament.category}</span>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm ${reg.status === 'APPROVED'
                            ? 'bg-success/10 text-success border border-success/20'
                            : reg.status === 'REJECTED'
                              ? 'bg-destructive/10 text-destructive border border-destructive/20'
                              : 'bg-primary/10 text-primary border border-primary/20'
                            }`}>
                            {reg.status}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm ${reg.paymentStatus === 'PAID'
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            }`}>
                            {reg.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID'}
                          </span>
                        </div>
                      </div>

                      {/* Players Section */}
                      <div className="flex-1 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <UsersIcon className="w-4 h-4 text-text-muted" />
                          <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Players</h5>
                        </div>

                        {reg.players && reg.players.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {reg.players.map((player, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-background/50 p-2.5 rounded-lg border border-border/30 hover:border-border transition-colors">
                                <span className="text-sm font-medium text-foreground">{player.playerName}</span>
                                {player.phoneNumber && (
                                  <span className="text-xs font-mono text-text-muted bg-surface px-2 py-0.5 rounded text-right">{player.phoneNumber}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 bg-background/30 rounded-lg border border-dashed border-border/50">
                            <UsersIcon className="w-6 h-6 text-text-muted/50 mb-2" />
                            <span className="text-xs text-text-muted font-medium">No players listed</span>
                          </div>
                        )}
                      </div>

                      {/* Actions Footer */}
                      <div className="mt-auto pt-4 flex flex-col gap-2.5">
                        <div className="flex gap-2.5">
                          {reg.status !== "APPROVED" && (
                            <button
                              onClick={() => handleApprove(reg.registrationUuid || reg.uuid)}
                              className="flex-1 py-2.5 bg-success/10 hover:bg-success text-success hover:text-white font-semibold rounded-lg text-sm border border-success/20 hover:border-success transition-all shadow-sm"
                            >
                              Approve
                            </button>
                          )}
                          {reg.status !== "REJECTED" && (
                            <button
                              onClick={() => handleReject(reg.registrationUuid || reg.uuid)}
                              className="flex-1 py-2.5 bg-background hover:bg-destructive text-destructive hover:text-white font-semibold rounded-lg text-sm border border-border hover:border-destructive transition-all shadow-sm"
                            >
                              Reject
                            </button>
                          )}
                        </div>

                        {reg.paymentStatus !== "PAID" ? (
                          <button
                            onClick={() => handlePaymentUpdate(reg.registrationUuid || reg.uuid, "PAID")}
                            className="w-full py-2.5 bg-[#1B9C56] hover:bg-[#1B9C56]/90 text-white font-bold rounded-lg text-sm transition-all shadow-sm shadow-[#1B9C56]/20"
                          >
                            Mark as Paid
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePaymentUpdate(reg.registrationUuid || reg.uuid, "PENDING")}
                            className="w-full py-2.5 bg-surface hover:bg-background text-text-muted hover:text-foreground font-medium rounded-lg text-sm border border-border transition-all shadow-sm"
                          >
                            Mark as Unpaid
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "draws" && (
          <div className="bg-surface rounded-xl border border-border p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Tournament Draws</h3>
                <p className="text-sm text-text-muted mt-1">Generate and manage brackets for categories.</p>
              </div>
              <button className="px-6 py-2.5 bg-primary text-black rounded-lg font-bold hover:opacity-90 transition-opacity whitespace-nowrap">
                Generate Draw
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
              <TrophyIcon className="w-12 h-12 text-border mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">No draws generated</h4>
              <p className="text-sm text-text-muted max-w-sm">Select a category and generate the bracket when registration is complete.</p>
            </div>
          </div>
        )}

        {activeTab === "matches" && (
          <div className="bg-surface rounded-xl border border-border p-8">
            <h3 className="text-lg font-semibold text-foreground mb-8">Match Schedule & Conduct</h3>

            <div className="space-y-4">
              {matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
                  <PlayIcon className="w-12 h-12 text-border mb-4" />
                  <p className="text-sm text-text-muted">No matches scheduled yet.</p>
                </div>
              ) : (
                matches.map((match) => (
                  <div key={match.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-background border border-border rounded-lg hover:border-primary transition-colors">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="text-center md:text-left min-w-[120px]">
                        <p className="text-xs font-semibold text-primary uppercase">{match.round}</p>
                        <p className="text-sm text-text-muted mt-1">{match.time} • {match.court}</p>
                      </div>
                      <div className="flex items-center gap-4 text-lg">
                        <span className="font-semibold">{match.player1}</span>
                        <span className="text-sm text-text-muted font-bold">vs</span>
                        <span className="font-semibold">{match.player2}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${match.status === 'Live' ? 'bg-live/20 text-live' : 'bg-surface-elevated text-text-muted'
                        }`}>
                        {match.status}
                      </span>
                      <button
                        onClick={() => router.push(`/umpire/scoring/${match.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-md text-sm font-bold hover:opacity-90 transition-opacity"
                      >
                        <PlayIcon className="w-4 h-4 fill-current" />
                        {match.status === 'Live' ? 'View Live' : 'Conduct'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
