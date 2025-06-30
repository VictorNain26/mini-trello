import { z } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
import type { Context, Tx } from '../context.js';

const t = initTRPC.context<Context>().create();

export const boardRouter = t.router({
  /* -------------------- GET board -------------------- */
  get: t.procedure
    .input(z.object({ boardId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.board.findUnique({
        where: { id: input.boardId },
        select: {
          id: true,
          title: true,
          columns: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              order: true,
              cards: {
                orderBy: { order: 'asc' },
                select: { id: true, title: true, order: true },
              },
            },
          },
        },
      }),
    ),

  /* -------------------- MOVE card -------------------- */
  moveCard: t.procedure
    .input(
      z.object({
        boardId: z.string(),
        cardId:  z.string(),
        from:    z.string(),
        to:      z.string(),
        pos:     z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      /* Sécurité : requête autorisée seulement si board existe */
      const boardExists = await ctx.prisma.board.findUnique({
        where: { id: input.boardId },
        select: { id: true },
      });
      if (!boardExists)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Board not found' });

      await ctx.prisma.$transaction(async (tx: Tx) => {
        const { cardId, from, to, pos } = input;

        /* vérifie appartenance */
        const card = await tx.card.findUnique({
          where: { id: cardId },
          select: { columnId: true, order: true },
        });
        if (!card || card.columnId !== from)
          throw new TRPCError({ code: 'BAD_REQUEST' });

        if (from === to) {
          /* même colonne : déplacement vertical */
          if (pos > card.order) {
            await tx.card.updateMany({
              where: { columnId: from, order: { gt: card.order, lte: pos } },
              data: { order: { decrement: 1 } },
            });
          } else if (pos < card.order) {
            await tx.card.updateMany({
              where: { columnId: from, order: { gte: pos, lt: card.order } },
              data: { order: { increment: 1 } },
            });
          }
          await tx.card.update({ where: { id: cardId }, data: { order: pos } });
          return;
        }

        /* colonnes différentes ---------------------------------------- */
        await tx.card.updateMany({
          where: { columnId: from, order: { gt: card.order } },
          data: { order: { decrement: 1 } },
        });
        await tx.card.updateMany({
          where: { columnId: to, order: { gte: pos } },
          data: { order: { increment: 1 } },
        });
        await tx.card.update({
          where: { id: cardId },
          data: { columnId: to, order: pos },
        });
      });

      /* broadcast temps réel */
      ctx.io.to(input.boardId).emit('card:moved', input);
      return { ok: true };
    }),
});
