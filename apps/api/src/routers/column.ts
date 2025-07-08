import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';

const ColumnInput = z.object({ 
  boardId: z.string(), 
  title: z.string().min(1),
  order: z.number().int().min(0)
});

export const columnRouter = router({
  /* ——— create column ——— */
  create: protectedProcedure
    .input(ColumnInput)
    .mutation(async ({ ctx, input }: any) => {
      // vérifie ownership
      const board = await ctx.prisma.board.findFirst({
        where: { id: input.boardId, ownerId: ctx.userId },
      });
      if (!board) throw new Error('Not your board');

      return ctx.prisma.column.create({
        data: { 
          title: input.title, 
          order: input.order, 
          boardId: input.boardId 
        },
        select: { id: true, title: true, order: true },
      });
    }),

  /* ——— update column title ——— */
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }: any) => {
      // Check ownership via board
      const column = await ctx.prisma.column.findUnique({
        where: { id: input.id },
        include: { board: { select: { ownerId: true } } },
      });
      if (!column || column.board.ownerId !== ctx.userId) {
        throw new Error('Not your column');
      }

      return ctx.prisma.column.update({
        where: { id: input.id },
        data: { title: input.title },
        select: { id: true, title: true, order: true },
      });
    }),

  /* ——— delete column ——— */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }: any) => {
      // Check ownership via board
      const column = await ctx.prisma.column.findUnique({
        where: { id: input.id },
        include: { board: { select: { ownerId: true } } },
      });
      if (!column || column.board.ownerId !== ctx.userId) {
        throw new Error('Not your column');
      }

      // Delete column and all its cards
      await ctx.prisma.column.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});