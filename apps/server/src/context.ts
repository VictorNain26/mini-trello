import type { inferAsyncReturnType } from '@trpc/server';
import type { Request, Response } from 'express';
import type { Server as IOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function createContext(opts: {
  req: Request;
  res: Response;
  io: IOServer;
}) {
  return { ...opts, prisma };
}
export type Context = inferAsyncReturnType<typeof createContext>;
