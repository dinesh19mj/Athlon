"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusIcon, CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function TournamentsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("all");

  // Mock data for now
  const tournaments = [
    {
      id: "1",
      name: "Summer Smash 2026",
      type: "PUBLIC",
      status: "UPCOMING",
      startDate: "2026-09-01",
      endDate: "2026-09-05",
      location: "Main Stadium",
      playersRegistered: 120,
    },
    {
      id: "2",
      name: "Club Internal Championship",
      type: "PRIVATE",
      status: "ONGOING",
      startDate: "2026-08-01",
      endDate: "2026-08-15",
      location: "Indoor Courts",
      playersRegistered: 45,
    },
  ];

  const filteredTournaments = tournaments.filter((t) => {
    if (activeTab === "all") return true;
    return t.type.toLowerCase() === activeTab;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tournaments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your public and private tournaments, schedules, and draws.
          </p>
        </div>
        <button
          onClick={() => router.push(`/org/${orgId}/tournaments/create`)}
          className="flex items-center gap-2 bg-[#1B9C56] text-black px-4 py-2 rounded-xl font-medium hover:bg-[#158045] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#1B9C56]/25"
        >
          <PlusIcon className="w-5 h-5" />
          Create Tournament
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-secondary/50 backdrop-blur-xl w-fit rounded-xl border border-border/50">
        {["all", "public", "private"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-[#1B9C56] text-black shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tournament) => (
          <Link
            key={tournament.id}
            href={`/org/${orgId}/tournaments/${tournament.id}`}
            className="group relative flex flex-col bg-card border border-border rounded-2xl p-6 transition-all hover:shadow-xl hover:border-[#1B9C56]/50 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1B9C56]/5 rounded-full blur-3xl group-hover:bg-[#1B9C56]/10 transition-colors" />
            
            <div className="flex justify-between items-start mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  tournament.type === "PUBLIC"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-orange-500/10 text-orange-500"
                }`}
              >
                {tournament.type}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  tournament.status === "ONGOING"
                    ? "border-[#1B9C56]/20 bg-[#1B9C56]/10 text-[#1B9C56]"
                    : "border-border bg-secondary text-muted-foreground"
                }`}
              >
                {tournament.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-[#1B9C56] transition-colors">
              {tournament.name}
            </h3>

            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CalendarIcon className="w-4 h-4 text-[#1B9C56]/70" />
                <span>{tournament.startDate} - {tournament.endDate}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPinIcon className="w-4 h-4 text-[#1B9C56]/70" />
                <span>{tournament.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <UsersIcon className="w-4 h-4 text-[#1B9C56]/70" />
                <span>{tournament.playersRegistered} Players</span>
              </div>
            </div>
          </Link>
        ))}

        {filteredTournaments.length === 0 && (
          <div className="col-span-full py-12 text-center bg-secondary/30 rounded-2xl border border-dashed border-border">
            <h3 className="text-lg font-medium text-foreground mb-2">No Tournaments Found</h3>
            <p className="text-muted-foreground">Create your first tournament to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}