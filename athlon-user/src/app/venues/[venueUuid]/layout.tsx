import type { Metadata } from 'next';
import React from 'react';
import { PublicSeoService } from '@/lib/api/seo';
import { venueApi } from '@/lib/api/venue';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venueUuid: string }>;
}): Promise<Metadata> {
  const { venueUuid } = await params;
  let entityData: Record<string, string> = { id: venueUuid };

  try {
    const res = await venueApi.getVenueByUuid(venueUuid);
    const v = res?.data;
    if (v) {
      entityData = {
        title: v.name || 'Athlon Sports Venue',
        sport: 'Multi-Sport',
        city: v.city || v.district || 'India',
        venue: v.name || 'Sports Venue',
        dates: 'Open Daily',
        id: venueUuid,
      };
    }
  } catch {
    entityData = {
      title: 'Athlon Sports Venue',
      sport: 'Multi-Sport',
      city: 'India',
      venue: 'Sports Facility',
      dates: 'Open Daily',
      id: venueUuid,
    };
  }

  const resolved = await PublicSeoService.resolveEntityMetadata('VENUE', venueUuid, entityData);

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

export default function VenueDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
