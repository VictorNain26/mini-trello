import type { NextFunction, Request, Response } from 'express';

/** Handle 404 not found errors */
export function errorNotFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' });
}

/** Generic error handler */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  const status = (err as { status?: number })?.status ?? 500;
  res.status(status).json({ error: message });
}
