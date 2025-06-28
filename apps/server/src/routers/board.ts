import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { Context } from '../context.js';

const t = initTRPC.context<Context>().create();

export const boardRouter = t.router({
  /* ------------------- Get board ------------------- */
  get: t.procedure
    .input(z.object({ boardId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.board.findUnique({
        where: { id: input.boardId },
        include: {
          columns: {
            orderBy: { order: 'asc' },
            include: { cards: { orderBy: { order: 'asc' } } },
          },
        },
      }),
    ),

  /* ------------------- Move card ------------------- */
  moveCard: t.procedure
    .input(
      z.object({
        boardId: z.string(),
        cardId: z.string(),
        from: z.string(),
        to: z.string(),
        pos: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      /* réordonnage naïf : on met simplement la carte cible au bon index    */
      await ctx.prisma.$transaction(async (tx) => {
        // déplace la carte
        await tx.card.update({
          where: { id: input.cardId },
          data: { columnId: input.to, order: input.pos },
        });

        // réindexe toutes les cartes de la colonne cible
        const cards = await tx.card.findMany({
          where: { columnId: input.to },
          orderBy: { order: 'asc' },
        });
        for (let i = 0; i < cards.length; i++) {
          await tx.card.update({ where: { id: cards[i].id }, data: { order: i } });
        }
      });

      /* push temps réel */
      ctx.io.to(input.boardId).emit('board:update', input);
      return { ok: true };
    }),
});
