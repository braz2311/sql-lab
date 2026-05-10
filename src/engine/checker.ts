import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { DATASETS } from '../data/datasets';
import { CAREER } from '../data/career';

export interface CheckResult {
  correct: boolean;
  message: string;
  expected?: unknown[][];
  got?: unknown[][];
}

function norm(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  const s = String(v).trim();
  const n = parseFloat(s);
  if (!isNaN(n)) return String(Math.round(n * 1000) / 1000);
  return s.toLowerCase();
}

async function getSQLjs() {
  return initSqlJs({ locateFile: () => wasmUrl });
}

export async function checkAnswer(
  userSql: string,
  curLevel: number,
  curEx: number,
  db: import('sql.js').Database
): Promise<CheckResult> {
  const levelData = CAREER[curLevel];
  if (!levelData) return { correct: false, message: 'Nível não encontrado.' };
  const exercise = levelData.exercises[curEx];
  if (!exercise) return { correct: false, message: 'Exercício não encontrado.' };

  const datasetKey = exercise.dataset_override || levelData.dataset;
  let tmpDB: import('sql.js').Database | null = null;

  try {
    const SQL = await getSQLjs();
    tmpDB = new SQL.Database();
    const dataset = DATASETS[datasetKey];
    if (dataset) tmpDB.run(dataset.sql);

    const uRes = db.exec(userSql);
    const eRes = tmpDB.exec(exercise.expected);

    if (!uRes[0] && !eRes[0]) return { correct: true, message: '✓ Correcto!' };
    if (!uRes[0]) return { correct: false, message: 'A tua query não devolveu resultados.' };
    if (!eRes[0]) return { correct: false, message: 'Erro interno ao verificar a resposta.' };

    const uVals = uRes[0].values.map((r) => r.map(norm).join('|')).sort();
    const eVals = eRes[0].values.map((r) => r.map(norm).join('|')).sort();
    const colMatch = uRes[0].columns.length === eRes[0].columns.length;
    const correct = colMatch && JSON.stringify(uVals) === JSON.stringify(eVals);

    return {
      correct,
      message: correct ? '✓ Correcto! Bom trabalho.' : '✗ Resultado diferente do esperado. Verifica o hint.',
      got: uRes[0].values,
      expected: eRes[0].values,
    };
  } catch (e: unknown) {
    return { correct: false, message: `Erro: ${(e as Error).message}` };
  } finally {
    if (tmpDB) try { tmpDB.close(); } catch (_) {}
  }
}

export async function checkInterviewAnswer(
  userSql: string,
  expected: string,
  dataset: string,
  db: import('sql.js').Database
): Promise<boolean> {
  let tmpDB: import('sql.js').Database | null = null;
  try {
    const SQL = await getSQLjs();
    tmpDB = new SQL.Database();
    const ds = DATASETS[dataset];
    if (ds) tmpDB.run(ds.sql);

    const uRes = db.exec(userSql);
    const eRes = tmpDB.exec(expected);
    if (!uRes[0] || !eRes[0]) return false;

    const uVals = uRes[0].values.map((r) => r.map(norm).join('|')).sort();
    const eVals = eRes[0].values.map((r) => r.map(norm).join('|')).sort();
    return uRes[0].columns.length === eRes[0].columns.length &&
      JSON.stringify(uVals) === JSON.stringify(eVals);
  } catch (_) { return false; }
  finally { if (tmpDB) try { tmpDB.close(); } catch (_) {} }
}
