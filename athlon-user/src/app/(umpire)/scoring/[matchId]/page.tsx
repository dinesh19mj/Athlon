'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const CricketScoringBoard = dynamic(() => import('./CricketScoringBoard'), { ssr: false });
const BadmintonScoringBoard = dynamic(() => import('./BadmintonScoringBoard'), { ssr: false });
const FootballScoringBoard = dynamic(() => import('./FootballScoringBoard'), { ssr: false });
const VolleyballScoringBoard = dynamic(() => import('./VolleyballScoringBoard'), { ssr: false });

export default function UmpireScoringPage({ params }: { params: Promise<{ matchId: string }> }) {
  return (
    <React.Suspense fallback={<div className="h-[100dvh] flex items-center justify-center">Loading...</div>}>
      <UmpireScoringContent params={params} />
    </React.Suspense>
  );
}

function UmpireScoringContent({ params }: { params: Promise<{ matchId: string }> }) {
  const searchParams = useSearchParams();
  const sport = searchParams.get('sport');

  const { matchId } = React.use(params);

  if (sport === 'Cricket') return <CricketScoringBoard />;
  if (sport === 'Football') return <FootballScoringBoard />;
  if (sport === 'Volleyball') return <VolleyballScoringBoard matchId={matchId} />;

  // Default to Badminton for backward compatibility
  return <BadmintonScoringBoard params={params} />;
}
