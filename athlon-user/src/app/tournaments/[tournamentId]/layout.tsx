import type { Metadata } from 'next';
import React from 'react';
import { PublicSeoService } from '@/lib/api/seo';
import { TournamentService } from '@/lib/api/tournaments';

type Props = {
  params: Promise<{ tournamentId: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}): Promise<Metadata> {
  const { tournamentId } = await params;
  let entityData: Record<string, string> = { id: tournamentId };

  try {
    const res = await TournamentService.getById(tournamentId);
    const t = res?.data;
    if (t) {
      entityData = {
        title: t.name || 'Athlon Tournament',
        name: t.name || 'Athlon Tournament',
        tournamentName: t.name || 'Athlon Tournament',
        sport: t.sport || 'Sports',
        sportName: t.sport || 'Sports',
        city: t.city || t.district || t.location || 'India',
        district: t.district || t.city || 'India',
        state: t.state || 'India',
        venue: t.location || 'Athlon Arena',
        dates: t.startDate ? `${t.startDate}${t.endDate ? ` - ${t.endDate}` : ''}` : 'Upcoming',
        startDate: t.startDate || 'Upcoming',
        endDate: t.endDate || 'Upcoming',
        registrationDeadline: t.registrationClosingDate || t.startDate || 'Upcoming',
        organizer: '',
        organizerName: 'ATHLON Organizer',
        id: tournamentId,
        tournamentUuid: tournamentId,
      };
    }
  } catch {
    // If backend entity lookup is unavailable during crawl, use default entity context
    entityData = {
      title: 'Athlon Tournament',
      name: 'Athlon Tournament',
      tournamentName: 'Athlon Tournament',
      sport: 'Sports',
      sportName: 'Sports',
      city: 'India',
      district: 'India',
      state: 'India',
      venue: 'Athlon Arena',
      dates: 'Upcoming',
      startDate: 'Upcoming',
      endDate: 'Upcoming',
      registrationDeadline: 'Upcoming',
      organizerName: 'ATHLON Organizer',
      id: tournamentId,
      tournamentUuid: tournamentId,
    };
  }

  const resolved = await PublicSeoService.resolveEntityMetadata('TOURNAMENT', tournamentId, entityData);

  return {
    title: resolved.title,
    description: resolved.description,
    alternates: {
      canonical: resolved.canonicalUrl,
    },
    robots: resolved.robotsDirective,
    openGraph: {
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      url: resolved.canonicalUrl,
      images: resolved.ogImageUrl ? [{ url: resolved.ogImageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: resolved.twitterCardType === 'summary' ? 'summary' : 'summary_large_image',
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      images: resolved.ogImageUrl ? [resolved.ogImageUrl] : [],
    },
  };
}

export default function TournamentDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
