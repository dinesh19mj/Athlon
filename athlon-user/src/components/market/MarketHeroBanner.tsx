'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface BannerSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
}

const SLIDES: BannerSlide[] = [
  {
    id: 'slide-1',
    tag: 'PREMIUM GEAR',
    title: 'PLAY BETTER FOR LESS',
    subtitle: 'Used, New & More from ATHLON Community',
    ctaText: 'Shop Now',
    ctaLink: '/market/search?condition=USED',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'slide-2',
    tag: 'AUTHENTIC DEALERS',
    title: 'OFFICIAL SPORTS SHOPS',
    subtitle: 'Verified local retail stores with genuine warranties',
    ctaText: 'Explore Shops',
    ctaLink: '/market/categories',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'slide-3',
    tag: 'ATHLON SELL',
    title: 'SELL YOUR USED GEAR',
    subtitle: 'Free commission selling for active tournament players',
    ctaText: 'Start Selling',
    ctaLink: '/market/sell',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  },
];

export function MarketHeroBanner() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[activeIdx];

  return (
    <div className="w-full relative select-none">
      <div
        className="relative w-full rounded-[24px] overflow-hidden border p-5 sm:p-6 shadow-xl transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 42, 28, 0.95) 0%, rgba(6, 18, 12, 0.98) 100%)',
          borderColor: 'var(--athlon-border, rgba(34, 197, 94, 0.2))',
          boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Neon Light Energy Rail */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, var(--athlon-primary, #22C55E) 50%, transparent 100%)',
          }}
        />

        {/* Ambient Halo Glow */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ backgroundColor: 'var(--athlon-primary, #22C55E)' }}
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Text Content */}
          <div className="flex-1 max-w-xs sm:max-w-md space-y-2">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/40 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{slide.tag}</span>
            </div>

            {/* Headline */}
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight">
              {slide.title}
            </h2>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-xs text-white/70 line-clamp-2 leading-relaxed">
              {slide.subtitle}
            </p>

            {/* CTA Button */}
            <div className="pt-1">
              <Link
                href={slide.ctaLink}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black text-white bg-black/50 hover:bg-black/70 border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                <span>{slide.ctaText}</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
              </Link>
            </div>
          </div>

          {/* Banner Graphic / Gear Image */}
          <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-2xl relative">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4 pt-2 border-t border-white/5">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIdx === idx ? 'w-5 bg-primary' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              style={{
                backgroundColor: activeIdx === idx ? 'var(--athlon-primary, #22C55E)' : undefined,
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MarketHeroBanner;
