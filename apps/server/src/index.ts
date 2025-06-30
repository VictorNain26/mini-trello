import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient, type RedisClientType } from 'redis';
import { authRouter } from './routes/auth.js';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { initTRPC } from '@trpc/server';
import { userRouter } from './routers/user.js';

import { boardRouter } from './routers/board.js';
import { createContext } from './context.js';
import { registerPresence } from './realtime/presence.js';

const app  = express();
const http = createServer(app);

/* ──────────────  CORS  ────────────── */
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
);

/* JSON body parser pour /signup */
app.use(express.json());

/* Auth routes */
app.use('/auth', authRouter);

/* ──────────────  Socket.IO  ────────────── */
const io = new Server(http, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io',
});

let redisPub: RedisClientType | undefined;

if (process.env.REDIS_URL) {
  redisPub = createClient({ url: process.env.REDIS_URL });
  const redisSub = redisPub.duplicate();
  await Promise.all([redisPub.connect(), redisSub.connect()]);
  io.adapter(createAdapter(redisPub, redisSub));
}

registerPresence(io, redisPub);

/* rooms “board” de base */
io.on('connection', (socket) => {
  socket.on('join-board',  (boardId) => socket.join(boardId));
  socket.on('leave-board', (boardId) => socket.leave(boardId));
});

/* ──────────────  tRPC  ────────────── */
const t = initTRPC.context().create();
export const appRouter = t.router(
  {
    board: boardRouter,
    user:  userRouter,
  }
);

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => createContext({ req, res, io }),
  }),
);

/* ──────────────  Start  ────────────── */
const PORT = process.env.PORT ?? 4000;
http.listen(PORT, () => console.log(`✅ API + WS sur :${PORT}`));

export type AppRouter = typeof appRouter;
