import { useAppStore, type AppMode } from '../../store/appStore';
import { useProgressStore } from '../../store/progressStore';
import { DATASETS } from '../../data/datasets';
import { CAREER } from '../../data/career';

interface Props {
  onLessonOpen?: () => void;
}

export function TopBar({ onLessonOpen }: Props) {
  const { mode, setMode, curDataset, setCurDataset, curLevel } = useAppStore();
  const streak = useProgressStore((s) => s.streak);

  const modes: { id: AppMode; label: string }[] = [
    { id: 'career', label: '🎯 Career' },
    { id: 'free', label: '🔬 Free SQL' },
    { id: 'interview', label: '🎤 Interview' },
    { id: 'import', label: '📂 Importar CSV' },
  ];

  const unlockedDS = new Set<string>();
  CAREER.forEach((lv, li) => {
    if (li <= curLevel) {
      unlockedDS.add(lv.dataset);
      lv.exercises.forEach((ex) => { if (ex.dataset_override) unlockedDS.add(ex.dataset_override); });
    }
  });

  return (
    <header className="top-bar">
      <div className="top-bar-logo">SQL Lab</div>

      <nav className="top-bar-modes">
        {modes.map((m) => (
          <button
            key={m.id}
            className={`mode-btn${mode === m.id ? ' active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </nav>

      {mode === 'free' && (
        <div className="ds-switcher">
          {Object.entries(DATASETS).map(([key, ds]) => {
            const locked = !unlockedDS.has(key);
            return (
              <button
                key={key}
                className={`ds-btn${curDataset === key ? ' active' : ''}${locked ? ' locked' : ''}`}
                onClick={() => !locked && setCurDataset(key)}
                title={locked ? 'Completa o nível que usa este dataset primeiro' : ds.label}
              >
                {ds.label}{locked ? ' 🔒' : ''}
              </button>
            );
          })}
        </div>
      )}

      {onLessonOpen && (
        <button className="btn-lessons-open" onClick={onLessonOpen} title="Abrir lições">📚</button>
      )}

      <div className="top-bar-streak" title="Streak">🔥 {streak}</div>
    </header>
  );
}
