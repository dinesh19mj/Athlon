export type ScoreEvent = {
  type: 'SCORE_UPDATE';
  matchId: string;
  leftScore: number;
  rightScore: number;
  timestamp: number;
};

type Listener = (event: ScoreEvent) => void;

class MockSocket {
  private listeners: Record<string, Set<Listener>> = {};
  
  // Simulated server state
  private scores: Record<string, { left: number; right: number }> = {};

  subscribe(matchId: string, callback: Listener) {
    if (!this.listeners[matchId]) {
      this.listeners[matchId] = new Set();
    }
    this.listeners[matchId].add(callback);

    // Give initial state
    if (!this.scores[matchId]) {
      this.scores[matchId] = { left: 0, right: 0 };
    }
    
    // Emit initial sync asynchronously to simulate connection delay
    setTimeout(() => {
      callback({
        type: 'SCORE_UPDATE',
        matchId,
        leftScore: this.scores[matchId].left,
        rightScore: this.scores[matchId].right,
        timestamp: Date.now(),
      });
    }, 100);

    return () => {
      this.listeners[matchId]?.delete(callback);
    };
  }

  // Client to Server emit
  emitUpdate(matchId: string, updates: { left: number; right: number }) {
    if (!this.scores[matchId]) {
      this.scores[matchId] = { left: 0, right: 0 };
    }
    
    // Update local simulated server state
    this.scores[matchId].left = updates.left;
    this.scores[matchId].right = updates.right;

    const event: ScoreEvent = {
      type: 'SCORE_UPDATE',
      matchId,
      leftScore: updates.left,
      rightScore: updates.right,
      timestamp: Date.now(),
    };

    // Broadcast to all subscribers for this matchId
    if (this.listeners[matchId]) {
      this.listeners[matchId].forEach(listener => {
        // simulate network latency
        setTimeout(() => listener(event), 50);
      });
    }
  }
}

export const mockSocket = new MockSocket();
