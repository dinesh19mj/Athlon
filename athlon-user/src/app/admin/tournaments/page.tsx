'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Search,
  Calendar,
  MapPin,
  ExternalLink,
  RefreshCw,
  X,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { TournamentService, Tournament } from '@/lib/api/tournaments';

const SPORTS = ['ALL', 'BADMINTON', 'CRICKET', 'FOOTBALL', 'VOLLEYBALL', 'TENNIS', 'BASKETBALL'];

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('ALL');

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await TournamentService.getAll();
      if (res?.data) {
        setTournaments(res.data);
      }
    } catch (err) {
      console.error('Failed to load tournaments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch =
      !search.trim() ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location?.toLowerCase().includes(search.toLowerCase()) ||
      t.city?.toLowerCase().includes(search.toLowerCase());

    const matchesSport =
      sportFilter === 'ALL' || t.sport?.toUpperCase() === sportFilter;

    return matchesSearch && matchesSport;
  });

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          MOBILE VIEW (max-width: md) — WORKSPACE DESIGN LANGUAGE
          Adapts dynamically to Light/Dark Mode & User's Selected Theme
          ───────────────────────────────────────────────────────────── */}
      <div className="block md:hidden space-y-4 pb-10">
        {/* 1. Mobile Compact Header */}
        <div className="flex items-center justify-between px-0.5 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-xs"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-primary)',
              }}
            >
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1
                  className="text-base font-black uppercase tracking-tight truncate leading-none"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  Tournaments
                </h1>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0"
                  style={{
                    backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                    borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  {filteredTournaments.length}
                </span>
              </div>
              <p
                className="text-[10px] truncate mt-0.5"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Competitive platform events &amp; leagues
              </p>
            </div>
          </div>

          <button
            onClick={fetchTournaments}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xs shrink-0 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
            title="Refresh Tournaments"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
              style={{ color: 'var(--athlon-primary)' }}
            />
            <span>Sync</span>
          </button>
        </div>

        {/* 2. Mobile Search & Sport Pills */}
        <div
          className="p-3 rounded-2xl border space-y-2.5 shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Search Field */}
          <form onSubmit={(e) => e.preventDefault()} className="relative w-full">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--athlon-text-muted)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or location..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs border focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:opacity-75"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </form>

          {/* Sport Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none">
            {SPORTS.map((sport) => {
              const isActive = sportFilter === sport;
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setSportFilter(sport)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-all shrink-0"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-primary)',
                          color: 'var(--athlon-primary)',
                        }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: 'var(--athlon-border)',
                          color: 'var(--athlon-text-muted)',
                        }
                  }
                >
                  {sport}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Mobile Tournament Cards List */}
        <div className="space-y-2.5">
          {loading ? (
            <div
              className="p-8 rounded-2xl border text-center space-y-2"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <RefreshCw
                className="w-5 h-5 mx-auto animate-spin"
                style={{ color: 'var(--athlon-primary)' }}
              />
              <p
                className="text-xs font-semibold"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Loading tournaments...
              </p>
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div
              className="p-8 rounded-2xl border text-center space-y-2"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <Trophy
                className="w-6 h-6 mx-auto opacity-40"
                style={{ color: 'var(--athlon-text-muted)' }}
              />
              <p
                className="text-xs font-semibold"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                No tournaments found matching criteria.
              </p>
            </div>
          ) : (
            filteredTournaments.map((t) => (
              <div
                key={t.tournamentUuid || t.tournamentId}
                className="p-3.5 rounded-2xl border space-y-3 shadow-xs transition-all"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                {/* Card Header: Icon, Name & Sport */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 font-bold"
                      style={{
                        backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                        borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                        color: 'var(--athlon-primary)',
                      }}
                    >
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="font-bold text-xs truncate leading-tight"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        {t.name}
                      </div>
                      <div
                        className="text-[9.5px] font-mono truncate mt-0.5"
                        style={{ color: 'var(--athlon-text-muted)' }}
                      >
                        ID #{t.tournamentId}
                      </div>
                    </div>
                  </div>

                  {/* Sport Badge */}
                  <span
                    className="px-2 py-0.5 rounded-full border text-[9.5px] font-black uppercase shrink-0"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-primary)',
                    }}
                  >
                    {t.sport || 'SPORT'}
                  </span>
                </div>

                {/* Card Meta Row: Format, Category, Date, Location */}
                <div
                  className="pt-2 border-t space-y-1.5 text-[10px]"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="font-semibold truncate"
                      style={{ color: 'var(--athlon-text)' }}
                    >
                      {t.matchFormat || t.tournamentType || 'Standard'}
                      <span
                        className="font-normal ml-1"
                        style={{ color: 'var(--athlon-text-muted)' }}
                      >
                        • {t.category || 'Open'}
                      </span>
                    </div>

                    <div
                      className="font-black shrink-0"
                      style={{ color: 'var(--athlon-primary)' }}
                    >
                      {t.registrationFees ? `₹${t.registrationFees}` : 'Free Entry'}
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between gap-2 text-[9.5px]"
                    style={{ color: 'var(--athlon-text-muted)' }}
                  >
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">
                        {t.city || t.district || t.location || 'Regional'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Calendar className="w-2.5 h-2.5 shrink-0" />
                      <span>
                        {t.startDate ? new Date(t.startDate).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Row */}
                <div
                  className="pt-2 border-t flex items-center justify-end"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <Link
                    href={`/tournaments/${t.tournamentUuid || t.tournamentId}`}
                    target="_blank"
                    className="w-full py-1.5 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-xs"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  >
                    <span>Inspect Tournament</span>
                    <ExternalLink className="w-3 h-3" style={{ color: 'var(--athlon-primary)' }} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DESKTOP VIEW (min-width: md) — UNCHANGED DESKTOP DESIGN
          Dynamically styled with Athlon theme tokens
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1
                className="text-2xl font-black uppercase tracking-tight"
                style={{ color: 'var(--athlon-text)' }}
              >
                Platform Tournaments
              </h1>
              <span
                className="px-2 py-0.5 rounded-full border text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                  borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                  color: 'var(--athlon-primary)',
                }}
              >
                {filteredTournaments.length} Tournaments
              </span>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--athlon-text-muted)' }}>
              Platform-wide oversight of active, upcoming, and completed competitive events.
            </p>
          </div>

          <button
            onClick={fetchTournaments}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all self-start sm:self-auto disabled:opacity-50 hover:opacity-90"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
              style={{ color: 'var(--athlon-primary)' }}
            />
            Refresh
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div
          className="space-y-3 p-4 rounded-2xl border"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--athlon-text-muted)' }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by tournament name or location..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text)',
                }}
              />
            </div>
          </div>

          {/* Sport Pills */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {SPORTS.map((sport) => {
              const isActive = sportFilter === sport;
              return (
                <button
                  key={sport}
                  onClick={() => setSportFilter(sport)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--athlon-primary)',
                          borderColor: 'var(--athlon-primary)',
                          color: '#000000',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        }
                      : {
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                          color: 'var(--athlon-text-muted)',
                        }
                  }
                >
                  {sport}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tournaments Grid / Table */}
        <div
          className="rounded-2xl border overflow-hidden shadow-xl"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr
                  className="border-b uppercase font-black tracking-wider text-[11px]"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text-muted)',
                  }}
                >
                  <th className="py-3.5 px-4">Tournament</th>
                  <th className="py-3.5 px-4">Sport</th>
                  <th className="py-3.5 px-4">Format / Category</th>
                  <th className="py-3.5 px-4">Schedule</th>
                  <th className="py-3.5 px-4">Registration</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <RefreshCw
                        className="w-5 h-5 mx-auto mb-2 animate-spin"
                        style={{ color: 'var(--athlon-primary)' }}
                      />
                      Loading platform tournaments...
                    </td>
                  </tr>
                ) : filteredTournaments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      No tournaments found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTournaments.map((t) => (
                    <tr
                      key={t.tournamentUuid || t.tournamentId}
                      className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 font-bold"
                            style={{
                              backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                              borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                              color: 'var(--athlon-primary)',
                            }}
                          >
                            <Trophy className="w-4 h-4" />
                          </div>
                          <div>
                            <div
                              className="font-bold leading-tight line-clamp-1"
                              style={{ color: 'var(--athlon-text)' }}
                            >
                              {t.name}
                            </div>
                            <div
                              className="text-[10px] font-mono mt-0.5 truncate max-w-[160px]"
                              style={{ color: 'var(--athlon-text-muted)' }}
                            >
                              ID #{t.tournamentId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sport */}
                      <td className="py-3.5 px-4">
                        <span
                          className="px-2 py-0.5 rounded-full border text-[10px] font-black uppercase"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                            color: 'var(--athlon-primary)',
                          }}
                        >
                          {t.sport || 'SPORT'}
                        </span>
                      </td>

                      {/* Format / Category */}
                      <td className="py-3.5 px-4">
                        <div
                          className="font-semibold"
                          style={{ color: 'var(--athlon-text)' }}
                        >
                          {t.matchFormat || t.tournamentType || 'Standard'}
                        </div>
                        <div
                          className="text-[10px] mt-0.5"
                          style={{ color: 'var(--athlon-text-muted)' }}
                        >
                          {t.category || 'Open Category'}
                        </div>
                      </td>

                      {/* Dates */}
                      <td
                        className="py-3.5 px-4"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Calendar
                            className="w-3 h-3"
                            style={{ color: 'var(--athlon-text-muted)' }}
                          />
                          <span>
                            {t.startDate ? new Date(t.startDate).toLocaleDateString() : 'TBD'}
                          </span>
                        </div>
                      </td>

                      {/* Registration */}
                      <td className="py-3.5 px-4">
                        <div
                          className="font-bold"
                          style={{ color: 'var(--athlon-text)' }}
                        >
                          {t.registrationFees ? `₹${t.registrationFees}` : 'Free Entry'}
                        </div>
                        <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                          {t.registrationMode || 'Open'}
                        </div>
                      </td>

                      {/* Location */}
                      <td
                        className="py-3.5 px-4 text-[11px]"
                        style={{ color: 'var(--athlon-text-muted)' }}
                      >
                        <div className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>
                            {t.city || t.district || t.location || 'Online / Regional'}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/tournaments/${t.tournamentUuid || t.tournamentId}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all hover:opacity-80"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                            color: 'var(--athlon-text)',
                          }}
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" style={{ color: 'var(--athlon-primary)' }} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
