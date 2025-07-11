import { getSession } from '@auth/express';
import type { Request } from 'express';
import { authConfig } from '../config/auth.simple.js';
import { prisma } from '../db.js';

/**
 * Extract user ID from session using Auth.js directly (with caching)
 */
export async function getCurrentUserId(req: Request): Promise<string | null> {
  try {
    // Try to get session token from cookies
    const _sessionToken =
      req.cookies?.['authjs.session-token'] || req.cookies?.['__Secure-authjs.session-token'];

    // Skip session cache - get fresh data from Auth.js
    const session = await getSession(req, authConfig);
    const userId = session?.user?.id || null;

    return userId;
  } catch (error) {
    console.error('Session validation error:', error);
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
