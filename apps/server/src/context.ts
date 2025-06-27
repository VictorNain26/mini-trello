import type { inferAsyncReturnType } from '@trpc/server';
import type { Request, Response } from 'express';
import type { Server as IOServer } from 'socket.io';
import { boards } from './data/seed.js';

export function createContext(opts: { req: Request; res: Response; io: IOServer }) {
  return { ...opts, boards };
}
export type Context = inferAsyncReturnType<typeof createContext>;
