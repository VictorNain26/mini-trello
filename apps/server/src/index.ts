import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

import { authRouter } from './routes/auth.js';
import { registerPresence } from './realtime/presence.js';
import { createContext } from './context.js';
import { initTRPC } from '@trpc/server';
import { boardRouter } from './routers/board.js';
import { userRouter } from './routers/user.js';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

const app  = express();
const http = createServer(app);

/* ---------- middlewares ---------- */
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());

/* ---------- Auth routes ---------- */
app.use('/auth', authRouter);

/* ---------- Socket.IO ---------- */
const io = new Server(http, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
  path: '/socket.io',
});

registerPresence(io);

/* Redis adapter si REDIS_URL présent */
if (process.env.REDIS_URL) {
  const pub = createClient({ url: process.env.REDIS_URL });
  const sub = pub.duplicate();
  await Promise.all([pub.connect(), sub.connect()]);
  io.adapter(createAdapter(pub, sub));
}

/* ---------- tRPC ---------- */
const t = initTRPC.context().create();
export const appRouter = t.router({
  board: boardRouter,
  user:  userRouter,
});

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => createContext({ req, res, io }),
  }),
);

export type AppRouter = typeof appRouter;

/* ---------- start ---------- */
const PORT = process.env.PORT ?? 4000;
http.listen(PORT, () => console.log(`✅ API + WS on :${PORT}`));
