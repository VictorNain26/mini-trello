import { router } from './trpc.js';
import { boardRouter } from './routers/board.js';
import { userRouter } from './routers/user.js';

export const appRouter = router({
  board: boardRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;