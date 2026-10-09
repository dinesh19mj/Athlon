'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Tag,
  Eye,
  ZoomIn,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Pencil,
  ExternalLink,
  Calendar,
  Trophy,
} from 'lucide-react';
import { Registration, RegistrationPlayer } from '@/lib/api/tournaments';
import { UserService } from '@/lib/api/user';

export interface OrganizerRegistrationCardProps {
  registration: Registration & {
    tournamentName?: string;
    tournamentUuid?: string;
    sport?: string;
  };
  orgId?: string;
  onApprove?: (regUuid: string) => void;
  onReject?: (regUuid: string) => void;
  onPaymentUpdate?: (regUuid: string, newStatus: 'PAID' | 'PENDING') => void;
  onPreviewPhoto?: (info: {
    url: string;
    playerName: string;
    teamName: string;
    phone?: string;
    regUuid: string;
    status: string;
  }) => void;
  onEdit?: (registration: Registration) => void;
  playerPhotos?: Record<string, string>;
  showTournamentLink?: boolean;
}

export const OrganizerRegistrationCard: React.FC<OrganizerRegistrationCardProps> = ({
  registration: reg,
  orgId,
  onApprove,
  onReject,
  onPaymentUpdate,
  onPreviewPhoto,
  onEdit,
  playerPhotos = {},
  showTournamentLink = true,
}) => {
  const regUuid = reg.registrationUuid || reg.uuid;
  const isPaid = reg.paymentStatus === 'PAID';
  const isApproved = reg.status === 'APPROVED';
  const isRejected = reg.status === 'REJECTED';

  const resolvePlayerPhoto = (p: RegistrationPlayer): string => {
    const direct =
      p.photo ||
      p.photoUrl ||
      p.avatar ||
      p.profilePic ||
      p.userPhoto ||
      (p as any).image ||
      (p as any).profileImage;

    if (direct) {
      if (direct.startsWith('http') || direct.startsWith('data:') || direct.startsWith('/')) {
        return direct;
      }
      return UserService.getPhotoUrl(direct);
    }

    if (p.phoneNumber && playerPhotos[p.phoneNumber]) {
      return playerPhotos[p.phoneNumber];
    }

    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.playerName)}&backgroundColor=0ea5e9,10b981,8b5cf6,f59e0b`;
  };

  const handlePhotoClick = (p: RegistrationPlayer, photoUrl: string) => {
    if (onPreviewPhoto) {
      onPreviewPhoto({
        url: photoUrl,
        playerName: p.playerName,
        teamName: reg.teamName,
        phone: p.phoneNumber,
        regUuid,
        status: reg.status,
      });
    }
  };

  return (
    <div
      className="rounded-2xl p-4 border transition-all duration-200 hover:shadow-lg flex flex-col justify-between relative overflow-hidden group shadow-sm"
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-border)',
      }}
    >
      {/* Top Accent Line based on status */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2.5px] ${
          isApproved
            ? 'bg-emerald-500'
            : isRejected
            ? 'bg-red-500'
            : isPaid
            ? 'bg-amber-500'
            : 'bg-primary'
        }`}
      />

      <div className="space-y-3">
        {/* Tournament name context if applicable */}
        {showTournamentLink && reg.tournamentName && (
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/40 text-[10px]">
            <Link
              href={
                orgId && reg.tournamentUuid
                  ? `/org/${orgId}/tournaments/${reg.tournamentUuid}`
                  : `/tournaments/${reg.tournamentUuid}`
              }
              className="font-extrabold text-foreground/70 hover:text-primary transition-colors flex items-center gap-1 truncate"
              title={reg.tournamentName}
            >
              <Trophy className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">{reg.tournamentName}</span>
            </Link>
            {reg.sport && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-surface border border-border text-foreground/60 shrink-0">
                {reg.sport}
              </span>
            )}
          </div>
        )}

        {/* 1. Card Header: Team Name & Status Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-black text-foreground tracking-tight line-clamp-1">
              {reg.teamName ||
                (reg.players && reg.players.length > 0
                  ? reg.players.map((p) => p.playerName).join(' & ')
                  : 'Participant')}
            </h4>

            {reg.category && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mt-1">
                <Tag className="w-2.5 h-2.5" />
                <span className="truncate">{reg.category}</span>
              </div>
            )}
          </div>

          {/* Status Badges in flex row */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {reg.registrationSource === 'ORGANIZER_MANUAL' ? (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                Manual
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                Online
              </span>
            )}

            <span
              className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider border ${
                isApproved
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : isRejected
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                  : 'bg-primary/15 text-primary border-primary/30'
              }`}
            >
              {reg.status || 'PENDING'}
            </span>

            <span
              className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider border ${
                isPaid
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}
            >
              {isPaid ? 'PAID' : 'UNPAID'}
            </span>
          </div>
        </div>

        {/* 2. Players Roster */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[9px] font-extrabold uppercase text-foreground/45 px-0.5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-primary" />
              Player ({reg.players?.length || 0})
            </span>
            <span className="text-foreground/40 lowercase">tap photo to view</span>
          </div>

          {reg.players && reg.players.length > 0 ? (
            <div className="space-y-1.5">
              {reg.players.map((p, pIdx) => {
                const formattedPhotoUrl = resolvePlayerPhoto(p);
                const hasRealPhoto = !!(
                  p.photo ||
                  p.photoUrl ||
                  p.avatar ||
                  p.profilePic ||
                  p.userPhoto ||
                  (p.phoneNumber && playerPhotos[p.phoneNumber])
                );

                return (
                  <div
                    key={pIdx}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-xl border text-xs gap-2.5 transition-all hover:border-primary/40 group/player"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border-subtle)',
                    }}
                  >
                    {/* Left: Player Avatar / Photo */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        onClick={() => handlePhotoClick(p, formattedPhotoUrl)}
                        className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-primary/30 relative flex items-center justify-center transition-all cursor-pointer shadow-xs group-hover/player:scale-105 hover:ring-2 hover:ring-primary/40 bg-black/20"
                        title="Tap to verify athlete photo"
                      >
                        <img
                          src={formattedPhotoUrl}
                          alt={p.playerName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              p.playerName
                            )}`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/player:opacity-100 flex items-center justify-center transition-opacity">
                          <ZoomIn className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      {/* Player details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-xs text-foreground truncate">
                            {p.playerName}
                          </span>
                          {hasRealPhoto && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                              title="Photo verified"
                            />
                          )}
                        </div>
                        {p.phoneNumber && (
                          <span className="text-[10px] font-mono text-foreground/50 block truncate">
                            {p.phoneNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Quick Eye Button */}
                    <button
                      type="button"
                      onClick={() => handlePhotoClick(p, formattedPhotoUrl)}
                      className="p-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors shrink-0"
                      title="Verify photo"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-foreground/40 italic">Single entry / No players listed</p>
          )}
        </div>
      </div>

      {/* 3. Action Footer Buttons */}
      <div
        className="mt-3 pt-2.5 border-t flex items-center gap-1.5"
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        {/* Payment Action */}
        {onPaymentUpdate && (
          !isPaid ? (
            <button
              onClick={() => onPaymentUpdate(regUuid, 'PAID')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
              title="Mark as Paid"
            >
              <IndianRupee className="w-3 h-3 shrink-0" />
              <span>Mark Paid</span>
            </button>
          ) : (
            <button
              onClick={() => onPaymentUpdate(regUuid, 'PENDING')}
              className="flex-1 py-1.5 px-2 rounded-xl border text-foreground/60 font-bold text-[10px] hover:text-foreground transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border-subtle)',
              }}
              title="Mark as Unpaid"
            >
              <IndianRupee className="w-3 h-3 shrink-0" />
              <span>Unpaid</span>
            </button>
          )
        )}

        {/* Approve Action */}
        {onApprove && !isApproved && (
          <button
            onClick={() => onApprove(regUuid)}
            className="py-1.5 px-2.5 rounded-xl bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider hover:bg-emerald-600 shadow-xs shadow-emerald-500/20 transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
            title="Approve Registration"
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Approve</span>
          </button>
        )}

        {/* Reject Action */}
        {onReject && !isRejected && (
          <button
            onClick={() => onReject(regUuid)}
            className="py-1.5 px-2.5 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 font-black text-[10px] uppercase tracking-wider hover:bg-red-500/25 transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
            title="Reject Registration"
          >
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Reject</span>
          </button>
        )}

        {/* Edit Button */}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(reg)}
            className="p-1.5 rounded-xl border text-foreground/60 hover:text-primary hover:border-primary/40 transition-all shrink-0"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border-subtle)',
            }}
            title="Edit Registration Details"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
