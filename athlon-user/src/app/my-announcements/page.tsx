'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Megaphone,
  Plus,
  Calendar,
  MapPin,
  ExternalLink,
  Share2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  DollarSign
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import {
  TournamentAnnouncement,
  TournamentAnnouncementService,
  getAnnouncementPosterUrl
} from '@/lib/api/tournamentAnnouncement';

export default function MyAnnouncementsPage() {
  const { isAuthenticated, userUuid } = useAuthStore();
  const [announcements, setAnnouncements] = useState<TournamentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deactivatingUuid, setDeactivatingUuid] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchAnnouncements = () => {
    if (!userUuid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    TournamentAnnouncementService.getMyAnnouncements(userUuid)
      .then((res) => {
        if (Array.isArray(res?.data)) {
          setAnnouncements(res.data);
        }
      })
      .catch((err) => console.error('Failed to load my announcements:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [userUuid]);

  const handleDeactivate = async (uuid: string) => {
    if (!confirm('Are you sure you want to close and deactivate this tournament announcement?')) {
      return;
    }
    try {
      setDeactivatingUuid(uuid);
      await TournamentAnnouncementService.deactivate(uuid);
      setFeedback('Tournament announcement marked as closed.');
      fetchAnnouncements();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to deactivate announcement:', err);
      alert('Failed to deactivate announcement. Please try again.');
    } finally {
      setDeactivatingUuid(null);
    }
  };

  const handleShare = (uuid: string, title: string) => {
    const url = `${window.location.origin}/tournaments/announcements/${uuid}`;
    if (navigator.share) {
      navigator.share({
        title,
        text: `Check out ${title} on Athlon!`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setFeedback('Link copied to clipboard!');
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const activeCount = announcements.filter((a) => a.isActive && a.status !== 'CLOSED').length;
  const closedCount = announcements.length - activeCount;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tournaments
          </Link>
          <Link
            href="/tournaments/announce"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> Announce Tournament
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Megaphone className="w-3.5 h-3.5" />
              My Tournament Flyers
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Announcements Management
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your published tournament flyers and share links with players.
            </p>
          </div>

          <Link
            href="/tournaments/announce"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow hover:opacity-90 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Post New Flyer
          </Link>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-emerald-600 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {feedback}
          </div>
        )}

        {/* Metrics Banner */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-muted-foreground">Total Announcements</span>
            <p className="text-xl sm:text-2xl font-black text-foreground mt-1">{announcements.length}</p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">Active / Open</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-muted-foreground">Closed</span>
            <p className="text-xl sm:text-2xl font-black text-muted-foreground mt-1">{closedCount}</p>
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground font-medium">Loading your announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-10 rounded-2xl border border-border bg-card text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <Megaphone className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">No Tournament Announcements Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Have an upcoming tournament? Post a flyer to invite badminton, cricket, or football players in your city.
              </p>
            </div>
            <Link
              href="/tournaments/announce"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" /> Announce a Tournament
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => {
              const posterSrc = a.posterUrl ? getAnnouncementPosterUrl(a.posterUrl) : null;
              const isClosed = !a.isActive || a.status === 'CLOSED';

              return (
                <div
                  key={a.uuid}
                  className="p-5 rounded-2xl border border-border bg-card hover:border-border/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-16 h-20 rounded-xl bg-muted/40 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                      {posterSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={posterSrc} alt={a.title} className="w-full h-full object-cover" />
                      ) : (
                        <Megaphone className="w-6 h-6 text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary/10 text-primary">
                          {a.sport}
                        </span>
                        {isClosed ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-rose-500/10 text-rose-500">
                            Closed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500">
                            Open
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-foreground truncate">
                        {a.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {a.venueName && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500" /> {a.venueName}
                          </span>
                        )}
                        {a.entryFee && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {a.entryFee}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleShare(a.uuid, a.title)}
                      className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Share flyer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/tournaments/announcements/${a.uuid}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-input text-xs font-bold text-foreground hover:bg-muted transition-colors"
                    >
                      View Flyer <ExternalLink className="w-3 h-3" />
                    </Link>

                    {!isClosed && (
                      <button
                        onClick={() => handleDeactivate(a.uuid)}
                        disabled={deactivatingUuid === a.uuid}
                        className="p-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Mark as Closed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
