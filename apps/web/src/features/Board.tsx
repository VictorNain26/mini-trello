import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import Column from './board/Column';
import { useSocket } from '@/providers/SocketProvider';
import type { Card as CardType } from '@/types';

export function Board({ boardId = 'demo' }: { boardId?: string }) {
  const socket = useSocket();

  /* ------------------------------ Data ------------------------------ */
  const utils = trpc.useUtils();
  const { data: board } = trpc.board.get.useQuery({ boardId });

  const move = trpc.board.moveCard.useMutation({
    onMutate: async (input: any) => {
      await utils.board.get.cancel();
      const prev = utils.board.get.getData({ boardId });

      utils.board.get.setData({ boardId }, (draft: any) => {
        if (!draft) return draft;
        const src = draft.columns.find((c: any) => c.id === input.from)!;
        const dst = draft.columns.find((c: any) => c.id === input.to)!;
        const idx = src.cards.findIndex((c: any) => c.id === input.cardId);
        const [card] = src.cards.splice(idx, 1);
        dst.cards.splice(input.pos, 0, card);
        return draft;
      });

      return { prev };
    },
    onError: (_e, _v, ctx: any) => {
      if (ctx?.prev) utils.board.get.setData({ boardId }, ctx.prev);
    },
    onSettled: () => utils.board.get.invalidate({ boardId }),
  });

  /* --------------------------- Realtime ----------------------------- */
  useState(() => {
    socket.emit('join-board', boardId);
    const invalidate = () => utils.board.get.invalidate({ boardId });
    socket.on('card:moved', invalidate);
    return () => {
      socket.emit('leave-board', boardId);
      socket.off('card:moved', invalidate);
    };
  });

  /* ------------------------------ DnD ------------------------------- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCard(null);
    if (!over || active.id === over.id) return;

    const fromCol = active.data.current?.col as string;
    const toCol   = over.data.current?.col  as string;
    if (!fromCol || !toCol) return;

    const pos =
      over.data.current?.isContainer
        ? board?.columns.find((c) => c.id === toCol)?.cards.length ?? 0
        : (over.data.current?.index as number);

    move.mutate({
      boardId,
      cardId: active.id as string,
      from:   fromCol,
      to:     toCol,
      pos,
    });
  };

  /* ------------------------------ UI -------------------------------- */
  if (!board) return <p className="p-4">Loading…</p>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => {
        const col = board.columns.find((c) =>
          c.cards.some((x) => x.id === active.id),
        );
        setActiveCard(col?.cards.find((x) => x.id === active.id) ?? null);
      }}
      onDragCancel={() => setActiveCard(null)}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto p-4">
        {board.columns.map((col) => (
          <SortableContext
            key={col.id}
            id={col.id}
            items={col.cards.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <Column column={col} />
          </SortableContext>
        ))}
      </div>

      {/* Overlay sans animation */}
      <DragOverlay dropAnimation={null}>
        {activeCard && (
          <div className="w-56 rounded-lg bg-white p-3 shadow-xl">
            {activeCard.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
