'use client';

import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  MapPin,
  Star,
  ChevronRight,
  ShieldCheck,
  Dumbbell,
  Navigation,
  Phone,
  Trophy,
  Building2,
  Building,
  Tv,
  Home,
  ArrowRight,
  Filter,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
  Clock,
  Award,
  LayoutGrid,
  List,
  GalleryHorizontal,
  Check,
  Zap,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

interface Venue {
  id: number;
  name: string;
  sport: string;
  rating: string;
  reviews: string;
  distance: string;
  location: string;
  price: number;
  courts: number;
  tags: string[];
  image: string;
  featured: boolean;
  openTiming: string;
  phone: string;
  availableSlots: string[];
}

export default function BookingsPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // States
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'carousel'>('grid');

  // Booking drawer modal state
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedCourtNum, setSelectedCourtNum] = useState<number>(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Generate the next 7 days for the interactive date picker
  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const dayName = isToday
        ? 'Today'
        : isTomorrow
        ? 'Tomorrow'
        : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      dates.push({
        label: dayName,
        dayNum,
        monthName,
        fullDate: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      });
    }
    return dates;
  }, []);

  const sportsList = [
    { id: 'all', label: 'All Sports', icon: '⚡' },
    { id: 'badminton', label: 'Badminton', icon: '🏸' },
    { id: 'tennis', label: 'Tennis', icon: '🎾' },
    { id: 'pickleball', label: 'Pickleball', icon: '🏓' },
    { id: 'football', label: 'Football / Turf', icon: '⚽' },
    { id: 'squash', label: 'Squash', icon: '🏐' },
  ];

  const timeFilterPills = [
    { id: 'all', label: 'All Times' },
    { id: 'morning', label: '🌅 Morning (6-12)' },
    { id: 'afternoon', label: '☀️ Afternoon (12-5)' },
    { id: 'evening', label: '🌙 Evening (5-11)' },
    { id: 'wooden', label: '🪵 Wooden Courts' },
    { id: 'top_rated', label: '⭐ 4.7+ Rated' },
  ];

  const venues: Venue[] = [
    {
      id: 1,
      name: 'Smash Arena Pro',
      sport: 'Badminton',
      rating: '4.9',
      reviews: '128',
      distance: '2.5 km',
      location: 'Koramangala, Bangalore',
      price: 500,
      courts: 6,
      tags: ['BWF Certified', 'Wooden Flooring', 'Showers'],
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
      featured: true,
      openTiming: '6:00 AM - 11:00 PM',
      phone: '+91 98765 43210',
      availableSlots: ['06:00 AM', '07:00 AM', '09:00 AM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'],
    },
    {
      id: 2,
      name: 'Elite Sports Club & Hub',
      sport: 'Badminton',
      rating: '4.7',
      reviews: '84',
      distance: '4.1 km',
      location: 'HSR Layout, Bangalore',
      price: 400,
      courts: 4,
      tags: ['Wooden Courts', 'Cafeteria', 'Pro Shop'],
      image: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?q=80&w=800&auto=format&fit=crop',
      featured: false,
      openTiming: '5:30 AM - 10:30 PM',
      phone: '+91 98765 43211',
      availableSlots: ['06:30 AM', '08:00 AM', '04:00 PM', '06:00 PM', '08:00 PM', '09:30 PM'],
    },
    {
      id: 3,
      name: 'Velocity Racket Club',
      sport: 'Tennis',
      rating: '4.8',
      reviews: '96',
      distance: '5.4 km',
      location: 'Indiranagar, Bangalore',
      price: 650,
      courts: 3,
      tags: ['Clay Courts', 'Floodlights', 'Equipment Rental'],
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=800&auto=format&fit=crop',
      featured: true,
      openTiming: '6:00 AM - 10:00 PM',
      phone: '+91 98765 43212',
      availableSlots: ['06:00 AM', '07:30 AM', '05:00 PM', '06:30 PM', '08:00 PM'],
    },
    {
      id: 4,
      name: 'Apex Pickleball & Fitness',
      sport: 'Pickleball',
      rating: '4.8',
      reviews: '64',
      distance: '3.2 km',
      location: 'Whitefield, Bangalore',
      price: 350,
      courts: 6,
      tags: ['USA Pickleball Standard', 'Air Conditioned'],
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
      featured: false,
      openTiming: '6:00 AM - 11:00 PM',
      phone: '+91 98765 43213',
      availableSlots: ['07:00 AM', '08:30 AM', '05:00 PM', '07:00 PM', '09:00 PM'],
    },
    {
      id: 5,
      name: 'Champions Turf & Arena',
      sport: 'Football',
      rating: '4.6',
      reviews: '112',
      distance: '6.0 km',
      location: 'JP Nagar, Bangalore',
      price: 900,
      courts: 2,
      tags: ['FIFA Certified Turf', 'Dressing Rooms', 'Night Lights'],
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=800&auto=format&fit=crop',
      featured: false,
      openTiming: 'Open 24 Hours',
      phone: '+91 98765 43214',
      availableSlots: ['06:00 AM', '08:00 AM', '04:00 PM', '06:00 PM', '08:00 PM', '10:00 PM', '11:30 PM'],
    },
    {
      id: 6,
      name: 'Prime Court Sports Zone',
      sport: 'Squash',
      rating: '4.7',
      reviews: '53',
      distance: '4.8 km',
      location: 'Bellandur, Bangalore',
      price: 450,
      courts: 3,
      tags: ['Glass Back Courts', 'Physio Support', 'Parking'],
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
      featured: false,
      openTiming: '6:00 AM - 10:30 PM',
      phone: '+91 98765 43215',
      availableSlots: ['07:00 AM', '08:00 AM', '05:30 PM', '07:00 PM', '08:30 PM'],
    },
  ];

  // Filtered venues list
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      // Sport filter
      if (selectedSport !== 'all' && v.sport.toLowerCase() !== selectedSport.toLowerCase()) {
        return false;
      }

      // Time / feature pill filter
      if (timeFilter === 'top_rated' && parseFloat(v.rating) < 4.7) return false;
      if (timeFilter === 'wooden' && !v.tags.some((t) => t.toLowerCase().includes('wood'))) return false;
      if (timeFilter === 'morning') {
        const hasMorning = v.availableSlots.some((s) => s.includes('AM'));
        if (!hasMorning) return false;
      }
      if (timeFilter === 'evening') {
        const hasEvening = v.availableSlots.some((s) => s.includes('PM') && (s.startsWith('05') || s.startsWith('06') || s.startsWith('07') || s.startsWith('08') || s.startsWith('09') || s.startsWith('10')));
        if (!hasEvening) return false;
      }

      // Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.sport.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [venues, selectedSport, timeFilter, searchQuery]);

  const featuredVenue = filteredVenues.find((v) => v.featured) || filteredVenues[0];

  const handleOpenBooking = (venue: Venue, slot?: string) => {
    setSelectedVenue(venue);
    setSelectedSlot(slot || venue.availableSlots[0] || '06:00 PM');
    setSelectedCourtNum(1);
    setBookingSuccess(false);
  };

  const handleConfirmBooking = () => {
    setBookingSuccess(true);
    setTimeout(() => {
      setSelectedVenue(null);
      setBookingSuccess(false);
    }, 2200);
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - COMPACT, HIGH-END BOOKINGS FLOW
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-28 min-h-screen">
        {/* Sticky Mobile Top Header */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-3.5 py-2.5 backdrop-blur-xl border-b transition-all"
          style={{
            backgroundColor: 'var(--athlon-navigation)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              className="w-8 h-8 rounded-xl flex items-center justify-center border text-foreground/80 hover:text-foreground transition-all hover:scale-105 active:scale-95 shrink-0"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black uppercase tracking-wider text-foreground truncate">
                  Book Courts & Slots
                </h1>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-primary/15 text-primary border border-primary/25 font-mono shrink-0">
                  {filteredVenues.length}
                </span>
              </div>
              <p className="text-[10px] text-foreground/50 font-bold truncate">
                Instant confirmation • Pay at venue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-foreground/80">Bangalore</span>
            </div>
          </div>
        </header>

        <main className="w-full max-w-lg mx-auto px-3.5 flex flex-col gap-3 pt-3">
          {/* 1. Date Selector Track (Horizontal 7 Days) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-foreground/60 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" /> Select Date
              </span>
              <span className="text-[10px] font-bold text-primary">
                {dateOptions[selectedDateIndex]?.fullDate}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scroll-px-3 hide-scrollbar -mx-3.5 px-3.5">
              {dateOptions.map((d, idx) => {
                const isSelected = selectedDateIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDateIndex(idx)}
                    className={`flex flex-col items-center justify-center min-w-[56px] py-2 px-2 rounded-2xl border transition-all text-center shrink-0 ${
                      isSelected
                        ? 'bg-primary text-black border-primary shadow-md shadow-primary/20 scale-[1.03]'
                        : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: isSelected ? undefined : 'var(--athlon-surface)',
                      borderColor: isSelected ? undefined : 'var(--athlon-border)',
                    }}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                      {d.label}
                    </span>
                    <span className="text-sm font-black font-mono leading-tight mt-0.5">
                      {d.dayNum}
                    </span>
                    <span className="text-[8.5px] font-medium opacity-60">
                      {d.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Search Input */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venue name, area, or amenities..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border text-xs font-medium outline-none focus:border-primary transition-all text-foreground placeholder:text-foreground/40"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 3. Sport Filters Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scroll-px-3 hide-scrollbar -mx-3.5 px-3.5">
            {sportsList.map((s) => {
              const isSelected = selectedSport === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSport(s.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-primary text-black border-primary shadow-sm shadow-primary/20 scale-[1.02]'
                      : 'border-transparent text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: isSelected ? undefined : 'var(--athlon-surface)',
                    borderColor: isSelected ? undefined : 'var(--athlon-border)',
                  }}
                >
                  <span className="text-xs">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* 4. Time / Feature Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scroll-px-3 hide-scrollbar -mx-3.5 px-3.5">
            {timeFilterPills.map((t) => {
              const isSelected = timeFilter === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTimeFilter(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all border ${
                    isSelected
                      ? 'bg-primary/20 text-primary border-primary font-black'
                      : 'border-transparent text-foreground/60 hover:text-foreground hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: isSelected ? undefined : 'var(--athlon-surface)',
                    borderColor: isSelected ? undefined : 'var(--athlon-border)',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* 5. View Mode Switcher Header */}
          <div className="flex items-center justify-between px-0.5 pt-0.5">
            <div className="text-[10.5px] font-bold text-foreground/60">
              Found <span className="text-foreground font-black font-mono">{filteredVenues.length}</span> venues with slots
            </div>

            <div
              className="flex items-center p-0.5 rounded-xl border"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                aria-label="Grid View"
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-primary text-black font-black shadow-sm'
                    : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[9.5px] font-bold hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                title="List View"
                aria-label="List View"
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'list'
                    ? 'bg-primary text-black font-black shadow-sm'
                    : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="text-[9.5px] font-bold hidden sm:inline">List</span>
              </button>

              <button
                onClick={() => setViewMode('carousel')}
                title="Horizontal Scroll View"
                aria-label="Horizontal Scroll View"
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'carousel'
                    ? 'bg-primary text-black font-black shadow-sm'
                    : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <GalleryHorizontal className="w-3.5 h-3.5" />
                <span className="text-[9.5px] font-bold hidden sm:inline">Scroll</span>
              </button>
            </div>
          </div>

          {/* 6. Venues Content List */}
          <div className="flex flex-col gap-3.5 pt-0.5">
            {filteredVenues.length === 0 ? (
              <div
                className="py-12 px-4 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/40">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    No Courts Available
                  </h3>
                  <p className="text-[11px] text-foreground/50 mt-1 max-w-xs mx-auto">
                    No open time slots match your current sport, date, and time filter settings.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedSport('all');
                    setTimeFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold hover:bg-primary/20 transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* ── 1. GRID VIEW (Rich Cards with Slot Pills) ── */
              <div className="space-y-3.5">
                {filteredVenues.map((venue) => (
                  <div
                    key={venue.id}
                    className="rounded-[22px] overflow-hidden border shadow-lg transition-all group"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    {/* Header Image */}
                    <div className="relative h-36 w-full overflow-hidden">
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary text-black shadow-sm">
                          {venue.sport}
                        </span>
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 shadow-sm">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-bold text-white">{venue.rating}</span>
                        </div>
                      </div>

                      {/* Price Tag */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black tracking-tight text-primary bg-black/70 backdrop-blur-md border border-primary/30 shadow-md">
                          ₹{venue.price}/hr
                        </span>
                      </div>

                      {/* Title on Image */}
                      <div className="absolute bottom-2.5 left-3 right-3">
                        <h3 className="text-sm font-black text-white leading-tight drop-shadow truncate">
                          {venue.name}
                        </h3>
                        <p className="text-[10.5px] text-white/70 truncate mt-0.5">
                          {venue.location} • {venue.distance} away
                        </p>
                      </div>
                    </div>

                    {/* Body Details */}
                    <div className="p-3.5 space-y-3">
                      {/* Available Slots Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-black uppercase tracking-wider text-foreground/60 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" /> Open Slots Today:
                          </span>
                          <span className="text-primary font-bold">{venue.courts} Courts</span>
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                          {venue.availableSlots.map((slot, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleOpenBooking(venue, slot)}
                              className="px-2.5 py-1 rounded-xl border text-[10.5px] font-mono font-bold text-primary hover:bg-primary hover:text-black transition-all shrink-0 active:scale-95"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border)',
                              }}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tag Chips & Book CTA */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-foreground/5">
                        <div className="flex items-center gap-1 flex-wrap min-w-0 flex-1">
                          {venue.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg border text-[9px] font-medium text-foreground/60 truncate"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border)',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => handleOpenBooking(venue)}
                          className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Book Slot</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'list' ? (
              /* ── 2. LIST VIEW (Compact Rows) ── */
              <div className="space-y-2">
                {filteredVenues.map((venue) => (
                  <div
                    key={venue.id}
                    onClick={() => handleOpenBooking(venue)}
                    className="flex items-center justify-between p-2.5 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-sm cursor-pointer"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden relative shrink-0 border border-foreground/10">
                        <img
                          src={venue.image}
                          alt={venue.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 py-0.2 flex items-center justify-center gap-0.5">
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          <span className="text-[8.5px] font-bold text-white">{venue.rating}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">
                          {venue.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-foreground/55 font-medium truncate mt-0.5">
                          <span className="text-primary font-bold">{venue.sport}</span>
                          <span>•</span>
                          <span className="truncate">{venue.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9.5px] text-primary font-bold mt-0.5 font-mono">
                          <span>{venue.availableSlots.length} slots available</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-mono font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        ₹{venue.price}/hr
                      </span>
                      <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── 3. HORIZONTAL SCROLL / CAROUSEL VIEW ── */
              <div className="space-y-4">
                {featuredVenue && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Featured Arena
                      </span>
                      <span className="text-[9.5px] font-bold text-foreground/40 uppercase">Recommended</span>
                    </div>

                    <div
                      className="relative rounded-2xl overflow-hidden border shadow-xl p-4 min-h-[190px] flex flex-col justify-end"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <div className="absolute inset-0 z-0">
                        <img
                          src={featuredVenue.image}
                          alt={featuredVenue.name}
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
                      </div>

                      <div className="relative z-10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary text-black">
                            ₹{featuredVenue.price}/hr
                          </span>
                          <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full text-[10px] font-bold text-white">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{featuredVenue.rating}</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-black text-white leading-tight">{featuredVenue.name}</h3>
                          <p className="text-[10px] text-white/70 mt-0.5">{featuredVenue.location} • {featuredVenue.distance}</p>
                        </div>

                        <button
                          onClick={() => handleOpenBooking(featuredVenue)}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-black font-black text-xs shadow-md"
                        >
                          <span>Select Court & Slot</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Horizontal Swipe Track */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-xs font-black uppercase tracking-wider text-foreground">
                      All Sports Centers ({filteredVenues.length})
                    </span>
                    <span className="text-[9.5px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-0.5">
                      Swipe <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>

                  <div className="flex items-stretch gap-3.5 overflow-x-auto pb-3 snap-x scroll-px-3.5 hide-scrollbar -mx-3.5 px-3.5">
                    {filteredVenues.map((venue) => (
                      <div
                        key={venue.id}
                        className="snap-start shrink-0 w-[84vw] sm:w-[320px] max-w-[340px]"
                      >
                        <div
                          className="rounded-2xl overflow-hidden border shadow-md flex flex-col justify-between h-full"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="relative h-28 w-full overflow-hidden">
                            <img
                              src={venue.image}
                              alt={venue.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-white">
                              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span>{venue.rating}</span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black text-primary bg-black/70 font-mono">
                                ₹{venue.price}/hr
                              </span>
                            </div>
                          </div>

                          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-black text-foreground truncate">{venue.name}</h4>
                              <p className="text-[10px] text-foreground/50 truncate mt-0.5">
                                {venue.location} ({venue.distance})
                              </p>
                            </div>

                            <button
                              onClick={() => handleOpenBooking(venue)}
                              className="w-full py-2 rounded-xl bg-primary text-black font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm"
                            >
                              <span>Book Court</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ── Interactive Booking Bottom Sheet / Modal ── */}
        {selectedVenue && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div
              className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] border p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                <div>
                  <h3 className="text-sm font-black text-foreground">{selectedVenue.name}</h3>
                  <p className="text-[10.5px] text-foreground/50">
                    {dateOptions[selectedDateIndex]?.fullDate}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVenue(null)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-foreground/60 hover:text-foreground transition-all"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-black text-foreground">Court Slot Reserved!</h4>
                  <p className="text-xs text-foreground/60 max-w-xs mx-auto">
                    Your booking for <span className="text-primary font-bold">Court {selectedCourtNum}</span> at <span className="text-primary font-bold">{selectedSlot}</span> has been confirmed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select Court Number */}
                  <div className="space-y-1.5">
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-foreground/60">
                      1. Select Court Number
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: selectedVenue.courts }).map((_, idx) => {
                        const courtNo = idx + 1;
                        const isChosen = selectedCourtNum === courtNo;
                        return (
                          <button
                            key={courtNo}
                            onClick={() => setSelectedCourtNum(courtNo)}
                            className={`py-2 px-1 rounded-xl border text-xs font-bold text-center transition-all ${
                              isChosen
                                ? 'bg-primary text-black border-primary shadow-sm font-black'
                                : 'text-foreground/70 hover:bg-white/5'
                            }`}
                            style={{
                              backgroundColor: isChosen ? undefined : 'var(--athlon-surface)',
                              borderColor: isChosen ? undefined : 'var(--athlon-border)',
                            }}
                          >
                            Court {courtNo}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Slot Time */}
                  <div className="space-y-1.5">
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-foreground/60">
                      2. Select Time Slot
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedVenue.availableSlots.map((slot, sIdx) => {
                        const isSlotChosen = selectedSlot === slot;
                        return (
                          <button
                            key={sIdx}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-1 rounded-xl border text-[11px] font-mono font-bold text-center transition-all ${
                              isSlotChosen
                                ? 'bg-primary text-black border-primary shadow-sm font-black'
                                : 'text-foreground/70 hover:bg-white/5'
                            }`}
                            style={{
                              backgroundColor: isSlotChosen ? undefined : 'var(--athlon-surface)',
                              borderColor: isSlotChosen ? undefined : 'var(--athlon-border)',
                            }}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary & Price */}
                  <div
                    className="p-3 rounded-2xl border space-y-2 text-xs"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="flex items-center justify-between text-foreground/70">
                      <span>Court Rate (1 hour):</span>
                      <span className="font-mono font-bold">₹{selectedVenue.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-foreground/70">
                      <span>Convenience Fee:</span>
                      <span className="text-primary font-bold uppercase">FREE</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-foreground/10 text-sm font-black text-foreground">
                      <span>Total Amount:</span>
                      <span className="text-primary font-mono text-base">₹{selectedVenue.price}</span>
                    </div>
                  </div>

                  {/* Confirm CTA */}
                  <button
                    onClick={handleConfirmBooking}
                    className="w-full py-3 rounded-xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Booking (Court {selectedCourtNum} • {selectedSlot})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Fixed Bottom Navigation */}
        <nav
          className="fixed bottom-0 left-0 right-0 h-20 backdrop-blur-xl border-t z-40 px-5 flex items-center justify-between max-w-lg mx-auto"
          style={{ backgroundColor: 'var(--athlon-navigation)', borderColor: 'var(--athlon-border)' }}
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
              href="/match-setup"
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3.5px] group relative overflow-hidden shadow-2xl"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                borderColor: 'var(--athlon-navigation)',
                boxShadow: '0 10px 25px -2px var(--athlon-primary-glow), 0 4px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.3)',
              }}
            >
              {/* 3D Glass Specular Reflection Arc */}
              <div className="absolute inset-x-1 top-0 h-[45%] rounded-t-full bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

              <img
                src="/umpire.png"
                alt="Umpire"
                className="w-8 h-8 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] relative z-10 transition-transform group-hover:scale-110 group-active:scale-95"
              />
            </Link>
          </div>

          <Link href="/academies" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
            <Athlon3DIcon type="academies" size={32} active={false} />
            <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
              Academy
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

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Desktop Top Navbar */}
        <header
          className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-background/85 transition-all duration-300"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-lg"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  border: '1px solid var(--athlon-border)',
                  boxShadow: '0 0 20px var(--athlon-primary-soft)',
                }}
              >
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-foreground leading-none">
                  ATHLON
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-primary leading-tight mt-0.5">
                  Court Reservations
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 bg-surface/40 p-1.5 rounded-2xl border border-foreground/5 backdrop-blur-md">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Home className="w-4 h-4 text-primary" />
                <span>Home</span>
              </Link>

              <Link
                href="/tournaments"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-primary" />
                <span>Tournaments</span>
              </Link>

              <Link
                href="/academies"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-primary" />
                <span>Academies</span>
              </Link>

              <Link
                href="/bookings"
                className="px-4 py-2 rounded-xl text-sm font-black bg-primary text-black transition-all flex items-center gap-2 shadow-sm"
              >
                <Calendar className="w-4 h-4 text-black" />
                <span>Book Courts</span>
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/home"
                  className="flex items-center gap-2 bg-primary text-black text-sm font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                  style={{ boxShadow: '0 4px 20px var(--athlon-primary-glow)' }}
                >
                  <span>Go to App</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-bold px-4 py-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all"
                  >
                    Log In
                  </Link>

                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 bg-primary text-black text-sm font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                    style={{ boxShadow: '0 4px 20px var(--athlon-primary-glow)' }}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section
          className="relative w-full border-b overflow-hidden py-12 px-6 lg:px-8"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="max-w-2xl space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" /> Instant Court Booking
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">
                Reserve Verified Sports Courts in Real-Time
              </h2>
              <p className="text-sm text-foreground/60">
                Choose your sport, select an open time slot, and lock in your reservation with zero hassle.
              </p>
            </div>

            {/* Desktop Quick Date & Sport Toolbar */}
            <div
              className="p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {/* Date Pills */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {dateOptions.map((d, idx) => {
                  const isSelected = selectedDateIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDateIndex(idx)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-primary text-black border-primary font-black shadow-sm'
                          : 'border-transparent text-foreground/70 hover:bg-white/5'
                      }`}
                    >
                      {d.label} ({d.dayNum} {d.monthName})
                    </button>
                  );
                })}
              </div>

              {/* Sport Filter */}
              <div className="flex items-center gap-2">
                {sportsList.map((s) => {
                  const isSelected = selectedSport === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSport(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-primary text-black border-primary font-black'
                          : 'border-transparent text-foreground/70 hover:bg-white/5'
                      }`}
                    >
                      {s.icon} {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Venues Grid */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                className="rounded-3xl overflow-hidden border shadow-lg transition-all group flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary text-black">
                      {venue.sport}
                    </span>
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{venue.rating}</span>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-xl text-sm font-mono font-black text-primary bg-black/70 backdrop-blur-md border border-primary/30">
                      ₹{venue.price}/hr
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-black text-white leading-tight drop-shadow">
                      {venue.name}
                    </h3>
                    <p className="text-xs text-white/70 mt-0.5">{venue.location} • {venue.distance}</p>
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-foreground/60 flex items-center justify-between">
                      <span>Available Slots ({dateOptions[selectedDateIndex]?.label}):</span>
                      <span className="text-primary font-bold">{venue.courts} Courts</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {venue.availableSlots.slice(0, 6).map((slot, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleOpenBooking(venue, slot)}
                          className="py-1.5 px-2 rounded-xl border text-xs font-mono font-bold text-primary hover:bg-primary hover:text-black transition-all text-center"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(venue)}
                    className="w-full py-3 rounded-2xl bg-primary text-black font-black text-xs shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Instant Court Booking</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Global Scrollbar utility */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />
    </div>
  );
}
