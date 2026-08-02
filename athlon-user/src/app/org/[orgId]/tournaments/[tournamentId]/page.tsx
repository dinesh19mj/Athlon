"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, PlayIcon, SearchIcon, TrophyIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

export default function TournamentDashboardPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const tournamentId = params.tournamentId as string;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const tournament = {
    name: "Summer Championship 2026",
    status: "ONGOING",
    type: "PUBLIC",
    location: "Main Stadium",
  };

  const categories = [
    { id: 1, name: "U-15 Boys", players: 24 },
    { id: 2, name: "Men's Singles", players: 32 },
  ];

  const registrations = [
    { id: 1, name: "John Doe", category: "U-15 Boys", status: "Approved" },
    { id: 2, name: "Mike Smith", category: "Men's Singles", status: "Pending" },
  ];

  const matches = [
    { id: 1, round: "Quarter-Final", player1: "John Doe", player2: "Sam Wilson", status: "Scheduled", time: "10:00 AM", court: "Court 1" },
    { id: 2, round: "Quarter-Final", player1: "Alice Brown", player2: "Emma Davis", status: "Live", time: "11:00 AM", court: "Court 2" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href={`/org/${orgId}/tournaments`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Tournaments
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              {tournament.type}
            </span>
            <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-semibold">
              {tournament.status}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{tournament.name}</h1>
          <p className="text-muted-foreground mt-1">{tournament.location}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all">
            Settings
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
            Publish Tournament
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {["overview", "registrations", "draws", "matches"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-3">
                  {categories.map((c) => (
                    <div key={c.id} className="flex justify-between items-center p-4 bg-background rounded-xl border border-border">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-sm text-muted-foreground">{c.players} Players</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Registrations</p>
                    <p className="text-2xl font-bold">56</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Matches Completed</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "registrations" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Player Registrations</h3>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search players..."
                  className="pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Player Name</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="py-4 font-medium">{reg.name}</td>
                    <td className="py-4 text-muted-foreground">{reg.category}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        reg.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {reg.status === "Pending" && (
                        <button className="text-primary hover:underline text-xs font-medium">Approve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "draws" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Tournament Draws</h3>
                <p className="text-sm text-muted-foreground">Generate and manage brackets for categories.</p>
              </div>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all">
                Generate Draw
              </button>
            </div>
            <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
              <TrophyIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-1">No draws generated</h4>
              <p className="text-muted-foreground text-sm">Select a category and generate the bracket.</p>
            </div>
          </div>
        )}

        {activeTab === "matches" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Match Schedule & Conduct</h3>
            </div>
            {matches.map((match) => (
              <div key={match.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all">
                <div className="flex items-center gap-6">
                  <div className="text-center w-24">
                    <p className="text-xs font-semibold text-primary">{match.round}</p>
                    <p className="text-xs text-muted-foreground mt-1">{match.time} • {match.court}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{match.player1}</span>
                    <span className="text-xs text-muted-foreground font-bold italic">VS</span>
                    <span className="font-medium">{match.player2}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    match.status === 'Live' ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {match.status}
                  </span>
                  <button 
                    onClick={() => router.push(`/umpire/scoring/${match.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <PlayIcon className="w-4 h-4" />
                    {match.status === 'Live' ? 'View Live' : 'Conduct Match'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
