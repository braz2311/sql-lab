import type { SchemaTable } from '../../engine/db';

interface TableCardProps {
  name: string;
  table: SchemaTable;
  onColumnClick: (col: string) => void;
}

export function TableCard({ name, table, onColumnClick }: TableCardProps) {
  return (
    <div className="table-card">
      <div className="table-card-header">{name.toUpperCase()}</div>
      {table.columns.map((col) => (
        <div
          key={col.name}
          className={`table-card-col ${col.constraint}`}
          onClick={() => onColumnClick(col.name)}
          title={col.constraint === 'FK' ? `→ ${col.fkRef}` : col.type}
        >
          {col.constraint === 'PK' ? '🔑 ' : col.constraint === 'FK' ? '🔗 ' : ''}
          <span className="col-name">{col.name}</span>
          <span className="col-type">{col.type}</span>
        </div>
      ))}
    </div>
  );
}
