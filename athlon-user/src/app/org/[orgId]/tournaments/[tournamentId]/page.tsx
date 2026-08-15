"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, PlayIcon, SearchIcon, TrophyIcon, UsersIcon, CalendarIcon, MapPinIcon, PhoneIcon, TicketIcon, InfoIcon, ActivityIcon, DownloadIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { TournamentService, RegistrationService, DrawService, MatchService, StreamConfigService, Tournament, Registration, Match, CourtConfig } from "@/lib/api/tournaments";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ManualBracketBuilder } from "@/components/tournaments/ManualBracketBuilder";
import { LeagueDrawBuilder } from "@/components/tournaments/LeagueDrawBuilder";
import { BracketViewer } from "@/components/tournaments/BracketViewer";
import { StandingsTable, PoolStanding } from "@/components/tournaments/StandingsTable";
import { LiveStreamSettings } from "@/components/tournaments/LiveStreamSettings";
import { MatchSetupSettings } from "@/components/tournaments/MatchSetupSettings";
import { TeamEventControlRoom } from "@/components/tournaments/teamevent/TeamEventControlRoom";
import * as htmlToImage from 'html-to-image';

export default function TournamentDashboardPage() {
  console.log("TournamentDashboardPage rendering!");
  const params = useParams();
  const orgId = params.orgId as string;
  const tournamentId = params.tournamentId as string;
  const router = useRouter();
  const { userId } = useAuthStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<PoolStanding[]>([]);
  const [courts, setCourts] = useState<CourtConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingDraw, setIsGeneratingDraw] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [isManualBuilderActive, setIsManualBuilderActive] = useState(false);
  const [isLeagueBuilderActive, setIsLeagueBuilderActive] = useState(false);
  const [isGeneratingPlayoffs, setIsGeneratingPlayoffs] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [assigningCourt, setAssigningCourt] = useState<number | null>(null);
  const [selectedTeamEventMatch, setSelectedTeamEventMatch] = useState<Match | null>(null);
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<"ALL" | "APPROVED" | "PENDING" | "REJECTED">("ALL");
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");

  const fetchMatches = async () => {
    if (tournament?.tournamentUuid) {
      const mRes = await MatchService.getByTournament(tournament.tournamentUuid);
      setMatches(mRes);
    }
  };

  const handleDownload = async () => {
    const bracketElement = document.getElementById('bracket-capture-area');
    if (!bracketElement) return;

    try {
      setIsDownloading(true);
      const dataUrl = await htmlToImage.toPng(bracketElement, {
        backgroundColor: '#0a0a0a',
        pixelRatio: 2,
        style: { padding: '24px' }
      });

      const link = document.createElement('a');
      link.download = 'athlon-tournament-fixture.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download fixture', err);
    } finally {
      setIsDownloading(false);
    }
  };

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
          if (tData.tournamentUuid) {
            const mRes = await MatchService.getByTournament(tData.tournamentUuid);
            setMatches(mRes);

            const fetchedCourts = await StreamConfigService.getByTournament(tData.tournamentUuid);
            setCourts(fetchedCourts);
            if (tData.tournamentType === 'LEAGUE') {
              try {
                const sRes = await DrawService.getStandings(tData.tournamentUuid);
                setStandings(sRes.data || sRes || []);
              } catch (e) { console.error("Failed to load standings", e); }
            }
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

  useEffect(() => {
    if (tournament?.tournamentUuid && (activeTab === "draws" || activeTab === "matches")) {
      const interval = setInterval(() => {
        MatchService.getByTournament(tournament.tournamentUuid!)
          .then(mRes => {
            if (mRes) setMatches(mRes);
          })
          .catch(() => {});
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [tournament?.tournamentUuid, activeTab]);

  const handleApprove = async (regUuid: string) => {
    try {
      await RegistrationService.updateStatus(regUuid, "APPROVED", Number(userId));
      setRegistrations(prev => prev.map(r => (r.registrationUuid === regUuid || r.uuid === regUuid) ? { ...r, status: "APPROVED" } : r));
    } catch (error) {
      console.error("Failed to approve registration", error);
    }
  };

  const handleReject = async (regUuid: string) => {
    try {
      await RegistrationService.updateStatus(regUuid, "REJECTED", Number(userId));
      setRegistrations(prev => prev.map(r => (r.registrationUuid === regUuid || r.uuid === regUuid) ? { ...r, status: "REJECTED" } : r));
    } catch (error) {
      console.error("Failed to reject registration", error);
    }
  };

  const handlePaymentUpdate = async (regUuid: string, status: string) => {
    try {
      await RegistrationService.updatePaymentStatus(regUuid, status, Number(userId));
      setRegistrations(prev => prev.map(r => (r.registrationUuid === regUuid || r.uuid === regUuid) ? { ...r, paymentStatus: status } : r));
    } catch (error) {
      console.error("Failed to update payment status", error);
    }
  };

  const handleGenerateDraw = async () => {
    try {
      setIsGeneratingDraw(true);
      // Generate draw using the tournament's inherent format instead of a selected category
      if (!tournament?.tournamentUuid) throw new Error("Missing tournament UUID");
      await DrawService.generateDraw(tournament.tournamentUuid, tournament?.tournamentType || "KNOCKOUT");
      alert("Draw generated successfully!");
      const mRes = await MatchService.getByTournament(tournament.tournamentUuid);
      setMatches(mRes);
    } catch (error) {
      console.error("Failed to generate draw", error);
      alert("Failed to generate draw. Check console for details.");
    } finally {
      setIsGeneratingDraw(false);
      setShowDrawModal(false);
    }
  };

  const handleDeleteDraw = async () => {
    if (!tournament?.tournamentUuid) return;
    if (!confirm("Are you sure you want to delete this draw? This action cannot be undone.")) return;
    try {
      await DrawService.deleteDraw(tournament.tournamentUuid);
      alert("Draw deleted successfully!");
      setMatches([]); // Clear local matches
    } catch (error) {
      console.error("Failed to delete draw", error);
      alert("Failed to delete draw.");
    }
  };

  const handleGeneratePlayoffs = async () => {
    if (!tournament?.tournamentUuid) return;
    try {
      setIsGeneratingPlayoffs(true);
      await DrawService.generateLeaguePlayoffs(tournament.tournamentUuid);
      alert("Playoffs generated successfully!");
      const mRes = await MatchService.getByTournament(tournament.tournamentUuid);
      setMatches(mRes);
    } catch (error: any) {
      console.error("Failed to generate playoffs", error);
      alert(error?.response?.data || "Failed to generate playoffs.");
    } finally {
      setIsGeneratingPlayoffs(false);
    }
  };

  const handleManualDraw = () => {
    setShowDrawModal(false);
    setIsManualBuilderActive(true);
  };

  const handleLeagueDraw = () => {
    setShowDrawModal(false);
    setIsLeagueBuilderActive(true);
  };

  const handleAssignCourt = async (matchUuid: string) => {
    if (assigningCourt === null) return;
    try {
      await MatchService.updateCourt(matchUuid, assigningCourt);
      setMatches(prev => prev.map(m => m.uuid === matchUuid ? { ...m, courtId: assigningCourt } : m));
      alert(`Match assigned to Court ${assigningCourt}`);
    } catch (error) {
      console.error("Failed to assign court", error);
      alert("Failed to assign match to court.");
    } finally {
      setAssigningCourt(null);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (registrationSearch && !reg.teamName?.toLowerCase().includes(registrationSearch.toLowerCase())) return false;
    
    if (approvalFilter !== "ALL" && reg.status !== approvalFilter) return false;
    if (paymentFilter !== "ALL" && reg.paymentStatus !== paymentFilter) return false;
    
    return true;
  });

  const renderMatchCard = (match: Match, idx: number) => {
    const teamA = registrations.find(r => r.registrationUuid === match.teamARegistrationUuid || r.uuid === match.teamARegistrationUuid);
    const teamB = registrations.find(r => r.registrationUuid === match.teamBRegistrationUuid || r.uuid === match.teamBRegistrationUuid);
    const isLive = match.status === 'LIVE';
    const isCompleted = match.status === 'COMPLETED';
    const assignedCourt = courts.find(c => c.id === match.courtId);

    return (
      <div key={match.uuid || idx} className="group relative bg-surface-elevated overflow-hidden border border-border rounded-2xl p-5 flex flex-col hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        {/* Premium Accent Line */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isLive ? 'from-live to-transparent' : isCompleted ? 'from-success to-transparent' : 'from-primary to-transparent'} opacity-50 group-hover:opacity-100 transition-opacity`}></div>

        {/* Match Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="inline-block px-2.5 py-1 bg-background border border-border rounded-md text-[10px] font-black tracking-widest uppercase text-primary mb-2">
              Match {idx + 1}
            </span>
            <p className="text-xs text-text-muted font-medium flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3" />
              {match.scheduledTime ? new Date(match.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'TBA'}
            </p>
            <p className="text-xs text-text-muted font-medium flex items-center gap-1.5 mt-1">
              <MapPinIcon className="w-3 h-3" />
              {assignedCourt ? assignedCourt.name : 'TBA'}
            </p>
          </div>
          {(match.status === 'LIVE' || match.status === 'COMPLETED') && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm ${isLive ? 'bg-live/10 text-live border border-live/20' : 'bg-success/10 text-success border border-success/20'}`}>
              {match.status}
            </span>
          )}
        </div>

        {/* Teams Section */}
        <div className="flex flex-col gap-3 flex-1 mb-6">
          {/* Team A */}
          <div className="flex items-center gap-3 p-3 bg-background/50 border border-border/50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border/80 shrink-0">
              <UsersIcon className="w-4 h-4 text-text-muted/70" />
            </div>
            <span className={`font-bold text-sm truncate ${!teamA ? 'text-text-muted italic' : 'text-foreground'}`}>
              {teamA ? teamA.teamName : 'TBD'}
            </span>
          </div>

          <div className="relative flex justify-center items-center h-4">
            <div className="absolute w-full border-t border-dashed border-border/60"></div>
            <span className="relative z-10 px-2 bg-surface-elevated text-[10px] font-black text-text-muted uppercase tracking-widest">VS</span>
          </div>

          {/* Team B */}
          <div className="flex items-center gap-3 p-3 bg-background/50 border border-border/50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border/80 shrink-0">
              <UsersIcon className="w-4 h-4 text-text-muted/70" />
            </div>
            <span className={`font-bold text-sm truncate ${!teamB ? 'text-text-muted italic' : 'text-foreground'}`}>
              {teamB ? teamB.teamName : 'TBD'}
            </span>
          </div>
        </div>
      </div>
    );
  };

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
              <div className="flex items-center flex-wrap gap-3 mb-2">
                <span className="text-primary text-sm font-bold uppercase tracking-wider">
                  {tournament.sport}
                </span>
                <span className="text-text-muted text-sm font-semibold flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-border">
                  {tournament.tournamentType === 'KNOCKOUT' ? 'Knockout' : tournament.tournamentType === 'LEAGUE' ? 'League' : tournament.tournamentType === 'TEAM_EVENT' ? 'Team League' : tournament.tournamentType}
                </span>
                <span className="px-2 py-0.5 ml-2 bg-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-wide">
                  {tournament.visibility}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {tournament.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-text-muted">
                <p className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4" />
                  {new Date(tournament.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(tournament.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4" />
                  {tournament.location}
                </p>
              </div>
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
            {[
              "overview", 
              "registrations", 
              "draws", 
              ...(tournament?.tournamentType === 'LEAGUE' ? ["standings"] : []),
              "matches", 
              "livestream", 
              "match setup"
            ].map((tab) => (
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <h3 className="text-xl font-bold text-foreground">Team Registrations</h3>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-4">
              
              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                
                {/* Approval Status */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-text-muted/80 uppercase tracking-widest pl-1">Approval</span>
                  <div className="flex items-center bg-surface p-0.5 rounded-md border border-border/50">
                    {[
                      { id: "APPROVED", label: "Approved" },
                      { id: "PENDING", label: "Pending" }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setApprovalFilter(prev => prev === f.id ? "ALL" : f.id as any)}
                        className={`h-6 px-3 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                          approvalFilter === f.id
                            ? 'bg-primary text-black shadow-sm'
                            : 'text-text-muted hover:text-foreground hover:bg-background/50'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Status */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-text-muted/80 uppercase tracking-widest pl-1">Payment</span>
                  <div className="flex items-center bg-surface p-0.5 rounded-md border border-border/50">
                    {[
                      { id: "PAID", label: "Paid" },
                      { id: "PENDING", label: "Unpaid" }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setPaymentFilter(prev => prev === f.id ? "ALL" : f.id as any)}
                        className={`h-6 px-3 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                          paymentFilter === f.id
                            ? 'bg-[#1B9C56] text-white shadow-sm'
                            : 'text-text-muted hover:text-foreground hover:bg-background/50'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Search Bar */}
              <div className="w-full xl:w-64 mt-1 xl:mt-0">
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={registrationSearch}
                    onChange={(e) => setRegistrationSearch(e.target.value)}
                    className="w-full pl-8 pr-3 h-8 bg-surface border border-border/50 rounded-md text-xs focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted/50"
                  />
                </div>
              </div>
            </div>

            <div>
              {filteredRegistrations.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  No registrations found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRegistrations.map((reg, rIdx) => (
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
          <div className="space-y-6">
            {isManualBuilderActive ? (
              <ManualBracketBuilder
                tournamentUuid={tournament.tournamentUuid!}
                registrations={registrations.filter(r => r.status === "APPROVED")}
                onComplete={() => {
                  setIsManualBuilderActive(false);
                  MatchService.getByTournament(tournament.tournamentUuid!).then(setMatches);
                }}
                onCancel={() => setIsManualBuilderActive(false)}
              />
            ) : isLeagueBuilderActive ? (
              <LeagueDrawBuilder
                tournamentUuid={tournament.tournamentUuid!}
                registrations={registrations.filter(r => r.status === "APPROVED")}
                onComplete={() => {
                  setIsLeagueBuilderActive(false);
                  MatchService.getByTournament(tournament.tournamentUuid!).then(setMatches);
                }}
                onCancel={() => setIsLeagueBuilderActive(false)}
              />
            ) : (
              <>
                <div className="flex justify-end mb-12">
                  {matches.length === 0 && (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowDrawModal(true)}
                        disabled={isGeneratingDraw}
                        className="px-6 py-2.5 bg-primary text-black rounded-lg font-bold hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingDraw ? "Generating..." : "Generate Draw"}
                      </button>
                    </div>
                  )}
                  {(tournament.tournamentType === 'LEAGUE' || tournament.tournamentType === 'TEAM_EVENT') && matches.length > 0 && !matches.some(m => m.teamARegistrationUuid === null && m.teamBRegistrationUuid === null && m.poolId == null) && (
                     <div className="flex items-center gap-4">
                      <button
                        onClick={handleGeneratePlayoffs}
                        disabled={isGeneratingPlayoffs}
                        className="px-6 py-2.5 bg-secondary text-white rounded-lg font-bold hover:bg-secondary/90 transition-opacity whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingPlayoffs ? "Generating..." : "Generate Playoffs"}
                      </button>
                    </div>
                  )}
                </div>

                {matches.length > 0 ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-primary/10 border border-primary/20 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-bold text-primary">Draw Successfully Generated</h4>
                        <p className="text-sm text-text-muted mt-1">{matches.length} matches have been organized into the tournament bracket.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <button
                          onClick={handleDeleteDraw}
                          className="w-full sm:w-auto px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                        >
                          Delete Draw
                        </button>
                        <button
                          onClick={handleDownload}
                          disabled={isDownloading}
                          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-surface border border-border text-foreground font-bold rounded-lg hover:bg-primary hover:text-black hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDownloading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <DownloadIcon className="w-4 h-4" />}
                          {isDownloading ? 'Processing...' : 'Download Fixture'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-8">
                      <BracketViewer 
                        matches={matches} 
                        registrations={registrations} 
                        tournamentType={tournament.tournamentType}
                        onMatchClick={(match) => {
                          if (tournament.tournamentType === 'TEAM_EVENT') {
                            setSelectedTeamEventMatch(match);
                          } else {
                            router.push(`/scoring/${match.uuid}`);
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
                    <TrophyIcon className="w-12 h-12 text-border mb-4" />
                    <h4 className="text-lg font-medium text-foreground mb-2">No draws generated</h4>
                    <p className="text-sm text-text-muted max-w-sm">Generate the bracket when registration is complete.</p>
                  </div>
                )}

                {showDrawModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                      <h3 className="text-xl font-bold text-foreground mb-2">Generate Draw</h3>
                      <p className="text-sm text-text-muted mb-6">How would you like to generate the brackets for this tournament?</p>

                      <div className="flex flex-col gap-3">
                        <button
                          onClick={handleGenerateDraw}
                          className="w-full flex flex-col items-start p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                        >
                          <span className="font-semibold text-foreground mb-1">Automatic Draw</span>
                          <span className="text-xs text-text-muted">Randomized seeding based on your configured tournament type.</span>
                        </button>

                        <button
                          onClick={handleManualDraw}
                          className="w-full flex flex-col items-start p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                        >
                          <span className="font-semibold text-foreground mb-1">Manual Draw</span>
                          <span className="text-xs text-text-muted">Manually place players into specific bracket positions.</span>
                        </button>
                        
                        {(tournament.tournamentType === 'LEAGUE' || tournament.tournamentType === 'TEAM_EVENT') && (
                          <button
                            onClick={handleLeagueDraw}
                            className="w-full flex flex-col items-start p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                          >
                            <span className="font-semibold text-foreground mb-1">League Setup</span>
                            <span className="text-xs text-text-muted">Configure pools and assign teams for a League format.</span>
                          </button>
                        )}
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => setShowDrawModal(false)}
                          className="px-4 py-2 text-sm font-medium text-text-muted hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "standings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">League Standings</h3>
              <button 
                onClick={handleGeneratePlayoffs}
                disabled={isGeneratingPlayoffs}
                className="px-6 py-2.5 bg-primary text-black rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isGeneratingPlayoffs ? "Generating Playoffs..." : "Generate Playoffs"}
              </button>
            </div>
            
            {standings.length > 0 ? (
              <StandingsTable standings={standings} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
                <TrophyIcon className="w-12 h-12 text-border mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">No standings yet</h4>
                <p className="text-sm text-text-muted max-w-sm">Play pool matches to update standings.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "matches" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-foreground">Match Schedule & Conduct</h3>
            </div>

            {matches.filter(match => match.teamARegistrationUuid != null || match.teamBRegistrationUuid != null).length === 0 ? (
              <div className="grid grid-cols-1 gap-6">
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
                  <PlayIcon className="w-12 h-12 text-border mb-4" />
                  <p className="text-sm text-text-muted">No matches scheduled yet.</p>
                </div>
              </div>
            ) : tournament.tournamentType === 'LEAGUE' ? (
              <div className="space-y-8">
                {/* Group Matches by Pool */}
                {Array.from(new Set(matches.map(m => m.poolName || 'Playoffs'))).map(poolName => (
                  <div key={poolName} className="space-y-4">
                    <h4 className="text-xl font-black text-foreground border-b border-border pb-2">{poolName}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {matches
                        .filter(m => (m.poolName || 'Playoffs') === poolName && (m.teamARegistrationUuid != null || m.teamBRegistrationUuid != null))
                        .map((match, idx) => renderMatchCard(match, matches.indexOf(match)))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {matches
                  .filter(match => match.teamARegistrationUuid != null || match.teamBRegistrationUuid != null)
                  .map((match, idx) => renderMatchCard(match, idx))}
              </div>
            )}
          </div>
        )}

        {activeTab === "livestream" && (
          <div className="space-y-6">
            <LiveStreamSettings
              tournamentId={tournamentId}
              tournamentName={tournament.name}
            />
          </div>
        )}

        {activeTab === "match setup" && (
          <div className="space-y-6">
            <MatchSetupSettings
              tournamentId={tournamentId}
            />
          </div>
        )}

      </div>
      {selectedTeamEventMatch && (
        <TeamEventControlRoom 
          match={selectedTeamEventMatch}
          registrations={registrations}
          onClose={() => setSelectedTeamEventMatch(null)}
          onUpdate={fetchMatches}
        />
      )}
    </div>
  );
}
