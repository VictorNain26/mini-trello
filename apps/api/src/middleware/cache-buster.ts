import type { NextFunction, Request, Response } from 'express';

/**
 * Middleware to prevent aggressive caching in production
 * Ensures fresh data is always served
 */
export function cacheBusterMiddleware(req: Request, res: Response, next: NextFunction) {
  // Set headers to prevent caching
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'ETag': false,
  });
  
  next();
}