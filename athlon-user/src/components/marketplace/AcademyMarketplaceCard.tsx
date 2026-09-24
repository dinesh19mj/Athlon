'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  ChevronRight,
  Building2,
  Sparkles,
  Award,
  Calendar,
  Users,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Dumbbell
} from 'lucide-react';
import { OrganizationService } from '@/lib/api/organization';
import { SportCardSkeletonBackground } from '@/components/common/SportCardSkeletonBackground';

export interface AcademyCardData {
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
    totalCourts?: number;
  };
  sportType?: string;
  tags?: string[];
  image?: string;
  courts?: number;
  openTiming?: string;
  price?: string;
  onEnrollClick?: () => void;
}

interface AcademyMarketplaceCardProps {
  academy: AcademyCardData;
  className?: string;
  onEnrollClick?: () => void;
  showEnrollModalOnCardClick?: boolean;
  variant?: 'card' | 'compact';
}

export const AcademyMarketplaceCard: React.FC<AcademyMarketplaceCardProps> = ({
  academy,
  className = '',
  onEnrollClick,
  variant = 'card',
}) => {
  const orgUuid = academy.uuid || academy.id || '';
  const name = academy.name || 'Academy Title';
  const type = academy.type || 'ACADEMY';

  // Extract logo
  const logoRaw = academy.profile?.logo || academy.logo;
  const logoUrl = logoRaw
    ? (logoRaw.startsWith('http') || logoRaw.startsWith('data:') || logoRaw.startsWith('blob:')
      ? logoRaw
      : OrganizationService.getLogoUrl(logoRaw))
    : '';

  // Extract cover
  const coverRaw = academy.profile?.banner || academy.banner || academy.image;
  const coverUrl = coverRaw
    ? (coverRaw.startsWith('http') || coverRaw.startsWith('data:') || coverRaw.startsWith('blob:')
      ? coverRaw
      : OrganizationService.getBannerUrl(coverRaw))
    : 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80';

  // Extract location
  const city = academy.profile?.city || academy.city;
  const stateOrCountry = academy.profile?.state || academy.state || academy.profile?.country || academy.country || '';
  const locationText = city ? `${city}${stateOrCountry ? `, ${stateOrCountry}` : ''}` : (academy.address || 'Training Facility');

  // Extract bio
  const bio = academy.profile?.bio || academy.profile?.description || academy.description || '';

  // Extract sports
  const rawSports = academy.profile?.sportsOffered;
  const sportsList: string[] = rawSports
    ? rawSports.split(',').map((s) => s.trim()).filter(Boolean)
    : academy.tags && academy.tags.length > 0
      ? academy.tags.slice(0, 3)
      : [academy.sportType || 'Badminton'];

  // Extract admission status
  const admissionStatus = academy.profile?.admissionStatus || 'OPEN';
  const establishedYear = academy.profile?.establishedYear;
  const courts = academy.profile?.totalCourts || academy.courts;

  // ── COMPACT ROW VARIANT (Mobile-first list item) ──
  if (variant === 'compact') {
    const CompactContent = (
      <div
        className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 hover:border-primary/40 active:scale-[0.99] select-none p-2.5 sm:p-3 flex items-center gap-3 w-full ${className}`}
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <SportCardSkeletonBackground sport={sportsList[0] || academy.sportType || 'BADMINTON'} showEnergyRail={false} />
        {/* Left Thumbnail with Logo Overlay */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-surface">
          <img src={coverUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          {logoUrl ? (
            <div className="absolute bottom-1 left-1 w-6 h-6 rounded-lg overflow-hidden border border-white/40 shadow-sm bg-black/60">
              <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="absolute bottom-1 left-1 w-5 h-5 rounded-lg bg-black/70 border border-primary/40 flex items-center justify-center text-primary">
              <Building2 className="w-3 h-3" />
            </div>
          )}
          {/* Status Dot */}
          <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
            admissionStatus === 'OPEN' ? 'bg-emerald-400 animate-pulse' : admissionStatus === 'LIMITED' ? 'bg-amber-400' : 'bg-rose-400'
          }`} />
        </div>

        {/* Middle Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1.5">
            <h4 className="text-xs sm:text-sm font-black text-foreground truncate group-hover:text-primary transition-colors tracking-tight">
              {name}
            </h4>
            {courts ? (
              <span className="text-[9px] font-bold text-primary px-1.5 py-0.5 rounded-md bg-primary/10 shrink-0">
                {courts} {courts === 1 ? 'Court' : 'Courts'}
              </span>
            ) : establishedYear ? (
              <span className="text-[9px] font-bold text-foreground/50 shrink-0">
                Est. {establishedYear}
              </span>
            ) : null}
          </div>

          <p className="text-[10px] text-foreground/60 font-semibold flex items-center gap-1 truncate">
            <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
            <span className="truncate">{locationText}</span>
          </p>

          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            {sportsList.slice(0, 3).map((s) => (
              <span
                key={s}
                className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold tracking-tight"
              >
                {s}
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
        <div className="w-7 h-7 rounded-xl bg-surface border border-border/80 flex items-center justify-center text-foreground/50 group-hover:text-primary group-hover:border-primary/40 transition-all shrink-0">
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
    const detailHref = orgUuid ? `/academies/${orgUuid}` : '/academies';
    return (
      <Link href={detailHref} className="block w-full cursor-pointer">
        {CompactContent}
      </Link>
    );
  }

  // ── STANDARD CARD VARIANT (Optimized for sleek mobile visual) ──
  const CardContent = (
    <div
      className={`group relative rounded-2xl sm:rounded-[18px] overflow-hidden border transition-all duration-300 hover:shadow-lg hover:shadow-primary/15 hover:-translate-y-0.5 select-none flex flex-col justify-between h-full w-full ${className}`}
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-border)',
      }}
    >
      {/* Sport-Specific Technical Wireframe Skeleton Background */}
      <SportCardSkeletonBackground sport={sportsList[0] || academy.sportType || 'BADMINTON'} />

      {/* ── TOP HERO COVER AREA (Tightened height for mobile) ── */}
      <div className="relative h-28 sm:h-36 w-full bg-surface-hover overflow-hidden z-10">
        {/* Cover Photo */}
        <img
          src={coverUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/25" />
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-[0.5px]" />

        {/* Top Badges Floating Bar */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10">
          {/* Institutional Type Pill */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[8.5px] font-black uppercase tracking-wider bg-black/70 text-primary border border-primary/30 backdrop-blur-md shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-primary" />
            {type}
          </span>

          {/* Dynamic Admissions Status Capsule */}
          {admissionStatus === 'OPEN' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[8.5px] font-black tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Admissions Open
            </span>
          ) : admissionStatus === 'LIMITED' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[8.5px] font-black tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Limited Slots
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[8.5px] font-black tracking-wide bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Waitlist
            </span>
          )}
        </div>

        {/* Overlaid Bottom Identity Pod */}
        <div className="absolute bottom-2 inset-x-2 flex items-center gap-2 z-10">
          {/* Logo Glass Box */}
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border border-primary/50 overflow-hidden shadow-lg flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-primary transition-all bg-black/70 backdrop-blur-md"
          >
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-primary" />
            )}
          </div>

          {/* Academy Name & Location */}
          <div className="min-w-0 flex-1 drop-shadow-md">
            <h4 className="text-xs sm:text-[13px] font-black text-white leading-tight truncate group-hover:text-primary transition-colors tracking-tight">
              {name}
            </h4>
            <p className="text-[9.5px] text-white/85 font-semibold flex items-center gap-0.5 mt-0.5 truncate">
              <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
              <span className="truncate">{locationText}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div className="p-2.5 sm:p-3.5 space-y-2 flex-1 flex flex-col justify-between relative z-10">
        <div>
          {/* Sports Trained Tags */}
          <div>
            <div className="flex items-center justify-between mb-1 text-[9px]">
              <span className="font-extrabold text-foreground/60 uppercase tracking-wider">
                Sports Trained
              </span>
              {courts ? (
                <span className="font-bold text-primary">
                  {courts} {courts === 1 ? 'Court' : 'Courts'}
                </span>
              ) : establishedYear ? (
                <span className="font-bold text-primary">
                  Est. {establishedYear}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-1">
              {sportsList.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9px] sm:text-[9.5px] font-bold tracking-tight shadow-xs hover:bg-primary/15 transition-colors"
                >
                  {s}
                </span>
              ))}
              {sportsList.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md bg-surface hover:bg-surface-hover text-foreground/60 text-[9px] font-bold border border-border">
                  +{sportsList.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── FOOTER ROW ── */}
        <div
          className="pt-2 border-t flex items-center justify-between text-xs"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center gap-1 text-foreground/60 font-bold text-[9.5px]">
            <Dumbbell className="w-3 h-3 text-primary shrink-0" />
            <span>{sportsList.length} {sportsList.length === 1 ? 'Sport' : 'Sports'}</span>
          </div>

          <div className="flex items-center gap-0.5 font-black text-[10px] sm:text-[11px] text-primary group-hover:translate-x-0.5 transition-transform">
            <span>Details</span>
            <ChevronRight className="w-3 h-3 text-primary" />
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

  const detailHref = orgUuid ? `/academies/${orgUuid}` : '/academies';

  return (
    <Link href={detailHref} className="block w-full h-full cursor-pointer">
      {CardContent}
    </Link>
  );
};
