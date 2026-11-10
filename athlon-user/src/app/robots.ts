import type { MetadataRoute } from 'next';
import { PublicSeoService } from '@/lib/api/seo';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await PublicSeoService.getGlobalSettings();
  const siteUrl = (settings?.siteUrl || 'https://athlon.co.in').replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/tournaments',
          '/tournaments/*',
          '/venues',
          '/venues/*',
          '/academies',
          '/academies/*',
          '/coaches',
          '/coaches/*',
          '/communities',
          '/market',
          '/market/*',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/admin/',
          '/admin/*',
          '/org/',
          '/org/*',
          '/home/',
          '/home/*',
          '/login',
          '/register',
          '/api/',
          '/api/*',
          '/overlay/',
          '/stream/',
          '/match-setup/',
          '/my-bookings/',
          '/my-announcements/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/images/*',
          '/icons/*',
          '/Athlon-sport.png',
          '/Athlon-sport-1.png',
          '/logo/*',
        ],
        disallow: [
          '/admin/*',
          '/org/*',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
