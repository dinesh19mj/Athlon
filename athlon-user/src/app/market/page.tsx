'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ScanLine,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Store,
  Tag,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { AppModeSwitcher } from '@/components/navigation/AppModeSwitcher';
import { MarketCategoryPills } from '@/components/market/MarketCategoryPills';
import { MarketHeroBanner } from '@/components/market/MarketHeroBanner';
import { MarketProductCard } from '@/components/market/MarketProductCard';
import { MarketShopCard } from '@/components/market/MarketShopCard';
import {
  MarketProduct,
  MarketShop,
  MarketplaceApi,
} from '@/lib/api/marketplace';

export default function MarketHomePage() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [shops, setShops] = useState<MarketShop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const [prods, shps] = await Promise.all([
        MarketplaceApi.getProducts({ sport: selectedSport }),
        MarketplaceApi.getShops(),
      ]);
      if (isMounted) {
        setProducts(prods);
        setShops(shps);
        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedSport]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/market/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/market/search');
    }
  };

  const preOwnedProducts = products.filter((p) => p.productType === 'USED' || p.condition !== 'NEW');
  const newArrivals = products.filter((p) => p.condition === 'NEW' || p.condition === 'LIKE_NEW');
  const dealsProducts = products.filter((p) => p.originalPrice && p.originalPrice > p.price);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-0 pb-8">
      {/* ─── 1. PWA Mobile Top Notch Mode Switcher (Visible on Mobile only) ─── */}
      <div className="block md:hidden flex justify-center pt-0 pb-0">
        <AppModeSwitcher />
      </div>

      <div className="space-y-6 mt-1.5">
        {/* ─── 2. Luxury Sports Market Hero Section (Matching Athlon Home Page) ─── */}
        <section
        className="relative w-full rounded-[26px] overflow-hidden border p-5 sm:p-6 shadow-xl transition-all"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
          boxShadow:
            '0 12px 32px -6px var(--athlon-shadow, rgba(0, 0, 0, 0.15)), 0 0 0 1px var(--athlon-border), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* 1. Top Edge Neon Energy Rail */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] opacity-75 pointer-events-none z-0"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, var(--athlon-primary) 50%, transparent 100%)',
          }}
        />

        {/* 2. Spotlight Beams & Multi-Layered Neon Halos */}
        <div
          className="absolute -top-16 -right-16 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-50 dark:opacity-70 animate-pulse duration-1000 z-0"
          style={{
            background:
              'radial-gradient(circle, var(--athlon-primary) 0%, rgba(52, 211, 153, 0.4) 40%, transparent 75%)',
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-25 dark:opacity-40 z-0"
          style={{
            background:
              'radial-gradient(circle, var(--athlon-primary-light, #54AC68) 0%, rgba(34, 197, 94, 0.2) 50%, transparent 80%)',
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-20 dark:opacity-30 z-0"
          style={{ backgroundColor: 'var(--athlon-primary)' }}
        />

        {/* 3. Tech Dot-Matrix Pattern with Precision Fade Mask */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.16] dark:opacity-[0.24] z-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, var(--athlon-primary) 1.2px, transparent 1.2px)',
            backgroundSize: '16px 16px',
            maskImage:
              'radial-gradient(ellipse 85% 85% at 75% 25%, black 20%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 85% 85% at 75% 25%, black 20%, transparent 80%)',
          }}
        />

        {/* 4. Diagonal Athletic Turf / Carbon Speed Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06] z-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--athlon-primary) 0, var(--athlon-primary) 1px, transparent 0, transparent 12px)',
          }}
        />

        {/* 5. Comprehensive Multi-Sport Arena, Stadium & Equipment Wireframe Skeleton */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0"
          viewBox="0 0 360 260"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="marketHeroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--athlon-primary)" stopOpacity="0.5" />
              <stop offset="60%" stopColor="var(--athlon-primary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="marketBeamGradient" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--athlon-primary)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--athlon-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Stadium Floodlight Cones */}
          <polygon points="340,-20 200,240 250,240 370,-20" fill="url(#marketBeamGradient)" opacity="0.32" />

          {/* ─── STADIUM ARENA BOWL ARCHITECTURAL SKELETON ─── */}
          <g opacity="0.32" stroke="var(--athlon-primary)">
            <ellipse cx="295" cy="55" rx="120" ry="72" fill="none" strokeWidth="1.2" strokeDasharray="3 3" />
            <ellipse cx="295" cy="55" rx="100" ry="60" fill="none" strokeWidth="0.8" opacity="0.6" />
            <ellipse cx="295" cy="55" rx="82" ry="48" fill="none" strokeWidth="1" />
            <ellipse cx="295" cy="55" rx="66" ry="38" fill="none" strokeWidth="0.75" strokeDasharray="2 2" />

            <line x1="295" y1="55" x2="175" y2="55" strokeWidth="0.75" opacity="0.4" />
            <line x1="295" y1="55" x2="200" y2="15" strokeWidth="0.75" opacity="0.5" />
            <line x1="295" y1="55" x2="235" y2="-10" strokeWidth="0.75" opacity="0.5" />
            <line x1="295" y1="55" x2="295" y2="-17" strokeWidth="0.75" opacity="0.5" />
            <line x1="295" y1="55" x2="355" y2="-10" strokeWidth="0.75" opacity="0.5" />
            <line x1="295" y1="55" x2="390" y2="15" strokeWidth="0.75" opacity="0.5" />
            <line x1="295" y1="55" x2="415" y2="55" strokeWidth="0.75" opacity="0.4" />
            <line x1="295" y1="55" x2="390" y2="95" strokeWidth="0.75" opacity="0.5" />
            <line x1="295" y1="55" x2="355" y2="120" strokeWidth="0.75" opacity="0.5" />
            <line x1="295" y1="55" x2="295" y2="127" strokeWidth="0.75" opacity="0.5" />
            <line x1="295" y1="55" x2="235" y2="120" strokeWidth="0.75" opacity="0.5" />
            <line x1="295" y1="55" x2="200" y2="95" strokeWidth="0.75" opacity="0.5" />

            <g transform="translate(332, 2)">
              <polygon points="0,0 8,-12 16,0" fill="none" strokeWidth="1" />
              <line x1="4" y1="-6" x2="12" y2="-6" strokeWidth="0.7" />
              <circle cx="2" cy="-12" r="1.5" fill="var(--athlon-primary)" />
              <circle cx="8" cy="-15" r="1.5" fill="var(--athlon-primary)" />
              <circle cx="14" cy="-12" r="1.5" fill="var(--athlon-primary)" />
            </g>
          </g>

          {/* ─── ISOMETRIC COURT SKELETON ─── */}
          <g transform="translate(205, 52)" opacity="0.38" stroke="var(--athlon-primary)">
            <polygon points="15,40 85,0 150,35 80,75" fill="none" strokeWidth="1.2" />
            <line x1="22" y1="36" x2="87" y2="-1" strokeWidth="0.7" strokeDasharray="3 2" />
            <line x1="73" y1="71" x2="138" y2="34" strokeWidth="0.7" strokeDasharray="3 2" />
            <polygon points="50,20 115,55 115,44 50,9" fill="rgba(84, 172, 104, 0.08)" strokeWidth="1" />
            <line x1="62" y1="17" x2="62" y2="28" strokeWidth="0.6" />
            <line x1="74" y1="23" x2="74" y2="34" strokeWidth="0.6" />
            <line x1="86" y1="30" x2="86" y2="41" strokeWidth="0.6" />
            <line x1="98" y1="37" x2="98" y2="48" strokeWidth="0.6" />
            <line x1="110" y1="44" x2="110" y2="55" strokeWidth="0.6" />
            <line x1="50" y1="20" x2="50" y2="6" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="115" y1="55" x2="115" y2="41" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="32" y1="30" x2="67" y2="49" strokeWidth="0.7" />
            <line x1="97" y1="26" x2="132" y2="45" strokeWidth="0.7" />
            <line x1="50" y1="40" x2="115" y2="35" strokeWidth="0.7" />
          </g>

          {/* ─── FOOTBALL / TURF PITCH SKELETON ─── */}
          <g transform="translate(18, 148)" opacity="0.22" stroke="var(--athlon-primary)">
            <rect x="0" y="0" width="130" height="75" rx="3" fill="none" strokeWidth="1" />
            <line x1="65" y1="0" x2="65" y2="75" strokeWidth="0.9" />
            <circle cx="65" cy="37.5" r="16" fill="none" strokeWidth="0.9" />
            <circle cx="65" cy="37.5" r="2" fill="var(--athlon-primary)" />
            <rect x="0" y="16" width="24" height="43" fill="none" strokeWidth="0.8" />
            <rect x="0" y="26" width="9" height="23" fill="none" strokeWidth="0.7" />
            <path d="M 24 30 A 10 10 0 0 1 24 45" fill="none" strokeWidth="0.75" />
            <rect x="106" y="16" width="24" height="43" fill="none" strokeWidth="0.8" />
            <rect x="121" y="26" width="9" height="23" fill="none" strokeWidth="0.7" />
            <path d="M 106 30 A 10 10 0 0 0 106 45" fill="none" strokeWidth="0.75" />
          </g>

          {/* ─── SPORTS EQUIPMENT SKELETONS ─── */}
          {/* Badminton Racket Wireframe */}
          <g transform="translate(36, 62) rotate(-26)" opacity="0.38" stroke="var(--athlon-primary)">
            <ellipse cx="0" cy="0" rx="17" ry="23" fill="rgba(84, 172, 104, 0.05)" strokeWidth="1.4" />
            <ellipse cx="0" cy="0" rx="15.5" ry="21.5" fill="none" strokeWidth="0.6" opacity="0.7" />
            <line x1="-11" y1="-14" x2="-11" y2="14" strokeWidth="0.5" />
            <line x1="-5.5" y1="-20" x2="-5.5" y2="20" strokeWidth="0.5" />
            <line x1="0" y1="-23" x2="0" y2="23" strokeWidth="0.6" />
            <line x1="5.5" y1="-20" x2="5.5" y2="20" strokeWidth="0.5" />
            <line x1="11" y1="-14" x2="11" y2="14" strokeWidth="0.5" />
            <line x1="-14" y1="-12" x2="14" y2="-12" strokeWidth="0.5" />
            <line x1="-16" y1="-6" x2="16" y2="-6" strokeWidth="0.5" />
            <line x1="-17" y1="0" x2="17" y2="0" strokeWidth="0.6" />
            <line x1="-16" y1="6" x2="16" y2="6" strokeWidth="0.5" />
            <line x1="-14" y1="12" x2="14" y2="12" strokeWidth="0.5" />
            <polygon points="-4.5,22 4.5,22 1.5,30 -1.5,30" fill="rgba(84, 172, 104, 0.2)" strokeWidth="1" />
            <line x1="0" y1="30" x2="0" y2="60" strokeWidth="1.6" />
            <rect x="-3" y="60" width="6" height="26" rx="1.5" fill="rgba(84, 172, 104, 0.12)" strokeWidth="1.2" />
            <line x1="-3" y1="66" x2="3" y2="67" strokeWidth="0.6" />
            <line x1="-3" y1="72" x2="3" y2="73" strokeWidth="0.6" />
            <line x1="-3" y1="78" x2="3" y2="79" strokeWidth="0.6" />
            <rect x="-4" y="85" width="8" height="2.5" rx="0.8" fill="var(--athlon-primary)" strokeWidth="0.8" />
          </g>

          {/* Aerodynamic Feather Shuttlecock */}
          <g transform="translate(170, 24) rotate(28) scale(0.7)" opacity="0.45" stroke="var(--athlon-primary)">
            <path d="M -16 6 Q -26 12 -34 14" fill="none" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.45" />
            <path d="M -14 0 Q -24 5 -32 6" fill="none" strokeWidth="0.65" strokeDasharray="2 3" opacity="0.35" />
            <path
              d="M -5 7 C -7 -2 -11 -12 -16 -23 C -8 -26 8 -26 16 -23 C 11 -12 7 -2 5 7 Z"
              fill="rgba(84, 172, 104, 0.08)"
              stroke="none"
            />
            <path d="M -5 7 C -7 -2 -11 -12 -16 -23" fill="none" strokeWidth="1.2" />
            <path d="M 5 7 C 7 -2 11 -12 16 -23" fill="none" strokeWidth="1.2" />
            <line x1="0" y1="7" x2="0" y2="-24.5" strokeWidth="0.8" />
            <line x1="-1.8" y1="7" x2="-3.2" y2="-24.2" strokeWidth="0.65" />
            <line x1="1.8" y1="7" x2="3.2" y2="-24.2" strokeWidth="0.65" />
            <line x1="-3.5" y1="7" x2="-6.8" y2="-24" strokeWidth="0.65" />
            <line x1="3.5" y1="7" x2="6.8" y2="-24" strokeWidth="0.65" />
            <line x1="-4.6" y1="7" x2="-11" y2="-23.6" strokeWidth="0.65" />
            <line x1="4.6" y1="7" x2="11" y2="-23.6" strokeWidth="0.65" />
            <path
              d="M -16 -23 C -15.5 -26.5 -12.5 -26.5 -11 -23.5 C -10 -27 -7 -27 -5.5 -24 C -4.5 -27.5 -1.5 -27.5 0 -24.5 C 1.5 -27.5 4.5 -27.5 5.5 -24 C 7 -27 10 -27 11 -23.5 C 12.5 -26.5 15.5 -26.5 16 -23"
              fill="none"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <ellipse cx="0" cy="-23.5" rx="16" ry="3.2" fill="none" strokeWidth="0.5" strokeDasharray="3 2" opacity="0.6" />
            <ellipse cx="0" cy="-6" rx="8.5" ry="2" fill="none" strokeWidth="0.9" />
            <ellipse cx="0" cy="-6" rx="8.5" ry="2" fill="none" strokeWidth="0.9" strokeDasharray="2 1.5" />
            <ellipse cx="0" cy="-14.5" rx="12.2" ry="2.6" fill="none" strokeWidth="0.9" strokeDasharray="2.5 1.5" />
            <line x1="-12" y1="-14" x2="-14.5" y2="-19" strokeWidth="0.5" opacity="0.7" />
            <line x1="12" y1="-14" x2="14.5" y2="-19" strokeWidth="0.5" opacity="0.7" />
            <line x1="-8" y1="-6" x2="-10" y2="-10" strokeWidth="0.5" opacity="0.6" />
            <line x1="8" y1="-6" x2="10" y2="-10" strokeWidth="0.5" opacity="0.6" />
            <rect x="-5" y="7" width="10" height="3" rx="0.5" fill="rgba(84, 172, 104, 0.35)" strokeWidth="0.9" />
            <path
              d="M -5 10 C -5 15.5 5 15.5 5 10 Z"
              fill="rgba(84, 172, 104, 0.25)"
              strokeWidth="1.1"
            />
          </g>

          {/* Sports Ball Geodesic / Seam Skeleton */}
          <g transform="translate(230, 185)" opacity="0.25" stroke="var(--athlon-primary)">
            <circle cx="0" cy="0" r="16" fill="none" strokeWidth="1.2" />
            <path d="M -16 0 A 16 16 0 0 1 16 0" fill="none" strokeWidth="0.8" />
            <path d="M 0 -16 A 16 16 0 0 1 0 16" fill="none" strokeWidth="0.8" />
            <path d="M -11 -11 C -4 -4, -4 4, -11 11" fill="none" strokeWidth="0.8" strokeDasharray="2 1" />
            <path d="M 11 -11 C 4 -4, 4 4, 11 11" fill="none" strokeWidth="0.8" strokeDasharray="2 1" />
          </g>

          {/* Running Track Curved Velocity Lanes */}
          <g opacity="0.28" stroke="var(--athlon-primary)">
            <ellipse cx="320" cy="40" rx="145" ry="110" fill="none" strokeWidth="0.8" strokeDasharray="4 4" />
            <ellipse cx="320" cy="40" rx="180" ry="135" fill="none" strokeWidth="1" />
            <ellipse cx="320" cy="40" rx="215" ry="160" fill="none" strokeWidth="0.8" strokeDasharray="2 2" />
          </g>

          {/* Velocity Chevrons */}
          <g transform="translate(295, 14)" stroke="var(--athlon-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.35">
            <line x1="0" y1="0" x2="6" y2="10" />
            <line x1="6" y1="10" x2="0" y2="20" />
            <line x1="8" y1="0" x2="14" y2="10" />
            <line x1="14" y1="10" x2="8" y2="20" />
            <line x1="16" y1="0" x2="22" y2="10" />
            <line x1="22" y1="10" x2="16" y2="20" />
          </g>

          {/* Technical Reticles & Grid Coordinates */}
          <path d="M 335 150 L 345 150 M 340 145 L 340 155" stroke="var(--athlon-primary)" strokeWidth="1" opacity="0.3" />
          <path d="M 28 215 L 36 215 M 32 211 L 32 219" stroke="var(--athlon-primary)" strokeWidth="0.8" opacity="0.25" />
          <path d="M 16 12 L 22 12 M 16 12 L 16 18" stroke="var(--athlon-primary)" strokeWidth="1" opacity="0.35" />
          <path d="M 344 248 L 338 248 M 344 248 L 344 242" stroke="var(--athlon-primary)" strokeWidth="1" opacity="0.35" />
        </svg>



        {/* 7. Top Specular Arc Light */}
        <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/[0.12] dark:from-white/[0.04] via-transparent to-transparent pointer-events-none z-0" />

        <div className="relative z-10 space-y-4">
          {/* 1. Live Market Ticker Pill */}
          <div className="flex items-center justify-between gap-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md"
              style={{
                backgroundColor: 'var(--athlon-primary-soft)',
                borderColor: 'var(--athlon-primary)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: 'var(--athlon-primary)' }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: 'var(--athlon-primary)' }}
                />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                Sports Marketplace
              </span>
            </div>
          </div>

          {/* 2. Bold Hero Typography */}
          <div className="space-y-1">
            <h1 className="text-[23px] sm:text-2xl font-black leading-[1.12] tracking-tight uppercase text-foreground">
              <span>BUY. SELL.</span>
              <br />
              <span className="text-primary drop-shadow-[0_2px_12px_var(--athlon-primary-glow)]">
                PLAY BETTER.
              </span>
            </h1>
            <p className="text-[11.5px] sm:text-xs text-text-secondary leading-relaxed font-medium pt-0.5 max-w-md">
              Discover authentic sports gear, list your pre-owned equipment, and shop verified pro stores.
            </p>
          </div>

          {/* 3. Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 max-w-md">
            <Link
              href="/market/search"
              className="flex items-center justify-center gap-1.5 text-[11px] font-black px-4 py-3 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-md tracking-wider uppercase"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                color: 'var(--athlon-primary-foreground)',
                boxShadow: '0 6px 20px var(--athlon-primary-glow)',
              }}
            >
              <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2.5} style={{ color: 'var(--athlon-primary-foreground)' }} />
              <span>Explore Shop</span>
            </Link>
            <Link
              href="/market/sell"
              className="flex items-center justify-center gap-1.5 border text-[11px] font-black px-4 py-3 rounded-2xl active:scale-95 transition-all shadow-sm tracking-wider uppercase backdrop-blur-md hover:bg-foreground/5"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
            >
              <Tag className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
              <span>Sell Gear</span>
            </Link>
          </div>

          {/* 4. Live Telemetry Strip */}
          <div
            className="grid grid-cols-3 divide-x rounded-2xl p-2.5 mt-1 border backdrop-blur-md max-w-md"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex flex-col items-center justify-center text-center px-1" style={{ borderColor: 'var(--athlon-border)' }}>
              <span className="text-xs font-black text-foreground font-mono leading-none">1,000+</span>
              <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1">
                Products
              </span>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-1" style={{ borderColor: 'var(--athlon-border)' }}>
              <span className="text-xs font-black text-primary font-mono leading-none">150+</span>
              <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1">
                Shops
              </span>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-1" style={{ borderColor: 'var(--athlon-border)' }}>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono leading-none">100%</span>
              <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1">
                Verified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Quick Action Squircle Tiles (Matching Athlon Home Page) ─── */}
      <section className="flex items-center justify-between w-full pt-1 pb-1 px-1">
        {[
          { id: 'shop', label: 'Buy Gear', icon: ShoppingBag, href: '/market/search' },
          { id: 'sell', label: 'Sell Gear', icon: Tag, href: '/market/sell' },
          { id: 'shops', label: 'Pro Shops', icon: Store, href: '/market/search?sellerType=SHOP' },
          { id: 'pre-owned', label: 'Pre-Owned', icon: RefreshCw, href: '/market/search?condition=USED' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div
                className="relative w-[68px] h-[68px] rounded-[18px] flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border overflow-hidden"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  boxShadow: '0 6px 20px -2px var(--athlon-primary-soft), 0 2px 6px var(--athlon-shadow)',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-foreground/[0.04] to-transparent pointer-events-none" />
                <Icon className="w-7 h-7 text-primary transition-transform group-hover:scale-110" strokeWidth={1.75} />
              </div>
              <span
                className="text-[10px] font-bold text-center tracking-tight transition-colors group-hover:text-primary"
                style={{ color: 'var(--athlon-text-secondary)' }}
              >
                {action.label}
              </span>
            </Link>
          );
        })}
      </section>

      {/* ─── 4. Search Bar with Scan QR ─── */}
      <form onSubmit={handleSearchSubmit} className="w-full">
        <div
          className="flex items-center px-4 py-3 rounded-2xl border shadow-inner transition-all group focus-within:ring-1 focus-within:ring-primary"
          style={{
            backgroundColor: 'var(--athlon-input, #0B1310)',
            borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
          }}
        >
          <Search className="w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors mr-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sports gear, brands, shops..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-foreground/35"
            style={{ color: 'var(--athlon-text, #FFF)' }}
          />
          <button
            type="button"
            onClick={() => router.push('/market/search')}
            className="p-1 text-foreground/40 hover:text-foreground transition-colors ml-2 shrink-0"
            title="Search Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => alert('Camera QR/Barcode scanner ready for product tags.')}
            className="p-1 text-foreground/40 hover:text-foreground transition-colors ml-1.5 shrink-0"
            title="Scan QR or Barcode"
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* ─── 5. Sport Categories Pill Row ─── */}
      <div>
        <MarketCategoryPills
          selectedSport={selectedSport}
          onSelectSport={setSelectedSport}
        />
      </div>

      {/* ─── 6. Dynamic Market Hero Promotional Carousel ─── */}
      <div>
        <MarketHeroBanner />
      </div>

      {/* ─── 7. PRE-OWNED GEAR SECTION ─── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-foreground uppercase">
              Pre-Owned Gear
            </h2>
          </div>
          <Link
            href="/market/search?condition=USED"
            className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-primary hover:underline"
            style={{ color: 'var(--athlon-primary, #22C55E)' }}
          >
            <span>See All</span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-[4/3] rounded-2xl bg-card animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : preOwnedProducts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-card">
            <p className="text-xs text-foreground/50">No pre-owned gear found for {selectedSport}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {preOwnedProducts.slice(0, 4).map((product) => (
              <MarketProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ─── 8. SPORTS SHOPS SECTION ─── */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Store className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-foreground uppercase">
              Sports Shops
            </h2>
          </div>
          <Link
            href="/market/search?sellerType=SHOP"
            className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-primary hover:underline"
            style={{ color: 'var(--athlon-primary, #22C55E)' }}
          >
            <span>See All</span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="aspect-[4/3] rounded-2xl bg-card animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-card space-y-2">
            <Store className="w-8 h-8 text-foreground/30 mx-auto" />
            <p className="text-xs text-foreground/60">No commercial sports shops registered yet.</p>
            <Link
              href="/market/plans"
              className="inline-block text-[11px] font-bold text-primary hover:underline"
            >
              Open a Pro Storefront &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {shops.map((shop) => (
              <MarketShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>

      {/* ─── 9. NEW ARRIVALS SECTION ─── */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-foreground uppercase">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/market/search?sort=newest"
            className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-primary hover:underline"
            style={{ color: 'var(--athlon-primary, #22C55E)' }}
          >
            <span>See All</span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-[4/3] rounded-2xl bg-card animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-card space-y-2">
            <Tag className="w-8 h-8 text-foreground/30 mx-auto" />
            <p className="text-xs text-foreground/60">No new gear listings found.</p>
            <Link
              href="/market/sell"
              className="inline-block text-[11px] font-bold text-primary hover:underline"
            >
              List Sports Gear Now &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {newArrivals.slice(0, 4).map((product) => (
              <MarketProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
