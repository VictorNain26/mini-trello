import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card as CardType } from '@/types';
import { useMemo } from 'react';

type Props = { card: CardType; colId: string; index: number };

export default function Card({ card, colId, index }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { col: colId, index },
    animateLayoutChanges: (args) =>
      defaultAnimateLayoutChanges({ ...args, wasDragging: true }),
  });

  const style = useMemo(
    () => ({
      transform: CSS.Translate.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }),
    [transform, transition, isDragging],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-lg bg-white p-3 shadow-sm text-sm cursor-grab select-none"
    >
      {card.title}
    </div>
  );
}
