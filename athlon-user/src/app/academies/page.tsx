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
  Shield,
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
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

export default function AcademiesPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'carousel'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const academies = [
    {
      id: 1,
      name: 'Smash Arena Pro Academy',
      rating: '4.9',
      reviews: '128',
      distance: '2.5 km',
      location: 'Koramangala, Bangalore',
      price: '₹500/hr',
      courts: 6,
      tags: ['BWF Certified', 'Pro Shop', 'Coaching Batches', 'Wooden Flooring'],
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
      featured: true,
      openTiming: '6:00 AM - 11:00 PM',
      phone: '+91 98765 43210',
    },
    {
      id: 2,
      name: 'Elite Sports Club & Academy',
      rating: '4.7',
      reviews: '84',
      distance: '4.1 km',
      location: 'HSR Layout, Bangalore',
      price: '₹400/hr',
      courts: 4,
      tags: ['Wooden Courts', 'Showers', 'Coaching Batches', 'Cafeteria'],
      image: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?q=80&w=800&auto=format&fit=crop',
      featured: false,
      openTiming: '5:30 AM - 10:30 PM',
      phone: '+91 98765 43211',
    },
    {
      id: 3,
      name: 'Velocity Badminton Hub',
      rating: '4.5',
      reviews: '56',
      distance: '6.8 km',
      location: 'Indiranagar, Bangalore',
      price: '₹350/hr',
      courts: 3,
      tags: ['Synthetic Flooring', '24/7 Open', 'Equipment Rental'],
      image: 'https://images.unsplash.com/photo-1611252758110-6c9f2868853b?q=80&w=800&auto=format&fit=crop',
      featured: false,
      openTiming: 'Open 24 Hours',
      phone: '+91 98765 43212',
    },
    {
      id: 4,
      name: 'Apex Badminton & Fitness Center',
      rating: '4.8',
      reviews: '92',
      distance: '3.4 km',
      location: 'Whitefield, Bangalore',
      price: '₹450/hr',
      courts: 8,
      tags: ['BWF Certified', 'Air Conditioned', 'Pro Shop'],
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
      featured: false,
      openTiming: '6:00 AM - 10:00 PM',
      phone: '+91 98765 43213',
    },
    {
      id: 5,
      name: 'Champions Sports Academy',
      rating: '4.6',
      reviews: '73',
      distance: '5.2 km',
      location: 'JP Nagar, Bangalore',
      price: '₹420/hr',
      courts: 5,
      tags: ['Junior Batches', 'Tournament Training', 'Locker Room'],
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=800&auto=format&fit=crop',
      featured: false,
      openTiming: '5:00 AM - 11:00 PM',
      phone: '+91 98765 43214',
    },
    {
      id: 6,
      name: 'Prime Court Sports Hub',
      rating: '4.7',
      reviews: '65',
      distance: '7.0 km',
      location: 'Bellandur, Bangalore',
      price: '₹480/hr',
      courts: 6,
      tags: ['Synthetic Courts', 'Parking Available', 'Physio Support'],
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
      featured: false,
      openTiming: '6:00 AM - 10:30 PM',
      phone: '+91 98765 43215',
    },
  ];

  const featured = academies.find((a) => a.featured);
  const others = academies.filter((a) => !a.featured);

  // Desktop Filtered List
  const filteredAcademies = useMemo(() => {
    return academies.filter((a) => {
      if (activeFilter === 'top_rated' && parseFloat(a.rating) < 4.7) return false;
      if (activeFilter === 'coaching' && !a.tags.some((t) => t.toLowerCase().includes('coaching') || t.toLowerCase().includes('training'))) return false;
      if (activeFilter === 'bwf' && !a.tags.some((t) => t.toLowerCase().includes('bwf'))) return false;
      if (activeFilter === '24_7' && !a.tags.some((t) => t.toLowerCase().includes('24/7') || a.openTiming.includes('24 Hours'))) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [academies, activeFilter, searchQuery]);

  const desktopFiltersList = [
    { id: 'all', label: 'All Academies' },
    { id: 'top_rated', label: 'Top Rated (4.7+)' },
    { id: 'coaching', label: 'Coaching Batches' },
    { id: 'bwf', label: 'BWF Certified Courts' },
    { id: '24_7', label: 'Open 24/7' },
  ];

  const mobileFiltersList = [
    { id: 'all', label: 'All', icon: '⚡' },
    { id: 'near_me', label: 'Near Me', icon: '📍' },
    { id: 'top_rated', label: 'Top Rated', icon: '⭐' },
    { id: 'coaching', label: 'Coaching', icon: '🏆' },
    { id: 'bwf', label: 'BWF Certified', icon: '🏸' },
    { id: '24_7', label: 'Open 24/7', icon: '⏰' },
  ];

  // Mobile Filtered List
  const mobileFilteredAcademies = useMemo(() => {
    return academies.filter((a) => {
      if (activeFilter === 'top_rated' && parseFloat(a.rating) < 4.7) return false;
      if (activeFilter === 'coaching' && !a.tags.some((t) => t.toLowerCase().includes('coaching') || t.toLowerCase().includes('training'))) return false;
      if (activeFilter === 'bwf' && !a.tags.some((t) => t.toLowerCase().includes('bwf'))) return false;
      if (activeFilter === '24_7' && !a.tags.some((t) => t.toLowerCase().includes('24/7') || a.openTiming.includes('24 Hours'))) return false;
      if (activeFilter === 'near_me' && parseFloat(a.distance) > 4.0) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [academies, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - REDESIGNED STYLISH & COMPACT EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-28 min-h-screen">
        {/* Compact Sticky Top Navbar */}
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
                  Academies & Clubs
                </h1>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-primary/15 text-primary border border-primary/25 font-mono shrink-0">
                  {mobileFilteredAcademies.length}
                </span>
              </div>
              <p className="text-[10px] text-foreground/50 font-bold truncate">
                Book certified courts and training
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

        <main className="w-full max-w-lg mx-auto px-3.5 flex flex-col gap-3.5 pt-3">
          {/* Search Bar & Instant Clear */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search academy, area, or amenities..."
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

          {/* Quick Filter Pills (Smooth Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scroll-px-3 hide-scrollbar -mx-3.5 px-3.5">
            {mobileFiltersList.map((f) => {
              const isSelected = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
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
                  <span className="text-xs">{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher Header */}
          <div className="flex items-center justify-between px-0.5 pt-0.5">
            <div className="text-[10.5px] font-bold text-foreground/60">
              Showing <span className="text-foreground font-black font-mono">{mobileFilteredAcademies.length}</span> {mobileFilteredAcademies.length === 1 ? 'academy' : 'academies'}
            </div>

            {/* View Mode Switcher: Grid, List, Scroll */}
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

          {/* Academies Content Section */}
          <div className="flex flex-col gap-3.5 pt-0.5">
            {mobileFilteredAcademies.length === 0 ? (
              <div
                className="py-12 px-4 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/40">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    No Academies Found
                  </h3>
                  <p className="text-[11px] text-foreground/50 mt-1 max-w-xs mx-auto">
                    {searchQuery || activeFilter !== 'all'
                      ? 'No facilities match your current search and filter settings.'
                      : 'There are no active academies registered in this area.'}
                  </p>
                </div>

                {(searchQuery || activeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilter('all');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold hover:bg-primary/20 transition-all"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              /* ── 1. GRID VIEW (Rich Bento Cards) ── */
              <div className="space-y-3.5">
                {mobileFilteredAcademies.map((academy) => (
                  <div
                    key={academy.id}
                    className="rounded-[22px] overflow-hidden border shadow-lg transition-all group"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    {/* Image Header with Overlay Badges */}
                    <div className="relative h-36 w-full overflow-hidden">
                      <img
                        src={academy.image}
                        alt={academy.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Top Left Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        {academy.featured && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary text-black shadow-sm">
                            Top Pick
                          </span>
                        )}
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 shadow-sm">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-bold text-white">{academy.rating}</span>
                          <span className="text-[9px] text-white/50">({academy.reviews})</span>
                        </div>
                      </div>

                      {/* Top Right Price Tag */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black tracking-tight text-primary bg-black/70 backdrop-blur-md border border-primary/30 shadow-md">
                          {academy.price}
                        </span>
                      </div>

                      {/* Bottom Title on Image */}
                      <div className="absolute bottom-2.5 left-3 right-3">
                        <h3 className="text-sm font-black text-white leading-tight drop-shadow truncate">
                          {academy.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-3.5 space-y-3">
                      {/* Location & Timings */}
                      <div
                        className="p-2.5 rounded-xl border space-y-1.5 text-[11px]"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-foreground/80 font-bold min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">{academy.location}</span>
                          </div>
                          <span className="text-[10px] font-bold text-foreground/50 shrink-0">
                            {academy.distance}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-foreground/5 text-[10px]">
                          <div className="flex items-center gap-1.5 text-foreground/60">
                            <Clock className="w-3 h-3 text-primary shrink-0" />
                            <span>{academy.openTiming}</span>
                          </div>
                          <div className="flex items-center gap-1 text-primary font-bold">
                            <Dumbbell className="w-3 h-3 shrink-0" />
                            <span>{academy.courts} Courts</span>
                          </div>
                        </div>
                      </div>

                      {/* Tags Chips */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {academy.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg border text-[9.5px] font-medium text-foreground/70"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Action CTAs */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <Link
                          href="/bookings"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Court</span>
                        </Link>

                        <a
                          href={`tel:${academy.phone}`}
                          className="w-10 h-10 rounded-xl border flex items-center justify-center text-foreground/80 hover:text-primary transition-all shrink-0"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                          }}
                          aria-label="Call Academy"
                        >
                          <Phone className="w-4 h-4 text-primary" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'list' ? (
              /* ── 2. LIST VIEW (Compact High-Density Rows) ── */
              <div className="space-y-2">
                {mobileFilteredAcademies.map((academy) => (
                  <Link
                    href="/bookings"
                    key={academy.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-sm"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden relative shrink-0 border border-foreground/10">
                        <img
                          src={academy.image}
                          alt={academy.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 py-0.2 flex items-center justify-center gap-0.5">
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          <span className="text-[8.5px] font-bold text-white">{academy.rating}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">
                          {academy.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-foreground/55 font-medium truncate mt-0.5">
                          <span className="truncate">{academy.location}</span>
                          <span>•</span>
                          <span className="text-primary font-bold">{academy.distance}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-foreground/45 mt-0.5">
                          <span>{academy.courts} Courts</span>
                          <span>•</span>
                          <span className="truncate">{academy.tags[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-mono font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        {academy.price}
                      </span>
                      <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* ── 3. HORIZONTAL SCROLL / CAROUSEL VIEW ── */
              <div className="space-y-4">
                {/* Featured Spotlight Card */}
                {featured && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Featured Center
                      </span>
                      <span className="text-[9.5px] font-bold text-foreground/40 uppercase">Top Rated</span>
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
                          src={featured.image}
                          alt={featured.name}
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
                      </div>

                      <div className="relative z-10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary text-black">
                            {featured.price}
                          </span>
                          <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full text-[10px] font-bold text-white">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{featured.rating}</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-black text-white leading-tight">{featured.name}</h3>
                          <p className="text-[10px] text-white/70 mt-0.5">{featured.location} • {featured.distance}</p>
                        </div>

                        <Link
                          href="/bookings"
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-black font-black text-xs shadow-md"
                        >
                          <span>Book Court Now</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Horizontal Carousel of More Academies */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-xs font-black uppercase tracking-wider text-foreground">
                      All Sports Facilities ({mobileFilteredAcademies.length})
                    </span>
                    <span className="text-[9.5px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-0.5">
                      Swipe <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>

                  <div className="flex items-stretch gap-3.5 overflow-x-auto pb-3 snap-x scroll-px-3.5 hide-scrollbar -mx-3.5 px-3.5">
                    {mobileFilteredAcademies.map((academy) => (
                      <div
                        key={academy.id}
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
                              src={academy.image}
                              alt={academy.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-white">
                              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span>{academy.rating}</span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black text-primary bg-black/70 font-mono">
                                {academy.price}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-black text-foreground truncate">{academy.name}</h4>
                              <p className="text-[10px] text-foreground/50 truncate mt-0.5">
                                {academy.location} ({academy.distance})
                              </p>
                            </div>

                            <div className="flex items-center gap-1 flex-wrap">
                              {academy.tags.slice(0, 2).map((t, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.2 rounded border text-[8.5px] text-foreground/60"
                                  style={{
                                    backgroundColor: 'var(--athlon-surface)',
                                    borderColor: 'var(--athlon-border)',
                                  }}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>

                            <Link
                              href="/bookings"
                              className="w-full py-2 rounded-xl bg-primary text-black font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm"
                            >
                              <span>Book Court</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
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

        {/* Mobile Fixed Bottom Nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 h-20 backdrop-blur-xl border-t z-50 px-5 flex items-center justify-between max-w-lg mx-auto"
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

          <Link href="/academies" className="flex flex-col items-center gap-0.5 w-16 group">
            <Athlon3DIcon type="academies" size={32} active={true} />
            <span className="text-[9.5px] font-bold text-primary leading-tight">
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
        {/* Desktop Top Navbar (Full Width) */}
        <header
          className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-background/85 transition-all duration-300"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-lg"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  border: '1px solid var(--athlon-border)',
                  boxShadow: '0 0 20px var(--athlon-primary-soft)',
                }}
              >
                <Building2 className="w-5 h-5" style={{ color: 'var(--athlon-primary)' }} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-foreground leading-none">
                  ATHLON
                </span>
                <span
                  className="text-[10px] font-mono font-bold tracking-widest uppercase leading-tight mt-0.5"
                  style={{ color: 'var(--athlon-primary)' }}
                >
                  Sports Platform
                </span>
              </div>
            </Link>

            {/* Center Navigation Links */}
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
                className="px-4 py-2 rounded-xl text-sm font-black bg-primary text-black transition-all flex items-center gap-2 shadow-sm"
              >
                <Building2 className="w-4 h-4 text-black" />
                <span>Academies</span>
              </Link>

              <Link
                href="/live-score"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Tv className="w-4 h-4 text-blue-400" />
                <span>Live Arena</span>
              </Link>
            </nav>

            {/* Right Action CTAs */}
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

        {/* Full-Width Academy Hero Discovery Banner */}
        <section
          className="relative w-full border-b overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Ambient Lighting Background */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-1/4 w-[450px] h-[250px] bg-emerald-500/10 rounded-full blur-[90px]" />
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14 space-y-8">
            <div className="flex items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary">
                  <Building2 className="w-4 h-4" />
                  <span>Verified Sports Academy Directory</span>
                </div>

                <h1 className="text-3xl lg:text-5xl font-black text-foreground tracking-tight leading-tight uppercase">
                  Find & Train at{' '}
                  <span className="bg-gradient-to-r from-primary via-emerald-400 to-amber-300 bg-clip-text text-transparent">
                    Premier Sports Academies
                  </span>
                </h1>

                <p className="text-sm lg:text-base text-foreground/75 leading-relaxed">
                  Discover top-rated badminton courts and sports training centers. Book court slots by the hour, enroll in certified coaching batches, or train with pro coaches.
                </p>
              </div>

              {/* 4 Metric Highlight Cards */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div
                  className="p-4 rounded-2xl border flex items-center gap-3 w-44"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-foreground/50">Verified Hubs</span>
                    <div className="text-lg font-black text-foreground font-mono">{academies.length}</div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border flex items-center gap-3 w-44"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-foreground/50">Courts</span>
                    <div className="text-lg font-black text-emerald-400 font-mono">32+ Courts</div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border flex items-center gap-3 w-44"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-foreground/50">Avg Rating</span>
                    <div className="text-lg font-black text-foreground font-mono">4.8 ⭐</div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border flex items-center gap-3 w-44"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-foreground/50">Coaching</span>
                    <div className="text-lg font-black text-blue-400 font-mono">Certified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Filter & Search Dock */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
          <div
            className="p-4 rounded-[28px] border shadow-sm space-y-3.5"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Filter Category Pills & Search */}
            <div className="flex items-center justify-between gap-4">
              {/* Filter Pills */}
              <div
                className="p-1 rounded-2xl border flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                {desktopFiltersList.map((tab) => {
                  const isSelected = activeFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-primary text-black shadow-md shadow-primary/20 scale-[1.01]'
                          : 'text-foreground/70 hover:text-foreground hover:bg-white/[0.04]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Interactive Search Bar */}
              <div className="relative w-80 shrink-0">
                <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by academy, location, tag..."
                  className="w-full pl-10 pr-9 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Academy Cards Grid */}
          {filteredAcademies.length === 0 ? (
            <div
              className="py-24 px-8 rounded-[36px] border border-dashed flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <Building2 className="w-12 h-12 text-foreground/30 mb-4" />
              <h3 className="text-xl font-black text-foreground mb-2">No Academies Found</h3>
              <p className="text-xs text-foreground/60 max-w-md mb-6 leading-relaxed">
                {searchQuery
                  ? `No academies matched "${searchQuery}". Try clearing search filters.`
                  : 'There are currently no academies matching your selected criteria.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2.5 rounded-2xl bg-primary text-black font-black text-xs shadow-md"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAcademies.map((academy) => (
                <div
                  key={academy.id}
                  className="group rounded-[28px] border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl relative"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {/* Top Image Banner */}
                  <div className="w-full h-48 relative overflow-hidden bg-black/40 border-b border-white/[0.08]">
                    <img
                      src={academy.image}
                      alt={academy.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-transparent to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                      {academy.featured ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary text-black shadow-lg flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Top Pick
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-primary" /> {academy.distance}
                        </span>
                      )}

                      <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-white">{academy.rating}</span>
                        <span className="text-[10px] text-white/50">({academy.reviews})</span>
                      </div>
                    </div>

                    {/* Bottom Rate Tag */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5" /> {academy.courts} Available Courts
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-white font-mono font-black text-xs">
                        {academy.price}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3.5">
                    <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
                      {academy.name}
                    </h3>

                    <div className="space-y-1.5 text-xs text-foreground/75">
                      <div className="flex items-center gap-2 font-medium">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">{academy.location}</span>
                      </div>

                      <div className="flex items-center gap-2 font-medium">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        <span>{academy.openTiming}</span>
                      </div>
                    </div>

                    {/* Feature Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {academy.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9.5px] font-bold text-foreground/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Strip */}
                  <div
                    className="p-3.5 px-5 border-t flex items-center justify-between text-xs"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <a
                      href={`tel:${academy.phone}`}
                      className="flex items-center gap-1.5 text-foreground/70 hover:text-primary transition-colors font-bold text-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>Contact Center</span>
                    </a>

                    <button
                      type="button"
                      className="flex items-center gap-1 text-primary font-black text-xs group-hover:translate-x-1 transition-transform"
                    >
                      <span>Book Court Slot</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Desktop Branded Footer */}
        <footer
          className="mt-20 border-t pt-12 pb-10 text-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-black text-foreground text-sm tracking-wide">ATHLON SPORTS</span>
              </div>

              <div className="flex items-center gap-8 text-foreground/60 font-medium">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <Link href="/tournaments" className="hover:text-primary transition-colors">Tournaments</Link>
                <Link href="/tournaments" className="hover:text-primary transition-colors">Team Championships</Link>
                <Link href="/academies" className="hover:text-primary transition-colors">Academies</Link>
                <Link href="/live-score" className="hover:text-primary transition-colors">Live Scoring</Link>
                <Link href="/login" className="hover:text-primary transition-colors">Organizer Hub</Link>
              </div>
            </div>

            <div className="border-t pt-6 flex items-center justify-between text-foreground/40 text-[11px]" style={{ borderColor: 'var(--athlon-border)' }}>
              <p>© 2026 Athlon Sports Platform. All rights reserved.</p>
              <p>The tournament experience, elevated.</p>
            </div>
          </div>
        </footer>
      </div>

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
