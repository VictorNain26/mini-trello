import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context.js';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const userId = ctx.session?.user?.id;
  
  if (!userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({ ctx: { ...ctx, userId } });
}) as any;