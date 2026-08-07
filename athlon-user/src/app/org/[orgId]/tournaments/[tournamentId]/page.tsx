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
      setRegistrations(prev => prev.map(r => r.uuid === regUuid ? { ...r, status: "APPROVED" } : r));
    } catch (error) {
      console.error("Failed to approve registration", error);
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
        <div className="max-w-7xl mx-auto px-8 py-6">
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
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-8 flex gap-8 border-t border-border mt-6">
          {["overview", "registrations", "draws", "matches"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-foreground hover:border-border"
                }`}
            >
              {tab}
            </button>
          ))}
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

            {/* Tournament Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-surface rounded-xl p-5 border border-border shadow-sm hover:border-primary/30 transition-colors">
                <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <ActivityIcon className="w-3.5 h-3.5 text-primary" /> Sport
                </p>
                <p className="text-lg font-bold text-foreground">{tournament.sport}</p>
              </div>

              <div className="bg-surface rounded-xl p-5 border border-border shadow-sm hover:border-primary/30 transition-colors">
                <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <TrophyIcon className="w-3.5 h-3.5 text-primary" /> Type
                </p>
                <p className="text-lg font-bold text-foreground">{tournament.tournamentType === 'TEAM_EVENT' ? 'Team League' : 'Knockout'}</p>
              </div>

              {tournament.matchFormat && (
                <div className="bg-surface rounded-xl p-5 border border-border shadow-sm hover:border-primary/30 transition-colors">
                  <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <UsersIcon className="w-3.5 h-3.5 text-primary" /> Format
                  </p>
                  <p className="text-sm font-bold text-foreground truncate" title={tournament.matchFormat}>
                    {tournament.matchFormat.split(',').join(', ')}
                  </p>
                </div>
              )}

              <div className="bg-surface rounded-xl p-5 border border-border shadow-sm hover:border-primary/30 transition-colors">
                <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <CalendarIcon className="w-3.5 h-3.5 text-primary" /> Dates
                </p>
                <p className="text-sm font-bold text-foreground">
                  {new Date(tournament.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(tournament.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>

              <div className="bg-surface rounded-xl p-5 border border-border shadow-sm hover:border-primary/30 transition-colors">
                <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPinIcon className="w-3.5 h-3.5 text-primary" /> Location
                </p>
                <p className="text-lg font-bold text-foreground truncate" title={tournament.location}>
                  {tournament.location || "TBD"}
                </p>
              </div>

              <div className="bg-surface rounded-xl p-5 border border-border shadow-sm hover:border-primary/30 transition-colors">
                <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <TicketIcon className="w-3.5 h-3.5 text-primary" /> Entry Fee
                </p>
                <p className="text-lg font-bold text-foreground">
                  {tournament.registrationFees ? `₹${tournament.registrationFees}` : "Free"}
                </p>
              </div>
              
              {tournament.contactPhone && (
                <div className="bg-surface rounded-xl p-5 border border-border shadow-sm hover:border-primary/30 transition-colors">
                  <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <PhoneIcon className="w-3.5 h-3.5 text-primary" /> Contact
                  </p>
                  <p className="text-lg font-bold text-foreground">{tournament.contactPhone}</p>
                </div>
              )}
            </div>

            {/* Categories Full Width */}
            <div className="bg-surface rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <TrophyIcon className="w-5 h-5 text-primary" />
                Categories
              </h3>
              <div className="flex flex-wrap gap-3">
                {(tournament.category ? tournament.category.split(',') : ["General"]).map((cat, idx) => (
                  <div key={idx} className="px-4 py-2 bg-background rounded-lg border border-border text-foreground font-medium flex items-center gap-2.5 shadow-sm hover:border-primary/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(27,156,86,0.8)]" />
                    <span className="capitalize text-sm">{cat.trim().toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "registrations" && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-background">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Team Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                        No registrations found.
                      </td>
                    </tr>
                  ) : (
                    registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-background transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{reg.teamName}</td>
                        <td className="px-6 py-4 text-text-muted">{tournament.category}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase ${reg.status === 'APPROVED'
                            ? 'bg-success/20 text-success'
                            : 'bg-primary/20 text-primary'
                            }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {reg.status === "PENDING" && (
                            <button
                              onClick={() => handleApprove(reg.uuid)}
                              className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
