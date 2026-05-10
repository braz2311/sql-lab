import { getDBSchema } from './db';

export interface ACItem {
  label: string;
  type: 'keyword' | 'table' | 'column';
}

export const SQL_KEYWORDS = [
  'SELECT','FROM','WHERE','GROUP BY','HAVING','ORDER BY','LIMIT','OFFSET',
  'INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL OUTER JOIN','JOIN','ON','AS',
  'AND','OR','NOT','IN','NOT IN','LIKE','BETWEEN','IS NULL','IS NOT NULL',
  'COUNT','SUM','AVG','MAX','MIN','ROUND','COALESCE','LENGTH','UPPER','LOWER',
  'TRIM','SUBSTR','CAST','CASE','WHEN','THEN','ELSE','END',
  'RANK','DENSE_RANK','ROW_NUMBER','LAG','LEAD','NTILE','OVER','PARTITION BY',
  'WITH','UNION','UNION ALL','INTERSECT','EXCEPT',
  'INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','DROP TABLE','CREATE TABLE',
  'ASC','DESC','DISTINCT','EXISTS','NOT EXISTS',
];

export function getACMatches(word: string): ACItem[] {
  if (word.length < 1) return [];
  const w = word.toLowerCase();
  const results: ACItem[] = [];

  SQL_KEYWORDS.filter((k) => k.toLowerCase().startsWith(w)).forEach((k) => {
    results.push({ label: k, type: 'keyword' });
  });

  try {
    const schema = getDBSchema();
    Object.keys(schema).filter((t) => t.toLowerCase().startsWith(w)).forEach((t) => {
      results.push({ label: t, type: 'table' });
    });
    Object.values(schema).forEach((tbl) => {
      tbl.columns.filter((c) => c.name.toLowerCase().startsWith(w)).forEach((c) => {
        if (!results.some((r) => r.label === c.name)) {
          results.push({ label: c.name, type: 'column' });
        }
      });
    });
  } catch (_) {}

  return results.slice(0, 10);
}

export function getCurrentWord(val: string, pos: number): string {
  const before = val.slice(0, pos);
  const match = before.match(/[\w.]+$/);
  return match ? match[0] : '';
}

export function applyCompletion(val: string, pos: number, completion: string): { value: string; cursor: number } {
  const before = val.slice(0, pos);
  const after = val.slice(pos);
  const match = before.match(/[\w.]*$/);
  const wordStart = pos - (match ? match[0].length : 0);
  const newVal = val.slice(0, wordStart) + completion + after;
  return { value: newVal, cursor: wordStart + completion.length };
}
