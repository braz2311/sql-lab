import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  done: string[];        // chaves "level-ex" ex: "0-3"
  streak: number;
  queryHistory: string[]; // max 50

  markDone: (key: string) => void;
  isDone: (key: string) => boolean;
  setStreak: (n: number) => void;
  incrementStreak: () => void;
  addHistory: (sql: string) => void;
  clearHistory: () => void;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      done: [],
      streak: 0,
      queryHistory: [],

      markDone: (key) =>
        set((s) => ({ done: s.done.includes(key) ? s.done : [...s.done, key] })),
      isDone: (key) => get().done.includes(key),
      setStreak: (streak) => set({ streak }),
      incrementStreak: () => set((s) => ({ streak: s.streak + 1 })),
      addHistory: (sql) =>
        set((s) => ({
          queryHistory: [sql, ...s.queryHistory.filter((q) => q !== sql)].slice(0, 50),
        })),
      clearHistory: () => set({ queryHistory: [] }),
      resetProgress: () => set({ done: [], streak: 0, queryHistory: [] }),
    }),
    { name: 'sql-lab-progress' }
  )
);
