'use client';

import React, { useState, useEffect, useRef } from 'react';
import WorkspaceHeroCard, { WorkspaceHeroCardProps } from './WorkspaceHeroCard';

export interface HomeIntroHeroProps extends Omit<WorkspaceHeroCardProps, 'isDesktop'> {
  backgroundVideo: string;
  onVideoComplete?: () => void;
  videoCompleted?: boolean;
  isDesktop?: boolean;
}

type HeroPlaybackState = 'VIDEO_PLAYING' | 'TRANSITIONING' | 'HERO_VISIBLE';

export default function HomeIntroHero({
  backgroundVideo,
  activeRole,
  activeOrg,
  playerStats,
  playerTournamentCount,
  playerUpcomingMatchesCount,
  organizerStats,
  otherOrgStats,
  onVideoComplete,
  videoCompleted = false,
  isDesktop = false,
}: HomeIntroHeroProps) {
  // If the video has already completed for this page session, start directly at HERO_VISIBLE
  const [playbackState, setPlaybackState] = useState<HeroPlaybackState>(() => {
    return videoCompleted ? 'HERO_VISIBLE' : 'VIDEO_PLAYING';
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure only the active viewport breakpoint mounts and decodes video
  const [screenMatches, setScreenMatches] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMatch = () => {
      const isWide = window.innerWidth >= 768;
      setScreenMatches(isDesktop ? isWide : !isWide);
    };
    checkMatch();
    window.addEventListener('resize', checkMatch);
    return () => window.removeEventListener('resize', checkMatch);
  }, [isDesktop]);

  // Check prefers-reduced-motion and video availability on mount
  useEffect(() => {
    if (videoCompleted) {
      setPlaybackState('HERO_VISIBLE');
      return;
    }

    if (!backgroundVideo) {
      setPlaybackState('HERO_VISIBLE');
      onVideoComplete?.();
      return;
    }

    if (typeof window !== 'undefined') {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (motionQuery.matches) {
        setPlaybackState('HERO_VISIBLE');
        onVideoComplete?.();
        return;
      }
    }
  }, [backgroundVideo, videoCompleted, onVideoComplete]);

  // Attempt video autoplay with graceful rejection handling
  useEffect(() => {
    if (playbackState !== 'VIDEO_PLAYING' || !screenMatches) return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    // Ensure audio remains muted per guidelines
    videoEl.muted = true;

    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch((_error) => {
        // Autoplay policy prevented playback or video failed to start
        // Fail-closed to hero card immediately without leaving blank container
        setPlaybackState('HERO_VISIBLE');
        onVideoComplete?.();
      });
    }
  }, [playbackState, onVideoComplete]);

  // Trigger smooth transition when video finishes naturally
  const handleVideoEnded = () => {
    if (playbackState !== 'VIDEO_PLAYING') return;

    // Check reduced motion preference for transition duration
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setPlaybackState('HERO_VISIBLE');
      onVideoComplete?.();
      return;
    }

    setPlaybackState('TRANSITIONING');

    // 300ms smooth fade transition (within requested 250-450ms range)
    transitionTimeoutRef.current = setTimeout(() => {
      setPlaybackState('HERO_VISIBLE');
      onVideoComplete?.();
    }, 300);
  };

  // Video load/error fallback
  const handleVideoError = () => {
    setPlaybackState('HERO_VISIBLE');
    onVideoComplete?.();
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const showVideo = playbackState === 'VIDEO_PLAYING' || playbackState === 'TRANSITIONING';

  return (
    <div
      className={`relative w-full h-[185px] sm:h-[205px] ${
        isDesktop ? 'md:h-[225px]' : ''
      } rounded-[20px] overflow-hidden border shadow-md select-none`}
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-border)',
      }}
    >
      {/* ─── 1. DYNAMIC WORKSPACE HERO CARD (Pre-rendered, exact container size) ─── */}
      <WorkspaceHeroCard
        activeRole={activeRole}
        activeOrg={activeOrg}
        playerStats={playerStats}
        playerTournamentCount={playerTournamentCount}
        playerUpcomingMatchesCount={playerUpcomingMatchesCount}
        organizerStats={organizerStats}
        otherOrgStats={otherOrgStats}
        isDesktop={isDesktop}
      />

      {/* ─── 2. VIDEO OVERLAY (Fills card 100% edge-to-edge with no inner framing) ─── */}
      {showVideo && (
        <div
          className={`absolute inset-0 z-20 w-full h-full flex items-center justify-center transform-gpu will-change-[opacity] transition-opacity duration-300 ease-out ${
            playbackState === 'TRANSITIONING'
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100 pointer-events-auto'
          }`}
          style={{
            backgroundColor: 'var(--athlon-card)',
          }}
        >
          <video
            ref={videoRef}
            key={backgroundVideo}
            autoPlay
            muted
            playsInline
            preload="metadata"
            loop={false}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            className="w-full h-full object-cover"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
}
