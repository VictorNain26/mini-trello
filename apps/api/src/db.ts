import { PrismaClient } from '@prisma/client';
import { getEnv } from './utils/env.js';

/** Prisma singleton partagé par toute l’app */
export const prisma = (globalThis as { prisma?: PrismaClient }).prisma ?? new PrismaClient();

if (getEnv('NODE_ENV') !== 'production') {
  (globalThis as { prisma?: PrismaClient }).prisma = prisma;
}
