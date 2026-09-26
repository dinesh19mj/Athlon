'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

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
  const { theme, mode } = useAthlonTheme();
  const isDark = mode === 'dark';
  const primary = theme?.colors?.primary || '#54AC68';
  const primaryLight = theme?.colors?.primaryLight || primary;

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
        className={`
          relative w-full rounded-[24px] overflow-hidden border p-5 sm:p-6 shadow-xl transition-all duration-300
          ${
            isDark
              ? 'bg-[#0A120E] border-white/[0.12]'
              : 'bg-white border-slate-200/90'
          }
        `}
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${primary}25 0%, #07100B 65%, #030705 100%)`
            : `linear-gradient(135deg, #FFFFFF 0%, ${primary}0A 50%, var(--athlon-card) 100%)`,
          boxShadow: isDark
            ? `0 14px 36px -6px rgba(0, 0, 0, 0.6), 0 0 0 1px ${primary}20, inset 0 1px 1px rgba(255, 255, 255, 0.15)`
            : `0 10px 30px -6px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9)`,
        }}
      >
        {/* Neon Light Energy Rail */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${primary} 50%, transparent 100%)`,
          }}
        />

        {/* Ambient Halo Glow */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-30 dark:opacity-50"
          style={{ backgroundColor: primary }}
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Text Content */}
          <div className="flex-1 max-w-xs sm:max-w-md space-y-2">
            {/* Tag Badge */}
            <div
              className={`
                inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md transition-colors
                ${
                  isDark
                    ? 'bg-black/50 border border-white/15'
                    : 'bg-slate-100/90 border border-slate-200 shadow-xs'
                }
              `}
              style={{
                color: isDark ? primaryLight : primary,
                borderColor: `${primary}35`,
              }}
            >
              <Sparkles className="w-2.5 h-2.5" style={{ color: primary }} />
              <span>{slide.tag}</span>
            </div>

            {/* Headline */}
            <h2
              className={`text-lg sm:text-2xl font-black tracking-tight leading-tight transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {slide.title}
            </h2>

            {/* Subtitle */}
            <p
              className={`text-[11px] sm:text-xs line-clamp-2 leading-relaxed transition-colors ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {slide.subtitle}
            </p>

            {/* CTA Button */}
            <div className="pt-1">
              <Link
                href={slide.ctaLink}
                className={`
                  inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-md
                  ${
                    isDark
                      ? 'text-white bg-white/10 hover:bg-white/20 border border-white/20'
                      : 'text-white hover:brightness-105'
                  }
                `}
                style={
                  !isDark
                    ? {
                        backgroundColor: primary,
                        boxShadow: `0 4px 14px -2px ${primary}50`,
                      }
                    : undefined
                }
              >
                <span>{slide.ctaText}</span>
                <ChevronRight
                  className="w-3.5 h-3.5"
                  style={{ color: isDark ? primaryLight : '#FFFFFF' }}
                />
              </Link>
            </div>
          </div>

          {/* Banner Graphic / Gear Image */}
          <div
            className={`
              w-24 h-24 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 border shadow-2xl relative
              ${isDark ? 'border-white/15 bg-black/40' : 'border-slate-200 bg-slate-100'}
            `}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />
            <div
              className={`
                absolute inset-0 pointer-events-none
                ${isDark ? 'bg-gradient-to-t from-black/60 via-transparent to-transparent' : 'bg-gradient-to-t from-black/20 via-transparent to-transparent'}
              `}
            />
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div
          className={`
            flex items-center justify-center gap-1.5 mt-4 pt-2 border-t transition-colors
            ${isDark ? 'border-white/10' : 'border-slate-200/80'}
          `}
        >
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIdx === idx
                  ? 'w-5'
                  : isDark
                    ? 'w-1.5 bg-white/20 hover:bg-white/40'
                    : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
              style={{
                backgroundColor: activeIdx === idx ? primary : undefined,
                boxShadow: activeIdx === idx ? `0 0 6px ${primary}` : undefined,
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
