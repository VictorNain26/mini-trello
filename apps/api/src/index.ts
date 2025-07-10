import 'dotenv/config';
import { createServer } from 'node:http';
import path from 'node:path';
import { ExpressAuth } from '@auth/express';
import { createAdapter } from '@socket.io/redis-adapter';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import logger from 'morgan';
import pug from 'pug';
import { Server } from 'socket.io';
import { authConfig } from './config/auth.simple.js';
import { getRedisClient } from './config/redis.js';
import { createContext } from './context.js';
import { prisma } from './db.js';
import { errorHandler, errorNotFoundHandler } from './middleware/error.middleware.js';
import { cacheBusterMiddleware } from './middleware/cache-buster.js';
import { appRouter } from './router.js';
// Import routes
import { boardRoutes } from './routes/boards.js';
import { cardRoutes } from './routes/cards.js';
import { columnRoutes } from './routes/columns.js';
import { healthRouter } from './routes/health.js';
import { memberRoutes } from './routes/members.js';
import { getEnv, getEnvWithFallback } from './utils/env.js';
// Import controllers for legacy endpoints
import { SignupSchema, validateRequest } from './utils/validation.js';

export type { AppRouter } from './router.js';

export const app: express.Application = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: getEnvWithFallback('CLIENT_ORIGIN', 'http://localhost:5173'),
    credentials: true,
  },
});

// Configure Redis adapter for Socket.io
async function setupRedisAdapter() {
  try {
    const redisClient = await getRedisClient();
    const subClient = redisClient.duplicate();
    await subClient.connect();

    io.adapter(createAdapter(redisClient, subClient));
    console.log('🔗 Socket.io Redis adapter configured');
  } catch (error) {
    console.warn(
      '⚠️ Redis not available, using default adapter:',
      error instanceof Error ? error.message : String(error)
    );
  }
}

app.set('port', getEnvWithFallback('PORT', '4000'));

/* ───────────── Views (Pug) ───────────── */
app.engine('pug', (pug as any).__express);
app.set('views', path.join(import.meta.dirname, '..', 'views'));
app.set('view engine', 'pug');

/* ───────────── Middlewares généraux ───── */
app.use(logger('dev'));
app.use(
  cors({
    origin: getEnvWithFallback('CLIENT_ORIGIN', 'http://localhost:5173'),
    credentials: true,
  })
);
app.use(express.static(path.join(import.meta.dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Disable caching in production to prevent stale data
app.use(cacheBusterMiddleware);

/* ───────────── Simple signup endpoint ─────────── */
app.post('/api/signup', async (req: Request, res: Response) => {
  try {
    const data = validateRequest(SignupSchema, req.body);

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    // Create user
    const hashedPwd = await bcrypt.hash(data.password, 10);
    await prisma.user.create({
      data: {
        email: data.email,
        hashedPwd,
        name: data.name ?? null,
      },
    });

    res.json({ success: true });
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: 'Invalid input' });
    return;
  }
});

/* ───────────── API Routes ─────────── */
app.use('/api/boards', boardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api', memberRoutes);

/* ───────────── Rate-limit (auth only) ─── */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: getEnv('NODE_ENV') === 'production' ? 50 : 200,
  message: {
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => {
    return (
      !req.path.includes('/callback/credentials') &&
      !req.path.includes('/signup') &&
      !req.path.includes('/signin')
    );
  },
});

app.use('/api/auth', authRateLimit);
app.use('/api/auth', ExpressAuth(authConfig) as any);

/* ───────────── tRPC ────────────── */
const trpcRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: getEnv('NODE_ENV') === 'production' ? 60 : 300,
  message: {
    error: 'Trop de requêtes. Ralentissez un peu.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: getEnv('NODE_ENV') === 'production',
});

app.use(
  '/trpc',
  trpcRateLimit,
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => createContext({ req, res, io }),
  })
);

/* ───────────── Health check ────────────── */
app.use('/', healthRouter);

/* ───────────── Routes demo ────────────── */
app.get('/', (_req: Request, res: Response) =>
  res.render('index', {
    title: 'Mini Trello API',
    // biome-ignore lint/complexity/useLiteralKeys: TypeScript strict mode requires bracket notation for index signatures
    user: res.locals['session']?.user || null,
  })
);

/* ───────────── Error handlers ─────────── */
app.use(errorNotFoundHandler);
app.use(errorHandler);

/* ───────────── Start server ─────────── */
const port = app.get('port');

async function startServer() {
  try {
    // Setup Redis adapter for Socket.io
    await setupRedisAdapter();

    // Start server
    server.listen(port, () => {
      console.log(`🚀 API server running on http://localhost:${port}`);
      console.log(`🔌 Socket.io ready for connections`);
      console.log(`🗄️  Database: ${getEnv('DATABASE_URL') ? 'Connected' : 'Local'}`);
      console.log(`📦 Redis: ${getEnv('REDIS_URL') ? 'Connected' : 'Local/Disabled'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
