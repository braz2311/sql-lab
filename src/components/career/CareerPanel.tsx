import { useState } from 'react';
import { CAREER } from '../../data/career';
import { checkAnswer } from '../../engine/checker';
import { getDB } from '../../engine/db';
import { launchConfetti } from '../../utils/confetti';
import { useAppStore } from '../../store/appStore';
import { useProgressStore } from '../../store/progressStore';

interface Props {
  sql: string;
  onSqlChange?: (sql: string) => void;
}

export function CareerPanel({ sql }: Props) {
  const { curLevel, curEx, nextExercise, prevExercise } = useAppStore();
  const { markDone, isDone, incrementStreak } = useProgressStore();
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const levelData = CAREER[curLevel];
  if (!levelData) return <div className="career-panel">Nível não encontrado.</div>;
  const exercise = levelData.exercises[curEx];
  if (!exercise) return <div className="career-panel">Exercício não encontrado.</div>;

  const key = `${curLevel}-${curEx}`;
  const alreadyDone = isDone(key);
  const totalEx = levelData.exercises.length;

  const handleCheck = async () => {
    if (!sql.trim()) return;
    setChecking(true);
    try {
      const result = await checkAnswer(sql, curLevel, curEx, getDB());
      setFeedback(result);
      if (result.correct && !alreadyDone) {
        markDone(key);
        incrementStreak();
        launchConfetti();
      }
    } catch (e: unknown) {
      setFeedback({ correct: false, message: (e as Error).message });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="career-panel">
      {/* Progress nodes */}
      <div className="level-nodes">
        {levelData.exercises.map((_, i) => {
          const k = `${curLevel}-${i}`;
          return (
            <button
              key={i}
              className={`level-node${i === curEx ? ' active' : ''}${isDone(k) ? ' done' : ''}${levelData.exercises[i].final ? ' final' : ''}`}
              onClick={() => { useAppStore.getState().setCurEx(i); setFeedback(null); setShowHint(false); }}
              title={levelData.exercises[i].title}
            />
          );
        })}
      </div>

      {/* Exercise card */}
      <div className={`exercise-card${exercise.final ? ' final' : ''}`}>
        <div className="ex-level-badge">Nível {curLevel + 1} · {levelData.name}</div>
        {exercise.ctx && <div className="ex-ctx">{exercise.ctx}</div>}
        <div className="ex-title">{exercise.title}</div>
        <div className="ex-desc" dangerouslySetInnerHTML={{ __html: exercise.desc }} />

        {/* Hint */}
        {exercise.hint && (
          <div className="ex-hint-wrap">
            <button className="btn-hint" onClick={() => setShowHint(!showHint)}>
              {showHint ? '🙈 Esconder hint' : '💡 Ver hint'}
            </button>
            {showHint && <pre className="ex-hint">{exercise.hint}</pre>}
          </div>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`ex-feedback${feedback.correct ? ' correct' : ' wrong'}`}>
          {feedback.message}
        </div>
      )}

      {/* Actions */}
      <div className="career-actions">
        <button className="btn-nav" onClick={() => { prevExercise(); setFeedback(null); setShowHint(false); }} disabled={curEx === 0}>← Anterior</button>
        <button
          className={`btn-check${checking ? ' loading' : ''}`}
          onClick={handleCheck}
          disabled={checking || !sql.trim()}
        >
          {checking ? 'A verificar...' : alreadyDone ? '✓ Feito' : '✓ Verificar'}
        </button>
        <button className="btn-nav" onClick={() => { nextExercise(totalEx); setFeedback(null); setShowHint(false); }} disabled={curEx >= totalEx - 1}>Próximo →</button>
      </div>

      {/* Level switcher */}
      <div className="level-switcher">
        {CAREER.map((lv, i) => (
          <button
            key={i}
            className={`lv-btn${i === curLevel ? ' active' : ''}`}
            onClick={() => { useAppStore.getState().setCurLevel(i); setFeedback(null); setShowHint(false); }}
            title={`N${i + 1} ${lv.name}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
