import { getDB, getDBSchema } from './db';

export interface ExecResult {
  columns: string[];
  values: unknown[][];
  timeMs: number;
}

export interface ExplainRow {
  detail: string;
  isScan: boolean;
  isSearch: boolean;
  isUseIndex: boolean;
}

export interface StoryStep {
  clause: string;
  description: string;
  color: string;
}

export function runSQL(sql: string): ExecResult {
  const db = getDB();
  const t0 = performance.now();
  const res = db.exec(sql);
  const timeMs = performance.now() - t0;
  if (!res[0]) return { columns: [], values: [], timeMs };
  return { columns: res[0].columns, values: res[0].values, timeMs };
}

export function friendlyError(err: string, sql: string): string {
  if (err.includes('no such column')) {
    const col = err.split(': ')[1];
    const wm = sql.match(/WHERE\s+(\w+)\s*=\s*([A-Za-záéíóúãõàâêôçÁÉÍÓÚÃÕÀÂÊÔÇ_]+)/i);
    if (wm && wm[2].toUpperCase() === col?.toUpperCase())
      return `<b>Faltam aspas simples!</b> <code>${col}</code> é texto, não coluna.<br>✓ <code style="color:var(--green)">WHERE ${wm[1]} = '${col}'</code>`;
    const schema = getDBSchema();
    const inTbl = Object.entries(schema).find(([, t]) => t.columns.some(c => c.name === col));
    if (inTbl) return `A coluna <b>${col}</b> existe em <b>${inTbl[0]}</b> mas não na tabela indicada. Falta um JOIN?`;
    return `A coluna <b>${col}</b> não existe. Verifica o schema à esquerda.`;
  }
  if (err.includes('no such table')) {
    const tbl = err.split(': ')[1];
    const avail = Object.keys(getDBSchema()).join(', ');
    return `Tabela <b>${tbl}</b> não existe. Disponíveis: <b>${avail || 'nenhuma'}</b>.`;
  }
  if (err.includes('incomplete input')) return 'Query incompleta — falta o <b>FROM</b> ou o nome da tabela.';
  if (err.includes('syntax error')) return 'Erro de sintaxe. Verifica vírgulas, parênteses e palavras-chave SQL.';
  if (err.includes('ambiguous')) return 'Coluna <b>ambígua</b> — existe em mais de uma tabela. Usa <code>tabela.coluna</code>';
  if (err.includes('aggregate')) return 'Erro de agregação. Quando usas COUNT/SUM/AVG, as outras colunas precisam de estar no <b>GROUP BY</b>.';
  if (err.includes('no such function')) return 'Função não reconhecida. SQLite suporta: COUNT, SUM, AVG, MAX, MIN, ROUND, COALESCE, LENGTH, UPPER, LOWER.';
  return err;
}

export function analyzePerformance(sql: string): ExplainRow[] {
  const db = getDB();
  try {
    const plan = db.exec('EXPLAIN QUERY PLAN ' + sql);
    if (!plan[0]) return [];
    return plan[0].values.map((row) => {
      const detail = String(row[3] || '');
      return {
        detail,
        isScan: detail.includes('SCAN'),
        isSearch: detail.includes('SEARCH'),
        isUseIndex: detail.includes('USING INDEX') || detail.includes('COVERING INDEX'),
      };
    });
  } catch (_) { return []; }
}

export function explainQuery(sql: string): StoryStep[] {
  const s = sql.toLowerCase();
  const steps: StoryStep[] = [];
  if (/\bfrom\b/.test(s)) steps.push({ clause: 'FROM', description: 'Vai ao armazém buscar a tabela', color: '#38bdf8' });
  if (/\bjoin\b/.test(s)) steps.push({ clause: 'JOIN', description: 'Liga tabelas pela chave em comum', color: '#4ade80' });
  if (/\bwhere\b/.test(s)) steps.push({ clause: 'WHERE', description: 'Filtra linhas que não passam na condição', color: '#fb923c' });
  if (/\bgroup\s+by\b/.test(s)) steps.push({ clause: 'GROUP BY', description: 'Agrupa linhas com o mesmo valor', color: '#a78bfa' });
  if (/\bhaving\b/.test(s)) steps.push({ clause: 'HAVING', description: 'Filtra grupos após a agregação', color: '#f472b6' });
  if (/\bselect\b/.test(s)) steps.push({ clause: 'SELECT', description: 'Escolhe as colunas a mostrar', color: '#fbbf24' });
  if (/\border\s+by\b/.test(s)) steps.push({ clause: 'ORDER BY', description: 'Ordena o resultado final', color: '#34d399' });
  if (/\blimit\b/.test(s)) steps.push({ clause: 'LIMIT', description: 'Limita o número de linhas devolvidas', color: '#94a3b8' });
  return steps;
}

export function beautifySQL(sql: string): string {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT',
    'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'JOIN', 'ON', 'AND', 'OR',
    'WITH', 'AS', 'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];
  let result = sql.trim();
  keywords.forEach((kw) => {
    result = result.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '\n' + kw);
  });
  return result.trim().replace(/\n{2,}/g, '\n').replace(/,\s*/g, ',\n  ');
}
