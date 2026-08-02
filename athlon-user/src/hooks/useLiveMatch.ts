import { useEffect, useState, useCallback } from 'react';
import { mockSocket, ScoreEvent } from '../lib/live/mockSocket';

export function useLiveMatch(matchId: string) {
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);

  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = mockSocket.subscribe(matchId, (event: ScoreEvent) => {
      setLeftScore(event.leftScore);
      setRightScore(event.rightScore);
    });

    return () => {
      unsubscribe();
    };
  }, [matchId]);

  // Expose an updater function for the umpire to call
  const updateScore = useCallback((newLeft: number, newRight: number) => {
    // Optimistic update
    setLeftScore(newLeft);
    setRightScore(newRight);
    
    // Sync to server
    mockSocket.emitUpdate(matchId, { left: newLeft, right: newRight });
  }, [matchId]);

  return { leftScore, rightScore, updateScore };
}
