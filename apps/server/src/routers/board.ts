import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { Context } from '../context.js';

const t = initTRPC.context<Context>().create();

export const boardRouter = t.router({
  get: t.procedure
    .input(z.object({ boardId: z.string() }))
    .query(({ ctx, input }) => ctx.boards[input.boardId]),

  moveCard: t.procedure
    .input(
      z.object({
        boardId: z.string(),
        cardId:  z.string(),
        from:    z.string(),  // colonne source
        to:      z.string(),  // colonne cible
        pos:     z.number()   // index dans la colonne cible
      })
    )
    .mutation(({ ctx, input }) => {
      const board = ctx.boards[input.boardId];
      if (!board) throw new Error('Board introuvable');

      const src = board.columns.find(c => c.id === input.from);
      const dst = board.columns.find(c => c.id === input.to);
      if (!src || !dst) throw new Error('Colonne introuvable');

      const idx = src.cards.findIndex(c => c.id === input.cardId);
      if (idx === -1) throw new Error('Carte introuvable');

      const [card] = src.cards.splice(idx, 1);
      dst.cards.splice(input.pos, 0, card);

      ctx.io.to(board.id).emit('board:update', input);   // push WS
      return { ok: true };
    })
});
