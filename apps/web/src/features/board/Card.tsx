import { useSortable } from '@dnd-kit/sortable';
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
    isDragging,
  } = useSortable({
    id: card.id,
    data: { col: colId, index },
    /* aucune animation post-drag */
    animateLayoutChanges: () => false,
  });

  const style = useMemo(
    () => ({
      transform: CSS.Translate.toString(transform),
      transition: undefined,        // déplacement instantané
      opacity: isDragging ? 0.6 : 1,
    }),
    [transform, isDragging],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-lg bg-white p-3 cursor-grab select-none shadow-sm"
    >
      {card.title}
    </div>
  );
}
