import type { Column as ColumnType } from '@/types';
import Card from './Card';
import { useDroppable } from '@dnd-kit/core';

export default function Column({ column }: { column: ColumnType }) {
  /* la colonne entière devient « zone de drop » */
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { col: column.id, isContainer: true },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-64 w-64 rounded-xl p-3 flex flex-col gap-3
        transition-colors duration-150
        ${isOver ? 'bg-primary/10' : 'bg-neutral-100'}`}
    >
      <h3 className="font-semibold text-sm">{column.title}</h3>

      {column.cards.map((card, idx) => (
        <Card key={card.id} card={card} colId={column.id} index={idx} />
      ))}
    </div>
  );
}
