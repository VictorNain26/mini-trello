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

const app = express();
app.set('trust proxy', true);

app.get('/', (_req, res) => { res.json({ ok: true }); return; });

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET','POST','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-CSRF-Token'],
  }),
);
app.options('*', cors());
app.use(express.json());

// Auth
app.use('/auth', authRouter);

// HTTP + WS
const http = createServer(app);
const io = new Server(http, {
  cors: { origin: 'http://localhost:5173', credentials: true },
  path: '/socket.io',
});
registerPresence(io);
if (process.env.REDIS_URL) {
  const pub = createClient({ url: process.env.REDIS_URL });
  const sub = pub.duplicate();
  await pub.connect();
  await sub.connect();
  io.adapter(createAdapter(pub, sub));
}

// tRPC
const t = initTRPC.context().create();
export const appRouter = t.router({
  board: boardRouter,
  user:  userRouter,
});
export type AppRouter = typeof appRouter;

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => createContext({ req, res, io }),
  }),
);

const PORT = process.env.PORT ?? 4000;
http.listen(PORT, () => console.log(`✅ API + WS on :${PORT}`));
