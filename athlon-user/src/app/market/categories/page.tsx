'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Layers, ArrowRight } from 'lucide-react';
import { MarketplaceApi } from '@/lib/api/marketplace';

const CATEGORY_DATA = [
  {
    sport: 'Badminton',
    emoji: '🏸',
    subcategories: [
      { name: 'Rackets', desc: 'Astrox, Nanoflare, Arcsaber, Thruster' },
      { name: 'Shoes', desc: 'Non-marking badminton court footwear' },
      { name: 'Bags', desc: 'Tour kitbags, thermo-guard backpacks' },
      { name: 'Shuttles', desc: 'Feather & nylon tournament shuttles' },
      { name: 'Strings & Grips', desc: 'High repulsion strings, tacky overgrips' },
      { name: 'Apparel', desc: 'Quick-dry jerseys, shorts, wristbands' },
    ],
  },
  {
    sport: 'Cricket',
    emoji: '🏏',
    subcategories: [
      { name: 'Bats', desc: 'English willow, Kashmir willow, tennis bats' },
      { name: 'Pads & Gloves', desc: 'Batting leg guards, wicket-keeping gloves' },
      { name: 'Helmets & Protection', desc: 'Concussion-tested titanium/steel helmets' },
      { name: 'Shoes', desc: 'Spike & rubber stud turf shoes' },
      { name: 'Kitbags', desc: 'Wheelie bags, duffle bags' },
    ],
  },
  {
    sport: 'Football',
    emoji: '⚽',
    subcategories: [
      { name: 'Boots', desc: 'FG, AG, TF turf and indoor court shoes' },
      { name: 'Balls', desc: 'FIFA certified match & training balls' },
      { name: 'Goalkeeper Gear', desc: 'Pro grip gloves, padded trousers' },
      { name: 'Apparel', desc: 'Club jerseys, shin guards, training bibs' },
    ],
  },
  {
    sport: 'Tennis',
    emoji: '🎾',
    subcategories: [
      { name: 'Rackets', desc: 'Spin, power, and precision racquets' },
      { name: 'Shoes', desc: 'Hard court, clay court footwear' },
      { name: 'Balls & Strings', desc: 'Pressurized tour balls, poly strings' },
    ],
  },
];

export default function MarketCategoriesPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-card text-foreground/70"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-black text-foreground">
          Sports Categories
        </h1>
      </div>

      <div className="space-y-6">
        {CATEGORY_DATA.map((catGroup) => (
          <div
            key={catGroup.sport}
            className="rounded-3xl border p-5 sm:p-6 bg-card space-y-4"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{catGroup.emoji}</span>
                <h2 className="text-base sm:text-lg font-black text-foreground">
                  {catGroup.sport}
                </h2>
              </div>
              <Link
                href={`/market/search?sport=${catGroup.sport}`}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
              >
                <span>View All {catGroup.sport}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {catGroup.subcategories.map((sub) => (
                <Link
                  key={sub.name}
                  href={`/market/search?sport=${catGroup.sport}&category=${encodeURIComponent(sub.name)}`}
                  className="p-3.5 rounded-2xl border border-white/5 bg-surface/50 hover:bg-surface hover:border-primary/40 transition-all group flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-foreground group-hover:text-primary transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-[10px] text-foreground/50 truncate mt-0.5">
                      {sub.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
