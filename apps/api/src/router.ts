import { router } from './trpc.js';
import { boardRouter } from './routers/board.js';
import { columnRouter } from './routers/column.js';
import { cardRouter } from './routers/card.js';
import { userRouter } from './routers/user.js';

export const appRouter = router({
  board: boardRouter,
  column: columnRouter,
  card: cardRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;