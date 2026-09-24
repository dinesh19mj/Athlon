'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  Clock,
  Layers,
  CheckCircle2,
  ArrowLeft,
  Navigation,
  Star,
  SlidersHorizontal,
  X,
  Zap,
  Tag,
  ShieldCheck,
  Calendar,
  Phone,
  Compass,
  Flame,
  Check,
  Award,
  ChevronDown,
  LayoutGrid,
  List,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import { venueApi, VenueDto } from '@/lib/api/venue';
import { OrganizationService } from '@/lib/api/organization';
import { VenueMarketplaceCard } from '@/components/marketplace/VenueMarketplaceCard';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

const POPULAR_CITIES = ['All Cities', 'Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi NCR', 'Pune'];

const SPORTS_CATEGORIES = [
  { id: 'ALL', label: 'All Sports', icon: '⚡' },
  { id: 'Badminton', label: 'Badminton', icon: '🏸' },
  { id: 'Football Turf', label: 'Football Turf', icon: '⚽' },
  { id: 'Cricket Nets', label: 'Cricket Nets', icon: '🏏' },
  { id: 'Tennis', label: 'Tennis', icon: '🎾' },
  { id: 'Pickleball', label: 'Pickleball', icon: '🏓' },
  { id: 'Basketball', label: 'Basketball', icon: '🏀' },
];

const QUICK_AMENITIES = ['Floodlights', 'Air Conditioned', 'Parking', 'Equipment Rental', 'Showers', 'Cafeteria'];

export default function PublicVenuesDiscoveryPage() {
  const router = useRouter();
  const { mode, themeKey } = useAthlonTheme();
  const { isAuthenticated } = useAuthStore();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(isAuthenticated ? '/home' : '/');
    }
  };
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'courts'>('recommended');
  const [quickFilter, setQuickFilter] = useState<'all' | 'instant' | 'ac' | 'floodlight'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  useEffect(() => {
    async function loadVenues() {
      try {
        setLoading(true);

        // Fetch organizations to identify and filter out non-venue workspaces (coaches/academies)
        const orgRes = await OrganizationService.getAll().catch(() => ({ data: [] }));
        const orgList = Array.isArray(orgRes) ? orgRes : orgRes?.data || [];
        const nonVenueOrgUuids = new Set<string>();
        const nonVenueOrgIds = new Set<string>();
        const nonVenueOrgNames = new Set<string>();

        orgList.forEach((o: any) => {
          const type = (o.type || '').toUpperCase();
          if (type !== 'COURT' && type !== 'VENUE' && type !== 'VENUE_MANAGER') {
            if (o.uuid) nonVenueOrgUuids.add(String(o.uuid).toLowerCase());
            if (o.organizationUuid) nonVenueOrgUuids.add(String(o.organizationUuid).toLowerCase());
            if (o.id) nonVenueOrgIds.add(String(o.id).toLowerCase());
            if (o.orgId) nonVenueOrgIds.add(String(o.orgId).toLowerCase());
            if (o.organizationId) nonVenueOrgIds.add(String(o.organizationId).toLowerCase());
            if (o.name) nonVenueOrgNames.add(o.name.trim().toLowerCase());
          }
        });

        const cityParam = cityFilter === 'All Cities' ? undefined : cityFilter;
        const res = await venueApi.getPublicVenues(cityParam);
        if (res?.success && Array.isArray(res.data)) {
          const rawList = res.data.filter((v: any) => {
            if (v.bookingEnabled === false) return false;
            const vType = (v.venueType || v.type || '').toUpperCase();
            if (vType === 'ACADEMY' || vType === 'COACH' || vType === 'CLUB' || vType === 'ORGANIZER' || vType === 'ASSOCIATION') return false;

            const orgUuid = String(v.organizationUuid || v.uuid || '').toLowerCase();
            const orgId = String(v.organizationId || v.id || v.orgId || '').toLowerCase();
            if (orgUuid && nonVenueOrgUuids.has(orgUuid)) return false;
            if (orgId && nonVenueOrgIds.has(orgId)) return false;

            const vName = (v.name || '').toLowerCase().trim();
            if (vName && nonVenueOrgNames.has(vName)) return false;

            return true;
          });

          const merged = rawList.map((v: any, idx: number) => ({
            ...v,
            rating: v.rating || '4.8',
            reviewCount: v.reviewCount || 0,
            sportsOffered: v.sportsOffered || (v.facilities?.map((f: any) => f.sportType).filter(Boolean) || ['Badminton']),
            featured: v.featured ?? (idx === 0),
            image: v.images?.[0]?.imageUrl || v.image || '/venue-placeholder.jpg',
          }));
          setVenues(merged);
        } else {
          setVenues([]);
        }
      } catch (err) {
        console.error('Failed to load public venues:', err);
        setVenues([]);
      } finally {
        setLoading(false);
      }
    }
    loadVenues();
  }, [cityFilter]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const filteredVenues = useMemo(() => {
    return venues
      .filter((v) => {
        // City Filter
        if (cityFilter !== 'All Cities') {
          const vCity = (v.city || '').toLowerCase();
          const target = cityFilter.toLowerCase();
          if (!vCity.includes(target) && !target.includes(vCity)) return false;
        }

        // Search Term Filter
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          const matchesName = v.name?.toLowerCase().includes(q);
          const matchesCity = v.city?.toLowerCase().includes(q);
          const matchesAddress = v.addressLine1?.toLowerCase().includes(q);
          const matchesDesc = v.description?.toLowerCase().includes(q);
          const matchesSport = Array.isArray(v.sportsOffered) && v.sportsOffered.some((s: string) => s.toLowerCase().includes(q));
          if (!matchesName && !matchesCity && !matchesAddress && !matchesDesc && !matchesSport) return false;
        }

        // Sport Category Filter
        if (selectedSport !== 'ALL') {
          const hasSport =
            (Array.isArray(v.sportsOffered) && v.sportsOffered.includes(selectedSport)) ||
            v.name?.toLowerCase().includes(selectedSport.toLowerCase());
          if (!hasSport) return false;
        }

        // Quick Filter Pills
        if (quickFilter === 'instant' && !v.bookingEnabled) return false;
        if (quickFilter === 'ac') {
          const hasAC = v.amenities?.some((a: any) =>
            (typeof a === 'string' ? a : a.amenityName || '').toLowerCase().includes('air conditioned')
          );
          if (!hasAC) return false;
        }
        if (quickFilter === 'floodlight') {
          const hasFlood = v.amenities?.some((a: any) =>
            (typeof a === 'string' ? a : a.amenityName || '').toLowerCase().includes('floodlight')
          );
          if (!hasFlood) return false;
        }

        // Amenities Filter
        if (selectedAmenities.length > 0) {
          const vAmenities: string[] = (v.amenities || []).map((a: any) =>
            (typeof a === 'string' ? a : a.amenityName || '').toLowerCase()
          );
          const matchesAll = selectedAmenities.every((req) =>
            vAmenities.some((va) => va.includes(req.toLowerCase()))
          );
          if (!matchesAll) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') {
          const pA = parseInt(String(a.startingPrice || '0').replace(/[^0-9]/g, ''), 10) || 0;
          const pB = parseInt(String(b.startingPrice || '0').replace(/[^0-9]/g, ''), 10) || 0;
          return pA - pB;
        }
        if (sortBy === 'price_desc') {
          const pA = parseInt(String(a.startingPrice || '0').replace(/[^0-9]/g, ''), 10) || 0;
          const pB = parseInt(String(b.startingPrice || '0').replace(/[^0-9]/g, ''), 10) || 0;
          return pB - pA;
        }
        if (sortBy === 'courts') {
          return (b.totalFacilities || 1) - (a.totalFacilities || 1);
        }
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (parseFloat(b.rating || '4.8') - parseFloat(a.rating || '4.8'));
      });
  }, [venues, cityFilter, searchTerm, selectedSport, quickFilter, selectedAmenities, sortBy]);

  const isFiltered =
    cityFilter !== 'All Cities' ||
    searchTerm.trim().length > 0 ||
    selectedSport !== 'ALL' ||
    quickFilter !== 'all' ||
    selectedAmenities.length > 0;

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSport('ALL');
    setCityFilter('All Cities');
    setQuickFilter('all');
    setSelectedAmenities([]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground pb-24 md:pb-12">
      {/* ── SLEEK MOBILE-FIRST HEADER & SEARCH HUB ── */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-card/90 via-surface/60 to-background pt-3 sm:pt-6 pb-4 sm:pb-6 px-3.5 sm:px-6">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 relative z-10">
          {/* Top Bar: Back Button, Title, and View Mode Switcher */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={handleBack}
                title="Go Back"
                className="w-9 h-9 rounded-xl border border-border/80 bg-surface/80 hover:bg-surface text-foreground/80 hover:text-foreground flex items-center justify-center transition-all active:scale-95 shadow-xs shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[9px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Athlon Venues
                  </span>
                  <span className="hidden xs:inline-block text-[10px] text-foreground/40 font-semibold">•</span>
                  <span className="hidden xs:inline-block text-[10px] text-foreground/50 font-bold truncate">
                    Courts &amp; Turfs
                  </span>
                </div>
                <h1 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight truncate mt-0.5">
                  Courts, Turfs &amp; Arenas
                </h1>
              </div>
            </div>

            {/* View Mode Switcher (Grid / List) */}
            <div className="flex items-center p-1 rounded-xl bg-surface/80 border border-border/80 shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-primary text-black font-black shadow-xs scale-105'
                    : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                title="Compact List View"
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-primary text-black font-black shadow-xs scale-105'
                    : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Hub Switcher Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-0.5">
            <Link
              href="/venues"
              className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-primary text-black flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Courts &amp; Turfs</span>
            </Link>
            <Link
              href="/academies"
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-foreground/70 hover:text-foreground border border-border/70 hover:bg-surface flex items-center gap-1.5 shrink-0 transition-all"
            >
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              <span>Academies</span>
            </Link>
            <Link
              href="/coaches"
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-foreground/70 hover:text-foreground border border-border/70 hover:bg-surface flex items-center gap-1.5 shrink-0 transition-all"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Coaches</span>
            </Link>
          </div>

          {/* Search & City Input Bar */}
          <div className="flex items-center gap-2">
            {/* City Selector Pill */}
            <div className="relative shrink-0">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="appearance-none pl-7 pr-6 py-2 rounded-xl text-xs font-bold border border-border/80 bg-surface/80 hover:bg-surface text-foreground shadow-inner outline-none focus:border-primary transition-all cursor-pointer"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c} value={c} className="bg-card text-foreground">
                    {c}
                  </option>
                ))}
              </select>
              <MapPin className="w-3.5 h-3.5 text-primary absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-foreground/50 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input Bar */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search court name, area, turf..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface/80 border border-border/80 rounded-xl pl-8.5 pr-8 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-foreground/35 font-medium transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground/10 text-foreground/60 flex items-center justify-center hover:bg-foreground/20 text-[10px]"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips Carousel (Horizontal scroll on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5 pt-0.5">
            {SPORTS_CATEGORIES.map((cat) => {
              const isSelected = selectedSport === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSport(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 border active:scale-95 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-black border-primary shadow-xs font-black'
                      : 'bg-surface/70 border-border/70 text-foreground/70 hover:bg-surface hover:text-foreground'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}

            <div className="w-[1px] h-5 bg-border/80 shrink-0 mx-0.5" />

            {/* Quick Filter Tags */}
            <button
              onClick={() => setQuickFilter(quickFilter === 'instant' ? 'all' : 'instant')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 border active:scale-95 flex items-center gap-1 ${
                quickFilter === 'instant'
                  ? 'bg-primary text-black border-primary shadow-xs font-black'
                  : 'bg-surface/70 border-border/70 text-foreground/70 hover:bg-surface hover:text-foreground'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Instant Slot</span>
            </button>

            <button
              onClick={() => setQuickFilter(quickFilter === 'ac' ? 'all' : 'ac')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 border active:scale-95 flex items-center gap-1 ${
                quickFilter === 'ac'
                  ? 'bg-primary text-black border-primary shadow-xs font-black'
                  : 'bg-surface/70 border-border/70 text-foreground/70 hover:bg-surface hover:text-foreground'
              }`}
            >
              <span>❄️ AC Courts</span>
            </button>

            <button
              onClick={() => setQuickFilter(quickFilter === 'floodlight' ? 'all' : 'floodlight')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 border active:scale-95 flex items-center gap-1 ${
                quickFilter === 'floodlight'
                  ? 'bg-primary text-black border-primary shadow-xs font-black'
                  : 'bg-surface/70 border-border/70 text-foreground/70 hover:bg-surface hover:text-foreground'
              }`}
            >
              <span>💡 Floodlights</span>
            </button>

            {/* Extra Amenities Toggle */}
            {QUICK_AMENITIES.filter((a) => !['Floodlights', 'Air Conditioned'].includes(a)).map((amenity) => {
              const active = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 border active:scale-95 flex items-center gap-1 ${
                    active
                      ? 'bg-primary text-black border-primary shadow-xs font-black'
                      : 'bg-surface/70 border-border/70 text-foreground/70 hover:bg-surface hover:text-foreground'
                  }`}
                >
                  {active && <Check className="w-3 h-3 text-black" />}
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── VENUES DIRECTORY LIST / GRID ── */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 pb-28 sm:pb-16">
        {/* Results Counter & Sort Bar */}
        <div className="flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 text-foreground/80 font-bold min-w-0">
            <Building2 className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-black text-foreground truncate">
              {loading
                ? 'Discovering venues...'
                : `${filteredVenues.length} ${filteredVenues.length === 1 ? 'Venue' : 'Venues'} Available`}
            </span>
            {cityFilter !== 'All Cities' && (
              <span className="text-foreground/50 text-[11px] hidden xs:inline truncate">in {cityFilter}</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Reset</span>
              </button>
            )}

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="text-[11px] font-bold bg-surface/80 border border-border/80 rounded-xl px-2.5 py-1 text-foreground outline-none cursor-pointer shadow-xs"
            >
              <option value="recommended">⚡ Best Match</option>
              <option value="price_asc">💰 Price: Low to High</option>
              <option value="price_desc">💎 Price: High to Low</option>
              <option value="courts">🏟️ Most Courts</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 sm:py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <p className="text-xs font-bold text-foreground/50">Discovering courts &amp; turfs...</p>
          </div>
        ) : venues.length === 0 ? (
          /* Empty Directory State */
          <div className="py-12 sm:py-16 text-center space-y-3 bg-surface/50 border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-foreground">No Venues Registered Yet</h3>
              <p className="text-xs text-foreground/60 leading-relaxed max-w-xs mx-auto">
                There are currently no sports arenas or turf complexes registered in the directory. Verified courts will appear here once onboarded.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={isAuthenticated ? '/home' : '/'}
                className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider shadow-sm hover:brightness-110 inline-flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        ) : filteredVenues.length === 0 ? (
          /* Search / Filter Mismatch State */
          <div className="py-12 sm:py-16 text-center space-y-3 bg-surface/50 border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-border/80 flex items-center justify-center text-foreground/40 mx-auto">
              <Search className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-foreground">No Venues Found</h3>
              <p className="text-xs text-foreground/50 leading-relaxed max-w-xs mx-auto">
                No arenas match your filters in {cityFilter}. Try resetting filters or choosing &quot;All Cities&quot;.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'compact' ? (
          /* Compact List View (Mobile-First) */
          <div className="space-y-2.5 max-w-2xl mx-auto">
            {filteredVenues.map((venue: any) => (
              <div key={venue.venueUuid || venue.venueId || venue.id}>
                <VenueMarketplaceCard venue={venue} variant="compact" />
              </div>
            ))}
          </div>
        ) : (
          /* Grid View (Mobile-Optimized Cards) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredVenues.map((venue: any) => (
              <div key={venue.venueUuid || venue.venueId || venue.id} className="h-full">
                <VenueMarketplaceCard venue={venue} variant="card" className="h-full shadow-xs" />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Nav */}
      <nav
        className="fixed bottom-0 inset-x-0 h-20 backdrop-blur-xl border-t z-50 px-5 flex items-center justify-between max-w-lg mx-auto fixed-bottom-nav md:hidden"
        style={{
          backgroundColor: 'var(--athlon-navigation)',
          borderColor: 'var(--athlon-border)',
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)',
        }}
      >
        <Link href="/" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
          <Athlon3DIcon type="home" size={32} active={false} />
          <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Home
          </span>
        </Link>

        <Link href="/tournaments" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
          <Athlon3DIcon type="tournaments" size={32} active={false} />
          <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Tournaments
          </span>
        </Link>

        {/* 3D Circular Elevated Umpire Button */}
        <div className="relative -top-5 flex items-center justify-center">
          <Link
            href="/practice"
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3.5px] group relative overflow-hidden shadow-2xl umpire-center-orb"
            style={{
              backgroundColor: 'var(--athlon-primary)',
              borderColor: 'var(--athlon-navigation)',
              boxShadow: '0 10px 25px -2px var(--athlon-primary-glow), 0 4px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.3)',
            }}
          >
            <div className="absolute inset-x-1 top-0 h-[45%] rounded-t-full bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />
            <img
              src="/umpire.png"
              alt="Umpire"
              className="w-8 h-8 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] relative z-10 transition-transform group-hover:scale-110 group-active:scale-95"
            />
          </Link>
        </div>

        <Link href="/venues" className="flex flex-col items-center gap-0.5 w-16 group">
          <Athlon3DIcon type="facilities" size={32} active={true} />
          <span className="text-[9.5px] font-bold text-primary leading-tight">
            Courts
          </span>
        </Link>

        <Link href={isAuthenticated ? '/home' : '/login'} className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
          <Athlon3DIcon type="profile" size={32} active={false} />
          <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Profile
          </span>
        </Link>
      </nav>
    </div>
  );
}
