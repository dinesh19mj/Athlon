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
}

export const CoachMarketplaceCard: React.FC<CoachMarketplaceCardProps> = ({
  coach,
  className = '',
  onEnrollClick,
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

  const CardContent = (
    <div
      className={`group relative rounded-[26px] overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-1 select-none flex flex-col justify-between h-full w-full ${className}`}
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-border)',
      }}
    >
      {/* Top Gradient Accent Trim */}
      <div className="h-[3px] w-full bg-gradient-to-r from-primary via-emerald-400 to-primary/30" />

      {/* ── TOP HERO COVER AREA ── */}
      <div className="relative h-44 w-full bg-surface-hover overflow-hidden">
        {/* Cover Photo */}
        <img
          src={coverUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/30" />
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-[0.5px]" />

        {/* Top Badges Floating Bar */}
        <div className="absolute top-3 inset-x-3.5 flex items-center justify-between z-10">
          {/* Institutional / Role Type Pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-primary border border-primary/30 backdrop-blur-md shadow-lg">
            <Award className="w-3 h-3 text-primary" />
            COACH
          </span>

          {/* Dynamic Availability Status Capsule */}
          {admissionStatus === 'OPEN' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Sessions Open
            </span>
          ) : admissionStatus === 'LIMITED' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Limited Slots
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Waitlist
            </span>
          )}
        </div>

        {/* Overlaid Bottom Identity Pod */}
        <div className="absolute bottom-3 inset-x-3.5 flex items-center gap-3 z-10">
          {/* Logo / Coach Photo Glass Box */}
          <div
            className="w-12 h-12 rounded-2xl border-2 border-primary/50 overflow-hidden shadow-2xl flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-primary transition-all bg-black/70 backdrop-blur-md"
          >
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <Award className="w-6 h-6 text-primary" />
            )}
          </div>

          {/* Coach Name & Location */}
          <div className="min-w-0 flex-1 drop-shadow-md">
            <h4 className="text-base font-black text-white leading-tight truncate group-hover:text-primary transition-colors tracking-tight">
              {name}
            </h4>
            <p className="text-[11px] text-white/85 font-semibold flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{locationText}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Sports & Specializations Tags Bento */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">
                Sports Trained
              </span>
              {experienceYears ? (
                <span className="text-[10px] font-bold text-primary">
                  {experienceYears} Yrs Exp
                </span>
              ) : establishedYear ? (
                <span className="text-[10px] font-bold text-primary">
                  Est. {establishedYear}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-primary">
                  Verified Coach
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {sportsList.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/25 text-[11px] font-bold tracking-tight shadow-sm hover:bg-primary/15 transition-colors"
                >
                  {s}
                </span>
              ))}
              {sportsList.length > 4 && (
                <span className="px-2 py-1 rounded-xl bg-surface hover:bg-surface-hover text-text-secondary text-[11px] font-bold border border-border">
                  +{sportsList.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── FOOTER ROW ── */}
        <div
          className="pt-3 border-t flex items-center justify-between text-xs"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center gap-1.5 text-text-secondary font-bold text-[11px]">
            <Dumbbell className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{sportsList.length} {sportsList.length === 1 ? 'Sport' : 'Sports'}</span>
          </div>

          <div className="flex items-center gap-1 font-black text-xs text-primary group-hover:translate-x-0.5 transition-transform">
            <span>Details</span>
            <ChevronRight className="w-4 h-4 text-primary" />
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
