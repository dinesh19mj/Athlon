import React from 'react';
import MatchOverlay from './MatchOverlay';

export default function OverlayPage({ params }: { params: Promise<{ matchId: string }> }) {
  return (
    <React.Suspense fallback={<div className="text-white">Loading Overlay...</div>}>
      <MatchOverlay params={params} />
    </React.Suspense>
  );
}
