import { useRef, useState, useCallback, useEffect } from 'react';
import { runSQL, friendlyError, beautifySQL } from '../../engine/query';
import { exportQueryCSV } from '../../engine/importer';
import { getACMatches, getCurrentWord, applyCompletion } from '../../engine/autocomplete';
import { useDBStore } from '../../store/dbStore';
import { useProgressStore } from '../../store/progressStore';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onInsert?: (ref: { insert: (text: string) => void }) => void;
}

export function SQLEditor({ value, onChange, onInsert }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [acItems, setAcItems] = useState<Array<{ label: string; type: string }>>([]);
  const [acVisible, setAcVisible] = useState(false);
  const [acIndex, setAcIndex] = useState(0);

  const setResult = useDBStore((s) => s.setResult);
  const setError = useDBStore((s) => s.setError);
  const addHistory = useProgressStore((s) => s.addHistory);

  // Expose insert method
  useEffect(() => {
    if (onInsert) {
      onInsert({
        insert: (text: string) => {
          const ta = textareaRef.current;
          if (!ta) return;
          const pos = ta.selectionStart;
          const newVal = value.slice(0, pos) + text + value.slice(pos);
          onChange(newVal);
          setTimeout(() => { ta.selectionStart = ta.selectionEnd = pos + text.length; ta.focus(); }, 0);
        },
      });
    }
  }, [onInsert, value, onChange]);

  const executeSQL = useCallback(() => {
    const sql = value.trim();
    if (!sql) return;
    try {
      const res = runSQL(sql);
      setResult({ columns: res.columns, values: res.values }, res.timeMs);
      addHistory(sql);
    } catch (e: unknown) {
      setError(friendlyError((e as Error).message, sql));
    }
  }, [value, setResult, setError, addHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (acVisible && acItems.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setAcIndex((i) => (i + 1) % acItems.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setAcIndex((i) => (i - 1 + acItems.length) % acItems.length); return; }
      if (e.key === 'Tab' || e.key === 'Enter') {
        if (e.key === 'Tab') { e.preventDefault(); }
        else if (e.key === 'Enter' && acVisible) { e.preventDefault(); }
        applyAC(acItems[acIndex].label);
        return;
      }
      if (e.key === 'Escape') { setAcVisible(false); return; }
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      executeSQL();
    }
  };

  const applyAC = (label: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { value: newVal, cursor } = applyCompletion(value, ta.selectionStart, label);
    onChange(newVal);
    setAcVisible(false);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = cursor; ta.focus(); }, 0);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);
    const word = getCurrentWord(val, e.target.selectionStart);
    if (word.length >= 1) {
      const matches = getACMatches(word);
      setAcItems(matches);
      setAcVisible(matches.length > 0);
      setAcIndex(0);
    } else {
      setAcVisible(false);
    }
  };

  return (
    <div className="editor-wrapper">
      <textarea
        ref={textareaRef}
        className="sql-editor"
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Escreve SQL aqui... (Ctrl+Enter para executar)"
        spellCheck={false}
      />
      {acVisible && acItems.length > 0 && (
        <ul className="ac-dropdown">
          {acItems.map((item, i) => (
            <li
              key={item.label}
              className={`ac-item ac-${item.type}${i === acIndex ? ' ac-active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); applyAC(item.label); }}
            >
              {item.label}
              <span className="ac-badge">{item.type}</span>
            </li>
          ))}
        </ul>
      )}
      <EditorToolbar onRun={executeSQL} sql={value} onChange={onChange} />
    </div>
  );
}

interface ToolbarProps {
  onRun: () => void;
  sql: string;
  onChange: (v: string) => void;
}

function EditorToolbar({ onRun, sql, onChange }: ToolbarProps) {
  const lastResult = useDBStore((s) => s.lastResult);
  const lastTimeMs = useDBStore((s) => s.lastTimeMs);

  const handleExport = () => {
    if (!lastResult) return;
    exportQueryCSV(lastResult.columns, lastResult.values);
  };

  return (
    <div className="editor-toolbar">
      <button className="btn-run" onClick={onRun} title="Ctrl+Enter">▶ Executar</button>
      <button className="btn-tool" onClick={() => onChange(beautifySQL(sql))} title="Formatar SQL">✦ Formatar</button>
      <button className="btn-tool" onClick={() => onChange('')}>✕ Limpar</button>
      {lastResult && (
        <button className="btn-tool" onClick={handleExport}>⬇ CSV</button>
      )}
      {lastTimeMs > 0 && (
        <span className="perf-inline">{lastTimeMs.toFixed(1)}ms</span>
      )}
    </div>
  );
}
