import "dotenv/config"
import express, { type Request, type Response } from "express"
import { createServer } from "node:http"
import { Server } from "socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import { getRedisClient } from "./config/redis.js"
import logger from "morgan"
import path from "node:path"
import cors from "cors"
import rateLimit from "express-rate-limit"
import pug from "pug"

import { ExpressAuth } from "@auth/express"
import { authConfig } from "./config/auth.simple.js"

import {
  errorHandler,
  errorNotFoundHandler,
} from "./middleware/error.middleware.js"

import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './router.js'
import { createContext } from './context.js'

// Import routes
import { boardRoutes } from './routes/boards.js'
import { columnRoutes } from './routes/columns.js'
import { cardRoutes } from './routes/cards.js'
import { memberRoutes } from './routes/members.js'
import { healthRouter } from './routes/health.js'

// Import controllers for legacy endpoints
import { validateRequest, SignupSchema } from './utils/validation.js'
import { prisma } from './db.js'
import bcrypt from 'bcrypt'

export type { AppRouter } from './router.js'

export const app: express.Application = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true
  }
})

// Configure Redis adapter for Socket.io
async function setupRedisAdapter() {
  try {
    const redisClient = await getRedisClient()
    const subClient = redisClient.duplicate()
    await subClient.connect()
    
    io.adapter(createAdapter(redisClient, subClient))
    console.log('🔗 Socket.io Redis adapter configured')
  } catch (error) {
    console.warn('⚠️ Redis not available, using default adapter:', error instanceof Error ? error.message : String(error))
  }
}

app.set("port", process.env.PORT ?? 4000)

/* ───────────── Views (Pug) ───────────── */
app.engine("pug", (pug as any).__express)
app.set("views", path.join(import.meta.dirname, "..", "views"))
app.set("view engine", "pug")

/* ───────────── Middlewares généraux ───── */
app.use(logger("dev"))
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
)
app.use(express.static(path.join(import.meta.dirname, "..", "public")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

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
        name: data.name ?? null 
      }
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
  max: process.env.NODE_ENV === 'production' ? 50 : 200,
  message: {
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => {
    return !req.path.includes('/callback/credentials') && 
           !req.path.includes('/signup') && 
           !req.path.includes('/signin');
  }
});

app.use("/api/auth", authRateLimit)
app.use("/api/auth", ExpressAuth(authConfig) as any)

/* ───────────── tRPC ────────────── */
const trpcRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 60 : 300,
  message: {
    error: 'Trop de requêtes. Ralentissez un peu.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: process.env.NODE_ENV === 'production',
});

app.use("/trpc", trpcRateLimit, createExpressMiddleware({
  router: appRouter,
  createContext: ({ req, res }) => createContext({ req, res, io }),
}))

/* ───────────── Health check ────────────── */
app.use("/", healthRouter)

/* ───────────── Routes demo ────────────── */
app.get("/", (_req: Request, res: Response) =>
  res.render("index", {
    title: "Mini Trello API",
    user: res.locals.session?.user || null,
  }),
)

/* ───────────── Error handlers ─────────── */
app.use(errorNotFoundHandler)
app.use(errorHandler)

/* ───────────── Start server ─────────── */
const port = app.get("port")

async function startServer() {
  try {
    // Setup Redis adapter for Socket.io
    await setupRedisAdapter()
    
    // Start server
    server.listen(port, () => {
      console.log(`🚀 API server running on http://localhost:${port}`)
      console.log(`🔌 Socket.io ready for connections`)
      console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Local'}`)
      console.log(`📦 Redis: ${process.env.REDIS_URL ? 'Connected' : 'Local/Disabled'}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()