import { useState } from 'react';
import { LESSONS, LESSON_PUZZLES, LESSON_ANIMS } from '../../data/lessons';
import { runSQL } from '../../engine/query';
import { useAppStore } from '../../store/appStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function LessonModal({ open, onClose }: Props) {
  const curLevel = useAppStore((s) => s.curLevel);
  const [activeIdx, setActiveIdx] = useState(curLevel);
  const [puzzleSql, setPuzzleSql] = useState('');
  const [puzzleFeedback, setPuzzleFeedback] = useState('');
  const [theoryVisible, setTheoryVisible] = useState(false);
  const [demoResults, setDemoResults] = useState<Record<number, { cols: string[]; vals: unknown[][] } | string>>({});

  if (!open) return null;

  const lesson = LESSONS[activeIdx];
  const puzzle = LESSON_PUZZLES[lesson.level];
  const anim = LESSON_ANIMS[lesson.level];

  const handleDemoRun = (demoIdx: number) => {
    try {
      const res = runSQL(lesson.demos[demoIdx].q);
      setDemoResults((prev) => ({ ...prev, [demoIdx]: { cols: res.columns, vals: res.values } }));
    } catch (e: unknown) {
      setDemoResults((prev) => ({ ...prev, [demoIdx]: (e as Error).message }));
    }
  };

  const handlePuzzleCheck = () => {
    if (!puzzleSql.trim()) return;
    const kw = puzzle?.keyword?.toLowerCase() ?? '';
    if (puzzleSql.toLowerCase().includes(kw)) {
      setPuzzleFeedback('✓ Boa tentativa! Vê a teoria para a solução completa.');
    } else {
      setPuzzleFeedback(`💡 Dica: ${puzzle?.hint}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="lesson-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lesson-modal-nav">
          <div className="lesson-nav-title">📚 Lições</div>
          {LESSONS.map((ls, i) => (
            <button
              key={i}
              className={`lesson-nav-btn${i === activeIdx ? ' active' : ''}`}
              onClick={() => { setActiveIdx(i); setPuzzleSql(''); setPuzzleFeedback(''); setTheoryVisible(false); setDemoResults({}); }}
            >
              N{ls.level} {ls.title}
            </button>
          ))}
        </div>

        <div className="lesson-modal-content">
          <div className="lesson-modal-header">
            <h2>Nível {lesson.level} — {lesson.title}</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          {/* Animation */}
          {anim && <div dangerouslySetInnerHTML={{ __html: anim }} />}

          {/* Puzzle */}
          {puzzle && (
            <div className="lesson-puzzle">
              <div className="puzzle-label">🧩 Desafio de aquecimento</div>
              <p className="puzzle-q">{puzzle.q}</p>
              <textarea
                className="sql-editor puzzle-editor"
                value={puzzleSql}
                onChange={(e) => setPuzzleSql(e.target.value)}
                placeholder="Escreve a tua tentativa aqui..."
                rows={3}
              />
              <div className="puzzle-actions">
                <button className="btn-check" style={{ padding: '5px 14px', fontSize: 13 }} onClick={handlePuzzleCheck}>✓ Verificar</button>
                <button className="btn-tool" onClick={() => setTheoryVisible(true)}>Ver teoria →</button>
              </div>
              {puzzleFeedback && <div className="puzzle-feedback">{puzzleFeedback}</div>}
            </div>
          )}

          {/* Theory reveal button */}
          {puzzle && !theoryVisible && (
            <button className="reveal-btn" onClick={() => setTheoryVisible(true)}>👁 Ver teoria e exemplos</button>
          )}

          {/* Theory */}
          {(!puzzle || theoryVisible) && (
            <div className="lesson-theory">
              <div className="theory-concept" dangerouslySetInnerHTML={{ __html: lesson.concept }} />
              <div className="theory-tip">{lesson.tip}</div>

              {/* Demos */}
              <div className="demos-title">Exemplos executáveis</div>
              {lesson.demos.map((demo, i) => (
                <div key={i} className="demo-block">
                  <div className="demo-header">
                    <span className="demo-label">{demo.label}</span>
                    <button className="btn-run" style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => handleDemoRun(i)}>▶ Executar</button>
                  </div>
                  <pre className="demo-query">{demo.q}</pre>
                  {demoResults[i] && (
                    typeof demoResults[i] === 'string'
                      ? <div className="demo-error">{String(demoResults[i])}</div>
                      : <div className="demo-result-wrap">
                          <table className="result-table demo-result-table">
                            <thead>
                              <tr>{(demoResults[i] as { cols: string[]; vals: unknown[][] }).cols.map((c) => <th key={c}>{c}</th>)}</tr>
                            </thead>
                            <tbody>
                              {(demoResults[i] as { cols: string[]; vals: unknown[][] }).vals.slice(0, 8).map((row, ri) => (
                                <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{String(cell ?? 'NULL')}</td>)}</tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
