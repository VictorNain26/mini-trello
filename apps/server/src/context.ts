import type { inferAsyncReturnType } from '@trpc/server';
import type { Request, Response } from 'express';
import type { Server as IOServer } from 'socket.io';
import { Prisma } from '@prisma/client';
import { getSession } from '@auth/express';
import { authConfig } from './auth.js';
import { prisma } from './db.js';

export async function createContext(opts: {
  req: Request;
  res: Response;
  io: IOServer;
}) {
  const session = await (getSession as any)(
    opts.req,
    opts.res,
    authConfig,
  ).catch(() => null);

  return { ...opts, prisma, session };
}

export type Context = inferAsyncReturnType<typeof createContext>;
export type Tx = Prisma.TransactionClient;
