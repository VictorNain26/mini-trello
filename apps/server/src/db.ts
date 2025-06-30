import { PrismaClient } from '@prisma/client';

/** Prisma singleton partagé par toute l’app */
export const prisma =
  (globalThis as any).prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).prisma = prisma;
}
