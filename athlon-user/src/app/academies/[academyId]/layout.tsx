import type { Metadata } from 'next';
import React from 'react';
import { PublicSeoService } from '@/lib/api/seo';
import { OrganizationService } from '@/lib/api/organization';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ academyId: string }>;
}): Promise<Metadata> {
  const { academyId } = await params;
  let entityData: Record<string, string> = { id: academyId };

  try {
    const res = await OrganizationService.getById(academyId);
    const org = res?.data;
    if (org) {
      entityData = {
        title: org.name || 'Athlon Sports Academy',
        sport: 'Sports Training',
        city: org.city || org.district || 'India',
        venue: org.name || 'Academy Campus',
        dates: 'Admissions Open',
        id: academyId,
      };
    }
  } catch {
    entityData = {
      title: 'Athlon Sports Academy',
      sport: 'Sports Training',
      city: 'India',
      venue: 'Academy Campus',
      dates: 'Admissions Open',
      id: academyId,
    };
  }

  const resolved = await PublicSeoService.resolveEntityMetadata('ACADEMY', academyId, entityData);

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

export default function AcademyDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
