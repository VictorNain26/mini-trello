import { router } from './trpc.js';

// Empty router for now since we're using REST endpoints
export const appRouter = router({});

export type AppRouter = typeof appRouter;