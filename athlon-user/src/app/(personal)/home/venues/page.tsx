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
  ArrowRight,
  Trophy,
  Star,
  X,
  Zap,
  Tag,
  ShieldCheck,
  Calendar,
  Phone,
  Compass,
  Flame,
  Check,
  ChevronDown,
  LayoutGrid,
  RefreshCw,
  Ticket,
  CreditCard,
  ArrowUpRight,
  TicketCheck,
} from 'lucide-react';
import { venueApi, bookingApi, BookingDto } from '@/lib/api/venue';
import { OrganizationService } from '@/lib/api/organization';
import { VenueMarketplaceCard } from '@/components/marketplace/VenueMarketplaceCard';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

const POPULAR_CITIES = [
  'All Cities',
  'Bangalore',
  'Chennai',
  'Hyderabad',
  'Mumbai',
  'Delhi NCR',
  'Pune',
  'Kochi',
  'Kozhikode',
  'Coimbatore',
];

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

export default function LoggedInVenuesPage() {
  const router = useRouter();
  const { userUuid, userId } = useAuthStore();
  const { mode } = useAthlonTheme();

  const [activeTab, setActiveTab] = useState<'venues' | 'my-bookings'>('venues');
  const [venues, setVenues] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'courts'>('recommended');
  const [quickFilter, setQuickFilter] = useState<'all' | 'instant' | 'ac' | 'floodlight'>('all');

  const loadVenuesAndBookings = async () => {
    try {
      setLoading(true);

      // 1. Fetch organizations to filter out non-venue workspaces (coaches/academies)
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
      const [res, bookingsRes] = await Promise.allSettled([
        venueApi.getPublicVenues(cityParam),
        userUuid ? bookingApi.getMyBookings(userUuid) : Promise.resolve(null as any),
      ]);

      if (res.status === 'fulfilled' && res.value?.success && Array.isArray(res.value.data)) {
        const rawList = res.value.data.filter((v: any) => {
          if (v.bookingEnabled === false) return false;
          const vType = (v.venueType || v.type || '').toUpperCase();
          if (
            vType === 'ACADEMY' ||
            vType === 'COACH' ||
            vType === 'CLUB' ||
            vType === 'ORGANIZER' ||
            vType === 'ASSOCIATION'
          )
            return false;

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
          sportsOffered:
            v.sportsOffered || (v.facilities?.map((f: any) => f.sportType).filter(Boolean) || ['Badminton']),
          featured: v.featured ?? idx === 0,
          image: v.images?.[0]?.imageUrl || v.image || '/venue-placeholder.jpg',
        }));
        setVenues(merged);
      } else {
        setVenues([]);
      }

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.data && Array.isArray(bookingsRes.value.data)) {
        setMyBookings(bookingsRes.value.data);
      } else {
        setMyBookings([]);
      }
    } catch (err) {
      console.error('Failed to load venues or bookings:', err);
      setVenues([]);
      setMyBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVenuesAndBookings();
  }, [cityFilter, userUuid]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadVenuesAndBookings();
  };

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
          const matchesSport =
            Array.isArray(v.sportsOffered) && v.sportsOffered.some((s: string) => s.toLowerCase().includes(q));
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

        // Amenity Filter
        if (selectedAmenities.length > 0) {
          const venueAmenities = (v.amenities || []).map((a: any) =>
            typeof a === 'string' ? a.toLowerCase() : (a.amenityName || '').toLowerCase()
          );
          const matchAll = selectedAmenities.every((amenity) =>
            venueAmenities.some((va: string) => va.includes(amenity.toLowerCase()))
          );
          if (!matchAll) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') {
          return (Number(a.startingPrice) || 0) - (Number(b.startingPrice) || 0);
        }
        if (sortBy === 'price_desc') {
          return (Number(b.startingPrice) || 0) - (Number(a.startingPrice) || 0);
        }
        if (sortBy === 'courts') {
          return (b.facilities?.length || b.courts || 0) - (a.facilities?.length || a.courts || 0);
        }
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [venues, cityFilter, searchTerm, selectedSport, quickFilter, selectedAmenities, sortBy]);

  // Telemetry counts
  const instantBookingCount = useMemo(() => {
    return venues.filter((v) => v.bookingEnabled).length;
  }, [venues]);

  const floodlitCount = useMemo(() => {
    return venues.filter((v) =>
      v.amenities?.some((a: any) =>
        (typeof a === 'string' ? a : a.amenityName || '').toLowerCase().includes('floodlight')
      )
    ).length;
  }, [venues]);

  const acCount = useMemo(() => {
    return venues.filter((v) =>
      v.amenities?.some((a: any) =>
        (typeof a === 'string' ? a : a.amenityName || '').toLowerCase().includes('air conditioned')
      )
    ).length;
  }, [venues]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24">
        {/* Mobile Header */}
        <header className="px-4 py-3 border-b border-foreground/10 bg-surface/85 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center safe-header">
          <div className="flex items-center gap-2">
            <Link
              href="/home"
              className="w-8 h-8 rounded-lg border border-foreground/10 flex items-center justify-center text-foreground/80 hover:text-foreground active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wide flex items-center gap-1.5 text-foreground">
                <TicketCheck className="w-4 h-4 text-primary" /> Venues &amp; Turfs
              </h1>
              <p className="text-text-muted font-medium text-[10px] leading-tight">
                Court booking &amp; reservations
              </p>
            </div>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="w-8 h-8 rounded-lg border border-foreground/10 flex items-center justify-center text-foreground/60 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Mobile Segmented Control */}
        <div className="p-3.5 pb-0 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('venues')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === 'venues'
                ? 'bg-primary text-black border-primary shadow-xs'
                : 'bg-surface border-foreground/10 text-foreground/70'
            }`}
          >
            <span>Explore ({filteredVenues.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === 'my-bookings'
                ? 'bg-primary text-black border-primary shadow-xs'
                : 'bg-surface border-foreground/10 text-foreground/70'
            }`}
          >
            <span>My Passes ({myBookings.length})</span>
          </button>
        </div>

        {/* Mobile Search & Filters for Venues Tab */}
        {activeTab === 'venues' && (
          <div className="p-3.5 space-y-3">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
            >
              <Search className="w-4 h-4 text-foreground/40 shrink-0" />
              <input
                type="text"
                placeholder="Search arena, turf, sport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs text-foreground placeholder:text-foreground/40 focus:outline-none w-full"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-foreground/40 p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* City Dropdown & Sport Pills */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold bg-surface text-foreground focus:outline-none border-foreground/10 shrink-0"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {SPORTS_CATEGORIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSport(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider shrink-0 transition-all border flex items-center gap-1 ${
                    selectedSport === s.id
                      ? 'bg-primary text-black border-primary font-black'
                      : 'bg-surface border-foreground/10 text-foreground/70'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Content Feed */}
        <main className="p-3.5 pt-0 space-y-4">
          {activeTab === 'venues' ? (
            loading ? (
              <div className="space-y-4 py-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border p-4 animate-pulse space-y-3"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="h-40 rounded-xl bg-foreground/10" />
                    <div className="h-4 w-3/4 bg-foreground/10 rounded" />
                    <div className="h-3 w-1/2 bg-foreground/10 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredVenues.length > 0 ? (
              <div className="space-y-4">
                {filteredVenues.map((v) => (
                  <VenueMarketplaceCard key={v.venueUuid || v.id} venue={v} />
                ))}
              </div>
            ) : (
              <div
                className="p-8 rounded-2xl border text-center space-y-3"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <Building2 className="w-10 h-10 text-foreground/30 mx-auto" />
                <h3 className="text-sm font-black uppercase text-foreground">No Venues Found</h3>
                <p className="text-xs text-foreground/60 max-w-xs mx-auto">
                  No sports arenas found matching your current filter. Try resetting filters.
                </p>
                <button
                  onClick={() => {
                    setCityFilter('All Cities');
                    setSelectedSport('ALL');
                    setSearchTerm('');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-primary text-black font-black text-xs uppercase"
                >
                  Reset Filters
                </button>
              </div>
            )
          ) : (
            /* My Bookings Mobile Feed */
            <div className="space-y-3 pt-2">
              {myBookings.length > 0 ? (
                myBookings.map((b) => (
                  <div
                    key={b.bookingUuid || b.bookingId}
                    className="p-4 rounded-2xl border space-y-2.5 shadow-xs"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-primary">
                        {b.bookingNumber || `#${b.bookingId}`}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          b.bookingStatus === 'CONFIRMED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : 'bg-primary/15 text-primary border border-primary/25'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-foreground">{b.venueName || 'Sports Venue'}</h3>

                    <div className="text-xs text-foreground/60 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{b.bookingDate}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>
                          {b.startTime} - {b.endTime}
                        </span>
                      </div>
                      {b.facilityName && (
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{b.facilityName}</span>
                          {b.sportName && <span>({b.sportName})</span>}
                        </div>
                      )}
                    </div>

                    <div
                      className="pt-2 border-t flex items-center justify-between text-xs"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <span className="font-mono font-bold text-foreground">₹{b.totalAmount}</span>
                      <Link
                        href={`/venues/${b.venueUuid}`}
                        className="text-primary font-bold flex items-center gap-1 hover:underline"
                      >
                        <span>Venue Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="p-8 rounded-2xl border text-center space-y-3"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <Ticket className="w-10 h-10 text-foreground/30 mx-auto" />
                  <h3 className="text-sm font-black uppercase text-foreground">No Bookings Yet</h3>
                  <p className="text-xs text-foreground/60 max-w-xs mx-auto">
                    You have no active court reservations. Browse available turfs to book your slot.
                  </p>
                  <button
                    onClick={() => setActiveTab('venues')}
                    className="px-4 py-1.5 rounded-xl bg-primary text-black font-black text-xs uppercase"
                  >
                    Browse Venues
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - TELEMETRY HUD + 3-COLUMN BOOKINGS GRID (NO STICKY NAVBAR)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen pb-24 bg-background">
        {/* Ambient Desktop Hero Banner & Telemetry HUD */}
        <section
          className="relative w-full border-b overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
            {/* Header + Telemetry Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Title Area */}
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <Link
                    href="/home"
                    className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all shadow-xs active:scale-95 shrink-0 hover:bg-white/5 cursor-pointer text-foreground/80 hover:text-foreground mr-1"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                    title="Return to Athlete Workspace"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 border border-primary/25 text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    Athlete Court &amp; Turf Bookings
                  </div>

                  <button
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:bg-white/5"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                    title="Sync real-time court availability"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                      style={{ color: 'var(--athlon-primary)' }}
                    />
                  </button>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight uppercase">
                  Venues &amp; Turf Bookings
                </h1>
                <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                  Discover verified sports arenas, book hourly courts, reserve floodlit turfs, and manage your court passes.
                </p>
              </div>

              {/* Right: 4 Telemetry HUD Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                {/* Total Venues */}
                <div
                  className="p-4 rounded-2xl border flex flex-col justify-between min-w-[130px] shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50">Total</span>
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-black font-mono text-foreground">{venues.length}</div>
                  <span className="text-[10px] text-foreground/50 font-medium">Verified arenas</span>
                </div>

                {/* Instant Booking */}
                <div
                  className="p-4 rounded-2xl border flex flex-col justify-between min-w-[130px] shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Instant</span>
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-400">{instantBookingCount}</div>
                  <span className="text-[10px] text-foreground/50 font-medium">Slot checkout active</span>
                </div>

                {/* Floodlit Turfs */}
                <div
                  className="p-4 rounded-2xl border flex flex-col justify-between min-w-[130px] shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Floodlights</span>
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-foreground">{floodlitCount}</div>
                  <span className="text-[10px] text-foreground/50 font-medium">Night play arenas</span>
                </div>

                {/* My Bookings */}
                <div
                  className="p-4 rounded-2xl border flex flex-col justify-between min-w-[130px] shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">My Passes</span>
                    <Ticket className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-foreground">{myBookings.length}</div>
                  <span className="text-[10px] text-foreground/50 font-medium">Court reservations</span>
                </div>
              </div>
            </div>

            {/* Segmented Control: Browse Venues vs My Bookings */}
            <div className="pt-2 flex items-center justify-between gap-4 flex-wrap border-t border-foreground/5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('venues')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                    activeTab === 'venues'
                      ? 'bg-primary text-black border-primary shadow-sm shadow-primary/20 scale-[1.02]'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'venues' ? 'var(--athlon-primary)' : 'var(--athlon-card)',
                    borderColor: activeTab === 'venues' ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                  }}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Explore Sports Venues</span>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold"
                    style={{
                      backgroundColor: activeTab === 'venues' ? 'rgba(0,0,0,0.2)' : 'var(--athlon-surface)',
                      color: activeTab === 'venues' ? '#000' : 'var(--athlon-text-muted)',
                    }}
                  >
                    {filteredVenues.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('my-bookings')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                    activeTab === 'my-bookings'
                      ? 'bg-primary text-black border-primary shadow-sm shadow-primary/20 scale-[1.02]'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'my-bookings' ? 'var(--athlon-primary)' : 'var(--athlon-card)',
                    borderColor: activeTab === 'my-bookings' ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                  }}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>My Court Passes</span>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold"
                    style={{
                      backgroundColor: activeTab === 'my-bookings' ? 'rgba(0,0,0,0.2)' : 'var(--athlon-surface)',
                      color: activeTab === 'my-bookings' ? '#000' : 'var(--athlon-text-muted)',
                    }}
                  >
                    {myBookings.length}
                  </span>
                </button>
              </div>

              {/* Search Bar when on Venues Tab */}
              {activeTab === 'venues' && (
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl border w-72 shadow-xs transition-colors focus-within:border-primary/50"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <Search className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search arena, turf, landmark..."
                      className="bg-transparent text-xs text-foreground placeholder:text-foreground/40 focus:outline-none w-full"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-foreground/40 hover:text-foreground p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sub-Filters: Sport Categories & City (Venues Tab Only) */}
            {activeTab === 'venues' && (
              <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Sports Pills */}
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                  {SPORTS_CATEGORIES.map((s) => {
                    const active = selectedSport === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSport(s.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
                          active
                            ? 'bg-primary text-black border-primary shadow-xs'
                            : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                        }`}
                        style={{
                          backgroundColor: active ? 'var(--athlon-primary)' : 'var(--athlon-card)',
                          borderColor: active ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                        }}
                      >
                        <span>{s.icon}</span>
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* City & Sort Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <option value="recommended">Featured First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="courts">Most Courts Available</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Desktop Main Content Feed */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
          {activeTab === 'venues' ? (
            /* Venues Grid */
            loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="p-5 rounded-3xl border animate-pulse space-y-4"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="h-48 rounded-2xl bg-foreground/10" />
                    <div className="h-5 w-3/4 bg-foreground/10 rounded" />
                    <div className="h-4 w-1/2 bg-foreground/10 rounded" />
                    <div className="h-10 bg-foreground/10 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredVenues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map((venue) => (
                  <VenueMarketplaceCard key={venue.venueUuid || venue.venueId || venue.id} venue={venue} />
                ))}
              </div>
            ) : (
              /* Empty Venues State */
              <div
                className="p-12 rounded-3xl border text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs space-y-4"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border"
                  style={{
                    backgroundColor: 'var(--athlon-primary-soft)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  <Building2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black uppercase tracking-tight text-foreground">
                    No Sports Arenas Found
                  </h3>
                  <p className="text-xs text-foreground/60 max-w-xs leading-relaxed font-medium">
                    {searchTerm
                      ? `No venues matching "${searchTerm}". Try searching for another locality or clear your filters.`
                      : 'No venues found for the selected city or sport discipline.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCityFilter('All Cities');
                    setSelectedSport('ALL');
                    setSearchTerm('');
                    setQuickFilter('all');
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-primary text-black transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            )
          ) : (
            /* My Bookings Desktop Feed */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                    Confirmed Court Passes &amp; Reservations ({myBookings.length})
                  </h2>
                  <p className="text-xs text-foreground/50">
                    Your scheduled match slots, facility reservations, and check-in codes
                  </p>
                </div>
              </div>

              {myBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myBookings.map((b) => (
                    <div
                      key={b.bookingUuid || b.bookingId}
                      className="p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      {/* Top Accent Line */}
                      <div className="h-1 w-full bg-emerald-500 absolute top-0 left-0 right-0" />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                            {b.bookingNumber || `#${b.bookingId}`}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              b.bookingStatus === 'CONFIRMED'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                : 'bg-primary/15 text-primary border-primary/25'
                            }`}
                          >
                            {b.bookingStatus}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-foreground truncate">
                            {b.venueName || 'Sports Venue'}
                          </h3>
                          {b.facilityName && (
                            <p className="text-xs text-foreground/60 font-medium mt-0.5">
                              {b.facilityName} {b.sportName ? `• ${b.sportName}` : ''}
                            </p>
                          )}
                        </div>

                        {/* Date & Time Capsule */}
                        <div
                          className="p-3.5 rounded-2xl border space-y-1.5"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-foreground/50 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-primary" /> Date
                            </span>
                            <span className="text-foreground font-mono">{b.bookingDate}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-foreground/50 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-primary" /> Time Slot
                            </span>
                            <span className="text-foreground font-mono">
                              {b.startTime} - {b.endTime}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-foreground/5">
                            <span className="text-foreground/50">Amount Paid</span>
                            <span className="text-primary font-mono font-bold">₹{b.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div
                        className="pt-4 mt-4 border-t flex items-center justify-between text-xs"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <span className="text-emerald-400 font-mono font-bold">Paid ✓</span>
                        <Link
                          href={`/venues/${b.venueUuid}`}
                          className="flex items-center gap-1.5 text-primary font-bold hover:underline"
                        >
                          <span>Open Venue Console</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty Bookings State */
                <div
                  className="p-12 rounded-3xl border text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs space-y-4"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center border"
                    style={{
                      backgroundColor: 'var(--athlon-primary-soft)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-primary)',
                    }}
                  >
                    <Ticket className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-black uppercase tracking-tight text-foreground">
                      No Active Court Passes
                    </h3>
                    <p className="text-xs text-foreground/60 max-w-xs leading-relaxed font-medium">
                      You don't have any active court bookings. Reserve an hourly court or turf session to receive your match day pass.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('venues')}
                    className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-primary text-black transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    Browse Available Venues
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}

