import { useState, useEffect, useRef } from 'react';
import { initSQL, loadDataset, getDBSchema } from '../engine/db';
import { runSQL } from '../engine/query';
import { useAppStore } from '../store/appStore';
import { useDBStore } from '../store/dbStore';

export function useDatabase(): { loading: boolean; error: string | null } {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  const curDataset = useAppStore((s) => s.curDataset);
  const setDbReady = useAppStore((s) => s.setDbReady);
  const setSchema = useDBStore((s) => s.setSchema);
  const setResult = useDBStore((s) => s.setResult);

  const runInitialQuery = () => {
    try {
      const res = runSQL('SELECT * FROM clientes;');
      setResult({ columns: res.columns, values: res.values }, res.timeMs);
    } catch (_) {
      try {
        const schema = getDBSchema();
        const firstTable = Object.keys(schema)[0];
        if (firstTable) {
          const res = runSQL(`SELECT * FROM ${firstTable};`);
          setResult({ columns: res.columns, values: res.values }, res.timeMs);
        }
      } catch (_) {}
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      try {
        await initSQL();
        await loadDataset('loja');
        setSchema(getDBSchema());
        setDbReady(true);
        runInitialQuery();
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    (async () => {
      try {
        await loadDataset(curDataset);
        setSchema(getDBSchema());
        runInitialQuery();
      } catch (e: unknown) {
        setError((e as Error).message);
      }
    })();
  }, [curDataset]);

  return { loading, error };
}
