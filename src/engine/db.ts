import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import { DATASETS } from '../data/datasets';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

export interface SchemaColumn {
  name: string;
  type: string;
  constraint: 'PK' | 'FK' | '';
  fkRef?: string;
}

export interface SchemaTable {
  columns: SchemaColumn[];
}

export interface DBSchema {
  [tableName: string]: SchemaTable;
}

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

export async function initSQL(): Promise<void> {
  SQL = await initSqlJs({ locateFile: () => wasmUrl });
}

export async function initDB(datasetKey: string): Promise<void> {
  if (!SQL) await initSQL();
  if (db) { try { db.close(); } catch (_) {} }
  db = new SQL!.Database();
  const dataset = DATASETS[datasetKey];
  if (dataset) db.run(dataset.sql);
}

export function getDB(): Database {
  if (!db) throw new Error('DB não inicializada');
  return db;
}

export async function loadDataset(key: string): Promise<void> {
  if (!SQL) await initSQL();
  if (db) { try { db.close(); } catch (_) {} }
  db = new SQL!.Database();
  const dataset = DATASETS[key];
  if (dataset) db.run(dataset.sql);
}

export function closeDB(): void {
  if (db) { try { db.close(); } catch (_) {} db = null; }
}

export function getDBSchema(): DBSchema {
  if (!db) return {};
  const schema: DBSchema = {};
  try {
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    if (!tables[0]) return schema;
    tables[0].values.forEach(([tName]) => {
      const name = tName as string;
      const info = db!.exec(`PRAGMA table_info(${name})`);
      if (!info[0]) return;
      const fks: Record<string, string> = {};
      try {
        const fkRows = db!.exec(`PRAGMA foreign_key_list(${name})`);
        if (fkRows[0]) {
          fkRows[0].values.forEach((r) => {
            fks[r[3] as string] = `${r[2]}.${r[4]}`;
          });
        }
      } catch (_) {}
      schema[name] = {
        columns: info[0].values.map((r) => ({
          name: r[1] as string,
          type: (r[2] as string) || 'TEXT',
          constraint: r[5] ? 'PK' : fks[r[1] as string] ? 'FK' : '',
          fkRef: fks[r[1] as string],
        })),
      };
    });
  } catch (_) {}
  return schema;
}
