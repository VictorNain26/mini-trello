import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context.js';

const t = initTRPC.context<Context>().create();

export const userRouter = t.router({
  queryUser: t.procedure
    .input(z.null().or(z.undefined()).optional())
    .query(({ ctx }) => ctx.session?.user ?? null),
});
