'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
  DollarSign,
  Phone,
  MessageCircle,
  Mail,
  ExternalLink,
  Share2,
  Clock,
  Sparkles,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  X,
  QrCode,
  Download,
  Building,
  UserCheck,
  ChevronDown,
  Navigation,
  Ticket,
  Users,
  Lock,
  Unlock,
  Loader2
} from 'lucide-react';
import {
  TournamentAnnouncement,
  TournamentAnnouncementService,
  getAnnouncementPosterUrl
} from '@/lib/api/tournamentAnnouncement';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { SportCardSkeletonBackground } from '@/components/common/SportCardSkeletonBackground';

export default function TournamentAnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params?.uuid as string;
  const { userUuid } = useAuthStore();

  const [announcement, setAnnouncement] = useState<TournamentAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mobile-only UI state
  const [scrolled, setScrolled] = useState(false);
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [ownerNoteOpen, setOwnerNoteOpen] = useState(false);

  // Owner status toggle
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 260);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!uuid) return;
    setLoading(true);
    TournamentAnnouncementService.getByUuid(uuid)
      .then((res) => {
        if (res?.data) {
          setAnnouncement(res.data);
        } else {
          setError('Announcement details could not be found.');
        }
      })
      .catch((err) => {
        console.error('Error fetching announcement:', err);
        setError('Failed to load tournament flyer.');
      })
      .finally(() => setLoading(false));
  }, [uuid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-muted-foreground">Loading tournament flyer...</p>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="p-6 rounded-2xl bg-card border border-border max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-foreground">Announcement Not Found</h2>
          <p className="text-xs text-muted-foreground">{error || 'This tournament announcement does not exist or was removed.'}</p>
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const posterSrc = announcement.posterUrl ? getAnnouncementPosterUrl(announcement.posterUrl) : null;
  const upiQrSrc = announcement.upiQrCodeUrl ? getAnnouncementPosterUrl(announcement.upiQrCodeUrl) : null;
  const isOwner = !!userUuid && announcement.userUuid === userUuid;
  // Only treat as closed when status says so, or the announcement was explicitly removed (isActive === false).
  // An undefined isActive must NOT be treated as closed.
  const isClosed =
    announcement.status === 'CLOSED' ||
    announcement.status === 'REGISTRATION_CLOSED' ||
    announcement.isActive === false;

  const handleToggleStatus = async () => {
    if (!isOwner || !userUuid || statusUpdating) return;
    const nextStatus: 'OPEN' | 'CLOSED' = isClosed ? 'OPEN' : 'CLOSED';
    if (nextStatus === 'CLOSED' && !window.confirm('Close registrations for this tournament? You can reopen anytime.')) {
      return;
    }
    setStatusUpdating(true);
    setStatusError(null);
    try {
      const res = await TournamentAnnouncementService.updateStatus(announcement.uuid, nextStatus, userUuid);
      if (res?.data) {
        setAnnouncement(res.data);
      } else {
        setAnnouncement({ ...announcement, status: nextStatus });
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setStatusError(err?.response?.data?.message || err?.message || 'Could not update registration status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const renderOwnerStatusControl = (compact = false) => (
    <div
      className={`rounded-2xl border flex items-center gap-3 ${compact ? 'p-3' : 'p-4'} ${
        isClosed ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
      }`}
    >
      <div
        className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
          isClosed ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
        }`}
      >
        {isClosed ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-foreground">
          Registrations are {isClosed ? 'closed' : 'open'}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {statusError ? <span className="text-rose-400">{statusError}</span> : 'Only you can change this.'}
        </p>
      </div>
      <button
        type="button"
        id="announcement-toggle-status"
        onClick={handleToggleStatus}
        disabled={statusUpdating}
        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black transition-all active:scale-95 disabled:opacity-60 ${
          isClosed
            ? 'bg-emerald-500 text-black hover:bg-emerald-400'
            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
        }`}
      >
        {statusUpdating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isClosed ? (
          <Unlock className="w-3.5 h-3.5" />
        ) : (
          <Lock className="w-3.5 h-3.5" />
        )}
        {isClosed ? 'Reopen' : 'Close'}
      </button>
    </div>
  );

  const formatDates = () => {
    try {
      if (!announcement.startDate) return 'Dates TBA';
      const s = new Date(announcement.startDate);
      const e = announcement.endDate ? new Date(announcement.endDate) : null;
      if (isNaN(s.getTime())) return 'Dates TBA';

      if (!e || isNaN(e.getTime()) || s.toDateString() === e.toDateString()) {
        return s.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return null;
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: announcement.title,
        text: `Tournament Announcement: ${announcement.title}`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const cleanPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
  };

  const whatsappLink = announcement.whatsappNumber
    ? `https://wa.me/${cleanPhone(announcement.whatsappNumber).replace(/^\+/, '')}?text=${encodeURIComponent(`Hi, I saw your tournament announcement "${announcement.title}" on Athlon and would like more details / to register.`)}`
    : null;

  // ── Mobile-only derived values ──
  const startDateObj = announcement.startDate ? new Date(announcement.startDate) : null;
  const endDateObj = announcement.endDate ? new Date(announcement.endDate) : null;
  const hasStart = !!startDateObj && !isNaN(startDateObj.getTime());
  const hasEnd =
    !!endDateObj && !isNaN(endDateObj.getTime()) && hasStart && startDateObj!.toDateString() !== endDateObj.toDateString();

  const deadlineObj = announcement.registrationDeadline ? new Date(announcement.registrationDeadline) : null;
  const daysLeft =
    deadlineObj && !isNaN(deadlineObj.getTime())
      ? Math.ceil((deadlineObj.getTime() - Date.now()) / 86400000)
      : null;

  const categoryChips = Array.from(
    new Set(
      (announcement.category || announcement.categoryDetails || '')
        .split(/[,•]/)
        .map((c) => c.trim())
        .filter((c) => c && c !== announcement.matchFormat)
    )
  );

  const locationLine = [announcement.city, announcement.district, announcement.state].filter(Boolean).join(', ');
  const directionsUrl =
    announcement.locationMapUrl ||
    (announcement.venueName || locationLine
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [announcement.venueName, announcement.address, locationLine].filter(Boolean).join(', ')
        )}`
      : null);

  const organizerName = announcement.organizerName || 'Independent Organizer';
  const organizerInitials = organizerName
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const longContent = (announcement.content || '').length > 220;

  return (
    <div className="min-h-screen bg-background md:pb-32">
      {/* ═══════════════════════════ MOBILE LAYOUT (below md) ═══════════════════════════ */}
      <div className="md:hidden">
        {/* Floating header — glass over hero, solid once scrolled */}
        <header
          className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
            scrolled ? 'bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-lg shadow-black/20' : 'bg-transparent'
          }`}
        >
          <div className="h-14 px-3 flex items-center gap-2">
            <Link
              href="/tournaments"
              aria-label="Back to tournaments"
              className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                scrolled ? 'bg-card border border-border text-foreground' : 'bg-black/40 backdrop-blur-md border border-white/15 text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <p
              className={`flex-1 min-w-0 text-[13px] font-bold text-foreground truncate transition-all duration-300 ${
                scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              }`}
            >
              {announcement.title}
            </p>

            <div className="flex items-center gap-2 shrink-0">
              {posterSrc && (
                <a
                  href={posterSrc}
                  download={`${announcement.title}-Flyer.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Download poster"
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                    scrolled ? 'bg-card border border-border text-foreground' : 'bg-black/40 backdrop-blur-md border border-white/15 text-white'
                  }`}
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share flyer"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  scrolled ? 'bg-card border border-border text-foreground' : 'bg-black/40 backdrop-blur-md border border-white/15 text-white'
                }`}
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Copied toast */}
        {copied && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
            Link copied to clipboard
          </div>
        )}

        {/* Immersive poster hero */}
        <section className="relative overflow-hidden">
          {posterSrc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={posterSrc}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-background" />
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="relative block w-full pt-[4.5rem] pb-14 px-8 active:scale-[0.99] transition-transform"
                aria-label="View poster fullscreen"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterSrc}
                  alt={announcement.title}
                  className="mx-auto w-auto max-h-[58vh] object-contain rounded-2xl shadow-2xl shadow-black/70 ring-1 ring-white/15"
                />
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white/90">
                  <Maximize2 className="w-3 h-3" /> Tap to expand
                </span>
              </button>
            </>
          ) : (
            <div className="relative h-72 flex items-center justify-center">
              <SportCardSkeletonBackground sport={announcement.sport} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
              <div className="relative z-10 text-center space-y-2 pt-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 text-primary mx-auto flex items-center justify-center backdrop-blur-md">
                  <Megaphone className="w-8 h-8" />
                </div>
                <p className="text-sm font-black text-foreground">{announcement.sport} Tournament</p>
              </div>
            </div>
          )}
        </section>

        {/* Content */}
        <main className="relative z-10 -mt-4 px-4 pb-40 space-y-4">
          {/* Status chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isClosed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/25">
                Closed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </span>
                Registrations Open
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3" />
              {announcement.sport}
            </span>
            {isOwner && (
              <button
                type="button"
                onClick={() => setOwnerNoteOpen((v) => !v)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25 active:scale-95 transition-transform"
              >
                <UserCheck className="w-3 h-3" />
                Yours
                <ChevronDown className={`w-3 h-3 transition-transform ${ownerNoteOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {isOwner && ownerNoteOpen && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <Megaphone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-foreground/80">
                <span className="font-bold text-foreground">You announced this tournament.</span> Players contact you directly to
                register. Brackets, scores and refereeing are managed by you outside Athlon.
              </p>
            </div>
          )}

          {isOwner && renderOwnerStatusControl(true)}

          {/* Title + format */}
          <div className="space-y-2.5">
            <h1 className="text-xl font-black leading-tight tracking-tight text-foreground">{announcement.title}</h1>
            {(announcement.matchFormat || categoryChips.length > 0) && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-0.5">
                {announcement.matchFormat && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                    <Users className="w-3 h-3" />
                    {announcement.matchFormat}
                  </span>
                )}
                {categoryChips.map((c) => (
                  <span
                    key={c}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-semibold text-foreground/80"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-2">
            {/* Calendar tile */}
            <div className="rounded-2xl bg-card border border-border overflow-hidden text-center">
              <div className="bg-gradient-to-r from-primary to-emerald-400 text-primary-foreground text-[9px] font-black uppercase tracking-[0.15em] py-1">
                {hasStart ? startDateObj!.toLocaleDateString(undefined, { month: 'short' }) : 'Date'}
              </div>
              <div className="py-2 px-1">
                <p className="text-xl font-black leading-none text-foreground">
                  {hasStart ? startDateObj!.getDate() : 'TBA'}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-muted-foreground truncate">
                  {hasStart
                    ? hasEnd
                      ? `→ ${endDateObj!.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`
                      : startDateObj!.toLocaleDateString(undefined, { weekday: 'long' })
                    : 'Coming soon'}
                </p>
              </div>
            </div>

            {/* Entry fee tile */}
            <div className="rounded-2xl bg-card border border-border p-2.5 flex flex-col justify-between min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Ticket className="w-3.5 h-3.5" />
              </div>
              <div className="mt-2 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Entry</p>
                <p className="text-[13px] font-black text-emerald-400 leading-tight line-clamp-2 break-words">
                  {announcement.entryFee || 'Contact'}
                </p>
              </div>
            </div>

            {/* Prize tile */}
            <div className="rounded-2xl bg-card border border-border p-2.5 flex flex-col justify-between min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <div className="mt-2 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Prize</p>
                <p className="text-[13px] font-black text-foreground leading-tight line-clamp-2 break-words">
                  {announcement.prizePool || 'Trophies'}
                </p>
              </div>
            </div>
          </div>

          {/* Deadline countdown */}
          {(isClosed || daysLeft !== null) && (
            <div
              className={`relative overflow-hidden p-3 rounded-2xl border flex items-center gap-3 ${
                isClosed || (daysLeft !== null && daysLeft < 0)
                  ? 'bg-rose-500/10 border-rose-500/25'
                  : daysLeft !== null && daysLeft <= 3
                    ? 'bg-amber-500/10 border-amber-500/25'
                    : 'bg-primary/5 border-primary/20'
              }`}
            >
              <div
                className={`w-11 h-11 shrink-0 rounded-xl flex flex-col items-center justify-center font-black leading-none ${
                  isClosed || (daysLeft !== null && daysLeft < 0)
                    ? 'bg-rose-500/15 text-rose-400'
                    : daysLeft !== null && daysLeft <= 3
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-primary/15 text-primary'
                }`}
              >
                {isClosed || daysLeft === null || daysLeft < 0 ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <>
                    <span className="text-lg">{daysLeft}</span>
                    <span className="text-[8px] uppercase tracking-wider mt-0.5">{daysLeft === 1 ? 'day' : 'days'}</span>
                  </>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-foreground">
                  {isClosed || (daysLeft !== null && daysLeft < 0)
                    ? 'Registrations closed'
                    : daysLeft === 0
                      ? 'Last day to register!'
                      : `Registration closes in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`}
                </p>
                {formatDeadline() && (
                  <p className="text-[11px] text-muted-foreground">Deadline · {formatDeadline()}</p>
                )}
              </div>
            </div>
          )}

          {/* Venue card */}
          {(announcement.venueName || locationLine || announcement.address) && (
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="relative h-20 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:18px_18px]">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-transparent to-primary/15" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="absolute inset-0 -m-2 rounded-full bg-amber-500/25 animate-ping" />
                  <div className="relative w-9 h-9 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/40">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="p-3.5 space-y-3">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Venue</p>
                  {announcement.venueName && (
                    <p className="text-sm font-black text-foreground leading-snug">{announcement.venueName}</p>
                  )}
                  {announcement.address && <p className="text-xs text-muted-foreground">{announcement.address}</p>}
                  {locationLine && <p className="text-xs font-medium text-foreground/70">{locationLine}</p>}
                </div>
                {directionsUrl && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold active:scale-[0.98] transition-transform"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Get Directions
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Organizer card */}
          <div className="rounded-2xl bg-card border border-border p-3.5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-amber-400 text-primary-foreground font-black text-sm flex items-center justify-center shadow-md">
                {organizerInitials || <Building className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Organized by</p>
                <p className="text-sm font-black text-foreground truncate">{organizerName}</p>
                {announcement.contactEmail && (
                  <p className="text-[11px] text-muted-foreground truncate">{announcement.contactEmail}</p>
                )}
              </div>
            </div>
            {(announcement.contactPhone || whatsappLink || announcement.contactEmail) && (
              <div className="flex gap-2">
                {announcement.contactPhone && (
                  <a
                    href={`tel:${cleanPhone(announcement.contactPhone)}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-background border border-border text-[11px] font-bold text-foreground active:scale-95 transition-transform"
                  >
                    <Phone className="w-3.5 h-3.5 text-primary" /> Call
                  </a>
                )}
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-bold text-emerald-400 active:scale-95 transition-transform"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                )}
                {announcement.contactEmail && (
                  <a
                    href={`mailto:${announcement.contactEmail}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-background border border-border text-[11px] font-bold text-foreground active:scale-95 transition-transform"
                  >
                    <Mail className="w-3.5 h-3.5 text-sky-400" /> Email
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Guidelines */}
          {announcement.content && (
            <div className="rounded-2xl bg-card border border-border p-3.5 space-y-2">
              <h2 className="text-[13px] font-black text-foreground">Guidelines & Rules</h2>
              <div className="relative">
                <p
                  className={`text-xs text-foreground/80 whitespace-pre-line leading-relaxed ${
                    longContent && !rulesExpanded ? 'line-clamp-5' : ''
                  }`}
                >
                  {announcement.content}
                </p>
                {longContent && !rulesExpanded && (
                  <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                )}
              </div>
              {longContent && (
                <button
                  type="button"
                  onClick={() => setRulesExpanded((v) => !v)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary"
                >
                  {rulesExpanded ? 'Show less' : 'Read more'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${rulesExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          )}

          {/* UPI QR (collapsible) */}
          {upiQrSrc && (
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setQrOpen((v) => !v)}
                className="w-full p-3.5 flex items-center gap-3 text-left"
              >
                <div className="w-9 h-9 shrink-0 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground">Pay entry fee via UPI</p>
                  <p className="text-[11px] text-muted-foreground">GPay · PhonePe · Paytm</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${qrOpen ? 'rotate-180' : ''}`} />
              </button>
              {qrOpen && (
                <div className="px-3.5 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="p-3 bg-white rounded-2xl w-fit mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={upiQrSrc} alt="UPI QR Code" className="w-52 h-52 object-contain" />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Floating action dock */}
        <div className="fixed bottom-0 inset-x-0 z-40 px-3 pt-6 pb-[max(env(safe-area-inset-bottom),0.75rem)] bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-2xl bg-card/90 backdrop-blur-xl border border-border shadow-2xl shadow-black/40">
            <div className="min-w-0 flex-1 pl-1.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Entry fee</p>
              <p className="text-sm font-black text-emerald-400 truncate">{announcement.entryFee || 'Contact'}</p>
            </div>
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp organizer"
                className="w-11 h-11 shrink-0 rounded-xl bg-emerald-600 text-white flex items-center justify-center active:scale-90 transition-transform"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            )}
            {isClosed ? (
              <span className="h-11 px-4 shrink-0 rounded-xl bg-muted text-muted-foreground text-xs font-bold flex items-center">
                Closed
              </span>
            ) : announcement.externalRegistrationUrl ? (
              <a
                href={announcement.externalRegistrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-4 shrink-0 rounded-xl bg-primary text-primary-foreground text-xs font-black flex items-center gap-1.5 shadow-lg shadow-primary/30 active:scale-95 transition-transform"
              >
                Register <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : announcement.contactPhone ? (
              <a
                href={`tel:${cleanPhone(announcement.contactPhone)}`}
                className="h-11 px-4 shrink-0 rounded-xl bg-primary text-primary-foreground text-xs font-black flex items-center gap-1.5 shadow-lg shadow-primary/30 active:scale-95 transition-transform"
              >
                <Phone className="w-3.5 h-3.5" /> Call to Register
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════ TABLET / DESKTOP LAYOUT (md+) ═══════════════════════════ */}
      {/* Sticky Top Bar */}
      <div className="hidden md:block sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tournaments
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-input text-xs font-bold text-foreground hover:bg-muted transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Link Copied!' : 'Share Flyer'}
            </button>
            {isOwner && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <UserCheck className="w-3 h-3" />
                Your Announcement
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Creator Notice (If logged in as poster creator) */}
        {isOwner && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
              <Megaphone className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-foreground/80 space-y-1">
                <p className="font-bold text-foreground">You announced this tournament</p>
                <p className="leading-relaxed">
                  This is a promotional bulletin for players to contact you and register. Match brackets, live scores, and refereeing are self-managed by you outside Athlon.
                </p>
              </div>
            </div>
            {renderOwnerStatusControl()}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Poster & Quick Visuals (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {posterSrc ? (
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-md bg-muted/20 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterSrc}
                  alt={announcement.title}
                  className="w-full h-auto max-h-[600px] object-contain mx-auto cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
                  onClick={() => setLightboxOpen(true)}
                />
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="p-2 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md transition-colors"
                    title="View Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <a
                    href={posterSrc}
                    download={`${announcement.title}-Flyer.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md transition-colors"
                    title="Download Poster"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <SportCardSkeletonBackground sport={announcement.sport} />
                <div className="relative z-10 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                    <Megaphone className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-black text-foreground">{announcement.sport} Tournament</h3>
                  <p className="text-xs text-muted-foreground max-w-xs">Official Community Bulletin Flyer</p>
                </div>
              </div>
            )}

            {/* Optional UPI QR Code preview card */}
            {upiQrSrc && (
              <div className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <QrCode className="w-4 h-4 text-primary" />
                  UPI Entry Fee Payment QR
                </div>
                <div className="p-3 bg-white rounded-xl border border-border/50 flex items-center justify-center max-w-xs mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={upiQrSrc} alt="UPI QR Code" className="w-48 h-48 object-contain" />
                </div>
                <p className="text-[11px] text-center text-muted-foreground">
                  Scan using Google Pay, PhonePe, or Paytm to pay registration fee.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Tournament Details & Contact Channels (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Megaphone className="w-3.5 h-3.5" />
                  Tournament Flyer
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  {announcement.sport}
                </span>
                {isClosed ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    Closed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Open for Registration
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
                {announcement.title}
              </h1>

              {announcement.matchFormat && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-bold">
                    {announcement.matchFormat}
                  </span>
                </div>
              )}

              {(announcement.category || announcement.categoryDetails) && (
                <p className="text-sm font-semibold text-primary">
                  Categories: {announcement.category || announcement.categoryDetails}
                </p>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Dates */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" /> Dates
                </span>
                <p className="text-xs sm:text-sm font-bold text-foreground">{formatDates()}</p>
              </div>

              {/* Entry Fee */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-500" /> Entry Fee
                </span>
                <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {announcement.entryFee || 'Free / Contact'}
                </p>
              </div>

              {/* Prize Pool */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" /> Prize Pool
                </span>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {announcement.prizePool || 'Trophies & Awards'}
                </p>
              </div>

              {/* Registration Deadline */}
              {formatDeadline() && (
                <div className="p-4 rounded-xl border border-border bg-card space-y-1 col-span-2 sm:col-span-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-500" /> Registration Closes On
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-foreground">{formatDeadline()}</p>
                </div>
              )}
            </div>

            {/* Direct Action CTAs */}
            <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-foreground">Registration & Inquiry</h3>
                <span className="text-[11px] text-muted-foreground">Direct with Organizer</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                {announcement.externalRegistrationUrl && (
                  <a
                    href={announcement.externalRegistrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow hover:opacity-90 active:scale-98 transition-all"
                  >
                    Register Online <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow active:scale-98 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp Organizer
                  </a>
                )}

                {announcement.contactPhone && (
                  <a
                    href={`tel:${cleanPhone(announcement.contactPhone)}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-card text-foreground font-bold text-sm hover:bg-muted active:scale-98 transition-all"
                  >
                    <Phone className="w-4 h-4 text-primary" /> Call
                  </a>
                )}
              </div>
            </div>

            {/* Venue & Location Details */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                Venue & Address
              </h3>
              <div className="space-y-1 text-sm text-foreground/90">
                {announcement.venueName && <p className="font-bold">{announcement.venueName}</p>}
                {announcement.address && <p className="text-xs text-muted-foreground">{announcement.address}</p>}
                {(announcement.city || announcement.state) && (
                  <p className="text-xs text-muted-foreground font-medium">
                    {[announcement.city, announcement.district, announcement.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              {announcement.locationMapUrl && (
                <div className="pt-2">
                  <a
                    href={announcement.locationMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <MapPin className="w-3.5 h-3.5" /> View on Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Description & Rules Content */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                Tournament Guidelines & Rules
              </h3>
              <div className="text-xs sm:text-sm text-foreground/85 whitespace-pre-line leading-relaxed">
                {announcement.content}
              </div>
            </div>

            {/* Organizer Info Card */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Announced By
              </h3>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-black text-foreground">{announcement.organizerName || 'Independent Organizer'}</p>
                  {announcement.contactEmail && (
                    <p className="text-xs text-muted-foreground mt-0.5">{announcement.contactEmail}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {announcement.contactPhone && (
                    <a
                      href={`tel:${cleanPhone(announcement.contactPhone)}`}
                      className="p-2.5 rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
                      title="Call Organizer"
                    >
                      <Phone className="w-4 h-4 text-primary" />
                    </a>
                  )}
                  {whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                      title="WhatsApp Organizer"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-3.5 hidden md:flex lg:hidden items-center justify-between gap-2.5 shadow-lg">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-foreground truncate">{announcement.title}</p>
          <p className="text-[11px] font-bold text-emerald-600 truncate">{announcement.entryFee || 'Contact Organizer'}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}
          {announcement.externalRegistrationUrl ? (
            <a
              href={announcement.externalRegistrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow"
            >
              Register Now
            </a>
          ) : (
            announcement.contactPhone && (
              <a
                href={`tel:${cleanPhone(announcement.contactPhone)}`}
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" /> Call to Register
              </a>
            )
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && posterSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterSrc}
            alt={announcement.title}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
