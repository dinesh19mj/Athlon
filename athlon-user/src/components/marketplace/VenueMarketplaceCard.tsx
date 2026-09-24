'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  ChevronRight,
  ChevronDown,
  Clock,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { VenueDto } from '@/lib/api/venue';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';
import { SportCardSkeletonBackground } from '@/components/common/SportCardSkeletonBackground';

export interface VenueCardData {
  id?: string | number;
  venueId?: number;
  venueUuid?: string;
  uuid?: string;
  name: string;
  venueType?: string;
  type?: string;
  description?: string;
  addressLine1?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  totalFacilities?: number;
  courts?: number;
  facilities?: any[];
  bookingEnabled?: boolean;
  images?: { imageUrl: string; isCover?: boolean }[];
  image?: string;
  banner?: string;
  logo?: string;
  amenities?: { id?: number; amenityName: string }[] | string[];
  operatingHours?: { dayOfWeek: string; openingTime: string; closingTime: string; isClosed?: boolean }[];
  sportsOffered?: string[];
  startingPrice?: string | number;
  slotsToday?: string[];
  onBookClick?: () => void;
}

interface VenueMarketplaceCardProps {
  venue: VenueCardData | VenueDto | any;
  className?: string;
  onBookClick?: () => void;
  variant?: 'card' | 'compact';
}

const SPORT_COVERS: Record<string, string> = {
  badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
  football: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
  tennis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80',
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
  pickleball: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=1200&q=80',
  squash: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
  table_tennis: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80',
  swimming: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
};

function getSportCover(sport?: string): string {
  if (!sport) return SPORT_COVERS.default;
  const s = sport.toLowerCase().trim();
  if (s.includes('badminton')) return SPORT_COVERS.badminton;
  if (s.includes('foot') || s.includes('soccer') || s.includes('turf')) return SPORT_COVERS.football;
  if (s.includes('cricket')) return SPORT_COVERS.cricket;
  if (s.includes('tennis') && !s.includes('table')) return SPORT_COVERS.tennis;
  if (s.includes('basket')) return SPORT_COVERS.basketball;
  if (s.includes('pickle')) return SPORT_COVERS.pickleball;
  if (s.includes('squash') || s.includes('padel')) return SPORT_COVERS.squash;
  if (s.includes('table') || s.includes('tt')) return SPORT_COVERS.table_tennis;
  if (s.includes('swim')) return SPORT_COVERS.swimming;
  return SPORT_COVERS.default;
}

function getSportEmoji(sport?: string): string {
  if (!sport) return '⚡';
  const s = sport.toLowerCase();
  if (s.includes('badminton')) return '🏸';
  if (s.includes('foot') || s.includes('soccer') || s.includes('turf')) return '⚽';
  if (s.includes('cricket')) return '🏏';
  if (s.includes('tennis')) return '🎾';
  if (s.includes('basket')) return '🏀';
  if (s.includes('pickle')) return '🏓';
  if (s.includes('squash') || s.includes('padel')) return '🎾';
  if (s.includes('table') || s.includes('tt')) return '🏓';
  if (s.includes('swim')) return '🏊';
  return '⚡';
}

function formatSlotTime12H(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let hour = parseInt(parts[0], 10);
  const minute = parts[1] || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
}

export const VenueMarketplaceCard: React.FC<VenueMarketplaceCardProps> = ({
  venue,
  className = '',
  onBookClick,
  variant = 'card',
}) => {
  const router = useRouter();
  const [showAmenities, setShowAmenities] = useState(false);

  const venueUuid = venue.venueUuid || venue.uuid || String(venue.venueId || venue.id || '');
  const name = venue.name || 'Sports Arena';

  // Extract sports offered
  const sportsList: string[] = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(venue.sportsOffered)) {
      venue.sportsOffered.forEach((s: any) => {
        if (typeof s === 'string') list.push(s);
        else if (s?.sportName) list.push(s.sportName);
      });
    } else if (typeof venue.sportsOffered === 'string') {
      venue.sportsOffered.split(',').forEach((s: string) => list.push(s.trim()));
    }

    if (Array.isArray(venue.facilities)) {
      venue.facilities.forEach((f: any) => {
        if (f.sportName) list.push(f.sportName);
        if (f.sport) list.push(f.sport);
        if (f.name && (f.name.toLowerCase().includes('badminton') || f.name.toLowerCase().includes('cricket') || f.name.toLowerCase().includes('football'))) {
          list.push(f.name);
        }
        if (Array.isArray(f.sports)) {
          f.sports.forEach((sp: any) => {
            if (typeof sp === 'string') list.push(sp);
            else if (sp?.sportName) list.push(sp.sportName);
          });
        }
      });
    }

    if (venue.sport) list.push(venue.sport);
    if (venue.sportType) list.push(venue.sportType);

    const deduped = Array.from(new Set(list.filter(Boolean)));
    return deduped.length > 0 ? deduped : ['Badminton'];
  }, [venue]);

  const primarySport = sportsList[0] || 'Badminton';
  const primaryEmoji = getSportEmoji(primarySport);

  // Extract cover photo
  const coverUrl = useMemo(() => {
    if (venue.images && venue.images.length > 0) {
      const cover = venue.images.find((img: any) => img.isCover) || venue.images[0];
      return cover.imageUrl;
    }
    if (venue.image) return venue.image;
    if (venue.banner) return venue.banner;
    return getSportCover(primarySport);
  }, [venue, primarySport]);

  // Location details
  const city = venue.city || venue.state || '';
  const address = venue.addressLine1 || venue.address || '';
  const locationText = address ? (city ? `${address}, ${city}` : address) : (city || 'Sports Complex');

  // Facilities & Court count
  const facilityCount = useMemo(() => {
    if (venue.totalFacilities) return venue.totalFacilities;
    if (venue.courts) return venue.courts;
    if (Array.isArray(venue.facilities) && venue.facilities.length > 0) return venue.facilities.length;
    return 2;
  }, [venue]);

  // Operating Timing & Slot Times
  const { timingText, openSlots } = useMemo(() => {
    let openStr = '06:00 AM – 11:00 PM';
    let startHour = 6;
    let endHour = 23;

    if (venue.operatingHours && venue.operatingHours.length > 0) {
      const firstOpen = venue.operatingHours.find((h: any) => !h.isClosed) || venue.operatingHours[0];
      if (firstOpen?.openingTime && firstOpen?.closingTime) {
        const startH = parseInt(firstOpen.openingTime.split(':')[0], 10);
        const endH = parseInt(firstOpen.closingTime.split(':')[0], 10);
        if (!isNaN(startH)) startHour = startH;
        if (!isNaN(endH)) endHour = endH;
        openStr = `${formatSlotTime12H(firstOpen.openingTime)} – ${formatSlotTime12H(firstOpen.closingTime)}`;
      }
    }

    if (venue.slotsToday && Array.isArray(venue.slotsToday) && venue.slotsToday.length > 0) {
      return { timingText: openStr, openSlots: venue.slotsToday };
    }

    // Generate standard hourly slots for today
    const generated: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      let hour12 = h % 12;
      if (hour12 === 0) hour12 = 12;
      generated.push(`${String(hour12).padStart(2, '0')}:00 ${ampm}`);
    }

    return {
      timingText: openStr,
      openSlots: generated.length > 0 ? generated : ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '04:00 PM', '05:00 PM', '06:00 PM'],
    };
  }, [venue]);

  // Amenities list
  const amenitiesList: string[] = useMemo(() => {
    const raw = venue.amenities || [];
    const list = raw
      .map((a: any) => (typeof a === 'string' ? a : a.amenityName || ''))
      .filter(Boolean);
    return list.length > 0
      ? list
      : ['Floodlights', 'Drinking Water', 'Parking', 'Changing Rooms'];
  }, [venue]);

  // Starting Price
  const startingPriceText = useMemo(() => {
    if (venue.startingPrice) {
      return String(venue.startingPrice).startsWith('₹') ? venue.startingPrice : `₹${venue.startingPrice}/hr`;
    }
    if (Array.isArray(venue.facilities) && venue.facilities.length > 0) {
      const prices: number[] = [];
      venue.facilities.forEach((f: any) => {
        if (Array.isArray(f.pricingRules)) {
          f.pricingRules.forEach((p: any) => {
            if (p.price && !isNaN(p.price)) prices.push(Number(p.price));
          });
        }
      });
      if (prices.length > 0) {
        return `₹${Math.min(...prices)}/hr`;
      }
    }
    return '₹400/hr';
  }, [venue]);

  const handleSlotClick = (e: React.MouseEvent, slotTime: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBookClick) {
      onBookClick();
      return;
    }
    const targetUrl = venueUuid ? `/venues/${venueUuid}?slot=${encodeURIComponent(slotTime)}` : '/venues';
    router.push(targetUrl);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (onBookClick) {
      e.preventDefault();
      onBookClick();
    }
  };

  const detailHref = venueUuid ? `/venues/${venueUuid}` : '/venues';

  // ── COMPACT ROW VARIANT (Mobile-first list item) ──
  if (variant === 'compact') {
    return (
      <Link
        href={detailHref}
        onClick={handleCardClick}
        className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 hover:border-primary/50 active:scale-[0.99] select-none p-2.5 sm:p-3 flex items-center gap-3 w-full bg-card border-border/80 hover:shadow-md ${className}`}
      >
        <SportCardSkeletonBackground sport={primarySport} showEnergyRail={false} />

        {/* Left Thumbnail with Logo Overlay */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-surface z-10">
          <img
            src={coverUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          {venue.logo ? (
            <div className="absolute bottom-1 left-1 w-6 h-6 rounded-lg overflow-hidden border border-white/40 shadow-sm bg-black/60">
              <img src={venue.logo} alt={name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="absolute bottom-1 left-1 w-5 h-5 rounded-lg bg-black/70 border border-primary/40 flex items-center justify-center text-primary">
              <Building2 className="w-3 h-3" />
            </div>
          )}

          {/* Instant slot active badge */}
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
        </div>

        {/* Middle Details */}
        <div className="min-w-0 flex-1 space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <span>{primaryEmoji}</span>
              <span>{primarySport}</span>
            </span>
            <span className="text-[10px] text-foreground/50 font-bold flex items-center gap-0.5">
              <Layers className="w-2.5 h-2.5 text-primary" />
              {facilityCount} {facilityCount === 1 ? 'Court' : 'Courts'}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
            {name}
          </h4>

          <p className="text-[10px] text-foreground/60 font-semibold flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">{locationText}</span>
          </p>

          <div className="flex items-center gap-2 text-[9.5px] font-mono text-foreground/70">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {timingText}
            </span>
          </div>
        </div>

        {/* Right Price & Action Column */}
        <div className="shrink-0 flex flex-col items-end justify-between self-stretch py-0.5 pl-1 relative z-10">
          <div className="text-right">
            <span className="text-[8px] font-bold text-foreground/45 uppercase tracking-wider block">From</span>
            <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono tracking-tight">{startingPriceText}</span>
          </div>

          <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all shadow-xs">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={detailHref}
      onClick={handleCardClick}
      className={`group relative rounded-[18px] overflow-hidden border border-border/80 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 select-none flex flex-col justify-between h-full w-full ${className}`}
    >
      {/* Sport Blueprint Skeleton Background */}
      <SportCardSkeletonBackground sport={primarySport} />

      {/* Top Gradient Accent Trim */}
      <div className="h-[2px] w-full bg-gradient-to-r from-emerald-400 via-primary to-teal-400 relative z-10" />

      {/* ── TOP HERO COVER AREA ── */}
      <div className="relative h-32 sm:h-40 w-full bg-surface-hover overflow-hidden z-10">
        {/* Cover Photo */}
        <img
          src={coverUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-[0.5px]" />

        {/* Top Badges Floating Bar */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          {/* Structure / Sport Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-black/70 text-primary border border-primary/40 backdrop-blur-md shadow-sm">
            <span>{primaryEmoji}</span>
            <span>{primarySport}</span>
          </span>

          {/* Instant Booking Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-wide bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            Instant Booking
          </span>
        </div>

        {/* Overlaid Bottom Identity Pod */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center gap-2.5 z-10">
          {/* Logo / Venue Icon Box */}
          <div className="w-9 h-9 rounded-xl border border-emerald-400/50 overflow-hidden shadow-lg flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-primary transition-all bg-black/80 backdrop-blur-md">
            {venue.logo ? (
              <img src={venue.logo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <Athlon3DIcon type="facilities" size={20} active={true} />
            )}
          </div>

          {/* Venue Name & Location */}
          <div className="min-w-0 flex-1 drop-shadow-md">
            <h4 className="text-xs sm:text-[13px] font-black text-white leading-tight truncate group-hover:text-primary transition-colors tracking-tight">
              {name}
            </h4>
            <p className="text-[10px] text-white/85 font-semibold flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">{locationText}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between relative z-10">
        <div className="space-y-2">
          {/* Facilities & Timing Meta Row */}
          <div className="flex items-center justify-between text-[10px] font-bold text-foreground/70 pb-1.5 border-b border-border/70">
            <div className="flex items-center gap-1 text-foreground font-extrabold">
              <Layers className="w-3 h-3 text-primary" />
              <span>{facilityCount} {facilityCount === 1 ? 'Court / Turf' : 'Courts & Turfs'}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-foreground/80 font-bold">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{timingText}</span>
            </div>
          </div>

          {/* ── OPEN SLOTS TODAY SECTION (From Mockup Reference) ── */}
          <div className="rounded-lg bg-surface/50 border border-border/70 p-2 space-y-1 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-emerald-400">
                <Clock className="w-3 h-3 shrink-0 stroke-[2.5]" />
                <span className="text-[9.5px] font-black uppercase tracking-wider">
                  OPEN SLOTS TODAY:
                </span>
              </div>
              <span className="text-[9.5px] font-extrabold text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                {facilityCount} {facilityCount === 1 ? 'Court' : 'Courts'}
              </span>
            </div>

            {/* Horizontal Scrollable Time Slot Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pt-0.5 pb-0.5 scrollbar-none no-scrollbar">
              {openSlots.slice(0, 8).map((slotTime: string, idx: number) => (
                <button
                  key={`${slotTime}-${idx}`}
                  type="button"
                  onClick={(e) => handleSlotClick(e, slotTime)}
                  className="px-2 py-0.5 rounded-full bg-background/80 hover:bg-emerald-500/25 active:bg-emerald-500/40 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 text-[9.5px] font-mono font-bold tracking-tight whitespace-nowrap transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  {slotTime}
                </button>
              ))}
              {openSlots.length > 8 && (
                <span className="px-1.5 py-0.5 rounded-full bg-surface text-[9px] font-mono font-bold text-foreground/60 shrink-0 border border-border/60">
                  +{openSlots.length - 8} more
                </span>
              )}
            </div>
          </div>

          {/* ── EXPANDABLE COURT AMENITIES & FEATURES ── */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAmenities((prev) => !prev);
              }}
              className="w-full flex items-center justify-between px-2 py-1 rounded-lg bg-surface/40 hover:bg-surface/80 border border-border/60 hover:border-primary/40 text-[10px] font-bold text-foreground/75 transition-all hover:text-foreground cursor-pointer group/amenity"
            >
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="tracking-tight">Court Amenities &amp; Features</span>
              </div>
              <div className="flex items-center gap-0.5 text-[9.5px] text-primary font-black">
                <span>{amenitiesList.length} Features</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 group-hover/amenity:translate-y-0.5 ${
                    showAmenities ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Expanded Amenities View */}
            {showAmenities && (
              <div
                className="flex flex-wrap gap-1 pt-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {amenitiesList.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/25 text-[9.5px] font-bold tracking-tight shadow-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER ROW ── */}
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <span className="text-[8.5px] font-bold text-foreground/50 uppercase tracking-wider">Slots From</span>
            <span className="text-xs sm:text-[13px] font-black text-emerald-400 font-mono tracking-tight">{startingPriceText}</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-black text-xs group-hover:brightness-110 shadow-sm shadow-primary/25 transition-all">
            <span>Book Court</span>
            <ChevronRight className="w-3 h-3 stroke-[3] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};
