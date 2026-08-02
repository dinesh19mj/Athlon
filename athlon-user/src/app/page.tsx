import type { Metadata } from 'next';
import { MarketingPageClient } from '@/components/marketing/MarketingPageClient';

export const metadata: Metadata = {
  title: 'Athlon | The tournament experience, elevated.',
  description: 'Athlon is a sports-tournament management platform with real-time scoring, live brackets, and role-based experiences for organizers, players, umpires, and spectators.',
  openGraph: {
    title: 'Athlon | Live Tournament Platform',
    description: 'Manage sports tournaments with real-time scoring and live brackets.',
    images: [{ url: '/og-image.jpg' }],
  },
};

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-(--bg) text-(--text)">
      <MarketingPageClient />
    </main>
  );
}
