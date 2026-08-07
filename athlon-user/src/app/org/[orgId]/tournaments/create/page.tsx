"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, ImageIcon, X } from "lucide-react";
import Link from "next/link";

import { TournamentService, CategoryService } from "@/lib/api/tournaments";
import { OrganizationService } from "@/lib/api/organization";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";

export default function CreateTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const orgUuid = params.orgId as string;
  const posterInputRef = useRef<HTMLInputElement>(null);

  const { userId, userUuid } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgCategories, setOrgCategories] = useState<any[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const orgResponse = await OrganizationService.getById(orgUuid);
        const orgData = orgResponse.data;
        if (orgData && orgData.orgId) {
          const catResponse = await CategoryService.getByOrg(orgData.orgId);
          if (catResponse && catResponse.data) {
            setOrgCategories(catResponse.data);
          }
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    loadCategories();
  }, [orgUuid]);

  const [formData, setFormData] = useState({
    name: "",
    type: "PRIVATE",
    location: "",
    mapLink: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    tournamentType: "KNOCKOUT",
    sport: "",
    category: "",
    categories: [] as string[],
    matchFormat: "",
    matchFormats: [] as string[],
    playersCount: "",
    registrationFees: "",
    description: "",
    contactPhone: "",
  });

  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = () => setPosterPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // We need orgId (number) to create the tournament. Fetch org by UUID
      const orgResponse = await OrganizationService.getById(orgUuid);
      const orgData = orgResponse.data; // Response is ApiResponse<{ orgId... }>

      if (!orgData || !orgData.orgId) {
        throw new Error("Could not load organization details.");
      }

      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);

      // Format start date and time
      const startDateTime = formData.startDate
        ? `${formData.startDate}T${formData.startTime || '00:00'}:00`
        : "";
      if (startDateTime) form.append("startDate", startDateTime);

      // Format end date and time
      const endDateTime = formData.endDate
        ? `${formData.endDate}T${formData.endTime || '00:00'}:00`
        : "";
      if (endDateTime) form.append("endDate", endDateTime);

      form.append("tournamentType", formData.tournamentType);
      form.append("sport", formData.sport);
      if (formData.tournamentType === 'TEAM_EVENT') {
        form.append("matchFormat", formData.matchFormats.join(","));
        form.append("category", formData.categories.join(","));
      } else {
        form.append("matchFormat", formData.matchFormat);
        form.append("category", formData.category);
      }
      if (formData.playersCount) {
        form.append("playersCount", formData.playersCount.toString());
      }
      form.append("visibility", formData.type);
      form.append("location", formData.location);
      if (formData.mapLink) form.append("mapLink", formData.mapLink);
      if (formData.contactPhone) form.append("contactPhone", formData.contactPhone);
      if (formData.registrationFees) form.append("registrationFees", formData.registrationFees);

      form.append("organizerId", orgData.orgId.toString());
      form.append("organizerUuid", orgUuid);

      if (userId) form.append("userId", userId.toString());
      if (userUuid) form.append("userUuid", userUuid);
      if (userId) form.append("createdBy", userId.toString());

      if (posterFile) {
        form.append("poster", posterFile);
      }

      await TournamentService.create(form);

      router.push(`/org/${orgUuid}/tournaments`);
    } catch (error) {
      console.error("Failed to create tournament", error);
      // Handle error display here
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-[#0D1520] border border-white/10 rounded-2xl px-4 py-4 text-white text-base focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all placeholder:text-white/25 font-medium";

  const labelClass = "block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center gap-4">
        <Link href={`/org/${orgUuid}/tournaments`} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1B9C56]" />
          <span className="text-white/50 text-sm font-bold tracking-widest uppercase"> CREATE TOURNAMENT</span>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-7 max-w-2xl mx-auto">

        {/* VISIBILITY */}
        <div>
          <label className={labelClass}>Visibility</label>
          <div className="space-y-2">
            {[
              { value: "PRIVATE", label: "Private", desc: "Me and players I invite can see this Tournament" },
              { value: "PUBLIC", label: "Public", desc: "Anyone can discover and view this Tournament" },
            ].map((opt) => (
              <div
                key={opt.value}
                onClick={() => setFormData({ ...formData, type: opt.value })}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 cursor-pointer transition-all ${formData.type === opt.value
                  ? "border-[#1B9C56] bg-[#1B9C56]/10"
                  : "border-white/10 bg-[#0D1520]"
                  }`}
              >
                {/* Radio dot */}
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.type === opt.value ? "border-[#1B9C56]" : "border-white/30"
                  }`}>
                  {formData.type === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-[#1B9C56]" />
                  )}
                </div>
                <div>
                  <div className={`font-bold text-sm ${formData.type === opt.value ? "text-white" : "text-white/70"}`}>
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-white/35 mt-0.5">{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOURNAMENT NAME */}
        <div>
          <label className={labelClass}>Tournament Name <span className="text-[#1B9C56]">*</span></label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
            placeholder="E.g. State Open 2026"
          />
        </div>

        {/* SPORT */}
        <div>
          <label className={labelClass}>Sport <span className="text-[#1B9C56]">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            {['Badminton', 'Cricket', 'Football', 'Volleyball'].map((sport) => (
              <button
                key={sport}
                type="button"
                onClick={() => {
                  const updates: any = { sport };
                  if (sport !== 'Badminton' && formData.tournamentType === 'TEAM_EVENT') {
                    updates.tournamentType = 'KNOCKOUT';
                  }
                  setFormData({ ...formData, ...updates });
                }}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                  formData.sport === sport
                    ? 'border-[#1B9C56] bg-[#1B9C56]/10 text-white'
                    : 'border-white/10 bg-[#0D1520] text-white/50 hover:border-white/25 hover:text-white/80'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        {/* TOURNAMENT TYPE */}
        <div>
          <label className={labelClass}>Tournament Type <span className="text-[#1B9C56]">*</span></label>
          <div className="grid grid-cols-3 gap-2">
            {['KNOCKOUT', 'LEAGUE', 'TEAM_EVENT'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  const updates: any = { tournamentType: type };
                  if (type === 'TEAM_EVENT') {
                    updates.sport = 'Badminton';
                  }
                  setFormData({ ...formData, ...updates });
                }}
                disabled={formData.sport && formData.sport !== 'Badminton' && type === 'TEAM_EVENT'}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  formData.tournamentType === type
                    ? 'border-[#1B9C56] bg-[#1B9C56]/10 text-white'
                    : 'border-white/10 bg-[#0D1520] text-white/50 hover:border-white/25 hover:text-white/80'
                }`}
              >
                {type === 'KNOCKOUT' ? 'Knockout' : type === 'LEAGUE' ? 'League' : 'Team League'}
              </button>
            ))}
          </div>
        </div>


        {/* MATCH FORMAT & PLAYERS COUNT */}
        <div className="space-y-7">
          {formData.tournamentType !== 'TEAM_EVENT' && (
            <div>
              <label className={labelClass}>Match Format <span className="text-[#1B9C56]">*</span></label>
              <select
                value={formData.matchFormat}
                onChange={(e) => setFormData({ ...formData, matchFormat: e.target.value })}
                className={`${inputClass} appearance-none`}
              >
                <option value="" disabled>Select format...</option>
                <option value="Men's Singles">Men's Singles</option>
                <option value="Women's Singles">Women's Singles</option>
                <option value="Men's Doubles">Men's Doubles</option>
                <option value="Women's Doubles">Women's Doubles</option>
                <option value="Mixed Doubles">Mixed Doubles</option>
              </select>
            </div>
          )}

          {formData.tournamentType === 'TEAM_EVENT' && (
            <div className="space-y-7">
              <div>
                <label className={labelClass}>Match Formats <span className="text-[#1B9C56]">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {["Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"].map(format => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => {
                        const newFormats = formData.matchFormats.includes(format)
                          ? formData.matchFormats.filter(f => f !== format)
                          : [...formData.matchFormats, format];
                        setFormData({ ...formData, matchFormats: newFormats });
                      }}
                      className={`py-2 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                        formData.matchFormats.includes(format)
                          ? 'border-[#1B9C56] bg-[#1B9C56]/10 text-white'
                          : 'border-white/10 bg-[#0D1520] text-white/50 hover:border-white/25 hover:text-white/80'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Players Count <span className="text-[#1B9C56]">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={formData.playersCount}
                  onChange={(e) => setFormData({ ...formData, playersCount: e.target.value })}
                  className={inputClass}
                  placeholder="E.g. 11"
                />
              </div>
            </div>
          )}
        </div>

        {/* VENUE */}
        <div>
          <label className={labelClass}>Venue <span className="text-[#1B9C56]">*</span></label>
          <div className="relative">
            <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1B9C56]" />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`${inputClass} pl-12`}
              placeholder="Search court, stadium, area..."
            />
          </div>
        </div>

        {/* GOOGLE MAP LINK */}
        <div>
          <label className={labelClass}>Google Maps Link (Optional)</label>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="url"
              value={formData.mapLink}
              onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
              className={`${inputClass} pl-12 text-sm`}
              placeholder="Paste Google Maps link here..."
            />
          </div>
          {formData.mapLink && (
            <a
              href={formData.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 text-[10px] font-bold text-[#1B9C56] hover:underline uppercase tracking-wider"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Preview on Google Maps
            </a>
          )}
        </div>

        {/* DATES */}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Start Date <span className="text-[#1B9C56]">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-[#0D1520] border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white text-sm focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all font-medium"
                />
              </div>
              <div className="relative">
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-[#0D1520] border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>End Date <span className="text-[#1B9C56]">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-[#0D1520] border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white text-sm focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all font-medium"
                />
              </div>
              <div className="relative">
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full bg-[#0D1520] border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* POSTER IMAGE */}
        <div>
          <label className={labelClass}>Tournament Poster</label>
          <input
            ref={posterInputRef}
            type="file"
            accept="image/*"
            onChange={handlePosterChange}
            className="hidden"
          />
          {posterPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[16/7]">
              <img src={posterPreview} alt="Poster" className="w-full h-full object-cover" />
              <button
                onClick={() => { setPosterPreview(null); setPosterFile(null); }}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => posterInputRef.current?.click()}
              className="w-full bg-[#0D1520] border-2 border-dashed border-white/15 rounded-2xl py-8 flex flex-col items-center gap-3 hover:border-[#1B9C56]/50 hover:bg-[#1B9C56]/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#1B9C56]/10 transition-colors">
                <ImageIcon className="w-6 h-6 text-white/30 group-hover:text-[#1B9C56] transition-colors" />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white/50 group-hover:text-white/70 transition-colors">Tap to upload poster</div>
                <div className="text-xs text-white/25 mt-0.5">JPG, PNG or WEBP · Max 5MB</div>
              </div>
            </button>
          )}
        </div>


        {/* CATEGORY */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">
              {formData.tournamentType === 'TEAM_EVENT' ? 'Categories' : 'Category'}
            </label>
            <Link
              href={`/org/${orgUuid}/categories?returnTo=create-tournament`}
              className="text-[10px] font-bold text-[#1B9C56] hover:text-[#158045] hover:underline uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              + Add Category
            </Link>
          </div>
          
          {formData.tournamentType !== 'TEAM_EVENT' ? (
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`${inputClass} appearance-none`}
              disabled={!formData.sport}
            >
              <option value="" disabled>Select category...</option>
              {orgCategories
                .filter((c) => c.sportType === formData.sport)
                .map((c) => (
                  <option key={c.categoryUuid} value={c.categoryName}>
                    {c.categoryName}
                  </option>
                ))}
            </select>
          ) : (
            <div className="flex flex-wrap gap-2">
              {orgCategories.filter((c) => c.sportType === formData.sport).length === 0 && formData.sport && (
                <div className="text-sm text-white/40 border border-white/10 rounded-xl px-4 py-3 bg-[#0D1520]">No categories found for {formData.sport}.</div>
              )}
              {orgCategories
                .filter((c) => c.sportType === formData.sport)
                .map((c) => (
                  <button
                    key={c.categoryUuid}
                    type="button"
                    onClick={() => {
                      const newCategories = formData.categories.includes(c.categoryName)
                        ? formData.categories.filter((name: string) => name !== c.categoryName)
                        : [...formData.categories, c.categoryName];
                      setFormData({ ...formData, categories: newCategories });
                    }}
                    className={`py-2 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                      formData.categories.includes(c.categoryName)
                        ? 'border-[#1B9C56] bg-[#1B9C56]/10 text-white'
                        : 'border-white/10 bg-[#0D1520] text-white/50 hover:border-white/25 hover:text-white/80'
                    }`}
                  >
                    {c.categoryName}
                  </button>
                ))}
            </div>
          )}
          {!formData.sport && (
            <div className="text-[10px] text-[#1B9C56] mt-2 ml-1">Please select a sport first to see categories</div>
          )}
        </div>

        {/* REGISTRATION FEES */}
        <div>
          <label className={labelClass}>Registration Fees</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-black text-lg">₹</span>
            <input
              type="number"
              min="0"
              value={formData.registrationFees}
              onChange={(e) => setFormData({ ...formData, registrationFees: e.target.value })}
              className={`${inputClass} pl-9`}
              placeholder="0 for free entry"
            />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className={labelClass}>Description (Optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`${inputClass} min-h-[100px] resize-none`}
            placeholder="Venue notes, schedule, links..."
          />
        </div>

        {/* CONTACT PHONE */}
        <div>
          <label className={labelClass}>Contact Phone (Optional)</label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className={inputClass}
            placeholder="10-digit mobile number"
            maxLength={10}
          />
        </div>

        {/* CREATE BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={!formData.name.trim() || !formData.location.trim() || isSubmitting}
          className="w-full bg-[#1B9C56] disabled:opacity-40 disabled:cursor-not-allowed text-black text-base font-black uppercase tracking-wider py-5 rounded-2xl transition-all hover:bg-[#158045] active:scale-95 shadow-[0_8px_30px_rgba(27,156,86,0.3)]"
        >
          {isSubmitting ? "Creating..." : "Create Tournament"}
        </button>

      </div>
    </div>
  );
}
