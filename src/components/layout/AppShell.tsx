import { useState, useRef, useCallback, useEffect } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { useAppStore } from '../../store/appStore';
import { useDBStore } from '../../store/dbStore';
import { runSQL, friendlyError } from '../../engine/query';
import { getDBSchema } from '../../engine/db';
import { exportQueryCSV } from '../../engine/importer';
import { TopBar } from './TopBar';
import { CareerPanel } from '../career/CareerPanel';
import { InterviewMode } from '../interview/InterviewMode';
import { CSVImporter } from '../import/CSVImporter';
import { LessonModal } from '../lesson/LessonModal';

// ── SchemaArea: todas as tabelas com dados clicáveis ──────────────────────────
function SchemaArea({ sql, onCellClick, onHeaderClick, onTableClick }: {
  sql: string;
  onCellClick: (tbl: string, col: string, val: unknown, type: string) => void;
  onHeaderClick: (tbl: string, col: string) => void;
  onTableClick: (tbl: string) => void;
}) {
  const schema = useDBStore(s => s.schema);
  const lastResult = useDBStore(s => s.lastResult);
  const [tableData, setTableData] = useState<Record<string, { cols: string[]; rows: unknown[][] }>>({});

  useEffect(() => {
    const data: Record<string, { cols: string[]; rows: unknown[][] }> = {};
    Object.keys(schema).forEach(tbl => {
      try {
        const res = runSQL(`SELECT * FROM ${tbl}`);
        data[tbl] = { cols: res.columns, rows: res.values };
      } catch (_) {}
    });
    setTableData(data);
  }, [schema]);

  const q = sql.toUpperCase();
  const selCols = new Set<string>();
  const grpCols = new Set<string>();
  const ordCols = new Set<string>();
  const joinCols = new Set<string>();

  const selMatch = sql.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
  if (selMatch && !/SELECT\s+\*/i.test(sql)) {
    selMatch[1].split(',').forEach(c => {
      const cl = c.trim().split(/\s+AS\s+/i)[0].trim().split('.').pop()?.toLowerCase() || '';
      if (cl && !/^(count|sum|avg|max|min|round)\s*\(/i.test(c.trim())) selCols.add(cl);
    });
  }
  const gm = sql.match(/GROUP\s+BY\s+([\s\S]+?)(?:\s+HAVING|\s+ORDER|\s+LIMIT|$)/i);
  if (gm) gm[1].split(',').forEach(c => { const cl = c.trim().split('.').pop()?.toLowerCase() || ''; if (cl) grpCols.add(cl); });
  const om = sql.match(/ORDER\s+BY\s+([\s\S]+?)(?:\s+LIMIT|$)/i);
  if (om) om[1].split(',').forEach(c => { const cl = c.trim().replace(/\s+(ASC|DESC)\s*$/i, '').split('.').pop()?.toLowerCase() || ''; if (cl) ordCols.add(cl); });
  const jms = [...sql.matchAll(/ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/gi)];
  jms.forEach(m => { joinCols.add(m[2].toLowerCase()); joinCols.add(m[4].toLowerCase()); });
  const selAll = /SELECT\s+\*/i.test(sql);
  const activeTbls = new Set<string>();
  [...sql.matchAll(/(?:FROM|JOIN)\s+(\w+)/gi)].forEach(m => activeTbls.add(m[1].toLowerCase()));

  // Resultado da última query para highlight de linhas matching
  const resRows = lastResult ? lastResult.values.map(rv =>
    lastResult!.columns.map((c, i) => [c.toLowerCase(), String(rv[i] ?? '')]).reduce((o, [k, v]) => ({ ...o, [k]: v }), {} as Record<string, string>)
  ) : null;

  return (
    <div className="schema-area-full">
      {Object.entries(schema).map(([tbl, tblSchema]) => {
        const isActive = activeTbls.has(tbl.toLowerCase()) || activeTbls.size === 0;
        const data = tableData[tbl] || { cols: tblSchema.columns.map(c => c.name), rows: [] };
        return (
          <div key={tbl} className={`tbl-card-full${isActive ? ' active' : ''}`}>
            <div className="tbl-name-full">
              <span className="tbl-title-click" onClick={() => onTableClick(tbl)}>
                {tbl.toUpperCase()} <span style={{fontSize:9,opacity:.5}}>▶</span>
              </span>
              <span className="tbl-stats">{data.rows.length} registos</span>
            </div>
            <div className="tbl-scroll">
              <table className="schema-table">
                <thead>
                  <tr>
                    <th className="row-num-th">#</th>
                    {tblSchema.columns.map(col => {
                      const cl = col.name.toLowerCase();
                      const isActive2 = activeTbls.has(tbl.toLowerCase());
                      const cls = isActive2 && (selAll || selCols.has(cl)) ? 'col-selected'
                        : isActive2 && grpCols.has(cl) ? 'col-group'
                        : isActive2 && ordCols.has(cl) ? 'col-order'
                        : isActive2 && joinCols.has(cl) ? 'col-join' : '';
                      return (
                        <th key={col.name} className={`schema-th ${cls}`}
                            onClick={() => onHeaderClick(tbl, col.name)}
                            title={`SELECT ${col.name} FROM ${tbl}`}>
                          {col.name}
                          {col.constraint === 'PK' && <span className="badge-pk">PK</span>}
                          {col.constraint === 'FK' && <span className="badge-fk">FK</span>}
                          <span className="badge-type">{col.type}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, ri) => {
                    const rowObj = tblSchema.columns.reduce((o, col, ci) => ({ ...o, [col.name.toLowerCase()]: String((row as unknown[])[ci] ?? '') }), {} as Record<string, string>);
                    const isMatch = resRows?.some(rv => tblSchema.columns.every(col => rv[col.name.toLowerCase()] === undefined || rv[col.name.toLowerCase()] === rowObj[col.name.toLowerCase()]));
                    return (
                      <tr key={ri} className={isMatch ? 'row-match' : ''}>
                        <td className="row-num">{ri + 1}</td>
                        {tblSchema.columns.map((col, ci) => {
                          const v = (row as unknown[])[ci];
                          const cl = col.name.toLowerCase();
                          const isActive2 = activeTbls.has(tbl.toLowerCase());
                          const tdCls = isActive2 && (selAll || selCols.has(cl)) ? 'col-selected'
                            : isActive2 && grpCols.has(cl) ? 'col-group'
                            : isActive2 && ordCols.has(cl) ? 'col-order'
                            : isActive2 && joinCols.has(cl) ? 'col-join' : '';
                          return (
                            <td key={ci} className={`schema-td ${tdCls} ${v === null ? 'null-cell' : ''}`}
                                onClick={() => v !== null && onCellClick(tbl, col.name, v, col.type)}
                                title={v !== null ? `WHERE ${col.name} = '${v}'` : 'NULL'}>
                              {v === null ? <span className="null-badge">NULL</span> : String(v)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Pipeline ─────────────────────────────────────────────────────────────────
function Pipeline({ sql }: { sql: string }) {
  const s = sql.toLowerCase();
  const steps = [
    { key: 'from', label: 'FROM', order: '① lê', active: /\bfrom\b/.test(s) },
    { key: 'join', label: 'JOIN', order: '② combina', active: /\bjoin\b/.test(s) },
    { key: 'where', label: 'WHERE', order: '③ filtra', active: /\bwhere\b/.test(s) },
    { key: 'group', label: 'GROUP', order: '④ agrupa', active: /\bgroup\s+by\b/.test(s) },
    { key: 'having', label: 'HAVING', order: '⑤ filtra', active: /\bhaving\b/.test(s) },
    { key: 'select', label: 'SELECT', order: '⑥ projeta', active: /\bselect\b/.test(s), exec: true },
    { key: 'order', label: 'ORDER', order: '⑦ ordena', active: /\border\s+by\b/.test(s), exec: true },
    { key: 'limit', label: 'LIMIT', order: '⑧ corta', active: /\blimit\b/.test(s), exec: true },
  ];
  return (
    <div className="pipeline">
      <div className="pipeline-label">Ordem de execução SQL</div>
      <div className="pipeline-steps">
        {steps.map((step, i) => (
          <div key={step.key} className={`pipe-step${step.active ? (step.exec ? ' on exec' : ' on') : ''}`}>
            <div className="pipe-box">{step.label}</div>
            <div className="pipe-order">{step.order}</div>
            {i < steps.length - 1 && <span className="pipe-arrow">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Venn ─────────────────────────────────────────────────────────────────────
function Venn({ sql }: { sql: string }) {
  const s = sql.toLowerCase();
  const hasJoin = /\bjoin\b/.test(s);
  if (!hasJoin) return null;
  let desc = '<b>INNER JOIN</b> — só os que têm correspondência nas <b>duas</b> tabelas.';
  if (/\bleft\s+join\b/.test(s)) desc = '<b>LEFT JOIN</b> — todos da <b>esquerda</b>, mesmo sem par.';
  else if (/\bright\s+join\b/.test(s)) desc = '<b>RIGHT JOIN</b> — todos da <b>direita</b>, mesmo sem par.';
  else if (/\bfull\b/.test(s)) desc = '<b>FULL JOIN</b> — todos de <b>ambas</b> as tabelas.';
  return (
    <div className="venn-wrap">
      <span className="venn-label">JOIN:</span>
      <svg width="80" height="40" viewBox="0 0 80 40">
        <circle cx="24" cy="20" r="16" fill="rgba(56,189,248,.25)" stroke="#38bdf8" strokeWidth="1.5"/>
        <circle cx="56" cy="20" r="16" fill="rgba(74,222,128,.25)" stroke="#4ade80" strokeWidth="1.5"/>
        <text x="16" y="23" fontSize="8" fill="#38bdf8" textAnchor="middle" fontFamily="monospace">A</text>
        <text x="64" y="23" fontSize="8" fill="#4ade80" textAnchor="middle" fontFamily="monospace">B</text>
      </svg>
      <div className="venn-desc" dangerouslySetInnerHTML={{ __html: desc }} />
    </div>
  );
}

// ── ResultTable ───────────────────────────────────────────────────────────────
function ResultTable({ columns, values, timeMs }: { columns: string[]; values: unknown[][]; timeMs: number }) {
  if (!columns.length) return null;
  const lastResult = { columns, values };
  const handleExport = () => exportQueryCSV(columns, values);
  return (
    <div className="result-area">
      <div className="result-toolbar">
        <span className="sec-label" style={{margin:0}}>Resultado</span>
        <button className="tbtn" onClick={handleExport}>⬇ CSV</button>
        <span className="res-summary">{values.length} linha(s) · {timeMs.toFixed(1)}ms</span>
      </div>
      <div className="result-scroll-inner">
        <table className="res-table">
          <thead>
            <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {values.map((row, i) => (
              <tr key={i}>
                {row.map((v, j) => (
                  <td key={j} className={v === null ? 'null-cell' : ''}>
                    {v === null ? <span className="null-badge">NULL</span> : String(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main AppShell ─────────────────────────────────────────────────────────────
export function AppShell() {
  const { loading, error } = useDatabase();
  const mode = useAppStore(s => s.mode);
  const { lastResult, lastError, lastTimeMs } = useDBStore();
  const setResult = useDBStore(s => s.setResult);
  const setError = useDBStore(s => s.setError);
  const [sql, setSql] = useState('SELECT * FROM clientes;');
  const [lessonOpen, setLessonOpen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const insertToEditor = useCallback((text: string) => {
    const ta = editorRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const newVal = sql.slice(0, pos) + text + sql.slice(pos);
    setSql(newVal);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = pos + text.length; ta.focus(); }, 0);
  }, [sql]);

  const executeSQL = useCallback((s?: string) => {
    const q = (s || sql).trim();
    if (!q) return;
    try {
      const res = runSQL(q);
      setResult({ columns: res.columns, values: res.values }, res.timeMs);
    } catch (e: unknown) {
      setError(friendlyError((e as Error).message, q));
    }
  }, [sql, setResult, setError]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); executeSQL(); }
  };

  // Click on table cell → add WHERE
  const handleCellClick = useCallback((tbl: string, col: string, val: unknown, type: string) => {
    const isNum = /INT|DECIMAL|REAL|NUMERIC/i.test(type) && !isNaN(Number(val));
    const quoted = isNum ? String(val) : `'${val}'`;
    setSql(prev => {
      const base = prev.trim().replace(/;$/, '');
      if (/\bWHERE\b/i.test(base)) {
        const tail = base.match(/(\s+ORDER\s+BY[\s\S]*)/i);
        if (tail) return base.slice(0, base.length - tail[1].length) + `\nAND ${col} = ${quoted}` + tail[1] + ';';
        return base + `\nAND ${col} = ${quoted};`;
      }
      const tail = base.match(/(\s+ORDER\s+BY[\s\S]*)/i);
      if (tail) return base.slice(0, base.length - tail[1].length) + `\nWHERE ${col} = ${quoted}` + tail[1] + ';';
      return base + `\nWHERE ${col} = ${quoted};`;
    });
  }, []);

  // Click on column header → add to SELECT
  const handleHeaderClick = useCallback((tbl: string, col: string) => {
    setSql(prev => {
      const base = prev.trim().replace(/;$/, '');
      if (/SELECT\s+\*/i.test(base)) return `SELECT ${col} FROM ${tbl};`;
      const selMatch = base.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
      if (selMatch) {
        const cols = selMatch[1].split(',').map(c => c.trim());
        if (cols.includes(col)) return prev;
        return base.replace(selMatch[1], [...cols, col].join(', ')) + ';';
      }
      return `SELECT ${col} FROM ${tbl};`;
    });
  }, []);

  // Click on table name → SELECT * FROM tbl
  const handleTableClick = useCallback((tbl: string) => {
    const q = `SELECT * FROM ${tbl};`;
    setSql(q);
    setTimeout(() => executeSQL(q), 50);
  }, [executeSQL]);

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>A carregar SQL Lab...</p>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <h2>Erro ao inicializar</h2>
      <pre>{error}</pre>
    </div>
  );

  return (
    <div className="app-shell">
      <TopBar onLessonOpen={() => setLessonOpen(true)} />
      <div className="app-body">

        {/* LEFT — Career/Editor/Pipeline/Mentor */}
        <div className="panel-left">
          {/* Mode panels */}
          {mode === 'career' && <CareerPanel sql={sql} />}
          {mode === 'free' && (
            <div className="free-panel-left">
              <div className="free-title">🔬 Exploração Livre</div>
              <p className="free-desc">Clica nas tabelas à direita para explorar. Clica nas células para filtrar.</p>
              <button className="btn-lesson" onClick={() => setLessonOpen(true)}>📚 Abrir lições</button>
            </div>
          )}
          {mode === 'interview' && <InterviewMode />}
          {mode === 'import' && <CSVImporter />}

          {/* Editor */}
          <div className="editor-wrap">
            <div className="editor-toolbar">
              <span className="sec-label" style={{margin:0}}>Query</span>
              <button className="tbtn" onClick={() => setSql('')}>✕ limpar</button>
              <span className="perf-inline">{lastTimeMs > 0 ? `${lastTimeMs.toFixed(1)}ms` : ''}</span>
            </div>
            <textarea
              ref={editorRef}
              className="sql-editor-main"
              value={sql}
              onChange={e => setSql(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="SELECT ..."
              spellCheck={false}
            />
            <button className="btn-run-main" onClick={() => executeSQL()}>▶ Executar <span style={{fontSize:10,opacity:.6}}>Ctrl+Enter</span></button>
          </div>

          {/* Pipeline */}
          <Pipeline sql={sql} />
          <Venn sql={sql} />

          {/* Mentor */}
          <div className="mentor-wrap">
            <div className="sec-label" style={{marginBottom:4}}>Professor Analista</div>
            {lastError && <div className="mentor-msg error" dangerouslySetInnerHTML={{ __html: lastError }} />}
            {!lastError && lastResult && <div className="mentor-msg success">✓ <b>Query válida!</b> Retornou <b>{lastResult.values.length}</b> linha(s).</div>}
            {!lastError && !lastResult && <div className="mentor-msg">Escreve a tua query. Clica nas células à direita para construir filtros.</div>}
          </div>
        </div>

        {/* RIGHT — Todas as tabelas com dados + Resultado */}
        <div className="panel-right-full">
          <SchemaArea
            sql={sql}
            onCellClick={handleCellClick}
            onHeaderClick={handleHeaderClick}
            onTableClick={handleTableClick}
          />
          {lastResult && !lastError && (
            <ResultTable columns={lastResult.columns} values={lastResult.values} timeMs={lastTimeMs} />
          )}
          {!lastResult && !lastError && (
            <div className="result-placeholder-full">
              Clica no nome de uma tabela ou prime <kbd>Ctrl+Enter</kbd> para ver resultados.
            </div>
          )}
        </div>
      </div>
      <LessonModal open={lessonOpen} onClose={() => setLessonOpen(false)} />
    </div>
  );
}
