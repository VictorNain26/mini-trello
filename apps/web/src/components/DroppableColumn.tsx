import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ReactNode } from 'react';

interface DroppableColumnProps {
  id: string;
  children: ReactNode;
  items: string[];
}

export function DroppableColumn({ id, children, items }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className="space-y-3 min-h-[200px] mb-4">
        {children}
      </div>
    </SortableContext>
  );
}
