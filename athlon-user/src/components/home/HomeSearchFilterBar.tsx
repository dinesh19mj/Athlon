'use client';

import React from 'react';
import { Search, MapPin, X, ChevronDown, Sparkles, Filter } from 'lucide-react';
import { POPULAR_SPORTS } from '@/lib/utils/homeFilter';

interface HomeSearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSport: string;
  onSelectSport: (sport: string) => void;
  selectedPlace: string;
  onSelectPlace: (place: string) => void;
  availablePlaces: string[];
  totalResults?: number;
  onResetFilters?: () => void;
}

export default function HomeSearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedSport,
  onSelectSport,
  selectedPlace,
  onSelectPlace,
  availablePlaces = [],
  totalResults,
  onResetFilters,
}: HomeSearchFilterBarProps) {
  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedSport.toLowerCase() !== 'all' ||
    selectedPlace.toLowerCase() !== 'all';

  return (
    <div className="w-full space-y-3 select-none">
      {/* ── 1. Search Query & Place / Location Inputs (Always same horizontal line) ── */}
      <div className="flex items-center gap-2 w-full">
        {/* Search Input */}
        <div
          className="flex items-center flex-1 min-w-0 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl border transition-all backdrop-blur-md group focus-within:ring-1 focus-within:ring-primary shadow-inner"
          style={{
            backgroundColor: 'var(--athlon-input, var(--athlon-card))',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground/40 mr-2 sm:mr-2.5 shrink-0 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search sport, turf, event..."
            className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm focus:outline-none placeholder:text-foreground/40 text-foreground font-medium truncate"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 hover:text-foreground text-foreground/40 transition-colors shrink-0"
              title="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Place / City Selector */}
        <div
          className="flex items-center w-[125px] sm:w-[190px] md:w-[210px] shrink-0 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl border transition-all backdrop-blur-md shadow-inner relative group cursor-pointer"
          style={{
            backgroundColor: 'var(--athlon-input, var(--athlon-card))',
            borderColor:
              selectedPlace.toLowerCase() !== 'all'
                ? 'var(--athlon-primary)'
                : 'var(--athlon-border)',
          }}
        >
          <MapPin
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0 transition-colors ${selectedPlace.toLowerCase() !== 'all'
                ? 'text-primary'
                : 'text-foreground/40 group-hover:text-foreground/70'
              }`}
          />
          <select
            value={selectedPlace}
            onChange={(e) => onSelectPlace(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-semibold focus:outline-none text-foreground appearance-none cursor-pointer pr-4 sm:pr-5 truncate"
          >
            <option value="All" className="bg-background text-foreground font-normal">
              All
            </option>
            {availablePlaces.map((place) => (
              <option
                key={place}
                value={place}
                className="bg-background text-foreground font-normal"
              >
                {place}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground/40 absolute right-2 sm:right-3 pointer-events-none group-hover:text-foreground transition-colors" />
        </div>
      </div>

      {/* ── 2. Sports Filter Chips Track ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
        {POPULAR_SPORTS.map((sport) => {
          const isSelected = selectedSport.toLowerCase() === sport.toLowerCase();
          return (
            <button
              key={sport}
              onClick={() => onSelectSport(sport)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 border cursor-pointer active:scale-95 ${isSelected
                  ? 'bg-primary text-black border-primary shadow-[0_2px_12px_var(--athlon-primary-glow)] font-black'
                  : 'text-foreground/70 border-border hover:border-primary/40 hover:text-foreground bg-card/60 hover:bg-card'
                }`}
              style={{
                backgroundColor: isSelected ? 'var(--athlon-primary)' : 'var(--athlon-card)',
                borderColor: isSelected ? 'var(--athlon-primary)' : 'var(--athlon-border)',
              }}
            >
              {sport}
            </button>
          );
        })}

        {/* Clear All Reset Filter Button */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all ml-auto"
            title="Reset all filters"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* ── 3. Active Filters Counter / Feedback Tag ── */}
      {isFiltered && (
        <div className="flex items-center justify-between text-[11px] px-1 text-foreground/60">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-primary flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtered by:
            </span>
            {selectedSport.toLowerCase() !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold">
                Sport: {selectedSport}
              </span>
            )}
            {selectedPlace.toLowerCase() !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> {selectedPlace}
              </span>
            )}
            {searchQuery.trim() !== '' && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-foreground font-bold">
                "{searchQuery}"
              </span>
            )}
          </div>

          {typeof totalResults === 'number' && (
            <span className="font-mono text-[10px] text-foreground/40 font-bold shrink-0 ml-2">
              {totalResults} {totalResults === 1 ? 'match' : 'matches'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
