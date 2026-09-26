'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Zap,
  Shield,
  Footprints,
  Shirt,
  Sparkles,
  Target,
  Flame,
  ShoppingBag,
  Layers,
} from 'lucide-react';

interface SubCategory {
  id: string;
  name: string;
  desc: string;
  popularBrands?: string[];
  iconName: 'racket' | 'shoe' | 'bag' | 'ball' | 'gear' | 'apparel' | 'shield' | 'zap';
  itemCount?: string;
}

interface SportCategoryGroup {
  id: string;
  sport: string;
  themeColor: string;
  themeGlow: string;
  badgeBg: string;
  tagline: string;
  iconType: 'badminton' | 'cricket' | 'football' | 'tennis' | 'pickleball' | 'basketball';
  subcategories: SubCategory[];
}

const CATEGORY_GROUPS: SportCategoryGroup[] = [
  {
    id: 'badminton',
    sport: 'Badminton',
    themeColor: '#22C55E',
    themeGlow: 'rgba(34, 197, 94, 0.25)',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    tagline: 'High repulsion strings, pro court shoes & precision rackets',
    iconType: 'badminton',
    subcategories: [
      {
        id: 'rackets',
        name: 'Rackets',
        desc: 'Astrox, Nanoflare, Arcsaber, Thruster',
        popularBrands: ['Yonex', 'Victor', 'Li-Ning'],
        iconName: 'racket',
        itemCount: '180+ items',
      },
      {
        id: 'shoes',
        name: 'Court Shoes',
        desc: 'Non-marking gum rubber sole & radial blade grip',
        popularBrands: ['Yonex', 'Asics', 'Victor'],
        iconName: 'shoe',
        itemCount: '95+ items',
      },
      {
        id: 'bags',
        name: 'Tour Kitbags',
        desc: 'Thermo-guard multi-compartment & 6/9-racket bags',
        popularBrands: ['Yonex Pro', 'Li-Ning'],
        iconName: 'bag',
        itemCount: '45+ items',
      },
      {
        id: 'shuttles',
        name: 'Shuttlecocks',
        desc: 'Grade-1 goose feather & high durability nylon shuttles',
        popularBrands: ['Aerosensa', 'Mavis 350'],
        iconName: 'ball',
        itemCount: '60+ items',
      },
      {
        id: 'strings-grips',
        name: 'Strings & Grips',
        desc: 'BG65, BG80, Exbolt & tacky overgrips',
        popularBrands: ['Yonex', 'Victor SuperGrip'],
        iconName: 'zap',
        itemCount: '120+ items',
      },
      {
        id: 'apparel',
        name: 'Apparel & Wear',
        desc: 'Quick-dry tournament tees, shorts & wristbands',
        popularBrands: ['Yonex', 'Athlon Teamwear'],
        iconName: 'apparel',
        itemCount: '80+ items',
      },
    ],
  },
  {
    id: 'cricket',
    sport: 'Cricket',
    themeColor: '#F59E0B',
    themeGlow: 'rgba(245, 158, 11, 0.25)',
    badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    tagline: 'English willow bats, test match armor & spiked spikes',
    iconType: 'cricket',
    subcategories: [
      {
        id: 'bats',
        name: 'Cricket Bats',
        desc: 'Grade-1 English willow, Kashmir willow & tennis bats',
        popularBrands: ['SS', 'SG', 'Kookaburra', 'MRF'],
        iconName: 'gear',
        itemCount: '140+ items',
      },
      {
        id: 'pads-gloves',
        name: 'Pads & Batting Gloves',
        desc: 'High-density foam leg guards & split-finger gloves',
        popularBrands: ['SG Test', 'SS Matrix'],
        iconName: 'shield',
        itemCount: '85+ items',
      },
      {
        id: 'helmets-armor',
        name: 'Helmets & Protection',
        desc: 'Titanium grille concussion protection & thigh pads',
        popularBrands: ['Shrey', 'Masuri'],
        iconName: 'shield',
        itemCount: '50+ items',
      },
      {
        id: 'shoes',
        name: 'Turf & Spike Shoes',
        desc: 'Full metal spike & all-round rubber stud shoes',
        popularBrands: ['Asics', 'Adidas', 'Payntr'],
        iconName: 'shoe',
        itemCount: '65+ items',
      },
      {
        id: 'kitbags',
        name: 'Wheelie Kitbags',
        desc: 'Heavy-duty 1000D polyester with bat caves',
        popularBrands: ['SG', 'SS Ton'],
        iconName: 'bag',
        itemCount: '40+ items',
      },
      {
        id: 'balls-accessories',
        name: 'Balls & Accessories',
        desc: 'Four-piece alum tanned leather & red/white match balls',
        popularBrands: ['Kookaburra Turf', 'SG Club'],
        iconName: 'ball',
        itemCount: '75+ items',
      },
    ],
  },
  {
    id: 'football',
    sport: 'Football',
    themeColor: '#38BDF8',
    themeGlow: 'rgba(56, 189, 248, 0.25)',
    badgeBg: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    tagline: 'Firm ground studs, FIFA match balls & pro grip gloves',
    iconType: 'football',
    subcategories: [
      {
        id: 'boots',
        name: 'Football Boots',
        desc: 'FG firm ground, AG artificial turf & indoor futsal boots',
        popularBrands: ['Nike Mercurial', 'Adidas Predator', 'Puma Future'],
        iconName: 'shoe',
        itemCount: '160+ items',
      },
      {
        id: 'balls',
        name: 'Match Balls',
        desc: 'FIFA Quality Pro thermally bonded match & training balls',
        popularBrands: ['Adidas Champions League', 'Nike Flight'],
        iconName: 'ball',
        itemCount: '70+ items',
      },
      {
        id: 'goalkeeper',
        name: 'Goalkeeper Gear',
        desc: '4mm contact latex grip gloves & padded protective jerseys',
        popularBrands: ['Uhlsport', 'Reusch', 'Adidas Predator'],
        iconName: 'shield',
        itemCount: '45+ items',
      },
      {
        id: 'apparel-guards',
        name: 'Jerseys & Shin Guards',
        desc: 'Dri-FIT club kits, carbon fiber slip-in guards & sleeves',
        popularBrands: ['Nike', 'Adidas', 'Athlon Kit'],
        iconName: 'apparel',
        itemCount: '110+ items',
      },
    ],
  },
  {
    id: 'tennis',
    sport: 'Tennis',
    themeColor: '#A3E635',
    themeGlow: 'rgba(163, 230, 53, 0.25)',
    badgeBg: 'bg-lime-500/15 border-lime-500/30 text-lime-400',
    tagline: 'Tour precision frames, all-court clay footwear & pressurized balls',
    iconType: 'tennis',
    subcategories: [
      {
        id: 'rackets',
        name: 'Tennis Racquets',
        desc: 'Spin, power & precision frames (Pure Aero, Clash, Blade)',
        popularBrands: ['Babolat', 'Wilson', 'Head'],
        iconName: 'racket',
        itemCount: '90+ items',
      },
      {
        id: 'shoes',
        name: 'All-Court Shoes',
        desc: 'Reinforced lateral toe-drag guard & herringbone clay soles',
        popularBrands: ['Asics Gel Resolution', 'Nike Vapor'],
        iconName: 'shoe',
        itemCount: '55+ items',
      },
      {
        id: 'balls-strings',
        name: 'Balls & Poly Strings',
        desc: 'Tour pressurized felt balls & co-poly monofilament strings',
        popularBrands: ['Wilson US Open', 'Luxilon ALU Power'],
        iconName: 'ball',
        itemCount: '80+ items',
      },
      {
        id: 'bags',
        name: 'Racquet Bags',
        desc: '6-12 racquet thermal protection bags & backpacks',
        popularBrands: ['Head Tour', 'Wilson Team'],
        iconName: 'bag',
        itemCount: '35+ items',
      },
    ],
  },
  {
    id: 'pickleball',
    sport: 'Pickleball',
    themeColor: '#EC4899',
    themeGlow: 'rgba(236, 72, 153, 0.25)',
    badgeBg: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
    tagline: 'USAPA approved carbon fiber paddles & outdoor tournament balls',
    iconType: 'pickleball',
    subcategories: [
      {
        id: 'paddles',
        name: 'Paddles',
        desc: 'Toray T700 raw carbon fiber surface & 16mm polymer cores',
        popularBrands: ['Joola', 'Selkirk', 'CRBN'],
        iconName: 'racket',
        itemCount: '65+ items',
      },
      {
        id: 'balls-nets',
        name: 'Balls & Portable Nets',
        desc: '40-hole outdoor seamless balls & regulation portable nets',
        popularBrands: ['Franklin X-40', 'Dura Fast 40'],
        iconName: 'ball',
        itemCount: '40+ items',
      },
      {
        id: 'shoes-bags',
        name: 'Court Shoes & Sling Bags',
        desc: 'High traction indoor/outdoor court shoes & paddle covers',
        popularBrands: ['K-Swiss', 'Selkirk Day Bag'],
        iconName: 'shoe',
        itemCount: '30+ items',
      },
    ],
  },
  {
    id: 'basketball',
    sport: 'Basketball',
    themeColor: '#F97316',
    themeGlow: 'rgba(249, 115, 22, 0.25)',
    badgeBg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
    tagline: 'Indoor composite leather balls, high-top ankle support shoes',
    iconType: 'basketball',
    subcategories: [
      {
        id: 'shoes',
        name: 'Basketball Shoes',
        desc: 'Zoom air cushioning, herringbone traction & high-top lock',
        popularBrands: ['Nike LeBron', 'Jordan', 'Kyrie'],
        iconName: 'shoe',
        itemCount: '85+ items',
      },
      {
        id: 'balls',
        name: 'Basketballs',
        desc: 'Composite leather indoor game balls & outdoor rubber balls',
        popularBrands: ['Spalding TF-1000', 'Wilson Evolution'],
        iconName: 'ball',
        itemCount: '50+ items',
      },
      {
        id: 'apparel-sleeves',
        name: 'Apparel & Compression',
        desc: 'Sleeveless jerseys, shooting sleeves & padded knee sleeves',
        popularBrands: ['Nike Pro', 'McDavid'],
        iconName: 'apparel',
        itemCount: '60+ items',
      },
    ],
  },
];

// Helper: Custom Subcategory Icon Renderer
function CategoryIcon({ type }: { type: SubCategory['iconName'] }) {
  switch (type) {
    case 'racket':
      return <Sparkles className="w-4 h-4 text-emerald-400" />;
    case 'shoe':
      return <Footprints className="w-4 h-4 text-sky-400" />;
    case 'bag':
      return <ShoppingBag className="w-4 h-4 text-purple-400" />;
    case 'ball':
      return <Target className="w-4 h-4 text-amber-400" />;
    case 'gear':
      return <Flame className="w-4 h-4 text-rose-400" />;
    case 'shield':
      return <Shield className="w-4 h-4 text-blue-400" />;
    case 'zap':
      return <Zap className="w-4 h-4 text-yellow-400" />;
    case 'apparel':
      return <Shirt className="w-4 h-4 text-indigo-400" />;
    default:
      return <Layers className="w-4 h-4 text-primary" />;
  }
}

// 3D Sport Vector Badge
function SportHeaderBadge({ type }: { type: SportCategoryGroup['iconType'] }) {
  switch (type) {
    case 'badminton':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
          <defs>
            <radialGradient id="shuttleCorkCat" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#64748B" />
            </radialGradient>
            <linearGradient id="shuttleFeatherCat" x1="0" y1="4" x2="0" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
          <g transform="translate(18, 18) rotate(-35) translate(-18, -18)">
            <path
              d="M10 5 C9 5 8 6 9 8 L14 22 C14.5 23 15.5 24 16.5 24 L19.5 24 C20.5 24 21.5 23 22 22 L27 8 C28 6 27 5 26 5 C24 5.5 22 6 18 6 C14 6 12 5.5 10 5 Z"
              fill="url(#shuttleFeatherCat)"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="0.8"
            />
            <line x1="11" y1="6" x2="15.5" y2="22" stroke="#94A3B8" strokeWidth="0.8" opacity="0.8" />
            <line x1="18" y1="6" x2="18" y2="22" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="25" y1="6" x2="20.5" y2="22" stroke="#94A3B8" strokeWidth="0.8" opacity="0.8" />
            <path d="M10.8 11 Q18 13.5 25.2 11" stroke="#38BDF8" strokeWidth="0.9" fill="none" />
            <path d="M12.5 16.5 Q18 18.5 23.5 16.5" stroke="#38BDF8" strokeWidth="0.9" fill="none" />
            <rect x="14.2" y="21.5" width="7.6" height="2.8" rx="1" fill="#10B981" />
            <path d="M14.2 23.5 C14.2 27.5 16 30 18 30 C20 30 21.8 27.5 21.8 23.5 Z" fill="url(#shuttleCorkCat)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.7" />
          </g>
        </svg>
      );

    case 'cricket':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
          <defs>
            <linearGradient id="cricketBladeCat" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="60%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <radialGradient id="cricketBallCat" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="70%" stopColor="#991B1B" />
              <stop offset="100%" stopColor="#450A0A" />
            </radialGradient>
          </defs>
          <g transform="translate(18, 18) rotate(35) translate(-18, -18)">
            <rect x="15" y="2" width="3.5" height="10" rx="1.5" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.6" />
            <rect x="13.5" y="11" width="6.5" height="21" rx="2" fill="url(#cricketBladeCat)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
            <line x1="16.7" y1="13" x2="16.7" y2="30" stroke="#78350F" strokeWidth="0.8" opacity="0.6" />
          </g>
          <circle cx="27" cy="25" r="5" fill="url(#cricketBallCat)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
          <path d="M24 23 Q27 25 30 27" stroke="#FFFFFF" strokeWidth="0.7" strokeDasharray="1 1" fill="none" />
        </svg>
      );

    case 'football':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
          <defs>
            <radialGradient id="footBallSphereCat" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#E2E8F0" />
              <stop offset="85%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#334155" />
            </radialGradient>
          </defs>
          <circle cx="18" cy="18" r="14" fill="url(#footBallSphereCat)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
          <polygon points="18,13 22.5,16.5 21,21.5 15,21.5 13.5,16.5" fill="#0F172A" />
          <polygon points="18,4 20,7.5 16,7.5" fill="#1E293B" />
          <polygon points="30,12 28,15.5 29,18" fill="#1E293B" />
          <polygon points="26,28 24,24.5 27,24" fill="#1E293B" />
          <polygon points="10,28 12,24.5 9,24" fill="#1E293B" />
          <polygon points="6,12 8,15.5 7,18" fill="#1E293B" />
          <line x1="18" y1="13" x2="18" y2="7.5" stroke="#475569" strokeWidth="0.8" />
          <line x1="22.5" y1="16.5" x2="28" y2="15.5" stroke="#475569" strokeWidth="0.8" />
          <line x1="21" y1="21.5" x2="24" y2="24.5" stroke="#475569" strokeWidth="0.8" />
          <line x1="15" y1="21.5" x2="12" y2="24.5" stroke="#475569" strokeWidth="0.8" />
          <line x1="13.5" y1="16.5" x2="8" y2="15.5" stroke="#475569" strokeWidth="0.8" />
        </svg>
      );

    case 'tennis':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
          <defs>
            <radialGradient id="tennisBallSphereCat" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="45%" stopColor="#A3E635" />
              <stop offset="85%" stopColor="#65A30D" />
              <stop offset="100%" stopColor="#3F6212" />
            </radialGradient>
          </defs>
          <circle cx="18" cy="18" r="14" fill="url(#tennisBallSphereCat)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
          <path d="M7 11 C13 13 15 23 11 29" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.95" />
          <path d="M29 11 C23 13 21 23 25 29" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.95" />
        </svg>
      );

    case 'pickleball':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
          <defs>
            <linearGradient id="picklePaddleCat" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="60%" stopColor="#BE123C" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <radialGradient id="pickleBallCat" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="70%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#A16207" />
            </radialGradient>
          </defs>
          <g transform="translate(18, 18) rotate(-25) translate(-18, -18)">
            <rect x="10" y="4" width="16" height="19" rx="5" fill="url(#picklePaddleCat)" stroke="#0F172A" strokeWidth="1.2" />
            <rect x="15" y="22" width="6" height="10" rx="2" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.8" />
          </g>
          <circle cx="27" cy="24" r="5" fill="url(#pickleBallCat)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
          <circle cx="25.5" cy="22.5" r="0.7" fill="#713F12" />
          <circle cx="28.5" cy="22.5" r="0.7" fill="#713F12" />
          <circle cx="27" cy="25" r="0.7" fill="#713F12" />
        </svg>
      );

    case 'basketball':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
          <defs>
            <radialGradient id="basketSphereCat" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="50%" stopColor="#EA580C" />
              <stop offset="85%" stopColor="#C2410C" />
              <stop offset="100%" stopColor="#7C2D12" />
            </radialGradient>
          </defs>
          <circle cx="18" cy="18" r="14" fill="url(#basketSphereCat)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
          <line x1="4" y1="18" x2="32" y2="18" stroke="#1E1B18" strokeWidth="1.2" />
          <line x1="18" y1="4" x2="18" y2="32" stroke="#1E1B18" strokeWidth="1.2" />
          <path d="M8 8 Q16 18 8 28" stroke="#1E1B18" strokeWidth="1.2" fill="none" />
          <path d="M28 8 Q20 18 28 28" stroke="#1E1B18" strokeWidth="1.2" fill="none" />
        </svg>
      );
  }
}

export default function MarketCategoriesPage() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Filter category groups based on sport tab and search filter
  const filteredGroups = useMemo(() => {
    let groups = CATEGORY_GROUPS;

    if (selectedSport !== 'All') {
      groups = groups.filter(
        (g) => g.sport.toLowerCase() === selectedSport.toLowerCase()
      );
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      groups = groups
        .map((g) => ({
          ...g,
          subcategories: g.subcategories.filter(
            (sub) =>
              sub.name.toLowerCase().includes(q) ||
              sub.desc.toLowerCase().includes(q) ||
              sub.popularBrands?.some((b) => b.toLowerCase().includes(q)) ||
              g.sport.toLowerCase().includes(q)
          ),
        }))
        .filter((g) => g.subcategories.length > 0);
    }

    return groups;
  }, [selectedSport, searchFilter]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-20 space-y-5">
      {/* ─── 1. Header Bar ─── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full border border-white/10 bg-card hover:bg-surface active:scale-95 flex items-center justify-center text-foreground transition-all shadow-sm"
            aria-label="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-foreground uppercase tracking-tight">
              Sports Categories
            </h1>
            <p className="text-[11px] text-foreground/50 font-medium">
              Explore pro equipment & authenticated sports gear
            </p>
          </div>
        </div>
      </div>

      {/* ─── 2. Search & Filter Bar ─── */}
      <div
        className="flex items-center px-3.5 py-2.5 rounded-2xl border shadow-inner transition-all group focus-within:ring-1 focus-within:ring-primary"
        style={{
          backgroundColor: 'var(--athlon-input, #0B1310)',
          borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
        }}
      >
        <Search className="w-4 h-4 text-foreground/40 group-focus-within:text-primary transition-colors mr-2.5 shrink-0" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search categories, brands (e.g. Yonex, Bats, Boots)..."
          className="flex-1 bg-transparent text-xs sm:text-sm focus:outline-none placeholder:text-foreground/35"
          style={{ color: 'var(--athlon-text, #FFF)' }}
        />
        {searchFilter && (
          <button
            type="button"
            onClick={() => setSearchFilter('')}
            className="text-[10px] font-bold text-foreground/40 hover:text-foreground px-2 py-0.5 rounded-md"
          >
            Clear
          </button>
        )}
      </div>

      {/* ─── 3. Quick Sport Jump Tabs ─── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
        {['All', ...CATEGORY_GROUPS.map((g) => g.sport)].map((sportName) => {
          const isSelected = selectedSport === sportName;
          return (
            <button
              key={sportName}
              type="button"
              onClick={() => setSelectedSport(sportName)}
              className={`px-3 py-1.5 rounded-full text-xs font-black tracking-wide uppercase whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]'
                  : 'bg-card text-foreground/70 border-white/5 hover:border-white/20 hover:text-foreground'
              }`}
            >
              {sportName}
            </button>
          );
        })}
      </div>

      {/* ─── 4. Category Sport Sections ─── */}
      {filteredGroups.length === 0 ? (
        <div className="p-10 text-center rounded-3xl border border-dashed border-white/10 bg-card space-y-2">
          <p className="text-sm font-bold text-foreground">No categories match &ldquo;{searchFilter}&rdquo;</p>
          <p className="text-xs text-foreground/50">Try searching for a different equipment name or brand.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((catGroup) => (
            <div
              key={catGroup.id}
              className="relative rounded-[24px] border overflow-hidden transition-all duration-300 backdrop-blur-xl"
              style={{
                backgroundColor: 'var(--athlon-card, #0E1612)',
                borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
                boxShadow:
                  '0 10px 30px -8px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Top Laser Accent Rim */}
              <div
                className="absolute top-0 inset-x-0 h-[2px] opacity-60 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${catGroup.themeColor} 50%, transparent 100%)`,
                }}
              />

              {/* Ambient Spotlight Halo */}
              <div
                className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20"
                style={{ backgroundColor: catGroup.themeColor }}
              />

              {/* ─── Sport Section Header ─── */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/[0.06] relative z-10">
                <div className="flex items-center gap-3">
                  {/* 3D Sport Vector Badge */}
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border shadow-md shrink-0 bg-black/40"
                    style={{
                      borderColor: `rgba(255, 255, 255, 0.15)`,
                      boxShadow: `0 4px 16px ${catGroup.themeGlow}`,
                    }}
                  >
                    <SportHeaderBadge type={catGroup.iconType} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">
                        {catGroup.sport}
                      </h2>
                      <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-foreground/60 uppercase">
                        {catGroup.subcategories.length} Categories
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground/50 font-medium line-clamp-1 mt-0.5">
                      {catGroup.tagline}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/market/search?sport=${catGroup.sport}`}
                  className="hidden xs:flex items-center gap-1 text-[11px] sm:text-xs font-black px-3 py-1.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 active:scale-95 transition-all shrink-0"
                  style={{ color: catGroup.themeColor, borderColor: `${catGroup.themeColor}40` }}
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* ─── Subcategories Grid (2-column on mobile, 3-column on tablet+) ─── */}
              <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 relative z-10">
                {catGroup.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/market/search?sport=${catGroup.sport}&category=${encodeURIComponent(sub.name)}`}
                    className="group relative flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 hover:scale-[1.015] active:scale-[0.99] gap-3 overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {/* Hover Glow Background */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{
                        background: `linear-gradient(90deg, ${catGroup.themeColor}0D 0%, transparent 100%)`,
                      }}
                    />

                    {/* Left: Subcategory Icon Badge & Info */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-primary/40 transition-all">
                        <CategoryIcon type={sub.iconName} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-[13px] font-black text-foreground group-hover:text-primary transition-colors truncate">
                            {sub.name}
                          </h3>
                        </div>

                        <p className="text-[10px] text-foreground/50 truncate mt-0.5 font-medium">
                          {sub.desc}
                        </p>

                        {/* Popular brands micro-pills */}
                        {sub.popularBrands && (
                          <div className="flex items-center gap-1 mt-1.5 overflow-hidden">
                            {sub.popularBrands.slice(0, 2).map((brand) => (
                              <span
                                key={brand}
                                className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/5 text-foreground/60 whitespace-nowrap"
                              >
                                {brand}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Tactile Arrow Chevron */}
                    <div className="shrink-0 w-6 h-6 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-foreground/40 group-hover:text-primary group-hover:border-primary/40 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
