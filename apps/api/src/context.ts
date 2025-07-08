import type { inferAsyncReturnType } from '@trpc/server';
import type { Request, Response } from 'express';
import type { Server as IOServer } from 'socket.io';
import { Prisma } from '@prisma/client';
import { getSession } from '@auth/express';
import { authConfig } from './config/auth.simple.js';
import { prisma } from './db.js';

export async function createContext(opts: {
  req: Request;
  res: Response;
  io?: IOServer;
}) {
  try {
    const session = await getSession(opts.req, authConfig);
    return { ...opts, prisma, session };
  } catch (error) {
    console.error('Context creation error:', error);
    // Return context with null session if Auth.js fails
    return { ...opts, prisma, session: null };
  }
}

export type Context = inferAsyncReturnType<typeof createContext>;
export type Tx = Prisma.TransactionClient;
