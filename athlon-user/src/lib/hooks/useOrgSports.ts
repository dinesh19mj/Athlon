'use client';

import { useState, useEffect } from 'react';
import { OrganizationService } from '@/lib/api/organization';

export const GLOBAL_SPORT_EMOJIS: Record<string, string> = {
  BADMINTON: '🏸',
  CRICKET: '🏏',
  FOOTBALL: '⚽',
  SOCCER: '⚽',
  TENNIS: '🎾',
  TABLE_TENNIS: '🏓',
  BASKETBALL: '🏀',
  SWIMMING: '🏊',
  VOLLEYBALL: '🏐',
  SQUASH: '🎯',
  PICKLEBALL: '🏓',
  ATHLETICS: '🏃',
  RUNNING: '🏃',
  CHESS: '♟️',
  KARATE: '🥋',
  MARTIAL_ARTS: '🥋',
  YOGA: '🧘',
  BOXING: '🥊',
  OTHER: '🏅',
};

export function getSportEmoji(sport?: string): string {
  if (!sport) return '🏅';
  const key = sport.toUpperCase().replace(/[\s\-_/]+/g, '_');
  return GLOBAL_SPORT_EMOJIS[key] || GLOBAL_SPORT_EMOJIS[sport.toUpperCase()] || '🏅';
}

export interface SportOption {
  value: string; // e.g. "BADMINTON"
  name: string;  // e.g. "Badminton"
  label: string; // e.g. "🏸 Badminton"
  emoji: string; // e.g. "🏸"
}

export function useOrgSports(orgUuid?: string) {
  const [sports, setSports] = useState<string[]>(['Badminton']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgUuid) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchOrgSports() {
      if (!orgUuid) return;
      try {
        setLoading(true);
        const res = await OrganizationService.getProfileByOrgUuid(orgUuid);
        const data = res?.data || res;
        if (data?.sportsOffered && isMounted) {
          const list = data.sportsOffered
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
          if (list.length > 0) {
            setSports(list);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch org profile sports:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrgSports();

    return () => {
      isMounted = false;
    };
  }, [orgUuid]);

  const sportOptions: SportOption[] = sports.map((s) => {
    const key = s.toUpperCase().replace(/[\s\-_/]+/g, '_');
    const emoji = getSportEmoji(s);
    return {
      value: key,
      name: s,
      label: `${emoji} ${s}`,
      emoji,
    };
  });

  return {
    sports,
    sportOptions,
    defaultSport: sports[0] || 'Badminton',
    defaultSportKey: (sports[0] || 'Badminton').toUpperCase().replace(/[\s\-_/]+/g, '_'),
    loading,
  };
}
