'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { VenueProfileEditor } from '@/components/venue/VenueProfileEditor';

export default function VenueProfilePage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/org/${orgId}/settings?tab=amenities`}
          className="inline-flex items-center gap-2 text-xs font-bold text-foreground/60 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workspace Settings</span>
        </Link>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
          Workspace Settings Hub
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
          <Clock className="w-7 h-7 text-primary" />
          <span>Venue Amenities &amp; Operating Hours</span>
        </h1>
        <p className="text-xs text-foreground/60">
          Configure venue amenities, weekly operating schedules, court footwear rules, and cancellation policies.
        </p>
      </div>

      <VenueProfileEditor orgId={orgId} />
    </div>
  );
}
