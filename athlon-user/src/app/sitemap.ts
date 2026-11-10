import type { MetadataRoute } from 'next';
import { PublicSeoService } from '@/lib/api/seo';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { venueApi, VenueDto } from '@/lib/api/venue';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await PublicSeoService.getGlobalSettings();
  const siteUrl = (settings?.siteUrl || 'https://athlon.co.in').replace(/\/+$/, '');
  const now = new Date();

  // 1. Static Core Discovery & Legal Pages
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/tournaments`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/venues`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/academies`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/coaches`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/communities`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/market`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 2. Dynamic Active Tournaments
  let tournamentUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await TournamentService.getAll();
    const list: Tournament[] = res?.data || [];
    tournamentUrls = list
      .filter((t) => t.tournamentUuid)
      .slice(0, 500)
      .map((t) => ({
        url: `${siteUrl}/tournaments/${t.tournamentUuid}`,
        lastModified: t.endDate ? new Date(t.endDate) : now,
        changeFrequency: 'daily',
        priority: 0.8,
      }));
  } catch {
    // Graceful fallback if backend is offline during static pre-rendering
    tournamentUrls = [];
  }

  // 3. Dynamic Public Venues
  let venueUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await venueApi.getPublicVenues();
    const venues: VenueDto[] = res?.data || [];
    venueUrls = venues
      .filter((v) => v.venueUuid)
      .slice(0, 500)
      .map((v) => ({
        url: `${siteUrl}/venues/${v.venueUuid}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.75,
      }));
  } catch {
    venueUrls = [];
  }

  return [...staticUrls, ...tournamentUrls, ...venueUrls];
}
