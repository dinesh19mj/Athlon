'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutGrid, MoreHorizontal } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  sport: string;
  iconType: 'all' | 'badminton' | 'cricket' | 'football' | 'tennis' | 'more';
  emoji?: string;
  customIcon?: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'All', name: 'All', sport: 'All', iconType: 'all' },
  { id: 'Badminton', name: 'Badminton', sport: 'Badminton', iconType: 'badminton', emoji: '🏸' },
  { id: 'Cricket', name: 'Cricket', sport: 'Cricket', iconType: 'cricket', emoji: '🏏' },
  { id: 'Football', name: 'Football', sport: 'Football', iconType: 'football', emoji: '⚽' },
  { id: 'Tennis', name: 'Tennis', sport: 'Tennis', iconType: 'tennis', emoji: '🎾' },
  { id: 'More', name: 'More', sport: 'More', iconType: 'more' },
];

interface MarketCategoryPillsProps {
  selectedSport: string;
  onSelectSport: (sport: string) => void;
  className?: string;
}

export function MarketCategoryPills({
  selectedSport,
  onSelectSport,
  className = '',
}: MarketCategoryPillsProps) {
  return (
    <div className={`w-full overflow-x-auto hide-scrollbar select-none -mx-4 px-4 ${className}`}>
      <div className="flex items-center gap-3.5 sm:gap-6 min-w-max pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedSport === cat.sport;

          if (cat.iconType === 'more') {
            return (
              <Link
                key={cat.id}
                href="/market/categories"
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200 group-hover:scale-105 active:scale-95 shadow-sm"
                  style={{
                    backgroundColor: 'var(--athlon-card, #111A15)',
                    borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
                  }}
                >
                  <MoreHorizontal className="w-5 h-5 text-foreground/60 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[11px] font-bold text-foreground/60 group-hover:text-foreground">
                  More
                </span>
              </Link>
            );
          }

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectSport(cat.sport)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-95 transition-transform"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200 shadow-sm ${
                  isSelected
                    ? 'border-primary shadow-[0_0_16px_var(--athlon-primary-glow)] scale-105'
                    : 'hover:scale-105 hover:border-primary/40'
                }`}
                style={{
                  backgroundColor: isSelected
                    ? 'var(--athlon-primary, #22C55E)'
                    : 'var(--athlon-card, #111A15)',
                  borderColor: isSelected
                    ? 'var(--athlon-primary, #22C55E)'
                    : 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
                }}
              >
                {cat.iconType === 'all' ? (
                  <LayoutGrid
                    className={`w-5 h-5 ${
                      isSelected ? 'text-black' : 'text-foreground/70 group-hover:text-primary'
                    }`}
                    strokeWidth={isSelected ? 2.5 : 2}
                  />
                ) : (
                  <span className="text-xl leading-none filter drop-shadow-sm select-none">
                    {cat.emoji}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] font-bold tracking-tight transition-colors ${
                  isSelected ? 'text-primary' : 'text-foreground/70 group-hover:text-foreground'
                }`}
                style={{ color: isSelected ? 'var(--athlon-primary)' : undefined }}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MarketCategoryPills;
