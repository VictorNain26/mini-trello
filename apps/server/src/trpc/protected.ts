import { TRPCError, initTRPC } from '@trpc/server';
import type { Context } from '../context.js';

const t = initTRPC.context<Context>().create();

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { userId: ctx.session.user.id } });
});
