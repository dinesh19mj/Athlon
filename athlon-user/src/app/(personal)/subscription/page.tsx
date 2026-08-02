'use client';

import { SubscriptionPackages } from '@/components/player/SubscriptionPackages';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-background overflow-y-auto pb-24">
      <div className="pt-8">
        <SubscriptionPackages />
      </div>
    </div>
  );
}
