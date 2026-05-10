import { create } from 'zustand';
import type { DBSchema } from '../engine/db';

export interface QueryResult {
  columns: string[];
  values: unknown[][];
}

interface DBState {
  schema: DBSchema;
  lastResult: QueryResult | null;
  lastError: string | null;
  lastTimeMs: number;

  setSchema: (schema: DBSchema) => void;
  setResult: (result: QueryResult, timeMs: number) => void;
  setError: (error: string) => void;
  clearResult: () => void;
}

export const useDBStore = create<DBState>((set) => ({
  schema: {},
  lastResult: null,
  lastError: null,
  lastTimeMs: 0,

  setSchema: (schema) => set({ schema }),
  setResult: (result, timeMs) => set({ lastResult: result, lastError: null, lastTimeMs: timeMs }),
  setError: (error) => set({ lastError: error, lastResult: null }),
  clearResult: () => set({ lastResult: null, lastError: null, lastTimeMs: 0 }),
}));
