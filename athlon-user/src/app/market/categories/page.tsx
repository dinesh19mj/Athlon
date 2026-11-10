'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronDown,
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
  ArrowRight,
  Tag,
  TrendingUp,
  SlidersHorizontal,
  ChevronUp,
} from 'lucide-react';

interface SubCategory {
  id: string;
  name: string;
  desc: string;
  popularBrands?: string[];
  iconName: 'racket' | 'shoe' | 'bag' | 'ball' | 'gear' | 'apparel' | 'shield' | 'zap';
  itemCount: string;
  tag?: string;
}

interface SportCategoryGroup {
  id: string;
  sport: string;
  themeColor: string;
  themeGlow: string;
  badgeBg: string;
  tagline: string;
  iconType: 'badminton' | 'cricket' | 'football' | 'tennis' | 'pickleball' | 'basketball';
  heroPromo: {
    headline: string;
    subheadline: string;
    badgeText: string;
  };
  featuredBrands: string[];
  subcategories: SubCategory[];
}

const CATEGORY_GROUPS: SportCategoryGroup[] = [
  {
    id: 'badminton',
    sport: 'Badminton',
    themeColor: '#22C55E',
    themeGlow: 'rgba(34, 197, 94, 0.25)',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    tagline: 'High repulsion strings, court shoes & precision rackets',
    iconType: 'badminton',
    heroPromo: {
      headline: 'PRO COURT ARENA',
      subheadline: 'Up to 35% Off Yonex, Victor & Li-Ning 2026 Collection',
      badgeText: 'AUTHENTICATED GEAR',
    },
    featuredBrands: ['Yonex', 'Victor', 'Li-Ning', 'Asics', 'Apacs', 'Mizuno'],
    subcategories: [
      {
        id: 'rackets',
        name: 'Rackets',
        desc: 'Astrox, Nanoflare, Arcsaber & Thruster series',
        popularBrands: ['Yonex', 'Victor', 'Li-Ning'],
        iconName: 'racket',
        itemCount: '180+ items',
        tag: 'BEST SELLER',
      },
      {
        id: 'shoes',
        name: 'Court Shoes',
        desc: 'Non-marking gum rubber sole & radial blade grip',
        popularBrands: ['Yonex', 'Asics', 'Victor'],
        iconName: 'shoe',
        itemCount: '95+ items',
        tag: 'POPULAR',
      },
      {
        id: 'bags',
        name: 'Tour Kitbags',
        desc: 'Thermo-guard multi-compartment & 6/9-racket tour bags',
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
        tag: 'MATCH READY',
      },
      {
        id: 'strings-grips',
        name: 'Strings & Grips',
        desc: 'BG65, BG80, Exbolt & tacky polyurethane overgrips',
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
    tagline: 'English willow bats, test match armor & spiked shoes',
    iconType: 'cricket',
    heroPromo: {
      headline: 'THE WILLOW VAULT',
      subheadline: 'Grade-1 English Willow Bats with Free Machine Knocking',
      badgeText: 'HAND-PICKED GRAINS',
    },
    featuredBrands: ['SS', 'SG', 'Kookaburra', 'MRF', 'Shrey', 'New Balance'],
    subcategories: [
      {
        id: 'bats',
        name: 'Cricket Bats',
        desc: 'Grade-1 English willow, Kashmir willow & tennis bats',
        popularBrands: ['SS', 'SG', 'Kookaburra', 'MRF'],
        iconName: 'gear',
        itemCount: '140+ items',
        tag: 'BEST SELLER',
      },
      {
        id: 'pads-gloves',
        name: 'Pads & Gloves',
        desc: 'High-density foam leg guards & split-finger batting gloves',
        popularBrands: ['SG Test', 'SS Matrix'],
        iconName: 'shield',
        itemCount: '85+ items',
      },
      {
        id: 'helmets-armor',
        name: 'Helmets & Armor',
        desc: 'Titanium grille concussion protection & thigh pads',
        popularBrands: ['Shrey', 'Masuri'],
        iconName: 'shield',
        itemCount: '50+ items',
        tag: 'SAFETY PRO',
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
        desc: 'Heavy-duty 1000D polyester with specialized bat caves',
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
    heroPromo: {
      headline: 'STRIKE & SCORE',
      subheadline: 'Latest FG, AG & Turf Boots from Nike, Adidas & Puma',
      badgeText: 'FIFA VERIFIED',
    },
    featuredBrands: ['Nike', 'Adidas', 'Puma', 'Uhlsport', 'Reusch'],
    subcategories: [
      {
        id: 'boots',
        name: 'Football Boots',
        desc: 'FG firm ground, AG artificial turf & indoor futsal boots',
        popularBrands: ['Nike Mercurial', 'Adidas Predator', 'Puma Future'],
        iconName: 'shoe',
        itemCount: '160+ items',
        tag: 'HOT',
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
        name: 'Jerseys & Guards',
        desc: 'Dri-FIT club kits, carbon fiber slip-in shin guards',
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
    heroPromo: {
      headline: 'GRAND SLAM READY',
      subheadline: 'Precision Racquets (Babolat Pure Aero, Wilson Blade & Head)',
      badgeText: 'TOUR PERFORMANCE',
    },
    featuredBrands: ['Babolat', 'Wilson', 'Head', 'Yonex', 'Asics', 'Luxilon'],
    subcategories: [
      {
        id: 'rackets',
        name: 'Tennis Racquets',
        desc: 'Spin, power & precision frames (Pure Aero, Clash, Blade)',
        popularBrands: ['Babolat', 'Wilson', 'Head'],
        iconName: 'racket',
        itemCount: '90+ items',
        tag: 'TOUR GRADE',
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
        name: 'Balls & Strings',
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
    heroPromo: {
      headline: 'FASTEST GROWING SPORT',
      subheadline: 'Raw Carbon Fiber 16mm Control & Power Paddles',
      badgeText: 'USAPA APPROVED',
    },
    featuredBrands: ['Joola', 'Selkirk', 'CRBN', 'Franklin', 'Gearbox'],
    subcategories: [
      {
        id: 'paddles',
        name: 'Paddles',
        desc: 'Toray T700 raw carbon fiber surface & 16mm polymer cores',
        popularBrands: ['Joola', 'Selkirk', 'CRBN'],
        iconName: 'racket',
        itemCount: '65+ items',
        tag: 'TRENDING',
      },
      {
        id: 'balls-nets',
        name: 'Balls & Nets',
        desc: '40-hole outdoor seamless balls & regulation portable nets',
        popularBrands: ['Franklin X-40', 'Dura Fast 40'],
        iconName: 'ball',
        itemCount: '40+ items',
      },
      {
        id: 'shoes-bags',
        name: 'Shoes & Covers',
        desc: 'High traction court footwear & specialized paddle sling covers',
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
    heroPromo: {
      headline: 'HOOP HERITAGE',
      subheadline: 'High-Traction Signature Shoes & Official Composite Balls',
      badgeText: 'INDOOR / OUTDOOR',
    },
    featuredBrands: ['Nike', 'Jordan', 'Spalding', 'Wilson', 'Under Armour'],
    subcategories: [
      {
        id: 'shoes',
        name: 'Basketball Shoes',
        desc: 'Zoom air cushioning, herringbone traction & high-top lock',
        popularBrands: ['Nike LeBron', 'Jordan', 'Kyrie'],
        iconName: 'shoe',
        itemCount: '85+ items',
        tag: 'SIGNATURE',
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
        name: 'Apparel & Sleeves',
        desc: 'Sleeveless jerseys, shooting sleeves & padded knee sleeves',
        popularBrands: ['Nike Pro', 'McDavid'],
        iconName: 'apparel',
        itemCount: '60+ items',
      },
    ],
  },
];

// Vector Icon for Subcategories
function SubcatVectorIcon({ type }: { type: SubCategory['iconName'] }) {
  switch (type) {
    case 'racket':
      return <Sparkles className="w-4 h-4 text-emerald-500" />;
    case 'shoe':
      return <Footprints className="w-4 h-4 text-sky-500" />;
    case 'bag':
      return <ShoppingBag className="w-4 h-4 text-purple-500" />;
    case 'ball':
      return <Target className="w-4 h-4 text-amber-500" />;
    case 'gear':
      return <Flame className="w-4 h-4 text-rose-500" />;
    case 'shield':
      return <Shield className="w-4 h-4 text-blue-500" />;
    case 'zap':
      return <Zap className="w-4 h-4 text-yellow-500" />;
    case 'apparel':
      return <Shirt className="w-4 h-4 text-indigo-500" />;
    default:
      return <Layers className="w-4 h-4 text-primary" />;
  }
}

// 3D Sport Icon Badge
function SportAccordionIcon({ type }: { type: SportCategoryGroup['iconType'] }) {
  switch (type) {
    case 'badminton':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
          <circle cx="18" cy="18" r="16" fill="#22C55E" opacity="0.15" />
          <path d="M11 7 L15 22 L21 22 L25 7 Z" fill="#22C55E" opacity="0.75" />
          <circle cx="18" cy="27" r="3.5" fill="#22C55E" />
        </svg>
      );
    case 'cricket':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
          <rect x="14" y="4" width="3" height="8" rx="1.5" fill="#F59E0B" opacity="0.6" />
          <rect x="12" y="12" width="7" height="18" rx="2" fill="#F59E0B" />
          <circle cx="26" cy="23" r="4.5" fill="#EF4444" />
        </svg>
      );
    case 'football':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
          <circle cx="18" cy="18" r="13" stroke="#38BDF8" strokeWidth="2.5" fill="none" />
          <polygon points="18,13 22,16 20.5,21 15.5,21 14,16" fill="#38BDF8" />
        </svg>
      );
    case 'tennis':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
          <circle cx="18" cy="18" r="13" fill="#A3E635" />
          <path d="M8 12 Q18 16 14 26" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
          <path d="M28 12 Q18 16 22 26" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'pickleball':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
          <rect x="10" y="5" width="16" height="18" rx="5" fill="#EC4899" />
          <rect x="15.5" y="23" width="5" height="9" rx="1.5" fill="currentColor" opacity="0.6" />
          <circle cx="26" cy="22" r="4.5" fill="#FACC15" />
        </svg>
      );
    case 'basketball':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
          <circle cx="18" cy="18" r="13" fill="#F97316" />
          <line x1="5" y1="18" x2="31" y2="18" stroke="#18181B" strokeWidth="1.5" />
          <line x1="18" y1="5" x2="18" y2="31" stroke="#18181B" strokeWidth="1.5" />
        </svg>
      );
    default:
      return <Layers className="w-6 h-6 text-primary" />;
  }
}

export default function MarketCategoriesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  // Initially expand the first sport (Badminton)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['badminton']));

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(CATEGORY_GROUPS.map((g) => g.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Filter groups and subcategories by search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORY_GROUPS;
    const q = searchQuery.toLowerCase().trim();

    return CATEGORY_GROUPS.map((g) => {
      const matchSport = g.sport.toLowerCase().includes(q) || g.tagline.toLowerCase().includes(q);
      const filteredSubs = g.subcategories.filter(
        (sub) =>
          sub.name.toLowerCase().includes(q) ||
          sub.desc.toLowerCase().includes(q) ||
          sub.popularBrands?.some((b) => b.toLowerCase().includes(q))
      );

      return {
        ...g,
        isSportMatch: matchSport,
        subcategories: matchSport ? g.subcategories : filteredSubs,
      };
    }).filter((g) => g.isSportMatch || g.subcategories.length > 0);
  }, [searchQuery]);

  const isAllExpanded = expandedIds.size === CATEGORY_GROUPS.length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-32 space-y-4 select-none">
      {/* ─── 1. TOP HEADER & NAVIGATION ─── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 hover:bg-card active:scale-95 transition-all shadow-xs"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-foreground uppercase tracking-tight truncate">
              Sports Categories
            </h1>
            <p className="text-[11px] sm:text-xs text-foreground/50 font-medium truncate">
              Explore pro equipment &amp; authenticated gear
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={isAllExpanded ? collapseAll : expandAll}
          className="px-3 py-1.5 rounded-xl border text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-foreground/70 hover:text-foreground active:scale-95 transition-all shrink-0"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {isAllExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* ─── 2. INSTANT SEARCH BAR ─── */}
      <div
        className="flex items-center px-4 py-3 rounded-2xl border shadow-inner transition-all group focus-within:ring-1 focus-within:ring-primary"
        style={{
          backgroundColor: 'var(--athlon-input, #0B1310)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <Search className="w-4 h-4 text-foreground/40 group-focus-within:text-primary transition-colors mr-3 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories, brands, equipment (e.g. Astrox, Spikes, Balls)..."
          className="flex-1 bg-transparent text-xs sm:text-sm focus:outline-none placeholder:text-foreground/40 font-medium"
          style={{ color: 'var(--athlon-text, #FFF)' }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-[11px] font-bold text-foreground/50 hover:text-foreground px-2 py-0.5 rounded-md"
          >
            Clear
          </button>
        )}
      </div>

      {/* ─── 3. FULL-WIDTH LUXURY ACCORDION SPORT CARDS (DECATHLON / ZARA STYLE) ─── */}
      {filteredGroups.length === 0 ? (
        <div className="p-10 text-center rounded-3xl border border-dashed border-white/10 bg-card space-y-2">
          <Search className="w-8 h-8 text-foreground/30 mx-auto" />
          <p className="text-sm font-bold text-foreground">No categories match &ldquo;{searchQuery}&rdquo;</p>
          <p className="text-xs text-foreground/50">Try searching for generic terms like &ldquo;Rackets&rdquo;, &ldquo;Shoes&rdquo;, or &ldquo;Bats&rdquo;.</p>
        </div>
      ) : (
        <div className="space-y-3.5 pt-1">
          {filteredGroups.map((group) => {
            const isExpanded = expandedIds.has(group.id) || searchQuery.trim().length > 0;
            const totalItemsCount = group.subcategories.reduce((acc, sub) => {
              const num = parseInt(sub.itemCount) || 50;
              return acc + num;
            }, 0);

            return (
              <div
                key={group.id}
                className="w-full rounded-[22px] sm:rounded-[26px] border overflow-hidden transition-all duration-300 shadow-md backdrop-blur-xl"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                {/* ─── CARD HEADER (ALWAYS VISIBLE & CLICKABLE TO EXPAND) ─── */}
                <button
                  type="button"
                  onClick={() => toggleExpand(group.id)}
                  className="w-full p-3.5 sm:p-5 flex items-center justify-between text-left transition-colors cursor-pointer group active:scale-[0.995]"
                  style={{
                    backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                  }}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* 3D Sport Vector Badge Pod */}
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${group.themeColor}15`,
                        borderColor: `${group.themeColor}35`,
                      }}
                    >
                      <SportAccordionIcon type={group.iconType} />
                    </div>

                    {/* Sport Name & Subtitle */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                          {group.sport}
                        </h2>
                        <span className="text-[9px] sm:text-[9.5px] font-bold px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-foreground/60 uppercase">
                          {group.subcategories.length} Categories
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-foreground/50 font-medium truncate mt-0.5">
                        {group.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Right Tactile Chevron Toggle */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="hidden sm:inline-block text-[10px] font-mono text-foreground/40 font-bold uppercase">
                      {totalItemsCount}+ items
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 bg-primary/10 border-primary/30 text-primary' : 'border-white/10 text-foreground/40'
                      }`}
                      style={{
                        backgroundColor: isExpanded ? `${group.themeColor}15` : 'var(--athlon-surface)',
                        borderColor: isExpanded ? `${group.themeColor}40` : 'var(--athlon-border)',
                        color: isExpanded ? group.themeColor : undefined,
                      }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* ─── EXPANDABLE ACCORDION BODY (ZARA / DECATHLON STYLE) ─── */}
                {isExpanded && (
                  <div className="border-t px-3.5 sm:px-5 py-4 space-y-4" style={{ borderColor: 'var(--athlon-border)' }}>
                    {/* 1. Sport Promo Strip & Fast CTA */}
                    <div
                      className="p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <div className="space-y-0.5 relative z-10">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: `${group.themeColor}15`,
                              borderColor: `${group.themeColor}35`,
                              color: group.themeColor,
                            }}
                          >
                            {group.heroPromo.badgeText}
                          </span>
                          <span className="text-xs font-black text-foreground uppercase tracking-tight">
                            {group.heroPromo.headline}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground/60 font-medium">
                          {group.heroPromo.subheadline}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto relative z-10">
                        <Link
                          href={`/market/search?sport=${group.sport}`}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider text-black active:scale-95 transition-all shadow-xs"
                          style={{
                            backgroundColor: group.themeColor,
                          }}
                        >
                          <span>Shop All {group.sport}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/market/search?sport=${group.sport}&condition=USED`}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border text-[10.5px] font-bold uppercase tracking-wider text-foreground/70 hover:text-foreground active:scale-95 transition-all"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <Tag className="w-3 h-3 text-primary" />
                          <span>Pre-Owned</span>
                        </Link>
                      </div>
                    </div>

                    {/* 2. Subcategories Visual Cards Grid (2-column on mobile, 3-column on tablet+) */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {group.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/market/search?sport=${encodeURIComponent(group.sport)}&category=${encodeURIComponent(sub.name)}`}
                          className="group relative p-3 rounded-2xl border flex flex-col justify-between transition-all duration-200 hover:scale-[1.015] active:scale-[0.985] shadow-xs overflow-hidden"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          {/* Top Specular Arc */}
                          <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

                          {/* Top: Icon + Badge */}
                          <div className="flex items-start justify-between gap-1 relative z-10 mb-2">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs group-hover:scale-105 transition-transform"
                              style={{
                                backgroundColor: 'var(--athlon-card)',
                                borderColor: 'var(--athlon-border)',
                              }}
                            >
                              <SubcatVectorIcon type={sub.iconName} />
                            </div>

                            {sub.tag ? (
                              <span
                                className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border"
                                style={{
                                  backgroundColor: `${group.themeColor}15`,
                                  borderColor: `${group.themeColor}35`,
                                  color: group.themeColor,
                                }}
                              >
                                {sub.tag}
                              </span>
                            ) : (
                              <span className="text-[8.5px] font-bold text-foreground/40 font-mono">
                                {sub.itemCount}
                              </span>
                            )}
                          </div>

                          {/* Title & Desc */}
                          <div className="relative z-10 space-y-0.5">
                            <h3 className="text-xs font-black text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                              {sub.name}
                            </h3>
                            <p className="text-[9.5px] text-foreground/50 line-clamp-1 font-medium">
                              {sub.desc}
                            </p>
                          </div>

                          {/* Popular Brands Pills */}
                          {sub.popularBrands && sub.popularBrands.length > 0 && (
                            <div className="flex items-center gap-1 mt-2.5 pt-1.5 border-t border-white/[0.05] relative z-10 overflow-hidden">
                              {sub.popularBrands.slice(0, 2).map((brand) => (
                                <span
                                  key={brand}
                                  className="text-[7.5px] font-bold px-1.5 py-0.5 rounded border text-foreground/60 truncate"
                                  style={{
                                    backgroundColor: 'var(--athlon-card)',
                                    borderColor: 'var(--athlon-border)',
                                  }}
                                >
                                  {brand}
                                </span>
                              ))}
                              <ArrowRight className="w-3 h-3 text-foreground/30 ml-auto group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>

                    {/* 3. Featured Brands Horizontal Strip */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/50 shrink-0">
                        Top Brands:
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                        {group.featuredBrands.map((brand) => (
                          <Link
                            key={brand}
                            href={`/market/search?sport=${encodeURIComponent(group.sport)}&q=${encodeURIComponent(brand)}`}
                            className="px-2.5 py-1 rounded-lg border text-[9.5px] font-bold hover:border-primary/50 hover:text-primary transition-colors shrink-0"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                              color: 'var(--athlon-text)',
                            }}
                          >
                            {brand}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
