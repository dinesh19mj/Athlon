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
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function AcademiesPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeFilter, setActiveFilter] = useState('all');
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

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - EXACT PRESERVED MOBILE EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-bold uppercase tracking-wider">Academies</h1>
          </div>

          <button className="p-2 -mr-2 text-foreground hover:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </header>

        <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-4">
          {/* Filters / Quick Search */}
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
            {['Near Me', 'Top Rated', 'Coaching', 'BWF Certified', 'Open Now'].map((filter, idx) => (
              <button
                key={idx}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  idx === 0
                    ? 'bg-primary text-black'
                    : 'bg-surface border border-foreground/10 text-foreground/70 hover:text-foreground'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Featured Academy Card */}
          {featured && (
            <section className="relative w-full h-[320px] rounded-[24px] overflow-hidden bg-surface border border-foreground/10 shadow-[0_10px_40px_rgba(0,136,255,0.15)] group cursor-pointer">
              <div className="absolute inset-0 z-0">
                <img
                  src={featured.image}
                  alt={featured.name}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1A] via-[#0A0F1A]/80 to-transparent" />
              </div>

              <div className="absolute top-4 left-4 z-10 bg-primary px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
                <span className="text-[9px] font-black uppercase tracking-wider text-foreground">Top Pick</span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col justify-end">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-black leading-tight text-foreground drop-shadow-md">
                    {featured.name}
                  </h2>
                  <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-foreground/10">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-foreground">{featured.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-foreground/80 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF7722]" />
                    <span>{featured.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-primary" />
                    <span>{featured.distance}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  {featured.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded border border-foreground/20 bg-foreground/10 backdrop-blur-md text-[9px] font-medium text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-[#0A0F1A] text-xs font-black px-4 py-3 rounded-xl hover:opacity-90 transition-opacity">
                    BOOK COURT <ChevronRight className="w-4 h-4" />
                  </button>
                  <button className="w-12 h-12 rounded-xl bg-foreground/10 backdrop-blur-md border border-foreground/20 flex items-center justify-center hover:bg-foreground/20 transition-colors">
                    <Phone className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Regular Academies List */}
          <section>
            <h3 className="text-xs font-bold text-foreground/50 tracking-wider uppercase mb-4 mt-2">More Academies</h3>
            <div className="flex flex-col gap-4">
              {others.map((academy) => (
                <div
                  key={academy.id}
                  className="bg-surface border border-foreground/5 hover:border-foreground/20 rounded-[20px] p-3 flex gap-4 transition-colors shadow-lg cursor-pointer group"
                >
                  <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative">
                    <img
                      src={academy.image}
                      alt={academy.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 border border-foreground/10">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-[10px] font-bold text-foreground">{academy.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-foreground leading-tight group-hover:text-[#FF7722] transition-colors">
                        {academy.name}
                      </h4>
                      <span className="text-[10px] font-black text-primary">{academy.price}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-foreground/50 mb-2">
                      <MapPin className="w-3 h-3 text-foreground/40" />
                      <span className="truncate">
                        {academy.location} ({academy.distance})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-background border border-foreground/5 text-[9px] text-foreground/70">
                        <Dumbbell className="w-3 h-3 text-purple-400" /> {academy.courts} Courts
                      </span>
                      {academy.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-background border border-foreground/5 text-[9px] text-foreground/70 whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
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
