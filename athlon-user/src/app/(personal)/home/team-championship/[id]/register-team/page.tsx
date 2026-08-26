"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Shield, Check } from "lucide-react";
import Link from "next/link";
import { TeamChampionshipService, TeamChampionship } from "@/lib/api/teamChampionship";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function RegisterTeamForChampionshipPage() {
  const params = useParams();
  const championshipUuid = params.id as string;
  const router = useRouter();
  const { userId, userUuid, userEmail } = useAuthStore();

  const [championship, setChampionship] = useState<TeamChampionship | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    contactPhone: "",
    contactEmail: userEmail || "",
  });

  useEffect(() => {
    TeamChampionshipService.getById(championshipUuid)
      .then(setChampionship)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [championshipUuid, userEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!championship?.championshipId) return;

    try {
      setSubmitting(true);
      await TeamChampionshipService.registerTeam({
        championshipId: championship.championshipId,
        championshipUuid: championship.championshipUuid,
        teamName: formData.teamName,
        captainName: formData.captainName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        ownerUserId: userId ? Number(userId) : undefined,
        ownerUserUuid: userUuid || undefined,
      });

      alert("Team registered successfully!");
      router.push(`/tournaments`);
    } catch (err: any) {
      alert(err.message || "Failed to register team");
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-primary selection:text-black">
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-8 py-4 flex items-center gap-3"
        style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
      >
        <Link
          href={`/tournaments`}
          className="p-2 rounded-xl border border-foreground/10 hover:bg-foreground/5 transition-all text-foreground/70"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-sm sm:text-base font-black text-foreground">Team Entry Registration</h1>
          <p className="text-[11px] font-medium text-foreground/50">{championship.name}</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border p-6 space-y-5 shadow-xl"
          style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
        >
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
              Team / Club Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Matrix Smashers"
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold outline-none focus:border-primary"
              style={{ borderColor: "var(--athlon-border)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
              Captain / Team Manager Name *
            </label>
            <input
              type="text"
              required
              value={formData.captainName}
              onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold outline-none focus:border-primary"
              style={{ borderColor: "var(--athlon-border)" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold outline-none focus:border-primary"
                style={{ borderColor: "var(--athlon-border)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-foreground/70 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold outline-none focus:border-primary"
                style={{ borderColor: "var(--athlon-border)" }}
              />
            </div>
          </div>

          {/* Entry Fee & Submit */}
          <div className="border-t pt-4 space-y-3" style={{ borderColor: "var(--athlon-border-subtle)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground/50 uppercase">Team Registration Fee</span>
              <span className="text-sm font-black text-primary">
                {championship.teamRegistrationFee > 0 ? `₹${championship.teamRegistrationFee}` : "FREE"}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-primary text-primary-foreground font-black text-sm rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 disabled:opacity-40"
            >
              {submitting ? "Registering..." : "Submit Team Registration"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
