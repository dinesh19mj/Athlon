"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

export default function CreateTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "PUBLIC",
    location: "",
    startDate: "",
    endDate: "",
    categories: [] as any[],
  });

  const [categoryInput, setCategoryInput] = useState({
    name: "",
    sportType: "Tennis",
    matchFormat: "Singles",
    maxPlayers: 32,
  });

  const handleNext = () => {
    if (step === 1) setStep(2);
    else handleSubmit();
  };

  const handleSubmit = () => {
    // Implement actual API call here
    console.log("Submitting tournament:", formData);
    router.push(`/org/${orgId}/tournaments`);
  };

  const addCategory = () => {
    if (!categoryInput.name) return;
    setFormData((prev) => ({
      ...prev,
      categories: [...prev.categories, { ...categoryInput, id: Date.now() }],
    }));
    setCategoryInput({ ...categoryInput, name: "" });
  };

  const removeCategory = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href={`/org/${orgId}/tournaments`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Tournaments
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {step === 1 ? "Create Tournament" : "Add Categories"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {step === 1
            ? "Set up the basic information for your new tournament."
            : "Define the categories and divisions for players to register in."}
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-secondary"}`} />
        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
      </div>

      {step === 1 ? (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tournament Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="e.g. Summer Championship 2026"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px]"
                placeholder="Brief details about the tournament..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Visibility Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                >
                  <option value="PUBLIC">Public (Open to everyone)</option>
                  <option value="PRIVATE">Private (Invite / Members only)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location / Venue</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="e.g. Main Stadium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add a Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="block text-xs text-muted-foreground mb-1">Name</label>
                <input
                  type="text"
                  value={categoryInput.name}
                  onChange={(e) => setCategoryInput({ ...categoryInput, name: e.target.value })}
                  placeholder="e.g. U-15 Boys"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Sport</label>
                <select
                  value={categoryInput.sportType}
                  onChange={(e) => setCategoryInput({ ...categoryInput, sportType: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option>Tennis</option>
                  <option>Badminton</option>
                  <option>Table Tennis</option>
                  <option>Squash</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Format</label>
                <select
                  value={categoryInput.matchFormat}
                  onChange={(e) => setCategoryInput({ ...categoryInput, matchFormat: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option>Singles</option>
                  <option>Doubles</option>
                  <option>Mixed Doubles</option>
                  <option>Team</option>
                </select>
              </div>
              <button
                onClick={addCategory}
                disabled={!categoryInput.name}
                className="flex items-center justify-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-xl font-medium hover:bg-secondary/80 disabled:opacity-50 transition-all h-[38px]"
              >
                <PlusIcon className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {formData.categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between bg-card/50 border border-border rounded-xl p-4">
                <div>
                  <h4 className="font-medium text-foreground">{cat.name}</h4>
                  <p className="text-sm text-muted-foreground">{cat.sportType} • {cat.matchFormat}</p>
                </div>
                <button
                  onClick={() => removeCategory(cat.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2Icon className="w-5 h-5" />
                </button>
              </div>
            ))}
            {formData.categories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No categories added yet.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="px-6 py-2.5 rounded-xl text-foreground font-medium hover:bg-secondary transition-all"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
        >
          {step === 1 ? "Next Step" : "Create Tournament"}
        </button>
      </div>
    </div>
  );
}
