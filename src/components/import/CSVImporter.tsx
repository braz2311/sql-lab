import { useState, useRef } from 'react';
import { importCSV } from '../../engine/importer';
import { getDBSchema } from '../../engine/db';
import { useAppStore } from '../../store/appStore';
import { useDBStore } from '../../store/dbStore';

export function CSVImporter() {
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importedTableNames, addImportedTable, clearImportedTables, setMode, setCurDataset } = useAppStore();
  const setSchema = useDBStore((s) => s.setSchema);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    for (const file of Array.from(files)) {
      setProgress(0);
      setMessage(`A importar ${file.name}...`);
      const result = await importCSV(file, setProgress);
      if (result.error) {
        setError(result.error);
        setProgress(null);
        return;
      }
      addImportedTable(result.tableName);
      setMessage(`✓ ${result.tableName} · ${result.rowCount} linhas · ${result.columns.length} colunas`);
    }
    setSchema(getDBSchema());
    setProgress(null);
    setMode('free');
    setCurDataset('__import');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="import-panel">
      <div className="import-title">📂 Importar CSV</div>
      <p className="import-desc">Importa ficheiros CSV para fazer queries SQL diretamente. Máx. 5MB por ficheiro.</p>

      {/* Drop zone */}
      <div
        className="drop-zone"
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
        onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-icon">⬆</div>
        <div className="drop-label">Arrasta CSV aqui ou clica para escolher</div>
        <div className="drop-sub">Separador automático: , ou ;</div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Progress */}
      {progress !== null && (
        <div className="import-progress">
          <div className="import-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
      {message && <div className="import-msg">{message}</div>}
      {error && <div className="import-error">{error}</div>}

      {/* Imported tables */}
      {importedTableNames.length > 0 && (
        <div className="imported-tables">
          <div className="imported-label">Tabelas importadas:</div>
          <div className="imported-tags">
            {importedTableNames.map((t) => (
              <span key={t} className="imp-tag">{t}</span>
            ))}
          </div>
          <button className="btn-tool" style={{ marginTop: 10 }} onClick={() => { clearImportedTables(); setMessage(''); }}>
            🗑 Limpar tudo
          </button>
        </div>
      )}
    </div>
  );
}
