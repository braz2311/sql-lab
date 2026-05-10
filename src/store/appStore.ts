import { create } from 'zustand';

export type AppMode = 'career' | 'free' | 'interview' | 'import';

interface AppState {
  mode: AppMode;
  curDataset: string;
  curLevel: number;
  curEx: number;
  dbReady: boolean;
  importedTableNames: string[];

  setMode: (mode: AppMode) => void;
  setCurDataset: (dataset: string) => void;
  setCurLevel: (level: number) => void;
  setCurEx: (ex: number) => void;
  setDbReady: (ready: boolean) => void;
  addImportedTable: (name: string) => void;
  clearImportedTables: () => void;
  nextExercise: (maxEx: number) => void;
  prevExercise: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'career',
  curDataset: 'loja',
  curLevel: 0,
  curEx: 0,
  dbReady: false,
  importedTableNames: [],

  setMode: (mode) => set({ mode }),
  setCurDataset: (curDataset) => set({ curDataset }),
  setCurLevel: (curLevel) => set({ curLevel, curEx: 0 }),
  setCurEx: (curEx) => set({ curEx }),
  setDbReady: (dbReady) => set({ dbReady }),
  addImportedTable: (name) =>
    set((s) => ({ importedTableNames: s.importedTableNames.includes(name) ? s.importedTableNames : [...s.importedTableNames, name] })),
  clearImportedTables: () => set({ importedTableNames: [] }),
  nextExercise: (maxEx) => set((s) => s.curEx < maxEx - 1 ? { curEx: s.curEx + 1 } : {}),
  prevExercise: () => set((s) => s.curEx > 0 ? { curEx: s.curEx - 1 } : {}),
}));
