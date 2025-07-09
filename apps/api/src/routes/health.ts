import { type Request, type Response, Router } from 'express';
import { getRedisClient } from '../config/redis.js';
import { prisma } from '../db.js';

const router: Router = Router();

router.get('/health', async (req: Request, res: Response) => {
  const healthChecks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthChecks.services.database = 'connected';
  } catch (_error) {
    healthChecks.services.database = 'disconnected';
    healthChecks.status = 'unhealthy';
  }

  // Check Redis
  try {
    const redisClient = await getRedisClient();
    await redisClient.ping();
    healthChecks.services.redis = 'connected';
  } catch (_error) {
    healthChecks.services.redis = 'disconnected';
    // Redis is optional, don't mark as unhealthy
  }

  res.status(healthChecks.status === 'healthy' ? 200 : 503).json(healthChecks);
});

export { router as healthRouter };
