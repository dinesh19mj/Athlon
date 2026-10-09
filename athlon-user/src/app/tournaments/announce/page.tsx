'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Megaphone,
  Calendar,
  MapPin,
  Trophy,
  DollarSign,
  Phone,
  MessageCircle,
  Mail,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Sparkles,
  AlertCircle,
  X,
  ChevronRight,
  Flame,
  Clock,
  Layers,
  ArrowRight,
  Zap,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { UserService } from '@/lib/api/user';
import { TournamentAnnouncementService } from '@/lib/api/tournamentAnnouncement';
import {
  LocationService,
  FALLBACK_INDIAN_STATES,
  FALLBACK_STATE_DISTRICTS
} from '@/lib/api/location';
import { SportMetadataService, SportMetadata, CategoryService } from '@/lib/api/tournaments';
import { getSportEmoji } from '@/lib/hooks/useOrgSports';

const FALLBACK_SPORTS = [
  { name: 'Badminton', icon: '🏸' },
  { name: 'Cricket', icon: '🏏' },
  { name: 'Football', icon: '⚽' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Table Tennis', icon: '🏓' },
  { name: 'Pickleball', icon: '🥒' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Volleyball', icon: '🏐' },
  { name: 'Athletics', icon: '🏃' },
  { name: 'Chess', icon: '♟️' },
  { name: 'Kabaddi', icon: '🤼' },
  { name: 'Squash', icon: '🎾' },
  { name: 'General', icon: '🏆' },
];

export default function AnnounceTournamentPage() {
  const router = useRouter();
  const { isAuthenticated, userUuid } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login?redirect=/tournaments/announce');
    }
  }, [mounted, isAuthenticated, router]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState('Badminton');
  const [categoryDetails, setCategoryDetails] = useState('');
  const [content, setContent] = useState('');

  // Dynamic Sports, Formats & Categories
  const [sportsList, setSportsList] = useState<{ name: string; icon: string }[]>(FALLBACK_SPORTS);
  const [sportsMetadataMap, setSportsMetadataMap] = useState<Record<string, SportMetadata>>({});
  const [commonCategories, setCommonCategories] = useState<any[]>([]);
  const [format, setFormat] = useState("Men's Singles");
  const [isCustomFormat, setIsCustomFormat] = useState(false);
  const [customFormat, setCustomFormat] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [newCustomCategory, setNewCustomCategory] = useState('');

  // Dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');

  // Location
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [locationMapUrl, setLocationMapUrl] = useState('');

  // Dynamic Location Lists
  const [statesList, setStatesList] = useState<string[]>([]);
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Commercials
  const [entryFee, setEntryFee] = useState('');
  const [prizePool, setPrizePool] = useState('');

  // Contacts & Link
  const [organizerName, setOrganizerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [externalRegistrationUrl, setExternalRegistrationUrl] = useState('');

  // Files
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [upiQrFile, setUpiQrFile] = useState<File | null>(null);
  const [upiQrPreview, setUpiQrPreview] = useState<string | null>(null);

  const posterInputRef = useRef<HTMLInputElement>(null);
  const upiQrInputRef = useRef<HTMLInputElement>(null);

  // Fetch Dynamic Sports and Common Categories from backend
  useEffect(() => {
    const fetchSportsAndCategories = async () => {
      try {
        const [sportsRes, catsRes] = await Promise.allSettled([
          SportMetadataService.getAllSports(),
          CategoryService.getCommonCategories(),
        ]);

        if (sportsRes.status === 'fulfilled') {
          const raw: any = sportsRes.value;
          const list: SportMetadata[] = Array.isArray(raw?.data?.data)
            ? raw.data.data
            : Array.isArray(raw?.data)
              ? raw.data
              : Array.isArray(raw)
                ? raw
                : [];

          if (list.length > 0) {
            const map: Record<string, SportMetadata> = {};
            const parsedSports = list.map((s) => {
              const name = s.sportName;
              const emoji = s.emoji || getSportEmoji(name);
              map[name.toLowerCase()] = s;
              return { name, icon: emoji };
            });
            setSportsList(parsedSports);
            setSportsMetadataMap(map);

            // Default to first sport if Badminton or first available
            const defaultSportObj = list.find((s) => s.sportName.toLowerCase() === 'badminton') || list[0];
            if (defaultSportObj) {
              setSport(defaultSportObj.sportName);
              const defaultFmt = defaultSportObj.defaultFormat || (defaultSportObj.formats?.[0]?.formatName) || "Men's Singles";
              setFormat(defaultFmt);
            }
          }
        }

        if (catsRes.status === 'fulfilled') {
          const rawCats: any = catsRes.value;
          const catList = Array.isArray(rawCats?.data?.data)
            ? rawCats.data.data
            : Array.isArray(rawCats?.data)
              ? rawCats.data
              : Array.isArray(rawCats)
                ? rawCats
                : [];
          setCommonCategories(catList);
        }
      } catch (e) {
        console.warn('Failed to load dynamic sports and categories:', e);
      }
    };

    fetchSportsAndCategories();
  }, []);

  // Compute formats based on currently selected sport
  const availableFormats = useMemo(() => {
    const meta = sportsMetadataMap[sport.toLowerCase()];
    if (meta && Array.isArray(meta.formats) && meta.formats.length > 0) {
      return meta.formats.map((f) => f.formatName);
    }
    const sLower = sport.toLowerCase();
    if (sLower.includes('badminton')) {
      return ["Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles", "Team Event", "Open Doubles"];
    }
    if (sLower.includes('cricket')) {
      return ["T20 Match", "Box / Turf Cricket", "Tennis Ball Cricket", "Limited Overs (30-50)", "Test / Multi-Day"];
    }
    if (sLower.includes('football') || sLower.includes('soccer')) {
      return ["5-a-side", "7-a-side", "11-a-side", "Futsal", "Open Tournament"];
    }
    if (sLower.includes('tennis') && !sLower.includes('table')) {
      return ["Men's Singles", "Women's Singles", "Men's Doubles", "Mixed Doubles", "Junior Singles"];
    }
    if (sLower.includes('table tennis') || sLower.includes('ping pong')) {
      return ["Men's Singles", "Women's Singles", "Men's Doubles", "Mixed Doubles"];
    }
    if (sLower.includes('pickleball')) {
      return ["Men's Doubles", "Women's Doubles", "Mixed Doubles", "Men's Singles", "Open Doubles"];
    }
    if (sLower.includes('basketball')) {
      return ["3x3 Half Court", "5v5 Full Court", "Open Tournament"];
    }
    if (sLower.includes('volleyball')) {
      return ["6v6 Standard", "4v4 Beach / Sand", "2v2 Beach Doubles"];
    }
    if (sLower.includes('chess')) {
      return ["Classical", "Rapid", "Blitz", "Bullet", "Team Chess"];
    }
    if (sLower.includes('squash')) {
      return ["Men's Singles", "Women's Singles", "Masters 35+", "Junior Open"];
    }
    if (sLower.includes('athletics')) {
      return ["Track Events", "Field Events", "Marathon / 5K / 10K", "Relay"];
    }
    if (sLower.includes('kabaddi')) {
      return ["Standard 7v7", "Beach Kabaddi", "Circle Style"];
    }
    return ["Standard Match", "Singles", "Doubles", "Team Event", "Open Format"];
  }, [sport, sportsMetadataMap]);

  // Compute category presets for currently selected sport
  const availableCategoryPresets = useMemo(() => {
    const meta = sportsMetadataMap[sport.toLowerCase()];
    const presetSet = new Set<string>();

    if (meta && Array.isArray(meta.categoryPresets) && meta.categoryPresets.length > 0) {
      meta.categoryPresets.forEach((p) => presetSet.add(p));
    }

    const sLower = sport.toLowerCase();
    commonCategories.forEach((c: any) => {
      const catSport = (c.sportType || 'ALL').toLowerCase().trim();
      if (catSport === 'all' || catSport === sLower) {
        if (c.categoryName) presetSet.add(c.categoryName);
      }
    });

    if (presetSet.size === 0) {
      [
        "Open Category",
        "Men's Open",
        "Women's Open",
        "Under-13",
        "Under-15",
        "Under-17",
        "Under-19",
        "35+ Veterans",
        "45+ Veterans",
        "Corporate",
        "Beginner",
        "Intermediate",
        "Advanced"
      ].forEach((p) => presetSet.add(p));
    }

    return Array.from(presetSet);
  }, [sport, sportsMetadataMap, commonCategories]);

  // Handler for changing sport
  const handleSportSelect = (selectedSportName: string) => {
    setSport(selectedSportName);
    const meta = sportsMetadataMap[selectedSportName.toLowerCase()];
    const defFormat = meta?.defaultFormat || meta?.formats?.[0]?.formatName || "Standard Match";
    setFormat(defFormat);
    setIsCustomFormat(false);
    setCustomFormat('');
    setIsCustomCategory(false);
  };

  // Category toggle & add helpers
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAddCustomCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCustomCategory.trim();
    if (!trimmed) return;
    if (!selectedCategories.includes(trimmed)) {
      setSelectedCategories((prev) => [...prev, trimmed]);
    }
    setNewCustomCategory('');
    setIsCustomCategory(false);
  };

  const removeSelectedCategory = (cat: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== cat));
  };

  // Fetch States dynamically on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await LocationService.getAllStates();
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = Array.from(new Set(res.data.map((s) => s.name))).sort();
          setStatesList(names);
        } else {
          setStatesList(FALLBACK_INDIAN_STATES);
        }
      } catch {
        setStatesList(FALLBACK_INDIAN_STATES);
      }
    };
    fetchStates();
  }, []);

  // Fetch Districts dynamically when selected State changes
  useEffect(() => {
    if (!state) {
      setDistrictsList([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await LocationService.getDistrictsByStateName(state);
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = Array.from(new Set(res.data.map((d) => d.name))).sort();
          setDistrictsList(names);
        } else if (FALLBACK_STATE_DISTRICTS[state]) {
          setDistrictsList(FALLBACK_STATE_DISTRICTS[state]);
        } else {
          setDistrictsList([]);
        }
      } catch {
        if (FALLBACK_STATE_DISTRICTS[state]) {
          setDistrictsList(FALLBACK_STATE_DISTRICTS[state]);
        } else {
          setDistrictsList([]);
        }
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [state]);

  // Auto-prefill organizer profile from logged-in user
  useEffect(() => {
    if (userUuid) {
      UserService.getUserByUuid(userUuid)
        .then((res) => {
          if (res?.data) {
            const u = res.data;
            const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ');
            if (fullName && !organizerName) setOrganizerName(fullName);
            if (u.phone && !contactPhone) {
              setContactPhone(u.phone);
              if (!whatsappNumber) setWhatsappNumber(u.phone);
            }
            if (u.email && !contactEmail) setContactEmail(u.email);
            if (u.city && !city) setCity(u.city);
            if (u.district && !district) setDistrict(u.district);
            if (u.state && !state) setState(u.state);
          }
        })
        .catch(() => { });
    }
  }, [userUuid]);

  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleUpiQrSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUpiQrFile(file);
      setUpiQrPreview(URL.createObjectURL(file));
    }
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!title.trim()) {
        setError('Please enter tournament title.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!venueName.trim() && !city.trim()) {
        setError('Please specify venue name or city.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const handlePrev = () => {
    setError(null);
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setStep(1);
      setError('Please provide tournament title.');
      return;
    }
    if (!organizerName.trim()) {
      setStep(3);
      setError('Please provide organizer name.');
      return;
    }
    if (!contactPhone.trim() && !whatsappNumber.trim()) {
      setStep(3);
      setError('Please provide phone or WhatsApp number for player registrations.');
      return;
    }

    try {
      setLoading(true);

      const activeFormat = isCustomFormat ? (customFormat.trim() || format) : format;
      const categoriesString = selectedCategories.length > 0 ? selectedCategories.join(', ') : undefined;
      const finalCategoryDetails = [
        activeFormat ? activeFormat : null,
        categoriesString ? categoriesString : null,
      ].filter(Boolean).join(' • ') || categoryDetails.trim() || undefined;

      const res = await TournamentAnnouncementService.create({
        title: title.trim(),
        content: content.trim() || 'Tournament guidelines and match schedule will be shared directly by the organizer.',
        sport,
        matchFormat: activeFormat || undefined,
        category: categoriesString || undefined,
        categoryDetails: finalCategoryDetails,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : undefined,
        venueName: venueName.trim() || undefined,
        city: city.trim() || undefined,
        district: district.trim() || undefined,
        state: state.trim() || undefined,
        address: address.trim() || undefined,
        locationMapUrl: locationMapUrl.trim() || undefined,
        entryFee: entryFee.trim() || undefined,
        prizePool: prizePool.trim() || undefined,
        organizerName: organizerName.trim(),
        contactPhone: contactPhone.trim() || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        externalRegistrationUrl: externalRegistrationUrl.trim() || undefined,
        userUuid: userUuid || undefined,
        poster: posterFile,
        upiQr: upiQrFile,
      });

      if (res?.data?.uuid) {
        router.push(`/tournaments/announcements/${res.data.uuid}`);
      } else {
        router.push('/tournaments?tab=announcements');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to publish flyer. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (mounted && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-foreground/60 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* ── COMPACT MOBILE HEADER ── */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/60">
        <div className="max-w-xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link
            href="/tournaments"
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-border bg-card/60 hover:bg-card text-foreground/80 hover:text-foreground transition-all active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>

          <div className="text-center">
            <h1 className="text-xs sm:text-[13px] font-bold tracking-tight text-foreground flex items-center justify-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-amber-500" />
              <span>Announce Tournament</span>
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {step}/3
            </span>
          </div>
        </div>

        {/* Dynamic Micro-Progress Bar */}
        <div className="w-full bg-muted/30 h-0.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-amber-400 transition-all duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-3.5 space-y-3.5">
        {/* Step Navigation Pills */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-card border border-border shadow-sm">
          {[
            { id: 1, label: 'Flyer & Info', icon: Trophy },
            { id: 2, label: 'Dates & Venue', icon: MapPin },
            { id: 3, label: 'Fee & Contact', icon: Phone },
          ].map((tab) => {
            const isActive = step === tab.id;
            const isCompleted = step > tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id < step || validateStep(step)) {
                    setStep(tab.id as 1 | 2 | 3);
                  }
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-all ${isActive
                  ? 'bg-primary text-black shadow-sm font-bold'
                  : isCompleted
                    ? 'text-primary/90 hover:bg-muted/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                  }`}
              >
                <tab.icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-rose-500 text-[11px] font-semibold animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* ══════════════════════════════════════════════════════════════════
              STEP 1: FLYER & EVENT DETAILS
             ══════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Poster Dropzone */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-foreground/80">
                  <span>Tournament Poster</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal">Optional</span>
                </div>

                {posterPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-card/60 shadow-sm max-h-60 flex items-center justify-center group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={posterPreview}
                      alt="Flyer Preview"
                      className="w-full h-auto max-h-60 object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => {
                        setPosterFile(null);
                        setPosterPreview(null);
                        if (posterInputRef.current) posterInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md transition-transform active:scale-90"
                      title="Remove poster"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => posterInputRef.current?.click()}
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl bg-primary text-black font-bold text-[10px] shadow-lg active:scale-95"
                    >
                      Change Poster
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => posterInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/50 active:scale-[0.99] rounded-2xl p-4 text-center cursor-pointer transition-all bg-card/40 hover:bg-card/70 flex flex-col items-center justify-center gap-1.5 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-primary/15 group-hover:text-primary transition-colors flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-foreground">Upload Event Poster</p>
                      <p className="text-[9.5px] text-muted-foreground mt-0.5">JPG, PNG, WebP</p>
                    </div>
                  </div>
                )}

                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePosterSelect}
                  className="hidden"
                />
              </div>

              {/* Tournament Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground/85 flex items-center gap-1.5">
                  <Trophy className="w-3 h-3 text-primary" />
                  <span>Tournament Title <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Athlon Smash Open 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground/50 placeholder:text-xs focus:outline-none focus:ring-1.5 focus:ring-primary shadow-sm"
                />
              </div>

              {/* Sport Category Chips (Dynamic from SportMetadataService) */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-foreground/85 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Sport <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[9.5px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    {sport}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar -mx-1 px-1">
                  {sportsList.map((item) => {
                    const isSelected = sport.toLowerCase() === item.name.toLowerCase();
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleSportSelect(item.name)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10.5px] font-semibold whitespace-nowrap transition-all shrink-0 active:scale-95 cursor-pointer ${isSelected
                          ? 'bg-primary text-black shadow-sm font-bold scale-[1.02]'
                          : 'bg-card border border-border text-foreground/75 hover:text-foreground hover:bg-card/80'
                          }`}
                      >
                        <span className="text-xs">{item.icon}</span>
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Match / Draw Format (Dynamic Dropdown) */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-foreground/85 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Match Format <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[9.5px] font-bold text-foreground/50">
                    {sport} formats
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={isCustomFormat ? '__CUSTOM__' : format}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomFormat(true);
                      } else {
                        setIsCustomFormat(false);
                        setFormat(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-foreground appearance-none cursor-pointer pr-10 focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
                  >
                    {availableFormats.map((fmt) => (
                      <option key={fmt} value={fmt} className="bg-card text-foreground">
                        {fmt}
                      </option>
                    ))}
                    <option value="__CUSTOM__" className="bg-card text-foreground font-semibold">
                      ➕ Custom Format
                    </option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                </div>

                {isCustomFormat && (
                  <div className="pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <input
                      type="text"
                      placeholder="Enter custom match format (e.g. 6-a-side Box Cricket, 35+ Doubles)"
                      value={customFormat}
                      onChange={(e) => setCustomFormat(e.target.value)}
                      autoFocus
                      className="w-full px-3 py-2 rounded-xl border border-primary/40 bg-card text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1.5 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Categories Dropdown */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-foreground/85 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-blue-400" />
                    <span>Tournament Category</span>
                  </label>
                  <span className="text-[9.5px] font-bold text-foreground/50">
                    {selectedCategories.length > 0 ? `${selectedCategories.length} selected` : 'Select category'}
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={isCustomCategory ? '__CUSTOM__' : (selectedCategories.length === 1 ? selectedCategories[0] : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      if (val === '__CUSTOM__') {
                        setIsCustomCategory(true);
                        return;
                      }
                      setIsCustomCategory(false);
                      if (!selectedCategories.includes(val)) {
                        setSelectedCategories((prev) => [...prev, val]);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-foreground appearance-none cursor-pointer pr-10 focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
                  >
                    <option value="" disabled={selectedCategories.length > 0}>
                      {selectedCategories.length === 0 ? 'Select Category...' : '+ Add Another Category...'}
                    </option>
                    <optgroup label="🏆 Available Categories">
                      {availableCategoryPresets.map((preset) => {
                        const alreadySelected = selectedCategories.includes(preset);
                        return (
                          <option key={preset} value={preset} className="bg-card text-foreground">
                            {preset} {alreadySelected ? '✓' : ''}
                          </option>
                        );
                      })}
                    </optgroup>
                    <option value="__CUSTOM__" className="bg-card text-foreground font-semibold">
                      ➕ Add Custom Category
                    </option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                </div>

                {/* Custom Category Input if selected */}
                {isCustomCategory && (
                  <div className="flex items-center gap-1.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <input
                      type="text"
                      placeholder="Type custom category (e.g. Corporate 40+, U-11 Novice)"
                      value={newCustomCategory}
                      onChange={(e) => setNewCustomCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomCategory();
                        }
                      }}
                      autoFocus
                      className="flex-1 px-3 py-1.5 rounded-xl border border-primary/40 bg-card text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      disabled={!newCustomCategory.trim()}
                      className="px-3.5 py-1.5 rounded-xl bg-primary text-black font-bold text-xs transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer shadow-xs"
                    >
                      + Add
                    </button>
                  </div>
                )}

                {/* Selected Category Tags */}
                {selectedCategories.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-card/60 border border-border mt-1">
                    {selectedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary/15 text-primary border border-primary/30 text-[10px] font-bold animate-in fade-in"
                      >
                        <span>{cat}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedCategory(cat)}
                          className="hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                          title="Remove category"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedCategories([])}
                      className="text-[9.5px] text-muted-foreground hover:text-rose-400 font-semibold ml-auto transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Summary / Preview Badge */}
              <div className="p-2.5 rounded-xl bg-card border border-border/80 flex items-center justify-between text-[10px] text-foreground/75 shadow-xs">
                <span className="font-medium text-muted-foreground">Setup Preview:</span>
                <span className="font-bold text-primary truncate max-w-[70%]">
                  {sport} • {isCustomFormat ? (customFormat || 'Custom') : format} • {selectedCategories.length > 0 ? `${selectedCategories.length} categories` : 'Open Entry'}
                </span>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 2: DATES & LOCATION
             ══════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Dates Bento */}
              <div className="p-3 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
                  <Calendar className="w-3 h-3" />
                  <span>Tournament Schedule</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-medium text-muted-foreground">Start Date</span>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-border bg-background text-[11px] text-foreground focus:outline-none focus:ring-1.5 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-medium text-muted-foreground">End Date</span>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-border bg-background text-[11px] text-foreground focus:outline-none focus:ring-1.5 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-0.5 pt-1.5 border-t border-border/50">
                  <span className="text-[9.5px] font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-rose-500" />
                    Last Date to Register
                  </span>
                  <input
                    type="datetime-local"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-border bg-background text-[11px] text-foreground focus:outline-none focus:ring-1.5 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Venue Bento */}
              <div className="p-3 rounded-2xl bg-card border border-border space-y-2 max-sm:space-y-2.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500">
                  <MapPin className="w-3 h-3" />
                  <span>Venue & Location</span>
                </div>

                <div className="space-y-0.5">
                  <input
                    type="text"
                    placeholder="Venue Name (e.g. Smash Badminton Club)"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full px-3 py-2 max-sm:h-9 max-sm:py-0 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/50 placeholder:text-xs focus:outline-none focus:ring-1.5 focus:ring-primary"
                  />
                </div>

                {/* Dynamic State and District Row */}
                <div className="grid grid-cols-2 gap-2 max-sm:items-start">
                  <div className="space-y-0.5 max-sm:min-w-0 max-sm:space-y-1">
                    <span className="text-[9.5px] font-medium text-muted-foreground max-sm:flex max-sm:items-center max-sm:h-4">State</span>
                    <div className="relative">
                    <select
                      value={state}
                      onChange={(e) => {
                        const newState = e.target.value;
                        setState(newState);
                        setDistrict(''); // Reset district when state changes
                      }}
                      className="w-full px-2 py-1.5 max-sm:h-9 max-sm:py-0 max-sm:pl-3 max-sm:pr-8 max-sm:appearance-none max-sm:truncate rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-primary"
                    >
                      <option value="" className="bg-card text-foreground">Select State</option>
                      {statesList.map((st) => (
                        <option key={st} value={st} className="bg-card text-foreground">
                          {st}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="hidden max-sm:block absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-0.5 max-sm:min-w-0 max-sm:space-y-1">
                    <span className="text-[9.5px] font-medium text-muted-foreground flex items-center justify-between max-sm:h-4">
                      <span>District</span>
                      {loadingDistricts && <span className="text-[8.5px] text-primary animate-pulse">Loading...</span>}
                    </span>
                    <div className="relative">
                    <select
                      value={district}
                      disabled={!state || loadingDistricts}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-2 py-1.5 max-sm:h-9 max-sm:py-0 max-sm:pl-3 max-sm:pr-8 max-sm:appearance-none max-sm:truncate rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-primary disabled:opacity-50"
                    >
                      <option value="" className="bg-card text-foreground">
                        {state ? (loadingDistricts ? 'Loading...' : 'Select District') : 'Select State First'}
                      </option>
                      {districtsList.map((dist) => (
                        <option key={dist} value={dist} className="bg-card text-foreground">
                          {dist}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="hidden max-sm:block absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* City / Area */}
                <div className="space-y-0.5 max-sm:space-y-1">
                  <span className="text-[9.5px] font-medium text-muted-foreground max-sm:flex max-sm:items-center max-sm:h-4">City / Town / Area</span>
                  <input
                    type="text"
                    placeholder="e.g. Vellarada or Anna Nagar"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 max-sm:h-9 max-sm:py-0 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/50 placeholder:text-xs focus:outline-none focus:ring-1.5 focus:ring-primary"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Street Address (Optional)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 max-sm:h-9 max-sm:py-0 max-sm:px-3 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/50 placeholder:text-xs focus:outline-none focus:ring-1.5 focus:ring-primary"
                />

                <input
                  type="url"
                  placeholder="Google Maps Link (Optional)"
                  value={locationMapUrl}
                  onChange={(e) => setLocationMapUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 max-sm:h-9 max-sm:py-0 max-sm:px-3 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/50 placeholder:text-xs focus:outline-none focus:ring-1.5 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 3: COMMERCIALS, CONTACTS & GUIDELINES
             ══════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Fee & Prize Bento */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-2xl bg-card border border-border space-y-1 shadow-sm">
                  <span className="text-[9.5px] font-bold text-emerald-500 flex items-center gap-1">
                    <DollarSign className="w-2.5 h-2.5" /> Entry Fee
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. ₹500 / Team"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground placeholder:text-xs focus:outline-none focus:ring-1.5 focus:ring-primary"
                  />
                </div>

                <div className="p-2.5 rounded-2xl bg-card border border-border space-y-1 shadow-sm">
                  <span className="text-[9.5px] font-bold text-amber-500 flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5" /> Prize Pool
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. ₹20,000 + Cups"
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground placeholder:text-xs focus:outline-none focus:ring-1.5 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Organizer Channels Bento */}
              <div className="p-3 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
                  <Phone className="w-3 h-3" />
                  <span>Organizer & Contact</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9.5px] font-medium text-muted-foreground">Organizer Name *</span>
                  <input
                    type="text"
                    required
                    placeholder="Your Name or Club"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/50 placeholder:text-xs focus:outline-none focus:ring-1.5 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-medium text-muted-foreground">Phone Number *</span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/50 placeholder:text-xs focus:outline-none focus:ring-1.5 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-medium text-muted-foreground">WhatsApp</span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/50 placeholder:text-xs focus:outline-none focus:ring-1.5 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9.5px] font-medium text-muted-foreground">Online Form / Website Link</span>
                  <input
                    type="url"
                    placeholder="https://forms.gle/... (Optional)"
                    value={externalRegistrationUrl}
                    onChange={(e) => setExternalRegistrationUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/50 placeholder:text-xs focus:outline-none focus:ring-1.5 focus:ring-primary"
                  />
                </div>

                {/* Optional UPI QR Code */}
                <div className="pt-1.5 border-t border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9.5px] font-medium text-muted-foreground flex items-center gap-1">
                      <QrCode className="w-2.5 h-2.5 text-primary" /> UPI Payment QR
                    </span>
                    <span className="text-[9px] text-muted-foreground">Optional</span>
                  </div>

                  {upiQrPreview ? (
                    <div className="relative rounded-xl border border-border bg-background p-1.5 w-24 h-24 mx-auto flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={upiQrPreview} alt="UPI QR" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setUpiQrFile(null);
                          setUpiQrPreview(null);
                          if (upiQrInputRef.current) upiQrInputRef.current.value = '';
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => upiQrInputRef.current?.click()}
                      className="w-full py-1.5 px-3 rounded-xl border border-dashed border-border text-[10.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/20 flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3 h-3 text-primary" />
                      Upload UPI QR Code (GPay/PhonePe)
                    </button>
                  )}

                  <input
                    ref={upiQrInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpiQrSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Tournament Guidelines */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground/85">
                  Rules & Guidelines <span className="text-[9.5px] font-normal text-muted-foreground">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Key rules, reporting time, etc."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground/50 placeholder:text-xs focus:outline-none focus:ring-1.5 focus:ring-primary shadow-sm"
                />
              </div>
            </div>
          )}

          {/* ── ELEVATED FLOATING BOTTOM NAVIGATION ── */}
          <div className="fixed bottom-6 inset-x-4 max-w-xl mx-auto z-40">
            <div className="p-1.5 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl flex items-center justify-between gap-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-background/80 text-foreground font-bold text-xs hover:bg-muted active:scale-95 transition-all flex items-center gap-1 shrink-0"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
              ) : (
                <Link
                  href="/tournaments"
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-background/80 text-muted-foreground hover:text-foreground font-bold text-xs hover:bg-muted active:scale-95 transition-all flex items-center gap-1 shrink-0"
                >
                  Cancel
                </Link>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-black font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-primary to-emerald-400 text-black font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Publish Flyer</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
