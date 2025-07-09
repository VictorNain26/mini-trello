import { getSession } from '@auth/express';
import type { Prisma } from '@prisma/client';
import type { inferAsyncReturnType } from '@trpc/server';
import type { Request, Response } from 'express';
import type { Server as IOServer } from 'socket.io';
import { authConfig } from './config/auth.simple.js';
import { prisma } from './db.js';

export async function createContext(opts: { req: Request; res: Response; io?: IOServer }) {
  let session = null;
  
  try {
    session = await getSession(opts.req, authConfig);
  } catch (error) {
    console.error('Session retrieval error:', error);
    // Don't throw, just continue with null session
  }
  
  return { 
    ...opts, 
    prisma, 
    session,
    // Add request info for debugging
    userAgent: opts.req.headers['user-agent'],
    ip: opts.req.ip,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
export type Tx = Prisma.TransactionClient;
