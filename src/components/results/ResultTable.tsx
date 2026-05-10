interface Props {
  columns: string[];
  values: unknown[][];
  timeMs: number;
  onCellClick?: (col: string, val: unknown) => void;
  onHeaderClick?: (col: string) => void;
}

export function ResultTable({ columns, values, timeMs, onCellClick, onHeaderClick }: Props) {
  if (!columns.length) return null;

  return (
    <div className="result-wrapper">
      <div className="result-scroll">
        <table className="result-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className={onHeaderClick ? 'th-clickable' : ''}
                  onClick={() => onHeaderClick?.(col)}
                  title={onHeaderClick ? `ORDER BY ${col}` : ''}
                >
                  {col}
                  {onHeaderClick && <span className="th-hint"> ↕</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {values.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`${cell === null ? 'cell-null' : ''} ${onCellClick ? 'cell-clickable' : ''}`}
                    onClick={() => cell !== null && onCellClick?.(columns[j], cell)}
                    title={cell !== null && onCellClick ? `WHERE ${columns[j]} = '${cell}'` : ''}
                  >
                    {cell === null ? 'NULL' : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="result-footer">
        {values.length} linha{values.length !== 1 ? 's' : ''} · {timeMs.toFixed(1)}ms
        {onCellClick && <span className="result-footer-hint"> · clica numa célula para filtrar</span>}
      </div>
    </div>
  );
}
