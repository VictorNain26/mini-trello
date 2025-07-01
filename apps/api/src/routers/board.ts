import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { Context, Tx } from '../context.js';
import { protectedProcedure } from '../trpc/protected.js';

const t = initTRPC.context<Context>().create();

/* ─────────── Types utilitaires ─────────── */
const BoardInput  = z.object({ title: z.string().min(1) });
const ColumnInput = z.object({ boardId: z.string(), title: z.string().min(1) });
const CardInput   = z.object({
  columnId: z.string(),
  title:    z.string().min(1),
  order:    z.number().int().min(0).default(0),
});

export const boardRouter = t.router({
  /* ——— query current user boards ——— */
  listMine: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.board.findMany({
      where: { ownerId: ctx.userId },
      select: { id: true, title: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
  ),

  /* ——— create board ——— */
  create: protectedProcedure
    .input(BoardInput)
    .mutation(({ ctx, input }) =>
      ctx.prisma.board.create({
        data: { title: input.title, ownerId: ctx.userId },
        select: { id: true, title: true },
      }),
    ),

  /* ——— create column ——— */
  addColumn: protectedProcedure
    .input(ColumnInput)
    .mutation(async ({ ctx, input }) => {
      // vérifie ownership
      const board = await ctx.prisma.board.findFirst({
        where: { id: input.boardId, ownerId: ctx.userId },
      });
      if (!board) throw new Error('Not your board');

      const pos = await ctx.prisma.column.count({
        where: { boardId: input.boardId },
      });

      return ctx.prisma.column.create({
        data: { title: input.title, order: pos, boardId: input.boardId },
        select: { id: true, title: true, order: true },
      });
    }),

  /* ——— create card ——— */
  addCard: protectedProcedure
    .input(CardInput)
    .mutation(async ({ ctx, input }) => {
      // ownership via join column->board
      const col = await ctx.prisma.column.findUnique({
        where: { id: input.columnId },
        include: { board: { select: { ownerId: true } } },
      });
      if (!col || col.board.ownerId !== ctx.userId) throw new Error('Not allowed');

      const pos =
        input.order ??
        (await ctx.prisma.card.count({ where: { columnId: input.columnId } }));

      return ctx.prisma.card.create({
        data: { title: input.title, order: pos, columnId: input.columnId },
        select: { id: true, title: true, order: true },
      });
    }),
});
