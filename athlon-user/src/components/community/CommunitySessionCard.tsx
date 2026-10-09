'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  MapPin,
  Users,
  Check,
  Zap,
  LogIn,
  ExternalLink,
  Navigation,
  UserCheck,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { SessionResponse } from '@/lib/api/community';
import { SportCardSkeletonBackground } from '@/components/common/SportCardSkeletonBackground';

export interface CommunitySessionCardProps {
  session: SessionResponse;
  isLoggedIn?: boolean;
  canManage?: boolean;
  communityName?: string;
  onRsvp?: (sessionUuid: string, status: 'GOING' | 'NOT_GOING') => void;
  onAttendance?: (session: SessionResponse) => void;
  onDelete?: (session: SessionResponse) => void;
  className?: string;
}

export function formatSessionTime(timeStr?: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function formatSessionDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getSportEmoji(sport?: string): string {
  if (!sport) return '🏸';
  const s = sport.toUpperCase();
  if (s.includes('BADMINTON')) return '🏸';
  if (s.includes('CRICKET')) return '🏏';
  if (s.includes('FOOTBALL') || s.includes('SOCCER')) return '⚽';
  if (s.includes('TENNIS')) return '🎾';
  if (s.includes('TABLE_TENNIS') || s.includes('PING')) return '🏓';
  if (s.includes('BASKETBALL')) return '🏀';
  if (s.includes('VOLLEYBALL')) return '🏐';
  if (s.includes('PICKLEBALL')) return '🏓';
  return '🏸';
}

export function CommunitySessionCard({
  session,
  isLoggedIn = true,
  canManage = false,
  communityName,
  onRsvp,
  onAttendance,
  onDelete,
  className = '',
}: CommunitySessionCardProps) {
  const router = useRouter();

  const isGoing = session.currentUserRsvp === 'GOING';
  const max = session.maxPlayers || session.maxParticipants || 8;
  const current =
    session.goingCount ||
    session.confirmedPlayersCount ||
    (session.rsvps ? session.rsvps.filter((r) => r.status === 'GOING').length : 0);
  const fillPct = Math.min(100, Math.round((current / max) * 100));
  const isFull = max ? current >= max : false;
  const spotsLeft = Math.max(0, max - current);

  const costRaw =
    session.costPerPlayer !== undefined && session.costPerPlayer !== null
      ? session.costPerPlayer
      : session.costPerPerson;
  const cost = costRaw !== undefined && costRaw !== null ? Number(costRaw) : 0;

  const startTimeFormatted = formatSessionTime(session.startTime);
  const endTimeFormatted = formatSessionTime(session.endTime);
  const dateFormatted = formatSessionDate(session.sessionDate);

  const handleActionClick = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/home`);
      return;
    }
    if (onRsvp) {
      onRsvp(session.sessionUuid, isGoing ? 'NOT_GOING' : 'GOING');
    }
  };

  return (
    <div
      className={`rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden p-3.5 sm:p-4.5 relative group hover:-translate-y-0.5 hover:border-primary/40 ${className}`}
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-border)',
      }}
    >
      {/* Sport-Specific Technical Wireframe Skeleton Background */}
      <SportCardSkeletonBackground sport={session.sport} />

      <div className="space-y-2.5 relative z-10">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {/* Sport Badge */}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <span>{getSportEmoji(session.sport)}</span>
              <span className="truncate max-w-[90px] sm:max-w-none">{session.sport || 'BADMINTON'}</span>
            </span>

            {/* Gender / Eligibility Badge */}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-0.5 bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25">
              <span>
                {session.genderCategory === 'MALE'
                  ? '🚹 Men'
                  : session.genderCategory === 'FEMALE'
                  ? '🚺 Women'
                  : '👥 Mixed'}
              </span>
            </span>

            {/* Skill Level Badge */}
            {session.skillLevel && session.skillLevel !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                {session.skillLevel === 'BEGINNER' && '🟢 Beg'}
                {session.skillLevel === 'INTERMEDIATE' && '🟡 Inter'}
                {session.skillLevel === 'ADVANCED' && '🔴 Adv'}
                {session.skillLevel === 'PRO' && '🏆 Pro'}
              </span>
            )}
          </div>

          {/* Pricing Badge */}
          <div className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-[11px] flex items-center gap-1 shadow-xs shrink-0">
            <span>🪙</span>
            <span>{cost > 0 ? `₹${cost}` : 'Free'}</span>
          </div>
        </div>

        {/* Title & Host */}
        <div>
          <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight leading-snug line-clamp-1">
            {session.title || 'Friendly Game Session'}
          </h3>
          {communityName && (
            <p className="text-[10px] text-foreground/50 font-semibold mt-0.5 flex items-center gap-1 truncate">
              <span>by</span>
              <span className="text-primary font-bold truncate">{communityName}</span>
            </p>
          )}
        </div>

        {/* Sleek Match Details Card */}
        <div
          className="p-2.5 rounded-xl border space-y-1.5 text-xs"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Date & Time */}
          <div className="flex items-center justify-between text-[11px] gap-2">
            <span className="text-foreground/75 font-semibold flex items-center gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{dateFormatted}</span>
            </span>
            <span className="font-mono text-[10.5px] font-bold text-foreground/80 shrink-0">
              {startTimeFormatted} – {endTimeFormatted}
            </span>
          </div>

          {/* Venue & Location */}
          {(session.venueName || session.city || session.state) && (
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-border/30 gap-2">
              <span className="text-foreground/75 font-semibold flex items-center gap-1.5 min-w-0 truncate">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">
                  {session.venueName || 'Court Venue'}
                  {session.city ? `, ${session.city}` : ''}
                </span>
              </span>
              {session.googleMapUrl && (
                <a
                  href={session.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-primary hover:underline shrink-0"
                >
                  <Navigation className="w-2.5 h-2.5" />
                  <span>Map</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Squad & Capacity (Integrated Strip) */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between gap-2">
            {/* Avatars Stack */}
            <div className="flex items-center min-w-0">
              {session.rsvps && session.rsvps.filter((r) => r.status === 'GOING' || (r as any).rsvpStatus === 'GOING').length > 0 ? (
                <div className="flex items-center">
                  <div className="flex items-center -space-x-1.5 overflow-hidden">
                    {session.rsvps
                      .filter((r) => r.status === 'GOING' || (r as any).rsvpStatus === 'GOING')
                      .slice(0, 4)
                      .map((r) => (
                        <div
                          key={(r as any).rsvpId || (r as any).userUuid}
                          title={r.fullName || (r as any).userName}
                          className="w-5.5 h-5.5 rounded-full border border-card text-[9px] font-black flex items-center justify-center text-primary shadow-xs shrink-0 overflow-hidden"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                          }}
                        >
                          {(r as any).avatarUrl || (r as any).userAvatar ? (
                            <img
                              src={(r as any).avatarUrl || (r as any).userAvatar}
                              alt={r.fullName || (r as any).userName}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            ((r.fullName || (r as any).userName || 'P') as string).charAt(0).toUpperCase()
                          )}
                        </div>
                      ))}
                  </div>
                  {session.rsvps.filter((r) => r.status === 'GOING' || (r as any).rsvpStatus === 'GOING').length > 4 && (
                    <span className="text-[10px] font-bold text-foreground/50 ml-1.5">
                      +{session.rsvps.filter((r) => r.status === 'GOING' || (r as any).rsvpStatus === 'GOING').length - 4}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-foreground/45 italic">
                  Be first to join!
                </span>
              )}
            </div>

            {/* Slots Counter */}
            <div className="text-[10.5px] font-bold shrink-0">
              <span className="font-mono text-foreground">{current}</span>
              <span className="text-foreground/40 font-normal">/{max}</span>
              <span className="ml-1 text-[10px] font-semibold text-primary">
                ({spotsLeft > 0 ? `${spotsLeft} left` : 'Full'})
              </span>
            </div>
          </div>

          {/* Slim Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fillPct >= 100 ? 'bg-rose-500' : fillPct >= 75 ? 'bg-amber-400' : 'bg-primary'
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div
        className="pt-2.5 mt-2.5 border-t flex items-center justify-between gap-2 relative z-10"
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        {!isLoggedIn ? (
          <button
            onClick={handleActionClick}
            className="flex-1 h-9.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 bg-primary text-black hover:bg-primary/90 shadow-[0_2px_10px_var(--athlon-primary-glow)]"
          >
            <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Login to Join {cost > 0 ? `(₹${cost})` : ''}</span>
          </button>
        ) : (
          <button
            onClick={handleActionClick}
            disabled={!isGoing && isFull}
            className={`flex-1 h-9.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
              isGoing
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : isFull
                ? 'bg-surface text-foreground/40 cursor-not-allowed border'
                : 'bg-primary text-black hover:bg-primary/90 shadow-[0_2px_10px_var(--athlon-primary-glow)]'
            }`}
            style={{
              borderColor: isFull ? 'var(--athlon-border)' : undefined,
            }}
          >
            {isGoing ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Confirmed (Playing)</span>
              </>
            ) : isFull ? (
              <span>Session Full</span>
            ) : cost > 0 ? (
              <>
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>RSVP &amp; Join (₹{cost})</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>1-Tap RSVP</span>
              </>
            )}
          </button>
        )}

        {/* Management Controls */}
        {canManage && onAttendance && (
          <button
            onClick={() => onAttendance(session)}
            className="h-9.5 px-3 rounded-xl border text-foreground font-bold text-xs flex items-center gap-1 hover:bg-surface transition-colors cursor-pointer shrink-0"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
            title="Roll Call & Attendance"
          >
            <UserCheck className="w-3.5 h-3.5 text-primary" />
            <span className="hidden xs:inline">Roll Call</span>
          </button>
        )}

        {canManage && onDelete && (
          <button
            onClick={() => onDelete(session)}
            className="h-9.5 px-2.5 rounded-xl border text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
            title="Delete Session"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
