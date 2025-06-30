import type { inferAsyncReturnType } from '@trpc/server';
import type { Request, Response } from 'express';
import type { Server as IOServer } from 'socket.io';
import { PrismaClient, Prisma } from '@prisma/client';

/* ───────────── Prisma singleton ───────────── */
export const prisma =
  (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production')
  (globalThis as any).prisma = prisma;

/* ───────────── Context factory ───────────── */
export async function createContext(opts: {
  req: Request;
  res: Response;
  io: IOServer;
}) {
  /**
   * Import dynamique : évite la boucle (auth ↔ context).
   * Le module auth sera chargé après l'init de prisma.
   */
  const { auth } = await import('./auth.js');
  const session  = await (auth as any).getSession(opts.req, opts.res);

  return { ...opts, prisma, session };
}

export type Context = inferAsyncReturnType<typeof createContext>;
export type Tx = Prisma.TransactionClient;
