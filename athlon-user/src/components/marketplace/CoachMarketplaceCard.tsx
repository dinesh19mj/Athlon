'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  ChevronRight,
  Sparkles,
  Award,
  Calendar,
  Users,
  CheckCircle2,
  Dumbbell,
  UserCheck
} from 'lucide-react';
import { OrganizationService } from '@/lib/api/organization';

export interface CoachCardData {
  id?: string | number;
  uuid?: string;
  name: string;
  type?: string;
  logo?: string;
  banner?: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  profile?: {
    logo?: string;
    banner?: string;
    sportsOffered?: string;
    admissionStatus?: string;
    bio?: string;
    description?: string;
    city?: string;
    state?: string;
    address?: string;
    country?: string;
    establishedYear?: number;
    experienceYears?: number;
    certifications?: string[];
    specializations?: string[];
  };
  sportType?: string;
  tags?: string[];
  image?: string;
  experienceYears?: number;
  price?: string;
  onEnrollClick?: () => void;
}

interface CoachMarketplaceCardProps {
  coach: CoachCardData;
  className?: string;
  onEnrollClick?: () => void;
  variant?: 'card' | 'compact';
}

function getSportEmoji(sport: string): string {
  const s = (sport || '').toLowerCase();
  if (s.includes('badminton') || s.includes('shuttle')) return '🏸';
  if (s.includes('cricket')) return '🏏';
  if (s.includes('football') || s.includes('soccer')) return '⚽';
  if (s.includes('tennis') || s.includes('pickle')) return '🎾';
  if (s.includes('table tennis') || s.includes('tt') || s.includes('ping')) return '🏓';
  if (s.includes('basket')) return '🏀';
  if (s.includes('volley')) return '🏐';
  if (s.includes('swim')) return '🏊';
  if (s.includes('athletic') || s.includes('run')) return '🏃';
  if (s.includes('martial') || s.includes('karate') || s.includes('taekwondo') || s.includes('boxing') || s.includes('judo')) return '🥋';
  if (s.includes('chess')) return '♟️';
  return '⚡';
}

export const CoachMarketplaceCard: React.FC<CoachMarketplaceCardProps> = ({
  coach,
  className = '',
  onEnrollClick,
  variant = 'card',
}) => {
  const orgUuid = coach.uuid || coach.id || '';
  const name = coach.name || 'Coach Profile';

  // Extract logo / avatar
  const logoRaw = coach.profile?.logo || coach.logo;
  const logoUrl = logoRaw
    ? (logoRaw.startsWith('http') || logoRaw.startsWith('data:') || logoRaw.startsWith('blob:')
        ? logoRaw
        : OrganizationService.getLogoUrl(logoRaw))
    : '';

  // Extract cover
  const coverRaw = coach.profile?.banner || coach.banner || coach.image;
  const coverUrl = coverRaw
    ? (coverRaw.startsWith('http') || coverRaw.startsWith('data:') || coverRaw.startsWith('blob:')
        ? coverRaw
        : OrganizationService.getBannerUrl(coverRaw))
    : 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80';

  // Extract location
  const city = coach.profile?.city || coach.city;
  const stateOrCountry = coach.profile?.state || coach.state || coach.profile?.country || coach.country || '';
  const locationText = city ? `${city}${stateOrCountry ? `, ${stateOrCountry}` : ''}` : (coach.address || 'Coaching Hub');

  // Extract sports / specializations
  const rawSports = coach.profile?.sportsOffered;
  const sportsList: string[] = rawSports
    ? rawSports.split(',').map((s) => s.trim()).filter(Boolean)
    : coach.tags && coach.tags.length > 0
    ? coach.tags.slice(0, 3)
    : [coach.sportType || 'Badminton'];

  // Extract admission / availability status
  const admissionStatus = coach.profile?.admissionStatus || 'OPEN';
  const experienceYears = coach.profile?.experienceYears || coach.experienceYears;
  const establishedYear = coach.profile?.establishedYear;

  // ── COMPACT ROW VARIANT (Mobile-first list item) ──
  if (variant === 'compact') {
    const CompactContent = (
      <div
        className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 hover:border-primary/50 hover:shadow-md active:scale-[0.99] select-none p-3 flex items-center gap-3.5 w-full ${className}`}
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        {/* Left Thumbnail with Avatar Overlay */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-border/40 shadow-xs">
          <img src={coverUrl} alt={name} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {logoUrl ? (
            <div className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-lg overflow-hidden border border-white/40 shadow-sm bg-black/60">
              <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-lg bg-black/70 border border-primary/40 flex items-center justify-center text-primary">
              <Award className="w-3.5 h-3.5" />
            </div>
          )}
          {/* Status Dot */}
          <span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-black/60 ${
            admissionStatus === 'OPEN' ? 'bg-emerald-400 animate-pulse' : admissionStatus === 'LIMITED' ? 'bg-amber-400' : 'bg-rose-400'
          }`} />
        </div>

        {/* Middle Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1.5">
            <h4 className="text-xs sm:text-sm font-black text-foreground truncate group-hover:text-primary transition-colors tracking-tight">
              {name}
            </h4>
            {experienceYears ? (
              <span className="text-[9px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                {experienceYears}y exp
              </span>
            ) : null}
          </div>

          <p className="text-[10.5px] text-foreground/60 font-medium flex items-center gap-1 truncate">
            <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
            <span className="truncate">{locationText}</span>
          </p>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {sportsList.slice(0, 3).map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9.5px] font-bold tracking-tight"
              >
                <span>{getSportEmoji(s)}</span>
                <span>{s}</span>
              </span>
            ))}
            {sportsList.length > 3 && (
              <span className="text-[8.5px] font-bold text-foreground/40">
                +{sportsList.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Right Arrow Action */}
        <div className="w-8 h-8 rounded-xl bg-surface border border-border/80 flex items-center justify-center text-foreground/50 group-hover:text-primary group-hover:border-primary/40 group-hover:bg-primary/5 transition-all shrink-0">
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    );

    if (onEnrollClick) {
      return (
        <div onClick={onEnrollClick} className="cursor-pointer w-full block">
          {CompactContent}
        </div>
      );
    }
    const detailHref = orgUuid ? `/coaches/${orgUuid}` : '/coaches';
    return (
      <Link href={detailHref} className="block w-full cursor-pointer">
        {CompactContent}
      </Link>
    );
  }

  // ── STANDARD CARD VARIANT (Ultra-Modern Premium Athletic Card) ──
  const CardContent = (
    <div
      className={`group relative rounded-[20px] overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 select-none flex flex-col justify-between h-full w-full ${className}`}
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-border)',
      }}
    >
      {/* ── 1. CINEMATIC HERO COVER WITH DYNAMIC BADGES & BRAND IDENTITY ── */}
      <div className="relative h-36 sm:h-40 w-full overflow-hidden shrink-0 bg-neutral-900">
        {/* Cover Photo */}
        <img
          src={coverUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        {/* Gradient Scrims for Total Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent opacity-80" />

        {/* Top Floating Control Bar */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20">
          {/* Role Pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/60 text-primary border border-primary/30 backdrop-blur-md shadow-sm">
            <Award className="w-2.5 h-2.5 text-primary" />
            COACH
          </span>

          {/* Dynamic Availability Status Capsule */}
          {admissionStatus === 'OPEN' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9.5px] font-black tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sessions Open
            </span>
          ) : admissionStatus === 'LIMITED' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9.5px] font-black tracking-wide bg-amber-500/20 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Limited Slots
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9.5px] font-black tracking-wide bg-rose-500/20 text-rose-300 border border-rose-400/40 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Waitlist
            </span>
          )}
        </div>

        {/* Bottom Floating Identity Pod */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center gap-3 z-20">
          {/* Logo / Avatar Box */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border border-white/20 p-0.5 shadow-xl flex items-center justify-center shrink-0 bg-black/80 backdrop-blur-md group-hover:border-primary group-hover:scale-105 transition-all">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="w-full h-full object-cover rounded-[14px]" />
            ) : (
              <Award className="w-5 h-5 text-primary" />
            )}
          </div>

          {/* Coach Name & Location */}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-black text-white leading-tight truncate group-hover:text-primary transition-colors tracking-tight drop-shadow-md">
              {name}
            </h4>
            <p className="text-[11px] text-white/85 font-medium flex items-center gap-1 mt-0.5 truncate drop-shadow-sm">
              <MapPin className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">{locationText}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. CARD CONTENT BODY (Bento Clean Section) ── */}
      <div className="p-3.5 sm:p-4 space-y-3.5 flex-1 flex flex-col justify-between relative z-10">
        <div className="space-y-3">
          {/* Bento Stats / Facilities Strip */}
          <div className="flex items-center justify-between text-[11px] pb-1">
            <span className="font-extrabold uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 text-[9.5px]">
              <Dumbbell className="w-3.5 h-3.5 text-primary" />
              Specializations
            </span>

            <div className="flex items-center gap-1.5">
              {experienceYears ? (
                <span className="font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px]">
                  {experienceYears} Yrs Exp
                </span>
              ) : establishedYear ? (
                <span className="font-bold text-foreground/60 text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border">
                  Est. {establishedYear}
                </span>
              ) : (
                <span className="font-bold text-emerald-500 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Sports Chips with Emojis */}
          <div className="flex flex-wrap gap-1.5">
            {sportsList.slice(0, 3).map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/8 hover:bg-primary/15 text-foreground dark:text-white border border-primary/20 text-[10.5px] font-bold tracking-tight shadow-xs transition-colors"
              >
                <span className="text-xs leading-none">{getSportEmoji(s)}</span>
                <span>{s}</span>
              </span>
            ))}
            {sportsList.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-xl bg-surface hover:bg-surface-hover text-foreground/60 text-[10px] font-bold border border-border">
                +{sportsList.length - 3} More
              </span>
            )}
          </div>
        </div>

        {/* ── 3. CARD FOOTER ACTION ROW ── */}
        <div
          className="pt-3 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center gap-1.5 text-foreground/70 font-bold text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-primary/80 inline-block" />
            <span>
              {sportsList.length} {sportsList.length === 1 ? 'Discipline' : 'Disciplines'}
            </span>
          </div>

          {/* Sleek Action CTA Button */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white font-black text-[11px] transition-all duration-200 shadow-xs">
            <span>Explore</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );

  if (onEnrollClick) {
    return (
      <div onClick={onEnrollClick} className="cursor-pointer w-full h-full block">
        {CardContent}
      </div>
    );
  }

  const detailHref = orgUuid ? `/coaches/${orgUuid}` : '/coaches';

  return (
    <Link href={detailHref} className="block w-full h-full cursor-pointer">
      {CardContent}
    </Link>
  );
};
