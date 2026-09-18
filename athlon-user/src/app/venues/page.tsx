'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { venueApi, VenueDto } from '@/lib/api/venue';
import { OrganizationService } from '@/lib/api/organization';
import { VenueMarketplaceCard } from '@/components/marketplace/VenueMarketplaceCard';
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
  const { mode, themeKey } = useAthlonTheme();
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'courts'>('recommended');
  const [quickFilter, setQuickFilter] = useState<'all' | 'instant' | 'ac' | 'floodlight'>('all');

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

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md)
          - Theme-Aware Sticky App Bar & Hub Switcher
          - Clean Sport Pill Carousel & Fast Filters
          - High-contrast Venue Cards
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24">
        {/* Sticky Mobile App Bar (100% Theme-Aware) */}
        <div className="sticky top-0 z-30 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-xl transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <Link
              href="/home"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-surface text-foreground text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>

            {/* City Selector Pill */}
            <div className="relative">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="appearance-none pl-7 pr-7 py-1.5 rounded-full text-xs font-bold border border-border bg-card hover:bg-surface text-foreground shadow-sm outline-none focus:border-primary transition-colors cursor-pointer"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c} value={c} className="bg-card text-foreground">
                    {c}
                  </option>
                ))}
              </select>
              <MapPin className="w-3.5 h-3.5 text-primary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-foreground/50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Unified Hub Navigation Switcher */}
          <div className="flex items-center p-1 rounded-2xl border border-border bg-card shadow-sm">
            <Link
              href="/venues"
              className="flex-1 py-1.5 rounded-xl text-[11px] font-black tracking-wide text-center bg-primary text-primary-foreground flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Courts &amp; Turfs</span>
            </Link>
            <Link
              href="/academies"
              className="flex-1 py-1.5 rounded-xl text-[11px] font-bold text-center text-foreground/70 hover:text-foreground hover:bg-surface/60 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Academies</span>
            </Link>
            <Link
              href="/coaches"
              className="flex-1 py-1.5 rounded-xl text-[11px] font-bold text-center text-foreground/70 hover:text-foreground hover:bg-surface/60 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Coaches</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search & Quick Filters Container */}
        <div className="px-4 pt-3.5 space-y-3">
          {/* Mobile Search Input */}
          <div className="relative rounded-2xl border border-border bg-card shadow-sm p-1 flex items-center">
            <Search className="w-4 h-4 ml-3 text-foreground/40 shrink-0" />
            <input
              type="text"
              placeholder="Search court name, area, turf..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent px-2.5 py-2 text-xs font-bold text-foreground outline-none placeholder:text-foreground/35"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 mr-1.5 rounded-full bg-foreground/10 text-foreground/60 hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontal Sports Chips Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4 snap-x">
            {SPORTS_CATEGORIES.map((cat) => {
              const isSelected = selectedSport === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSport(cat.id)}
                  className={`snap-start shrink-0 px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all border ${isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]'
                      : 'border-border bg-card hover:bg-surface text-foreground/75 hover:text-foreground'
                    }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Filter Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4">
            <button
              onClick={() => setQuickFilter(quickFilter === 'instant' ? 'all' : 'instant')}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1 ${quickFilter === 'instant'
                  ? 'bg-primary/15 text-primary border-primary font-black'
                  : 'bg-card border-border text-foreground/65 hover:text-foreground'
                }`}
            >
              <Zap className="w-3 h-3 text-primary" /> Instant Slot
            </button>
            <button
              onClick={() => setQuickFilter(quickFilter === 'ac' ? 'all' : 'ac')}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1 ${quickFilter === 'ac'
                  ? 'bg-primary/15 text-primary border-primary font-black'
                  : 'bg-card border-border text-foreground/65 hover:text-foreground'
                }`}
            >
              ❄️ AC Courts
            </button>
            <button
              onClick={() => setQuickFilter(quickFilter === 'floodlight' ? 'all' : 'floodlight')}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1 ${quickFilter === 'floodlight'
                  ? 'bg-primary/15 text-primary border-primary font-black'
                  : 'bg-card border-border text-foreground/65 hover:text-foreground'
                }`}
            >
              💡 Floodlights
            </button>
          </div>

          {/* Section Header Count Bar (Clean, Zero Overlap) */}
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-[11px] font-black text-foreground uppercase tracking-widest">
                Available Venues ({filteredVenues.length})
              </h2>
            </div>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="text-[10px] font-bold bg-card border border-border rounded-lg px-2 py-1 text-foreground outline-none cursor-pointer"
            >
              <option value="recommended">⚡ Best Match</option>
              <option value="price_asc">💰 Price: Low to High</option>
              <option value="price_desc">💎 Price: High to Low</option>
              <option value="courts">🏟️ Most Courts</option>
            </select>
          </div>
        </div>

        {/* Mobile Venues List */}
        <div className="px-4 pt-3 space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-3xl border border-border bg-card/60"
                />
              ))}
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-border bg-card space-y-3">
              <Building2 className="w-10 h-10 text-foreground/30 mx-auto" />
              <h3 className="text-sm font-black text-foreground">No Venues Found</h3>
              <p className="text-xs text-foreground/50 max-w-xs mx-auto">
                No arenas match your filters in {cityFilter}. Try resetting filters or choosing &quot;All Cities&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSport('ALL');
                  setCityFilter('All Cities');
                  setQuickFilter('all');
                  setSelectedAmenities([]);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVenues.map((venue: any) => (
                <VenueMarketplaceCard
                  key={venue.venueUuid || venue.venueId || venue.id}
                  venue={venue}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (>= md)
          - Theme-Aware Hero Banner with Dynamic Gradient
          - Wide Multi-Field Search & City Console
          - Multi-Select Amenities Filter Bar & Sorting
          - 3-Column Responsive Marketplace Cards Grid
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block pb-28">
        {/* Desktop Hero Showcase Banner (Theme-Aware) */}
        <div className="relative border-b border-border overflow-hidden pt-10 pb-16 px-8 lg:px-12 bg-gradient-to-b from-card via-surface/70 to-background">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto space-y-8 relative z-10">
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between">
              <Link
                href="/home"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-surface text-foreground text-xs font-bold transition-all shadow-sm hover:border-primary/50 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Return to Home</span>
              </Link>

              {/* Hub Category Switcher */}
              <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full border border-border bg-card shadow-md">
                <Link
                  href="/venues"
                  className="px-4 py-1.5 rounded-full text-xs font-black bg-primary text-primary-foreground flex items-center gap-2 shadow-sm"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Courts &amp; Turfs</span>
                </Link>
                <Link
                  href="/academies"
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-surface flex items-center gap-2 transition-colors"
                >
                  <span>Academies</span>
                </Link>
                <Link
                  href="/coaches"
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-surface flex items-center gap-2 transition-colors"
                >
                  <span>Coaches</span>
                </Link>
              </div>
            </div>

            {/* Headline & Value Proposition */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Real-Time Slot Discovery &amp; Instant Booking
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                Find &amp; Book Top Sports Venues
              </h1>
              <p className="text-sm lg:text-base text-foreground/60 font-medium max-w-2xl mx-auto">
                Real-time hourly court booking for synthetic Badminton courts, floodlit Football turfs, Cricket box nets, and Tennis arenas.
              </p>

              {/* Quality Value Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-bold text-foreground/70">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant Live Confirmation
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" /> 100% Verified Quality Courts
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" /> Zero Cancellation Stress
                </span>
              </div>
            </div>

            {/* Desktop Unified Search & City Console */}
            <div className="max-w-4xl mx-auto p-2.5 rounded-3xl border border-border bg-card shadow-xl flex items-center gap-3">
              {/* Search Query Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search court name, area, turf or sport..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-8 py-3 rounded-2xl bg-surface text-xs font-bold text-foreground outline-none border border-border focus:border-primary transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* City Selector */}
              <div className="relative w-56">
                <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 rounded-2xl bg-surface text-xs font-bold text-foreground outline-none border border-border focus:border-primary appearance-none cursor-pointer transition-colors"
                >
                  {POPULAR_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-card text-foreground">
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
              </div>

              {/* Search CTA */}
              <button
                onClick={() => { }}
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/25 hover:bg-primary-hover active:scale-95 transition-all flex items-center gap-2 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Find Courts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Filter Toolbar & Sport Selector */}
        <div className="max-w-7xl mx-auto px-8 lg:px-12 pt-8 space-y-6">
          {/* Sports Category Tabs */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {SPORTS_CATEGORIES.map((cat) => {
                const isSelected = selectedSport === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSport(cat.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all border ${isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                        : 'border-border bg-card hover:bg-surface text-foreground/70 hover:text-foreground'
                      }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-foreground/50">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="text-xs font-bold bg-card border border-border rounded-xl px-3 py-2 text-foreground outline-none cursor-pointer"
              >
                <option value="recommended">⚡ Best Match &amp; Rating</option>
                <option value="price_asc">💰 Price: Low to High</option>
                <option value="price_desc">💎 Price: High to Low</option>
                <option value="courts">🏟️ Most Courts</option>
              </select>
            </div>
          </div>

          {/* Secondary Amenities Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold uppercase text-[10px] tracking-widest text-foreground/40 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
              </span>
              {QUICK_AMENITIES.map((amenity) => {
                const active = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${active
                        ? 'bg-primary/15 border-primary text-primary font-black shadow-sm'
                        : 'bg-card border-border text-foreground/60 hover:bg-surface hover:text-foreground'
                      }`}
                  >
                    {active && <Check className="w-3 h-3 text-primary" />}
                    {amenity}
                  </button>
                );
              })}
              {selectedAmenities.length > 0 && (
                <button
                  onClick={() => setSelectedAmenities([])}
                  className="text-[11px] font-bold text-red-500 hover:underline ml-2"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-foreground/50">
              <Building2 className="w-4 h-4 text-primary" />
              <span>
                Showing <strong className="text-foreground">{filteredVenues.length}</strong> venues in{' '}
                <strong className="text-foreground">{cityFilter}</strong>
              </span>
            </div>
          </div>

          {/* Desktop Venues Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse pt-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-96 rounded-3xl border border-border bg-card/60"
                />
              ))}
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="p-20 text-center rounded-3xl border border-border bg-card space-y-4 my-6">
              <Building2 className="w-14 h-14 text-foreground/30 mx-auto" />
              <h3 className="text-lg font-black text-foreground">No Venues Match Your Criteria</h3>
              <p className="text-xs sm:text-sm text-foreground/50 max-w-md mx-auto">
                We couldn&apos;t find any venues in {cityFilter} matching your search query or selected amenities.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSport('ALL');
                  setCityFilter('All Cities');
                  setSelectedAmenities([]);
                  setQuickFilter('all');
                }}
                className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
              {filteredVenues.map((venue: any) => (
                <VenueMarketplaceCard
                  key={venue.venueUuid || venue.venueId || venue.id}
                  venue={venue}
                  className="h-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
