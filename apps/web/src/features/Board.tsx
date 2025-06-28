import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { socket } from '@/lib/socket';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import Column from './board/Column';

export function Board({ boardId = 'demo' }) {
  /* data ---------------------------------------------------------------- */
  const utils = trpc.useUtils();
  const { data: board } = trpc.board.get.useQuery({ boardId });

  const move = trpc.board.moveCard.useMutation({
    onMutate: async (input: any) => {
      await utils.board.get.cancel();
      const previous = utils.board.get.getData({ boardId });

      utils.board.get.setData({ boardId }, (draft: any) => {
        if (!draft) return draft;
        const src = draft.columns.find((c: any) => c.id === input.from)!;
        const dst = draft.columns.find((c: any) => c.id === input.to)!;
        const idx = src.cards.findIndex((c: any) => c.id === input.cardId);
        const [card] = src.cards.splice(idx, 1);
        dst.cards.splice(input.pos, 0, card);
        return draft;
      });

      return { previous };
    },
    onError: (_e, _v, ctx: any) => {
      if (ctx?.previous) utils.board.get.setData({ boardId }, ctx.previous);
    },
    onSettled: () => utils.board.get.invalidate({ boardId }),
  });

  /* realtime ------------------------------------------------------------- */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.emit('join-board', boardId);
    const invalidate = () => utils.board.get.invalidate({ boardId });
    socket.on('board:update', invalidate);

    return () => {
      /* on quitte simplement la room et on retire le listener –
         on NE ferme PAS la connexion globale */
      socket.emit('leave-board', boardId);
      socket.off('board:update', invalidate);
    };
  }, [boardId]);

  /* dnd ------------------------------------------------------------------ */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const fromCol = active.data.current?.col as string;
    const toCol   = over.data.current?.col  as string;
    if (!fromCol || !toCol) return;

    move.mutate({
      boardId,
      cardId: active.id as string,
      from:   fromCol,
      to:     toCol,
      pos:    over.data.current?.index as number,
    });
  };

  /* render --------------------------------------------------------------- */
  if (!board) return <p className="p-4">Loading…</p>;

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-4">
        {board.columns.map((col: any) => (
          <SortableContext
            key={col.id}
            id={col.id}
            items={col.cards.map((c: any) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <Column column={col} />
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
}
