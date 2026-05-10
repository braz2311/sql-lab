import { getDB } from './db';

export interface ImportResult {
  tableName: string;
  rowCount: number;
  columns: string[];
  error?: string;
}

export async function importCSV(
  file: File,
  onProgress?: (pct: number) => void
): Promise<ImportResult> {
  if (file.size > 5 * 1024 * 1024) {
    return { tableName: '', rowCount: 0, columns: [], error: `Ficheiro demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Limite: 5MB.` };
  }

  const text = await file.text();
  onProgress?.(20);

  const lines = text.trim().split('\n').filter((l) => l.trim());
  if (lines.length < 2) return { tableName: '', rowCount: 0, columns: [], error: 'O CSV precisa de pelo menos 2 linhas (cabeçalho + dados).' };

  const firstLine = lines[0];
  const sep = firstLine.split(';').length > firstLine.split(',').length ? ';' : ',';
  const headers = firstLine.split(sep).map((h) =>
    h.trim().replace(/^"|"$/g, '').replace(/\s+/g, '_').toLowerCase()
  );

  const rows = lines.slice(1).map((l) => {
    const vals: string[] = [];
    let cur = '', inQ = false;
    for (const ch of l) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === sep && !inQ) { vals.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    vals.push(cur.trim());
    return vals.map((v) => v.replace(/^"|"$/g, ''));
  });

  onProgress?.(50);

  const types = headers.map((_, i) => {
    const sample = rows.slice(0, 5).map((r) => r[i]).filter((v) => v !== '');
    if (sample.every((v) => /^-?\d+$/.test(v))) return 'INT';
    if (sample.every((v) => /^-?\d*\.?\d+$/.test(v))) return 'DECIMAL';
    return 'TEXT';
  });

  const tName = file.name.replace('.csv', '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  const db = getDB();

  try {
    db.run(`DROP TABLE IF EXISTS ${tName};`);
    db.run(`CREATE TABLE ${tName}(${headers.map((h, i) => `${h} ${types[i]}`).join(',')});`);

    rows.forEach((row, idx) => {
      const v = row.map((val, i) =>
        types[i] === 'TEXT' ? `'${val.replace(/'/g, "''")}'` : (val || 'NULL')
      );
      try { db.run(`INSERT INTO ${tName} VALUES(${v.join(',')});`); } catch (_) {}
      if (idx % 100 === 0) onProgress?.(50 + Math.round((idx / rows.length) * 40));
    });

    onProgress?.(100);
    return { tableName: tName, rowCount: rows.length, columns: headers };
  } catch (e: unknown) {
    return { tableName: tName, rowCount: 0, columns: headers, error: (e as Error).message };
  }
}

export function exportQueryCSV(columns: string[], values: unknown[][], filename = 'query_result.csv'): void {
  const header = columns.join(',');
  const rows = values.map((row) =>
    row.map((v) => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v)).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
