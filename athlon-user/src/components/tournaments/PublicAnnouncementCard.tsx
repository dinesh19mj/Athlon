'use client';

import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Sparkles,
  Trophy,
  Share2,
  Megaphone,
  CheckCircle2,
  Lock,
  ChevronRight,
  Clock,
  Users,
} from 'lucide-react';
import { TournamentAnnouncement, getAnnouncementPosterUrl } from '@/lib/api/tournamentAnnouncement';
import { SportCardSkeletonBackground } from '@/components/common/SportCardSkeletonBackground';

interface PublicAnnouncementCardProps {
  announcement: TournamentAnnouncement;
}

export function PublicAnnouncementCard({ announcement }: PublicAnnouncementCardProps) {
  const formatDates = () => {
    try {
      if (!announcement.startDate) return 'Dates TBA';
      const s = new Date(announcement.startDate);
      const e = announcement.endDate ? new Date(announcement.endDate) : null;
      if (isNaN(s.getTime())) return 'Dates TBA';

      if (!e || isNaN(e.getTime()) || s.toDateString() === e.toDateString()) {
        return s.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      }

      const sStr = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const eStr = e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${sStr} – ${eStr}`;
    } catch {
      return 'Dates TBA';
    }
  };

  const formatDeadline = () => {
    if (!announcement.registrationDeadline) return null;
    try {
      const d = new Date(announcement.registrationDeadline);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return null;
    }
  };

  const formatLocation = () => {
    const parts: string[] = [];
    if (announcement.venueName && announcement.venueName.trim()) parts.push(announcement.venueName.trim());
    if (announcement.city && announcement.city.trim() && !parts.some((p) => p.toLowerCase().includes(announcement.city!.toLowerCase()))) {
      parts.push(announcement.city.trim());
    }
    if (announcement.state && announcement.state.trim() && !parts.some((p) => p.toLowerCase().includes(announcement.state!.toLowerCase()))) {
      parts.push(announcement.state.trim());
    }
    return parts.length > 0 ? parts.join(', ') : 'Venue TBA';
  };

  const posterSrc = announcement.posterUrl ? getAnnouncementPosterUrl(announcement.posterUrl) : null;
  const isClosed = announcement.status === 'CLOSED' || announcement.status === 'REGISTRATION_CLOSED' || announcement.isActive === false;
  const deadlineStr = formatDeadline();

  const categories = (announcement.category || '')
    .split(/[,•]/)
    .map((c) => c.trim())
    .filter(Boolean);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/tournaments/announcements/${announcement.uuid}`;
    if (navigator.share) {
      navigator.share({
        title: announcement.title,
        text: `Tournament Announcement: ${announcement.title}`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert('Announcement link copied to clipboard!');
    }
  };

  return (
    <Link
      href={`/tournaments/announcements/${announcement.uuid}`}
      className="group block h-full select-none"
    >
      <div
        className="relative rounded-[18px] overflow-hidden shadow-sm border h-full flex flex-col justify-between transition-all duration-300 group-hover:scale-[1.01] group-hover:border-primary/50"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        {/* Sport-Specific Wireframe Skeleton Background */}
        <SportCardSkeletonBackground sport={announcement.sport} />

        <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between relative z-10">
          {/* Header Row: Badges, Fee, Share */}
          <div className="flex items-center justify-between gap-2 border-b border-foreground/5 pb-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {/* Flyer Tag */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/25 shrink-0">
                <Megaphone className="w-2.5 h-2.5" />
                Flyer
              </span>

              {/* Sport Pill */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-primary" />
                {announcement.sport || 'Sports'}
              </span>

              {/* Status Badge */}
              {isClosed ? (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-foreground/10 text-foreground/60 border border-foreground/20 shrink-0">
                  <Lock className="w-2.5 h-2.5" /> Closed
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Open
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Fee Tag */}
              <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-black tracking-tight text-primary bg-primary/10 border border-primary/25 shrink-0">
                {announcement.entryFee ? announcement.entryFee : 'FREE / TBA'}
              </span>

              {/* Share button */}
              <button
                type="button"
                onClick={handleShare}
                title="Share flyer"
                className="p-1 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <Share2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Optional Poster Thumbnail Preview Banner if poster exists */}
          {posterSrc && (
            <div className="relative w-full h-28 rounded-xl overflow-hidden bg-muted/40 border border-foreground/5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={posterSrc}
                alt={announcement.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              {announcement.prizePool && (
                <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-primary/90 backdrop-blur-sm text-[9.5px] font-black text-white shadow">
                  🏆 {announcement.prizePool}
                </div>
              )}
            </div>
          )}

          {/* Announcement Title & Location */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-amber-500/20 transition-all text-amber-500">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="text-xs sm:text-[13px] font-black text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1 leading-snug"
                title={announcement.title}
              >
                {announcement.title}
              </h3>
              <div className="flex items-center gap-1 text-[9.5px] font-bold text-foreground/45 truncate mt-0.5" title={formatLocation()}>
                <MapPin className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{formatLocation()}</span>
              </div>
            </div>
          </div>

          {/* Bento Detail Bar: Date, Match Format, Categories */}
          <div
            className="rounded-lg p-2.5 border space-y-1.5 text-[10.5px]"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border-subtle)',
            }}
          >
            {/* Dates & Match Format */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-foreground/80 font-bold text-[10px] min-w-0">
                <Calendar className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{formatDates()}</span>
              </div>

              {announcement.matchFormat && (
                <div className="flex items-center gap-1 shrink-0">
                  <Users className="w-3 h-3 text-foreground/40 shrink-0" />
                  <span className="text-[8.5px] font-bold text-foreground/60 truncate max-w-[110px]">
                    {announcement.matchFormat}
                  </span>
                </div>
              )}
            </div>

            {/* Registration Closing Date Notice (if available) */}
            {deadlineStr && !isClosed && (
              <div className="flex items-center justify-between gap-2 text-[9.5px] bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                <div className="flex items-center gap-1 text-primary font-bold">
                  <Clock className="w-3 h-3 text-primary shrink-0" />
                  <span>Registration Closes</span>
                </div>
                <span className="font-extrabold text-primary tabular-nums">
                  {deadlineStr}
                </span>
              </div>
            )}

            {/* Categories / Prizes Chips */}
            {(categories.length > 0 || announcement.prizePool) && (
              <div className="flex items-center gap-1 flex-wrap border-t border-foreground/5 pt-1">
                {announcement.prizePool && !posterSrc && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-[8px] truncate">
                    🏆 {announcement.prizePool}
                  </span>
                )}
                {categories.slice(0, 3).map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.2 rounded bg-background border border-foreground/10 text-foreground/75 font-semibold text-[8px] truncate max-w-[85px]"
                  >
                    {cat}
                  </span>
                ))}
                {categories.length > 3 && (
                  <span className="px-1 py-0.2 rounded bg-background text-foreground/40 font-bold text-[7.5px]">
                    +{categories.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer Callout */}
          <div className="flex items-center justify-between pt-1 border-t border-foreground/5 text-xs">
            <span className="text-[8.5px] font-bold uppercase tracking-wider text-foreground/50 truncate max-w-[150px]">
              By {announcement.organizerName || 'Independent Organizer'}
            </span>

            <span
              className={`text-[9.5px] font-black uppercase tracking-wider flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform ${
                isClosed ? 'text-foreground/50' : 'text-primary'
              }`}
            >
              {isClosed ? 'View Details' : 'View Flyer'}
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
