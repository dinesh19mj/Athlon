"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  User,
  Users,
  ChevronRight,
  Trophy,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Calendar,
  Ticket,
  UserCheck,
  UserPlus,
  Star,
  Zap,
  Camera,
  Upload,
  X,
  BadgeCheck,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { TeamChampionshipService, TeamChampionship } from "@/lib/api/teamChampionship";
import { UserService, UserResponse } from "@/lib/api/user";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface PlayerCheckState {
  isChecking: boolean;
  isAppUser: boolean | null;
  user: UserResponse | null;
  photo: string | null;
}

export default function RegisterTeamForChampionshipPage() {
  const params = useParams();
  const router = useRouter();
  const championshipUuid = params.id as string;
  const { userId, userUuid, userEmail } = useAuthStore();

  const [championship, setChampionship] = useState<TeamChampionship | null>(null);
  const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [step, setStep] = useState(1);
  const [registrationType, setRegistrationType] = useState<"self" | "someone_else">("self");

  const [teamName, setTeamName] = useState("");
  const [captain, setCaptain] = useState({ name: "", phone: "" });

  // Captain Verification & Photo State
  const [captainCheck, setCaptainCheck] = useState<PlayerCheckState>({
    isChecking: false,
    isAppUser: null,
    user: null,
    photo: null,
  });

  const captainFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [cRes, uRes] = await Promise.all([
          TeamChampionshipService.getById(championshipUuid),
          userUuid ? UserService.getUserByUuid(userUuid) : Promise.resolve(null),
        ]);
        if (cRes) setChampionship(cRes);
        if (uRes?.data) setUserProfile(uRes.data);
      } catch (err) {
        console.error("Failed to load championship registration data:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [championshipUuid, userUuid]);

  // Pre-fill user data if self registration
  useEffect(() => {
    if (registrationType === "self" && userProfile) {
      setCaptain({
        name: `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim(),
        phone: userProfile.phone || "",
      });
      setCaptainCheck({
        isChecking: false,
        isAppUser: true,
        user: userProfile,
        photo: null,
      });
    } else if (registrationType === "someone_else") {
      setCaptain({ name: "", phone: "" });
      setCaptainCheck({
        isChecking: false,
        isAppUser: null,
        user: null,
        photo: null,
      });
    }
  }, [registrationType, userProfile]);

  // Debounced Phone Lookup for Captain (when registering for someone else)
  useEffect(() => {
    if (registrationType !== "someone_else") return;

    const cleaned = captain.phone.replace(/[^0-9]/g, "");
    if (cleaned.length < 10) {
      setCaptainCheck((prev) => ({ ...prev, isChecking: false, isAppUser: null, user: null }));
      return;
    }

    setCaptainCheck((prev) => ({ ...prev, isChecking: true }));
    const timer = setTimeout(async () => {
      try {
        const res = await UserService.getUserByPhone(cleaned);
        if (res && res.data && res.data.uuid) {
          setCaptainCheck((prev) => ({
            ...prev,
            isChecking: false,
            isAppUser: true,
            user: res.data,
          }));
          if (!captain.name) {
            setCaptain((prev) => ({
              ...prev,
              name: `${res.data.firstName || ""} ${res.data.lastName || ""}`.trim(),
            }));
          }
        } else {
          setCaptainCheck((prev) => ({
            ...prev,
            isChecking: false,
            isAppUser: false,
            user: null,
          }));
        }
      } catch {
        setCaptainCheck((prev) => ({
          ...prev,
          isChecking: false,
          isAppUser: false,
          user: null,
        }));
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [captain.phone, registrationType]);

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCaptainCheck((prev) => ({ ...prev, photo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setCaptainCheck((prev) => ({ ...prev, photo: null }));
    if (captainFileInputRef.current) captainFileInputRef.current.value = "";
  };

  const handleNext = () => setStep((p) => p + 1);
  const handleBack = () => setStep((p) => p - 1);

  const handleSubmit = async () => {
    if (!championship?.championshipId) return;

    try {
      setSubmitting(true);

      const ownerUserId =
        registrationType === "self" && userId ? Number(userId) : undefined;

      const ownerUserUuid =
        registrationType === "self" && userUuid
          ? userUuid
          : captainCheck.user?.uuid || undefined;

      await TeamChampionshipService.registerTeam({
        championshipId: championship.championshipId,
        championshipUuid: championship.championshipUuid,
        teamName: teamName.trim(),
        captainName: captain.name.trim(),
        contactPhone: captain.phone.trim(),
        contactEmail: userEmail || undefined,
        ownerUserId,
        ownerUserUuid,
      });

      setIsSuccess(true);
    } catch (err: any) {
      alert(err.message || "Failed to register team");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !championship) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-foreground/50">Loading Team Registration...</p>
        </div>
      </div>
    );
  }

  // ── SUCCESS CONFIRMATION SCREEN ──────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 selection:bg-primary selection:text-black">
        <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-black rounded-full flex items-center justify-center text-xs font-black shadow-lg">
              ✓
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight">Team Registered Successfully!</h1>
            <p className="text-xs text-foreground/60 leading-relaxed max-w-sm mx-auto">
              Your team <span className="text-primary font-black">"{teamName}"</span> has been officially registered for{" "}
              <span className="text-foreground font-bold">{championship.name}</span>.
            </p>
          </div>

          {/* Ticket Summary Card */}
          <div
            className="p-5 rounded-2xl border text-left space-y-4 shadow-xl"
            style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--athlon-border)" }}>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-black text-foreground uppercase tracking-wider">{championship.name}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                Confirmed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-foreground/40 block">Team Name</span>
                <span className="font-black text-foreground">{teamName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-foreground/40 block">Captain / Owner</span>
                <span className="font-black text-foreground">{captain.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-foreground/40 block">Contact Phone</span>
                <span className="font-mono text-foreground">{captain.phone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-foreground/40 block">Registration Fee</span>
                <span className="font-black text-primary">
                  {championship.teamRegistrationFee > 0 ? `₹${championship.teamRegistrationFee}` : "FREE"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => router.push(`/home/team-championship/${championship.championshipUuid}`)}
              className="flex-1 py-3.5 bg-primary text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              View Championship
            </button>
            <button
              onClick={() => router.push(`/home/tournaments`)}
              className="flex-1 py-3.5 border font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-white/5 transition-all text-foreground/80"
              style={{ borderColor: "var(--athlon-border)" }}
            >
              All Tournaments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-black">
      {/* ── TOP NAVBAR WITH STEP PROGRESS ─────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b transition-all"
        style={{ backgroundColor: "var(--athlon-navigation)", borderColor: "var(--athlon-border)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={step === 2 ? handleBack : () => router.push(`/home/team-championship/${championshipUuid}`)}
              className="w-8 h-8 rounded-xl flex items-center justify-center border text-foreground/80 hover:text-foreground transition-all hover:scale-105 active:scale-95 shrink-0"
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xs font-black uppercase tracking-wider text-foreground">
                Team Championship Registration
              </h1>
              <p className="text-[10px] text-foreground/50 font-bold">Step {step} of 2</p>
            </div>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-1.5 rounded-full transition-all ${step >= 1 ? "bg-primary" : "bg-foreground/10"}`} />
            <div className={`w-6 h-1.5 rounded-full transition-all ${step >= 2 ? "bg-primary" : "bg-foreground/10"}`} />
          </div>
        </div>
      </header>

      {/* ── CHAMPIONSHIP MINI BANNER ─────────────────────────────────────── */}
      <div
        className="border-b"
        style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-foreground truncate">{championship.name}</p>
            <div className="flex items-center gap-3 flex-wrap">
              {championship.location && (
                <span className="text-[10px] text-foreground/50 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {championship.location}
                </span>
              )}
              {championship.startDate && (
                <span className="text-[10px] text-foreground/50 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(championship.startDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Team Entry Fee</p>
            <p className="text-sm font-black text-primary">
              {championship.teamRegistrationFee > 0 ? `₹${championship.teamRegistrationFee}` : "FREE"}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6 pb-24">
        {/* ── STEP 1: Team & Owner Details ──────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* Section heading */}
            <div className="space-y-1">
              <h2 className="text-xl font-black text-foreground tracking-tight">Register Your Team</h2>
              <p className="text-xs text-foreground/55 font-medium">
                Enter your team name and owner details to claim your spot.
              </p>
            </div>

            {/* ── Registration type selector ──────────────────────────── */}
            <div
              className="p-1.5 rounded-2xl border grid grid-cols-2 gap-1"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <button
                type="button"
                onClick={() => setRegistrationType("self")}
                className={`relative py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2.5 ${
                  registrationType === "self"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-black"
                    : "text-foreground/50 hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <UserCheck
                  className={`w-4 h-4 ${
                    registrationType === "self" ? "text-primary-foreground" : "text-foreground/40"
                  }`}
                />
                <span>I'm Playing</span>
                {registrationType === "self" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setRegistrationType("someone_else")}
                className={`relative py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2.5 ${
                  registrationType === "someone_else"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-black"
                    : "text-foreground/50 hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <UserPlus
                  className={`w-4 h-4 ${
                    registrationType === "someone_else" ? "text-primary-foreground" : "text-foreground/40"
                  }`}
                />
                <span>For Others</span>
                {registrationType === "someone_else" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-background" />
                )}
              </button>
            </div>

            {/* Context hint */}
            <div
              className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium"
              style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
            >
              {registrationType === "self" ? (
                <>
                  <Star className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-foreground/60">Your profile details have been pre-filled.</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-foreground/60">
                    Enter the phone number. If registered on Athlon, details will auto-sync; otherwise, attach their photo.
                  </span>
                </>
              )}
            </div>

            {/* ── Team Name Input ────────────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/45 flex items-center gap-1.5 pl-1">
                <Users className="w-3 h-3" />
                Team Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30"
                style={{
                  backgroundColor: "var(--athlon-surface)",
                  borderColor: "var(--athlon-border)",
                  color: "var(--athlon-text)",
                }}
                placeholder="e.g. The Smashers"
              />
            </div>

            {/* ── Team Owner / Captain Card ──────────────────────────── */}
            <div
              className="rounded-2xl border p-5 space-y-5 relative overflow-hidden"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/50" />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground">Team Owner / Captain</h3>
                  <p className="text-[10px] text-foreground/45 font-medium">Primary registration contact</p>
                </div>

                {registrationType === "self" && (
                  <span className="ml-auto px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}

                {registrationType === "someone_else" && (
                  <div className="ml-auto">
                    {captainCheck.isChecking && (
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                      </span>
                    )}
                    {!captainCheck.isChecking && captainCheck.isAppUser === true && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {!captainCheck.isChecking && captainCheck.isAppUser === false && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Unregistered
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/45 pl-0.5 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={captain.phone}
                    onChange={(e) => setCaptain({ ...captain, phone: e.target.value })}
                    disabled={registrationType === "self"}
                    className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "var(--athlon-surface)",
                      borderColor: "var(--athlon-border)",
                      color: "var(--athlon-text)",
                    }}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/45 pl-0.5 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={captain.name}
                    onChange={(e) => setCaptain({ ...captain, name: e.target.value })}
                    disabled={registrationType === "self"}
                    className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "var(--athlon-surface)",
                      borderColor: "var(--athlon-border)",
                      color: "var(--athlon-text)",
                    }}
                    placeholder="Full name"
                  />
                </div>
              </div>

              {/* ── Photo Upload Provision for Captain (When Unregistered) ── */}
              {registrationType === "someone_else" && captainCheck.isAppUser === false && (
                <div
                  className="p-4 rounded-xl border space-y-3 animate-in fade-in duration-300"
                  style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="text-xs font-black text-foreground block">Captain Photo (ID & Scorecard)</span>
                        <span className="text-[10px] text-foreground/50">
                          Since this contact is not registered on Athlon, upload their photo.
                        </span>
                      </div>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={captainFileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {captainCheck.photo ? (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 border border-white/10">
                      <img
                        src={captainCheck.photo}
                        alt="Captain"
                        className="w-12 h-12 rounded-xl object-cover border border-primary/40 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-foreground block truncate">Photo Attached</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Ready for Scorecard Display</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => captainFileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-colors"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="p-1.5 text-foreground/40 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => captainFileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border border-dashed border-white/20 hover:border-primary/50 bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-center gap-2 text-xs font-bold text-foreground/75 hover:text-foreground transition-all"
                    >
                      <Upload className="w-4 h-4 text-primary" />
                      <span>Upload Captain Photo (Optional)</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Continue Button ────────────────────────────────────── */}
            <button
              type="button"
              disabled={!captain.name.trim() || !captain.phone.trim() || !teamName.trim()}
              onClick={handleNext}
              className="w-full py-4 bg-primary text-primary-foreground font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              Review & Confirm
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ── STEP 2: Review & Final Confirmation ──────────────────────── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 border border-primary/20 text-primary mb-1">
                <Sparkles className="w-3 h-3" />
                Final Review
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tight">Confirm Your Entry</h2>
              <p className="text-xs text-foreground/55 font-medium">Review your registration details before submitting.</p>
            </div>

            {/* Championship Ticket Preview */}
            <div
              className="rounded-2xl border overflow-hidden shadow-lg"
              style={{ backgroundColor: "var(--athlon-card)", borderColor: "var(--athlon-border)" }}
            >
              {/* Ticket header */}
              <div className="p-5 border-b border-dashed relative" style={{ borderColor: "var(--athlon-border)" }}>
                <div className="absolute -left-3 bottom-[-12px] w-6 h-6 rounded-full bg-background border border-white/5 z-10" />
                <div className="absolute -right-3 bottom-[-12px] w-6 h-6 rounded-full bg-background border border-white/5 z-10" />

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-wider">
                        {championship.sport || "Sports"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                        Team Championship
                      </span>
                    </div>
                    <h3 className="text-base font-black text-foreground leading-tight">{championship.name}</h3>
                    {championship.location && (
                      <p className="text-xs text-foreground/50 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {championship.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-wider">Team Entry Fee</p>
                    <p className="text-2xl font-black text-primary">
                      {championship.teamRegistrationFee > 0 ? `₹${championship.teamRegistrationFee}` : "FREE"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket body */}
              <div className="p-5 space-y-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/40 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Registration Summary
                </p>

                <div className="space-y-2.5">
                  {/* Team Name */}
                  <div
                    className="p-3.5 rounded-xl border flex items-center gap-3"
                    style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40">Team Name</p>
                      <p className="text-sm font-black text-foreground">{teamName}</p>
                    </div>
                  </div>

                  {/* Captain / Owner */}
                  <div
                    className="flex items-center justify-between p-3.5 rounded-xl border gap-3"
                    style={{ backgroundColor: "var(--athlon-surface)", borderColor: "var(--athlon-border)" }}
                  >
                    <div className="flex items-center gap-3">
                      {captainCheck.photo ? (
                        <img
                          src={captainCheck.photo}
                          alt="Captain"
                          className="w-9 h-9 rounded-xl object-cover border border-primary/40 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-black text-foreground leading-none">
                            {registrationType === "self" && userProfile
                              ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim()
                              : captain.name}
                          </p>
                          {(registrationType === "self" || captainCheck.isAppUser) && (
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">
                          Team Owner / Captain {captainCheck.photo && "· Photo Attached"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-foreground/50">{captain.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-primary text-primary-foreground font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Registering Team...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm & Submit Registration
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-foreground/35 font-medium">
              By confirming, you agree to the championship's terms and conditions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
