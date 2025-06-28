import type { Column as ColumnType } from '@/types';
import Card from './Card';

export default function Column({ column }: { column: ColumnType }) {
  return (
    <div className="min-w-64 w-64 rounded-xl bg-neutral-100 p-3 flex flex-col gap-3">
      <h3 className="font-semibold text-sm">{column.title}</h3>
      {column.cards.map((card, idx) => (
        <Card key={card.id} card={card} colId={column.id} index={idx} />
      ))}
    </div>
  );
}
// This component renders a column with its title and a list of cards.
