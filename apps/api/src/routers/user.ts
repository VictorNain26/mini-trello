import { z } from 'zod';
import { router, procedure, protectedProcedure } from '../trpc.js';

export const userRouter = router({
  // Simple test endpoint
  test: procedure
    .query(() => {
      return { message: "Test endpoint works" };
    }),
    
  // Public endpoint that returns user if session exists, null if not
  queryUser: procedure
    .input(z.null().or(z.undefined()).optional())
    .query(({ ctx }) => {
      console.log('queryUser called, session:', !!ctx.session);
      console.log('session user:', ctx.session?.user);
      return ctx.session?.user ?? null;
    }),
    
  // Protected endpoint that requires authentication
  getProfile: protectedProcedure
    .query(({ ctx }: { ctx: any }) => {
      return ctx.session?.user;
    }),
});
