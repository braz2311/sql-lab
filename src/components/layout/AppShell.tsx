import { useState, useRef, useCallback } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { useAppStore } from '../../store/appStore';
import { useDBStore } from '../../store/dbStore';
import { TopBar } from './TopBar';
import { SchemaPanel } from '../schema/SchemaPanel';
import { SQLEditor } from '../editor/SQLEditor';
import { ResultTable } from '../results/ResultTable';
import { CareerPanel } from '../career/CareerPanel';
import { InterviewMode } from '../interview/InterviewMode';
import { CSVImporter } from '../import/CSVImporter';
import { LessonModal } from '../lesson/LessonModal';

export function AppShell() {
  const { loading, error } = useDatabase();
  const mode = useAppStore((s) => s.mode);
  const { lastResult, lastError, lastTimeMs } = useDBStore();
  const [sql, setSql] = useState('SELECT * FROM clientes;');
  const [lessonOpen, setLessonOpen] = useState(false);

  const editorInsertRef = useRef<{ insert: (text: string) => void } | null>(null);
  const handleInsertRef = useCallback((ref: { insert: (text: string) => void }) => {
    editorInsertRef.current = ref;
  }, []);

  const handleColumnClick = (col: string) => {
    editorInsertRef.current?.insert(col);
  };

  // Clicar numa célula → adiciona WHERE coluna = 'valor' ao editor
  const handleCellClick = (col: string, val: unknown) => {
    const isNum = typeof val === 'number' || !isNaN(Number(val));
    const clause = isNum
      ? ` WHERE ${col} = ${val}`
      : ` WHERE ${col} = '${val}'`;

    setSql((prev) => {
      const base = prev.trim().replace(/;$/, '');
      // Se já tem WHERE, usa AND em vez de WHERE
      if (/\bWHERE\b/i.test(base)) {
        return base + ` AND ${col} = ${isNum ? val : `'${val}'`};`;
      }
      // Remove ORDER BY antes de adicionar WHERE
      const withoutOrder = base.replace(/\s+ORDER BY.*/i, '');
      const orderMatch = base.match(/(\s+ORDER BY.*)/i);
      return withoutOrder + clause + (orderMatch ? orderMatch[1] : '') + ';';
    });
  };

  // Clicar no header → ORDER BY coluna
  const handleHeaderClick = (col: string) => {
    setSql((prev) => {
      const base = prev.trim().replace(/;$/, '');
      const withoutOrder = base.replace(/\s+ORDER BY.*/i, '');
      return withoutOrder + ` ORDER BY ${col};`;
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>A carregar SQL Lab...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Erro ao inicializar</h2>
        <pre>{error}</pre>
      </div>
    );
  }

  const resultPanel = (
    <div className="results-area">
      {lastError && <div className="error-box" dangerouslySetInnerHTML={{ __html: lastError }} />}
      {lastResult && !lastError && (
        <ResultTable
          columns={lastResult.columns}
          values={lastResult.values}
          timeMs={lastTimeMs}
          onCellClick={handleCellClick}
          onHeaderClick={handleHeaderClick}
        />
      )}
      {!lastResult && !lastError && (
        <div className="results-placeholder">
          Escreve uma query e prime <kbd>Ctrl+Enter</kbd> para executar.
        </div>
      )}
    </div>
  );

  if (mode === 'interview') {
    return (
      <div className="app-shell">
        <TopBar />
        <div className="app-body">
          <aside className="panel-schema">
            <SchemaPanel onColumnClick={handleColumnClick} />
          </aside>
          <main className="panel-main">
            <SQLEditor value={sql} onChange={setSql} onInsert={handleInsertRef} />
            {resultPanel}
          </main>
          <aside className="panel-right">
            <InterviewMode />
          </aside>
        </div>
        <LessonModal open={lessonOpen} onClose={() => setLessonOpen(false)} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopBar onLessonOpen={() => setLessonOpen(true)} />
      <div className="app-body">
        <aside className="panel-schema">
          <SchemaPanel onColumnClick={handleColumnClick} />
        </aside>
        <main className="panel-main">
          <SQLEditor value={sql} onChange={setSql} onInsert={handleInsertRef} />
          {resultPanel}
        </main>
        <aside className="panel-right">
          {mode === 'career' && <CareerPanel sql={sql} />}
          {mode === 'free' && (
            <div className="free-panel">
              <div className="free-title">🔬 Free SQL</div>
              <p className="free-desc">Escreve qualquer query. Clica nas células para filtrar, nos headers para ordenar.</p>
              <button className="btn-lesson" onClick={() => setLessonOpen(true)}>📚 Abrir lições</button>
            </div>
          )}
          {mode === 'import' && <CSVImporter />}
        </aside>
      </div>
      <LessonModal open={lessonOpen} onClose={() => setLessonOpen(false)} />
    </div>
  );
}
