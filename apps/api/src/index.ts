import "dotenv/config"
import express, { type Request, type Response } from "express"
import { createServer } from "node:http"
import { Server } from "socket.io"
import logger        from "morgan"
import path          from "node:path"
import cors          from "cors"
import rateLimit     from "express-rate-limit"
import pug           from "pug"

import { ExpressAuth } from "@auth/express"
import { authConfig }  from "./config/auth.simple.js"

import {
  errorHandler,
  errorNotFoundHandler,
} from "./middleware/error.middleware.js"

import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './router.js'
import { createContext } from './context.js'
// import { registerPresence } from './realtime/presence.js' // Removed unused presence

export type { AppRouter } from './router.js'

export const app: express.Application = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true
  }
})

app.set("port", process.env.PORT ?? 4000)

/* ───────────── Views (Pug) ───────────── */

app.engine("pug", (pug as any).__express)
app.set("views", path.join(import.meta.dirname, "..", "views"))
app.set("view engine", "pug")

/* ───────────── Middlewares généraux ───── */
// app.set("trust proxy", true)                // si derrière un proxy - disabled for dev
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
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from './db.js';

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

app.post('/api/signup', async (req: any, res: any) => {
  try {
    const { email, password, name } = SignupSchema.parse(req.body);
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Create user
    const hashedPwd = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, hashedPwd, name: name ?? null }
    });
    
    return res.json({ success: true });
  } catch {
    return res.status(400).json({ error: 'Invalid input' });
  }
});

/* ───────────── Board endpoints ─── */
app.get('/api/boards', async (req: any, res: any) => {
  try {
    // Get user from session
    const sessionResponse = await fetch('http://localhost:4000/api/auth/session', {
      headers: { cookie: req.headers.cookie || '' }
    });
    
    let userId = null;
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      const sessionUserId = session?.user?.id;
      
      // Verify the user exists in database
      if (sessionUserId) {
        const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
        if (user) {
          userId = user.id;
        }
      }
    }
    
    // Fallback to demo user if no valid session user
    if (!userId) {
      const demoEmail = 'demo@demo.com';
      
      let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });
      if (!demoUser) {
        // Create new demo user
        demoUser = await prisma.user.create({
          data: {
            email: demoEmail,
            hashedPwd: 'demo-hash',
            name: 'Demo User'
          }
        });
      }
      userId = demoUser.id;
    }
    
    if (!userId) {
      return res.json([]);
    }
    
    // Get owned boards
    const ownedBoards = await prisma.board.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: {
            columns: true
          }
        },
        owner: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get shared boards (where user is a member)
    const sharedBoards = await prisma.board.findMany({
      where: {
        members: {
          some: { userId: userId }
        }
      },
      include: {
        _count: {
          select: {
            columns: true
          }
        },
        owner: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const boards = {
      owned: ownedBoards.map(board => ({ ...board, isOwner: true })),
      shared: sharedBoards.map(board => ({ ...board, isOwner: false }))
    };
    return res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/boards', async (req: any, res: any) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title required' });
    }

    // Get user from session
    const sessionResponse = await fetch('http://localhost:4000/api/auth/session', {
      headers: { cookie: req.headers.cookie || '' }
    });
    
    let userId = null;
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      const sessionUserId = session?.user?.id;
      
      // Verify the user exists in database
      if (sessionUserId) {
        const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
        if (user) {
          userId = user.id;
        }
      }
    }
    
    // Fallback to demo user if no valid session user
    if (!userId) {
      const demoEmail = 'demo@demo.com';
      
      let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });
      if (!demoUser) {
        // Create new demo user
        demoUser = await prisma.user.create({
          data: {
            email: demoEmail,
            hashedPwd: 'demo-hash',
            name: 'Demo User'
          }
        });
      }
      userId = demoUser.id;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const board = await prisma.board.create({
      data: {
        title: title.trim(),
        ownerId: userId
      }
    });

    return res.json(board);
  } catch (error) {
    console.error('Create board error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ───────────── Board detail endpoint ─── */
app.get('/api/boards/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Get user from session
    const sessionResponse = await fetch('http://localhost:4000/api/auth/session', {
      headers: { cookie: req.headers.cookie || '' }
    });
    
    let userId = null;
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      const sessionUserId = session?.user?.id;
      
      // Verify the user exists in database
      if (sessionUserId) {
        const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
        if (user) {
          userId = user.id;
        }
      }
    }
    
    // Fallback to demo user if no valid session user
    if (!userId) {
      const demoEmail = 'demo@demo.com';
      
      let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });
      if (!demoUser) {
        // Create new demo user
        demoUser = await prisma.user.create({
          data: {
            email: demoEmail,
            hashedPwd: 'demo-hash',
            name: 'Demo User'
          }
        });
      }
      userId = demoUser.id;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const board = await prisma.board.findFirst({
      where: { 
        id,
        OR: [
          { ownerId: userId },
          { 
            members: {
              some: { userId: userId }
            }
          }
        ]
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            cards: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    return res.json(board);
  } catch (error) {
    console.error('Get board error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ───────────── Column endpoints ─── */
app.post('/api/boards/:boardId/columns', async (req: any, res: any) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title required' });
    }

    // Get next order
    const lastColumn = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' }
    });

    const column = await prisma.column.create({
      data: {
        title: title.trim(),
        boardId,
        order: (lastColumn?.order || 0) + 1
      }
    });

    return res.json(column);
  } catch (error) {
    console.error('Create column error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/columns/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title required' });
    }

    await prisma.column.update({
      where: { id },
      data: { title: title.trim() }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Update column error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/columns/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    await prisma.column.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete column error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ───────────── Card endpoints ─── */
app.post('/api/columns/:columnId/cards', async (req: any, res: any) => {
  try {
    const { columnId } = req.params;
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title required' });
    }

    // Get next order
    const lastCard = await prisma.card.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' }
    });

    const card = await prisma.card.create({
      data: {
        title: title.trim(),
        columnId,
        order: (lastCard?.order || 0) + 1
      }
    });

    return res.json(card);
  } catch (error) {
    console.error('Create card error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/cards/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title, description, labels, dueDate } = req.body;

    // Validation côté serveur
    if (title && !title.trim()) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    // Validation de la date - ne doit pas être dans le passé
    if (dueDate) {
      const selectedDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (selectedDate < today) {
        return res.status(400).json({ error: 'Due date cannot be in the past' });
      }
    }

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (labels !== undefined) updateData.labels = labels;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    await prisma.card.update({
      where: { id },
      data: updateData
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Update card error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/cards/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    await prisma.card.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete card error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/cards/:id/move', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { columnId, order } = req.body;

    await prisma.card.update({
      where: { id },
      data: { columnId, order }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Move card error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ───────────── Board invitation endpoints ─── */
app.post('/api/boards/:boardId/invite', async (req: any, res: any) => {
  try {
    const { boardId } = req.params;
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email required' });
    }

    // Get current user from session
    const sessionResponse = await fetch('http://localhost:4000/api/auth/session', {
      headers: { cookie: req.headers.cookie || '' }
    });
    
    let currentUserId = null;
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      const sessionUserId = session?.user?.id;
      
      if (sessionUserId) {
        const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
        if (user) {
          currentUserId = user.id;
        }
      }
    }

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is owner or admin of the board
    const board = await prisma.board.findFirst({
      where: { 
        id: boardId,
        OR: [
          { ownerId: currentUserId },
          { 
            members: {
              some: {
                userId: currentUserId,
                role: { in: ['admin', 'owner'] }
              }
            }
          }
        ]
      }
    });

    if (!board) {
      return res.status(403).json({ error: 'Not authorized to invite to this board' });
    }

    // Find user by email
    let invitedUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    
    if (!invitedUser) {
      return res.status(404).json({ 
        error: 'User not found',
        requiresSignup: true,
        email: email.toLowerCase()
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: invitedUser.id
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this board' });
    }

    // Add user as member
    await prisma.boardMember.create({
      data: {
        boardId,
        userId: invitedUser.id,
        role: 'member'
      }
    });

    return res.json({ 
      success: true, 
      message: `${invitedUser.name || invitedUser.email} has been added to the board` 
    });

  } catch (error) {
    console.error('Invite user error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/boards/:boardId/members', async (req: any, res: any) => {
  try {
    const { boardId } = req.params;

    // Get current user from session
    const sessionResponse = await fetch('http://localhost:4000/api/auth/session', {
      headers: { cookie: req.headers.cookie || '' }
    });
    
    let currentUserId = null;
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      const sessionUserId = session?.user?.id;
      
      if (sessionUserId) {
        const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
        if (user) {
          currentUserId = user.id;
        }
      }
    }

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has access to this board
    const hasAccess = await prisma.board.findFirst({
      where: { 
        id: boardId,
        OR: [
          { ownerId: currentUserId },
          { 
            members: {
              some: { userId: currentUserId }
            }
          }
        ]
      }
    });

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all members including owner
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: {
          select: { id: true, name: true, email: true, color: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, color: true }
            }
          }
        }
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const members = [
      {
        ...board.owner,
        role: 'owner',
        joinedAt: board.createdAt
      },
      ...board.members.map(member => ({
        ...member.user,
        role: member.role,
        joinedAt: member.joinedAt
      }))
    ];

    return res.json(members);

  } catch (error) {
    console.error('Get board members error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ───────────── Board management endpoints ─── */
app.put('/api/boards/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title required' });
    }

    await prisma.board.update({
      where: { id },
      data: { title: title.trim() }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Update board error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/boards/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    await prisma.board.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete board error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/columns/:id/move', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { order } = req.body;

    await prisma.column.update({
      where: { id },
      data: { order }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Move column error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ───────────── Rate-limit (auth only) ─── */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 50 : 200, // 50 requests per 15min in prod, 200 in dev
  message: {
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests to reduce rate limiting on normal usage
  skipSuccessfulRequests: true,
  // Only apply to login/signup endpoints
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
  max: process.env.NODE_ENV === 'production' ? 60 : 300, // 60 requests per minute in prod, 300 in dev
  message: {
    error: 'Trop de requêtes. Ralentissez un peu.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // More lenient for development
  skipSuccessfulRequests: process.env.NODE_ENV === 'production',
});

app.use("/trpc", trpcRateLimit, createExpressMiddleware({
  router: appRouter,
  createContext: ({ req, res }) => createContext({ req, res, io }),
}))

/* ───────────── Socket.io ────────────── */
// registerPresence(io) // Removed unused presence

/* ───────────── Routes demo ────────────── */
app.get("/", (_req: Request, res: Response) =>
  res.render("index", {
    title: "Mini Trello API",
    user: res.locals.session?.user || null,
  }),
)

// Removed unused protected routes

/* ───────────── Error handlers ─────────── */
app.use(errorNotFoundHandler)
app.use(errorHandler)

/* ───────────── Start server ─────────── */
const port = app.get("port")
server.listen(port, () => {
  console.log(`🚀 API server running on http://localhost:${port}`)
  console.log(`🔌 Socket.io ready for connections`)
})
