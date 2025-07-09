import type { Request } from 'express';
import { prisma } from '../db.js';

/**
 * Extract user ID from session
 */
export async function getCurrentUserId(req: Request): Promise<string | null> {
  try {
    const sessionResponse = await fetch(`${process.env.VITE_API_URL}/api/auth/session`, {
      headers: { cookie: req.headers.cookie || '' },
    });

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      return sessionData?.user?.id || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get authenticated user or demo user fallback
 */
export async function getAuthenticatedUser(req: Request) {
  let userId = await getCurrentUserId(req);

  // Fallback to demo user if no valid session user
  if (!userId) {
    const demoEmail = 'demo@demo.com';

    let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });
    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          email: demoEmail,
          hashedPwd: 'demo-hash',
          name: 'Demo User',
        },
      });
    }
    userId = demoUser.id;
  }

  return userId;
}

/**
 * Require authenticated user (throw if not found)
 */
export async function requireAuth(req: Request): Promise<string> {
  const userId = await getCurrentUserId(req);
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}
