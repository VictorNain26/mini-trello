import { z } from 'zod';
import { router, procedure } from '../trpc.js';

export const userRouter = router({
  queryUser: procedure
    .input(z.null().or(z.undefined()).optional())
    .query(({ ctx }) => ctx.session?.user ?? null),
});
