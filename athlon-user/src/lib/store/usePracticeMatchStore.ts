import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PracticeMatchRecord {
  id: string;
  sport: string;
  category: string;
  teamALabel: string;
  teamBLabel: string;
  createdAt: string;
  status: 'live' | 'completed';
  scoreA?: string;
  scoreB?: string;
  winner?: 'A' | 'B';
  liveRoute: string;
}

interface PracticeMatchState {
  records: PracticeMatchRecord[];
  addRecord: (record: PracticeMatchRecord) => void;
  updateRecord: (id: string, updates: Partial<PracticeMatchRecord>) => void;
  removeRecord: (id: string) => void;
  clearAll: () => void;
}

const MAX_RECORDS = 10;

export const usePracticeMatchStore = create<PracticeMatchState>()(
  persist(
    (set) => ({
      records: [],

      addRecord: (record) =>
        set((state) => {
          const updated = [record, ...state.records].slice(0, MAX_RECORDS);
          return { records: updated };
        }),

      updateRecord: (id, updates) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      removeRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),

      clearAll: () => set({ records: [] }),
    }),
    {
      name: 'practice-matches',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
