import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { Server as IOServer } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { initTRPC } from '@trpc/server';
import { boardRouter } from './routers/board.js';
import { createContext } from './context.js';
import { registerPresence } from './realtime/presence.js';

const app  = express();
const http = createServer(app);

/* ---------- Socket.IO ---------- */
const io = new IOServer(http, { cors: { origin: '*' } });

registerPresence(io);

// Redis adapter (optionnel en dev)
if (process.env.REDIS_URL) {
  const pub = createClient({ url: process.env.REDIS_URL });
  const sub = pub.duplicate();
  await Promise.all([pub.connect(), sub.connect()]);
  io.adapter(createAdapter(pub, sub));
}

io.on('connection', socket => {
  socket.on('join-board', boardId => socket.join(boardId));
});

/* ---------- tRPC ---------- */
const t = initTRPC.context().create();
export const appRouter = t.router({ board: boardRouter });

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => createContext({ req, res, io })
  })
);

const PORT = process.env.PORT ?? 4000;
http.listen(PORT, () => console.log(`✅ API + WS sur :${PORT}`));

export type AppRouter = typeof appRouter;
