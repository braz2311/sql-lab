import { useState, useEffect, useRef, useCallback } from 'react';
import { IV_QUESTIONS } from '../../data/interview';
import { loadDataset, getDB, getDBSchema } from '../../engine/db';
import { checkInterviewAnswer } from '../../engine/checker';
import { useDBStore } from '../../store/dbStore';
import { launchConfetti } from '../../utils/confetti';

type Phase = 'intro' | 'running' | 'done';
interface QResult { correct: boolean; sql: string; }

export function InterviewMode() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [secsLeft, setSecsLeft] = useState(300);
  const [results, setResults] = useState<QResult[]>([]);
  const [sql, setSql] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setSchema = useDBStore((s) => s.setSchema);

  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const finish = useCallback((finalResults: QResult[]) => {
    stopTimer();
    setResults(finalResults);
    setPhase('done');
    const score = finalResults.filter((r) => r.correct).length;
    if (score / IV_QUESTIONS.length >= 0.8) launchConfetti();
  }, []);

  const startTimer = useCallback((onDone: (r: QResult[]) => void, currentResults: QResult[]) => {
    stopTimer();
    setSecsLeft(300);
    timerRef.current = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) { stopTimer(); onDone(currentResults); return 0; }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (phase !== 'running') return;
    const q = IV_QUESTIONS[qIndex];
    if (!q) return;
    loadDataset(q.dataset).then(() => setSchema(getDBSchema()));
    setSql('');
    setFeedback(null);
  }, [qIndex, phase]);

  useEffect(() => () => stopTimer(), []);

  const handleStart = () => {
    setQIndex(0);
    const r: QResult[] = [];
    setResults(r);
    setSql('');
    setFeedback(null);
    setPhase('running');
    startTimer(finish, r);
  };

  const advance = (newResults: QResult[]) => {
    if (qIndex + 1 >= IV_QUESTIONS.length) { finish(newResults); }
    else { setResults(newResults); setQIndex((i) => i + 1); }
  };

  const handleSubmit = async () => {
    const q = IV_QUESTIONS[qIndex];
    const correct = await checkInterviewAnswer(sql, q.expected, q.dataset, getDB());
    const newResults = [...results, { correct, sql }];
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => advance(newResults), 900);
  };

  const handleSkip = () => {
    advance([...results, { correct: false, sql: '' }]);
  };

  const mm = String(Math.floor(secsLeft / 60)).padStart(2, '0');
  const ss = String(secsLeft % 60).padStart(2, '0');

  if (phase === 'intro') {
    return (
      <div className="iv-panel iv-intro">
        <div className="iv-intro-icon">🎤</div>
        <h2 className="iv-intro-title">Interview Mode</h2>
        <p className="iv-intro-desc">{IV_QUESTIONS.length} questões · 5 minutos · sem hints.</p>
        <ul className="iv-rules">
          <li>✓ Simula uma entrevista técnica real</li>
          <li>✓ O timer corre para todas as questões</li>
          <li>✓ 80%+ correcto = Contratado!</li>
        </ul>
        <button className="btn-check" style={{ width: '100%', marginTop: 16 }} onClick={handleStart}>
          ▶ Começar entrevista
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    const score = results.filter((r) => r.correct).length;
    const pct = Math.round(score / IV_QUESTIONS.length * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪';
    const msg = pct >= 80 ? 'Contratado!' : pct >= 60 ? 'Bom resultado!' : 'Continua a praticar!';
    const color = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--orange)' : 'var(--red)';
    return (
      <div className="iv-panel iv-done">
        <div className="iv-score-num" style={{ color }}>{score}/{IV_QUESTIONS.length}</div>
        <div className="iv-score-label">{emoji} {msg} · {pct}%</div>
        <div className="iv-breakdown">
          {IV_QUESTIONS.map((q, i) => (
            <div key={i} className={`iv-breakdown-row ${results[i]?.correct ? 'correct' : 'wrong'}`}>
              <span>{results[i]?.correct ? '✓' : '✗'}</span>
              <span className="iv-q-short">{q.ctx.slice(0, 50)}…</span>
            </div>
          ))}
        </div>
        <button className="btn-check" style={{ width: '100%', marginTop: 16 }} onClick={handleStart}>↺ Tentar novamente</button>
      </div>
    );
  }

  const q = IV_QUESTIONS[qIndex];
  return (
    <div className="iv-panel iv-running">
      <div className="iv-header">
        <span className="iv-q-num">Questão {qIndex + 1}/{IV_QUESTIONS.length}</span>
        <span className={`iv-timer${secsLeft < 60 ? ' warn' : ''}`}>{mm}:{ss}</span>
      </div>
      <div className="iv-dots">
        {IV_QUESTIONS.map((_, i) => (
          <div key={i} className={`iv-dot${i < qIndex ? ' done' : i === qIndex ? ' active' : ''}`} />
        ))}
      </div>
      <div className="iv-q-ctx">{q.ctx}</div>
      <div className="iv-q-desc" dangerouslySetInnerHTML={{ __html: q.desc }} />
      <textarea
        className="sql-editor iv-editor"
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSubmit(); } }}
        placeholder="Escreve a tua query... (Ctrl+Enter para submeter)"
        spellCheck={false}
      />
      {feedback && (
        <div className={`ex-feedback ${feedback}`}>
          {feedback === 'correct' ? '✓ Correcto!' : '✗ Errado.'}
        </div>
      )}
      <div className="career-actions">
        <button className="btn-nav" onClick={handleSkip}>Saltar →</button>
        <button className="btn-check" onClick={handleSubmit} disabled={!sql.trim()}>✓ Submeter</button>
      </div>
    </div>
  );
}
