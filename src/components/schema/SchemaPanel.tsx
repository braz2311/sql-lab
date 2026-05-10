import { useDBStore } from '../../store/dbStore';
import { TableCard } from './TableCard';

interface Props {
  onColumnClick: (col: string) => void;
}

export function SchemaPanel({ onColumnClick }: Props) {
  const schema = useDBStore((s) => s.schema);
  const tables = Object.entries(schema);

  return (
    <div className="schema-panel">
      <div className="schema-panel-title">Schema</div>
      {tables.length === 0 ? (
        <p className="schema-empty">Nenhuma tabela carregada.</p>
      ) : (
        tables.map(([name, tbl]) => (
          <TableCard key={name} name={name} table={tbl} onColumnClick={onColumnClick} />
        ))
      )}
    </div>
  );
}
