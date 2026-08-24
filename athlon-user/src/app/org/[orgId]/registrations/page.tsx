"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Trophy,
  ChevronRight,
  UserCircle2,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
} from "lucide-react";

// ─── Mock Data ─────────────────────────────────────────────────────────────
const MOCK_TOURNAMENTS = [
  {
    id: "t1",
    name: "Summer Smash 2026",
    sport: "Badminton",
    startDate: "2026-09-01",
    status: "UPCOMING",
    registrations: [
      { id: "reg_001", playerName: "Arjun Sharma",  playerId: "ATH-1001", email: "arjun@mail.com",  phone: "9876543210", category: "Open",  status: "APPROVED", feePaid: true,  amount: 500, registeredAt: "2026-07-25" },
      { id: "reg_002", playerName: "Priya Nair",    playerId: "ATH-1042", email: "priya@mail.com",  phone: "9123456789", category: "U-18",  status: "PENDING",  feePaid: false, amount: 300, registeredAt: "2026-07-26" },
      { id: "reg_005", playerName: "Karan Mehta",   playerId: "ATH-4522", email: "karan@mail.com",  phone: "9812345678", category: "35+",   status: "PENDING",  feePaid: true,  amount: 500, registeredAt: "2026-07-30" },
    ],
  },
  {
    id: "t2",
    name: "Club Internal Championship",
    sport: "Cricket",
    startDate: "2026-08-01",
    status: "ONGOING",
    registrations: [
      { id: "reg_003", playerName: "Rahul Verma",   playerId: "ATH-2031", email: "rahul@mail.com",  phone: "9988776655", category: "Open",  status: "APPROVED", feePaid: true,  amount: 200, registeredAt: "2026-07-28" },
      { id: "reg_004", playerName: "Sneha Iyer",    playerId: "ATH-3011", email: "sneha@mail.com",  phone: "9001122334", category: "U-14",  status: "REJECTED", feePaid: false, amount: 150, registeredAt: "2026-07-29" },
    ],
  },
];

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "text-primary",  bg: "bg-primary/10" },
  PENDING:  { label: "Pending",  icon: Clock,        color: "text-yellow-400",  bg: "bg-yellow-400/10" },
  REJECTED: { label: "Rejected", icon: XCircle,      color: "text-red-400",     bg: "bg-red-400/10" },
};

type Tournament = typeof MOCK_TOURNAMENTS[0];
type Registration = Tournament["registrations"][0];

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function RegistrationsPage() {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  if (selectedTournament) {
    return (
      <RegistrationList
        tournament={selectedTournament}
        onBack={() => setSelectedTournament(null)}
        selectedReg={selectedReg}
        setSelectedReg={setSelectedReg}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-2 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Registrations</h1>
        <p className="text-white/40 text-sm mt-1">Select a tournament to view its registrations.</p>
      </div>

      <div className="px-5 pt-4 max-w-2xl mx-auto space-y-3">
        {MOCK_TOURNAMENTS.map((t) => {
          const approved = t.registrations.filter((r) => r.status === "APPROVED").length;
          const pending  = t.registrations.filter((r) => r.status === "PENDING").length;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTournament(t)}
              className="w-full text-left bg-[#0A101D] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/40 transition-all active:scale-[0.99] group"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-primary" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-black text-white text-sm truncate">{t.name}</div>
                <div className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">{t.sport} · {t.startDate}</div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[9px] font-black text-white/30 uppercase tracking-widest">
                    <Users className="w-3 h-3" /> {t.registrations.length} total
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3" /> {approved} approved
                  </span>
                  {pending > 0 && (
                    <span className="flex items-center gap-1 text-[9px] font-black text-yellow-400 uppercase tracking-widest">
                      <Clock className="w-3 h-3" /> {pending} pending
                    </span>
                  )}
                </div>
              </div>

              {/* Status + arrow */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  t.status === "ONGOING"  ? "bg-primary/10 text-primary" :
                  t.status === "UPCOMING" ? "bg-blue-400/10 text-blue-400" :
                  "bg-white/5 text-white/30"
                }`}>
                  {t.status}
                </span>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
              </div>
            </button>
          );
        })}

        {MOCK_TOURNAMENTS.length === 0 && (
          <div className="bg-[#0A101D] border border-dashed border-white/10 rounded-2xl py-16 text-center">
            <Trophy className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm font-bold text-white/30 uppercase tracking-widest">No tournaments yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Registration List for a Tournament ─────────────────────────────────────
function RegistrationList({
  tournament,
  onBack,
  selectedReg,
  setSelectedReg,
}: {
  tournament: Tournament;
  onBack: () => void;
  selectedReg: Registration | null;
  setSelectedReg: (r: Registration | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [regs, setRegs] = useState<Registration[]>(tournament.registrations);

  const updateReg = (id: string, patch: Partial<Registration>) => {
    setRegs((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSelectedReg(selectedReg?.id === id ? { ...selectedReg, ...patch } : selectedReg);
  };

  const markPayment = (id: string) => updateReg(id, { feePaid: true });
  const approveReg  = (id: string) => updateReg(id, { status: "APPROVED" });
  const rejectReg   = (id: string) => updateReg(id, { status: "REJECTED" });

  const filtered = regs.filter((r) => {
    const matchSearch =
      r.playerName.toLowerCase().includes(search.toLowerCase()) ||
      r.playerId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const approved = regs.filter((r) => r.status === "APPROVED").length;
  const pending  = regs.filter((r) => r.status === "PENDING").length;
  const revenue  = regs.filter((r) => r.feePaid).reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-black text-white text-sm truncate">{tournament.name}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">{tournament.sport}</div>
        </div>
      </div>

      <div className="px-5 pt-5 max-w-2xl mx-auto space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0A101D] border border-white/5 rounded-xl p-3 text-center">
            <div className="text-xl font-black text-white">{tournament.registrations.length}</div>
            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Total</div>
          </div>
          <div className="bg-[#0A101D] border border-white/5 rounded-xl p-3 text-center">
            <div className="text-xl font-black text-primary">{approved}</div>
            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Approved</div>
          </div>
          <div className="bg-[#0A101D] border border-white/5 rounded-xl p-3 text-center">
            <div className="text-base font-black text-blue-400">₹{revenue}</div>
            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Revenue</div>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player or ID..."
              className="w-full bg-[#0A101D] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-1 p-1 bg-[#0A101D] border border-white/10 rounded-xl">
            {["ALL", "APPROVED", "PENDING", "REJECTED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  statusFilter === s ? "bg-primary text-black" : "text-white/40 hover:text-white"
                }`}
              >
                {s === "ALL" ? "All" : s[0]}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-[#0A101D] border border-dashed border-white/10 rounded-2xl py-12 text-center">
              <Users className="w-7 h-7 text-white/15 mx-auto mb-3" />
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">No registrations found</p>
            </div>
          ) : (
            filtered.map((reg) => {
              const cfg = STATUS_CONFIG[reg.status];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={reg.id}
                  onClick={() => setSelectedReg(reg)}
                  className="bg-[#0A101D] border border-white/5 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-all active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <UserCircle2 className="w-6 h-6 text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-sm text-white truncate">{reg.playerName}</span>
                      <span className="text-[9px] font-bold text-white/25 font-mono shrink-0">{reg.playerId}</span>
                    </div>
                    <div className="text-[10px] text-white/40">{reg.category} · Registered {reg.registeredAt}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {cfg.label}
                    </div>
                    <span className={`text-[10px] font-bold ${reg.feePaid ? "text-primary" : "text-red-400"}`}>
                      {reg.feePaid ? `₹${reg.amount} Paid` : "Unpaid"}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/15 shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedReg && (() => {
        const cfg = STATUS_CONFIG[selectedReg.status];
        const StatusIcon = cfg.icon;
        return (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => setSelectedReg(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative z-10 w-full max-w-lg bg-[#0A101D] border border-white/10 rounded-t-3xl md:rounded-3xl p-6 space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-white/10 mx-auto md:hidden" />

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <UserCircle2 className="w-8 h-8 text-white/30" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">{selectedReg.playerName}</h2>
                  <span className="text-xs text-white/30 font-mono">{selectedReg.playerId}</span>
                </div>
                <div className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${cfg.bg} ${cfg.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: ShieldCheck, label: "Category",   value: selectedReg.category },
                  { icon: Calendar,    label: "Registered",  value: selectedReg.registeredAt },
                  { icon: Mail,        label: "Email",        value: selectedReg.email },
                  { icon: Phone,       label: "Phone",        value: selectedReg.phone },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1 text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">
                      <Icon className="w-3 h-3" />{label}
                    </div>
                    <div className="text-white text-xs font-bold truncate">{value}</div>
                  </div>
                ))}
              </div>

              <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${selectedReg.feePaid ? "bg-primary/10 border-primary/20" : "bg-red-400/10 border-red-400/20"}`}>
                <div>
                  <div className="text-xs font-black text-white/50 uppercase tracking-widest">Registration Fee</div>
                  <div className={`font-black text-base mt-0.5 ${selectedReg.feePaid ? "text-primary" : "text-red-400"}`}>
                    ₹{selectedReg.amount} {selectedReg.feePaid ? "· Paid" : "· Unpaid"}
                  </div>
                </div>
                {!selectedReg.feePaid && (
                  <button
                    onClick={() => markPayment(selectedReg.id)}
                    className="flex items-center gap-1.5 bg-primary text-black text-xs font-black px-3 py-2 rounded-xl hover:bg-primary-dark active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark as Paid
                  </button>
                )}
                {selectedReg.feePaid && (
                  <div className="flex items-center gap-1 text-primary text-xs font-black">
                    <CheckCircle2 className="w-4 h-4" /> Paid
                  </div>
                )}
              </div>

              {/* Status Actions — always visible */}
              <div>
                <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Registration Status</div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => approveReg(selectedReg.id)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${
                      selectedReg.status === "APPROVED"
                        ? "bg-primary text-black shadow-[0_4px_15px_rgba(27,156,86,0.3)]"
                        : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {selectedReg.status === "APPROVED" ? "✓ Approved" : "Approve"}
                  </button>
                  <button
                    onClick={() => rejectReg(selectedReg.id)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${
                      selectedReg.status === "REJECTED"
                        ? "bg-red-500 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)]"
                        : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    {selectedReg.status === "REJECTED" ? "✕ Rejected" : "Reject"}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSelectedReg(null)}
                className="w-full py-3 rounded-xl bg-white/5 text-white/40 font-bold text-sm hover:bg-white/10 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}