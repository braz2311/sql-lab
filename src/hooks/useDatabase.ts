import { useEffect, useRef, useState } from 'react';
import { initSQL, loadDataset, getDBSchema } from '../engine/db';
import { useAppStore } from '../store/appStore';
import { useDBStore } from '../store/dbStore';

export function useDatabase(): { loading: boolean; error: string | null } {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  const curDataset = useAppStore((s) => s.curDataset);
  const setDbReady = useAppStore((s) => s.setDbReady);
  const setSchema = useDBStore((s) => s.setSchema);

  // One-time init
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        setLoading(true);
        await initSQL();
        await loadDataset('loja');
        setSchema(getDBSchema());
        setDbReady(true);
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Reload when dataset changes
  useEffect(() => {
    if (!initialized.current) return;
    (async () => {
      try {
        await loadDataset(curDataset);
        setSchema(getDBSchema());
      } catch (e: unknown) {
        setError((e as Error).message);
      }
    })();
  }, [curDataset]);

  return { loading, error };
}
