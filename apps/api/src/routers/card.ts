import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';

const CardInput = z.object({
  columnId: z.string(),
  title: z.string().min(1),
  order: z.number().int().min(0),
});

export const cardRouter = router({
  /* ——— create card ——— */
  create: protectedProcedure
    .input(CardInput)
    .mutation(async ({ ctx, input }: any) => {
      // ownership via join column->board
      const col = await ctx.prisma.column.findUnique({
        where: { id: input.columnId },
        include: { board: { select: { ownerId: true } } },
      });
      if (!col || col.board.ownerId !== ctx.userId) throw new Error('Not allowed');

      return ctx.prisma.card.create({
        data: { 
          title: input.title, 
          order: input.order, 
          columnId: input.columnId 
        },
        select: { id: true, title: true, order: true },
      });
    }),

  /* ——— delete card ——— */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }: any) => {
      // Check ownership via column->board
      const card = await ctx.prisma.card.findUnique({
        where: { id: input.id },
        include: { 
          column: { 
            include: { board: { select: { ownerId: true } } } 
          } 
        },
      });
      if (!card || card.column.board.ownerId !== ctx.userId) {
        throw new Error('Not your card');
      }

      await ctx.prisma.card.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /* ——— move card ——— */
  move: protectedProcedure
    .input(z.object({
      cardId: z.string(),
      newColumnId: z.string(),
      newOrder: z.number().int().min(0),
    }))
    .mutation(async ({ ctx, input }: any) => {
      return ctx.prisma.$transaction(async (tx: any) => {
        // Check ownership
        const card = await tx.card.findUnique({
          where: { id: input.cardId },
          include: { 
            column: { 
              include: { board: { select: { ownerId: true } } } 
            } 
          },
        });
        if (!card || card.column.board.ownerId !== ctx.userId) {
          throw new Error('Not your card');
        }

        const oldColumnId = card.columnId;
        const oldOrder = card.order;

        // If moving to same column, adjust orders
        if (oldColumnId === input.newColumnId) {
          if (input.newOrder < oldOrder) {
            // Moving up: increment orders between newOrder and oldOrder-1
            await tx.card.updateMany({
              where: {
                columnId: oldColumnId,
                order: { gte: input.newOrder, lt: oldOrder },
              },
              data: { order: { increment: 1 } },
            });
          } else if (input.newOrder > oldOrder) {
            // Moving down: decrement orders between oldOrder+1 and newOrder
            await tx.card.updateMany({
              where: {
                columnId: oldColumnId,
                order: { gt: oldOrder, lte: input.newOrder },
              },
              data: { order: { decrement: 1 } },
            });
          }
        } else {
          // Moving to different column
          // Adjust orders in old column
          await tx.card.updateMany({
            where: {
              columnId: oldColumnId,
              order: { gt: oldOrder },
            },
            data: { order: { decrement: 1 } },
          });

          // Adjust orders in new column
          await tx.card.updateMany({
            where: {
              columnId: input.newColumnId,
              order: { gte: input.newOrder },
            },
            data: { order: { increment: 1 } },
          });
        }

        // Update the card
        await tx.card.update({
          where: { id: input.cardId },
          data: {
            columnId: input.newColumnId,
            order: input.newOrder,
          },
        });

        return { success: true };
      });
    }),
});