import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';

/* ─────────── Types utilitaires ─────────── */
const BoardInput  = z.object({ title: z.string().min(1) });
// const ColumnInput = z.object({ boardId: z.string(), title: z.string().min(1) }); // Unused
// const CardInput   = z.object({ // Unused
//   columnId: z.string(),
//   title:    z.string().min(1),
//   order:    z.number().int().min(0).default(0),
// });
const MoveCardInput = z.object({
  boardId: z.string(),
  cardId: z.string(),
  from: z.string(),
  to: z.string(),
  pos: z.number().int().min(0),
});

export const boardRouter = router({
  /* ——— query current user boards ——— */
  getAll: protectedProcedure.query(({ ctx }: any) =>
    ctx.prisma.board.findMany({
      where: { ownerId: ctx.userId },
      include: {
        columns: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ),

  /* ——— get board with columns and cards ——— */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
     
    .query(async ({ ctx, input }: any) => {
      const board = await ctx.prisma.board.findFirst({
        where: { id: input.id, ownerId: ctx.userId },
        include: {
          columns: {
            include: {
              cards: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });
      if (!board) throw new Error('Board not found');
      return board;
    }),

  /* ——— create board ——— */
  create: protectedProcedure
    .input(BoardInput)
     
    .mutation(({ ctx, input }: any) =>
      ctx.prisma.board.create({
        data: { title: input.title, ownerId: ctx.userId },
        select: { id: true, title: true },
      }),
    ),


  /* ——— move card between columns ——— */
  moveCard: protectedProcedure
    .input(MoveCardInput)
     
    .mutation(async ({ ctx, input }: any) => {
      // Check ownership via board
      const board = await ctx.prisma.board.findFirst({
        where: { id: input.boardId, ownerId: ctx.userId },
      });
      if (!board) throw new Error('Not your board');

      // Move card in transaction
       
      return ctx.prisma.$transaction(async (tx: any) => {
        // Get the card
        const card = await tx.card.findUnique({
          where: { id: input.cardId },
        });
        if (!card) throw new Error('Card not found');

        // Update card's column and position
        await tx.card.update({
          where: { id: input.cardId },
          data: {
            columnId: input.to,
            order: input.pos,
          },
        });

        // Reorder cards in source column
        if (input.from !== input.to) {
          await tx.card.updateMany({
            where: {
              columnId: input.from,
              order: { gt: card.order },
            },
            data: {
              order: { decrement: 1 },
            },
          });
        }

        // Reorder cards in destination column
        await tx.card.updateMany({
          where: {
            columnId: input.to,
            order: { gte: input.pos },
            id: { not: input.cardId },
          },
          data: {
            order: { increment: 1 },
          },
        });

        return { success: true };
      });
    }),
});
