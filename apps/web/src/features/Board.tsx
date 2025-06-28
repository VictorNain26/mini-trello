import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { socket } from '@/lib/socket';
import {
  DndContext, DragEndEvent, useSensor, PointerSensor, useSensors
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, horizontalListSortingStrategy
} from '@dnd-kit/sortable';

export function Board({ boardId = 'demo' }) {
  /* --- data --- */
  const utils = trpc.useUtils();
  const { data: board } = trpc.board.get.useQuery({ boardId });
  const move = trpc.board.moveCard.useMutation({
    // Optimistic UI
    onMutate: async input => {
      await utils.board.get.cancel();
      const previous = utils.board.get.getData({ boardId });
      utils.board.get.setData({ boardId }, draft => {
        if (!draft) return;
        const src = draft.columns.find(c => c.id === input.from)!;
        const dst = draft.columns.find(c => c.id === input.to)!;
        const idx = src.cards.findIndex(c => c.id === input.cardId);
        const [card] = src.cards.splice(idx, 1);
        dst.cards.splice(input.pos, 0, card);
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) utils.board.get.setData({ boardId }, ctx.previous);
    },
    onSettled: () => utils.board.get.invalidate({ boardId })
  });

  /* --- realtime --- */
  useEffect(() => {
    socket.connect();
    socket.emit('join-board', boardId);
    socket.on('board:update', () => utils.board.get.invalidate({ boardId }));
    return () => {
      socket.off('board:update');
      socket.disconnect();
    };
  }, [boardId]);

  /* --- dnd --- */
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const [fromCol, toCol] = [active.data.current!.col, over.data.current!.col];
    if (!fromCol || !toCol) return;
    move.mutate({
      boardId,
      cardId: active.id as string,
      from: fromCol,
      to: toCol,
      pos: over.data.current!.index
    });
  };

  if (!board) return <p>Loading…</p>;

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-4">
        {board.columns.map(col => (
          <SortableContext
            key={col.id}
            id={col.id}
            items={col.cards.map(c => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <Column column={col} />
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
}
