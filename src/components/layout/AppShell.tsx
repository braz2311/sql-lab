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

  // Interview mode is full-panel (no editor)
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
            <div className="results-area">
              {lastError && <div className="error-box" dangerouslySetInnerHTML={{ __html: lastError }} />}
              {lastResult && !lastError && <ResultTable columns={lastResult.columns} values={lastResult.values} timeMs={lastTimeMs} />}
              {!lastResult && !lastError && (
                <div className="results-placeholder">Escreve a query e prima <kbd>Ctrl+Enter</kbd>.</div>
              )}
            </div>
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
          <div className="results-area">
            {lastError && <div className="error-box" dangerouslySetInnerHTML={{ __html: lastError }} />}
            {lastResult && !lastError && (
              <ResultTable columns={lastResult.columns} values={lastResult.values} timeMs={lastTimeMs} />
            )}
            {!lastResult && !lastError && (
              <div className="results-placeholder">
                Escreve uma query e prime <kbd>Ctrl+Enter</kbd> para executar.
              </div>
            )}
          </div>
        </main>

        <aside className="panel-right">
          {mode === 'career' && <CareerPanel sql={sql} />}
          {mode === 'free' && (
            <div className="free-panel">
              <div className="free-title">🔬 Free SQL</div>
              <p className="free-desc">Escreve qualquer query. Usa o schema à esquerda como guia.</p>
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
