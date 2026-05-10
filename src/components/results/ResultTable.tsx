interface Props {
  columns: string[];
  values: unknown[][];
  timeMs: number;
}

export function ResultTable({ columns, values, timeMs }: Props) {
  if (!columns.length) return null;

  return (
    <div className="result-wrapper">
      <div className="result-scroll">
        <table className="result-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {values.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                {row.map((cell, j) => (
                  <td key={j} className={cell === null ? 'cell-null' : ''}>
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
      </div>
    </div>
  );
}
