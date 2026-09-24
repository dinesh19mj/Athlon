'use client';

import React, { useState } from 'react';
import { Vote, Check } from 'lucide-react';
import { CommunityPoll } from '@/lib/api/community';

export interface CommunityPollCardProps {
  poll: CommunityPoll;
  communityName?: string;
  onVote?: (pollId: number, optionId: number) => Promise<void> | void;
  className?: string;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export function CommunityPollCard({
  poll,
  communityName,
  onVote,
  className = '',
}: CommunityPollCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalVotes = poll.totalVotes || 0;
  const userVotedOptionIds = poll.userVotedOptionIds || [];
  const hasVotedAny = userVotedOptionIds.length > 0;
  const options = poll.options || [];

  const handleOptionClick = async (optionId: number) => {
    if (poll.isClosed || isSubmitting || !onVote) return;
    try {
      setIsSubmitting(true);
      await onVote(poll.pollId, optionId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`p-5 rounded-3xl border space-y-4 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-primary/40 flex flex-col justify-between ${className}`}
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-border)',
      }}
    >
      <div>
        {/* Poll Top Bar */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>{poll.isClosed ? 'CLOSED' : 'LIVE VOTE'}</span>
            </span>
            {communityName && (
              <span className="text-[10px] font-mono text-foreground/50 truncate max-w-[140px]">
                {communityName}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-foreground/40">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        </div>

        {/* Question */}
        <h3 className="font-black text-sm sm:text-base text-foreground tracking-tight leading-snug">
          {poll.question}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-2 pt-1">
        {options.length === 0 ? (
          <p className="text-[11px] text-foreground/40 italic py-2 text-center">
            No options available for this poll.
          </p>
        ) : (
          options.map((opt) => {
            const hasVotedThis = userVotedOptionIds.includes(opt.optionId);
            const votesCount = opt.votesCount || 0;
            const pct = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;

            return (
              <button
                key={opt.optionId}
                disabled={poll.isClosed || isSubmitting}
                onClick={() => handleOptionClick(opt.optionId)}
                className={`w-full relative p-3 rounded-2xl border text-left overflow-hidden group transition-all duration-300 cursor-pointer disabled:cursor-default ${
                  hasVotedThis
                    ? 'border-primary shadow-sm shadow-primary/10'
                    : 'hover:border-foreground/30'
                }`}
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: hasVotedThis ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                }}
              >
                {/* Animated Percentage Fill Bar */}
                <div
                  className={`absolute top-0 left-0 bottom-0 transition-all duration-700 ${
                    hasVotedThis ? 'bg-primary/25' : 'bg-foreground/5 group-hover:bg-foreground/10'
                  }`}
                  style={{ width: `${pct}%` }}
                />

                <div className="relative z-10 flex items-center justify-between gap-2 text-xs font-bold text-foreground">
                  <span className="flex items-center gap-2 truncate">
                    {hasVotedThis && (
                      <span className="w-4 h-4 rounded-full bg-primary text-black flex items-center justify-center text-[10px] font-black shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <span className={hasVotedThis ? 'text-primary font-black' : ''}>
                      {opt.optionText}
                    </span>
                  </span>

                  <span className="font-mono text-[11px] shrink-0 flex items-center gap-1.5 text-foreground/70">
                    <span className="font-black">{pct}%</span>
                    <span className="text-[10px] text-foreground/40">({votesCount})</span>
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div
        className="pt-2 border-t flex items-center justify-between text-[10px] text-foreground/40 font-mono"
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        <span>Created {formatRelativeTime(poll.createdAt)}</span>
        {hasVotedAny && (
          <span className="text-primary font-bold">You voted in this poll</span>
        )}
      </div>
    </div>
  );
}
