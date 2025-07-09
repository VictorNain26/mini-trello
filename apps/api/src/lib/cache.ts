import { Redis } from 'ioredis';
import { getEnv, getEnvWithFallback } from '../utils/env.js';

const redisPassword = getEnv('REDIS_PASSWORD');
const redisConfig = {
  host: getEnvWithFallback('REDIS_HOST', 'localhost'),
  port: parseInt(getEnvWithFallback('REDIS_PORT', '6379')),
  connectTimeout: 5000,
  lazyConnect: true,
  ...(redisPassword && { password: redisPassword }),
};

const redis = new Redis(redisConfig);

// Error handling
redis.on('error', (error: Error) => {
  console.error('Redis connection error:', error);
});

export class CacheService {
  private static instance: CacheService;
  private redis: Redis;

  private constructor() {
    this.redis = redis;
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache del error:', error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache delPattern error:', error);
    }
  }

  // Session cache methods
  async getSession(sessionToken: string) {
    return this.get(`session:${sessionToken}`);
  }

  async setSession(sessionToken: string, session: any, ttlSeconds: number = 3600) {
    return this.set(`session:${sessionToken}`, session, ttlSeconds);
  }

  async delSession(sessionToken: string) {
    return this.del(`session:${sessionToken}`);
  }

  // User permission cache methods
  async getUserPermissions(userId: string, boardId: string) {
    return this.get(`permissions:${userId}:${boardId}`);
  }

  async setUserPermissions(
    userId: string,
    boardId: string,
    permissions: any,
    ttlSeconds: number = 600
  ) {
    return this.set(`permissions:${userId}:${boardId}`, permissions, ttlSeconds);
  }

  async delUserPermissions(userId: string, boardId?: string) {
    if (boardId) {
      return this.del(`permissions:${userId}:${boardId}`);
    } else {
      return this.delPattern(`permissions:${userId}:*`);
    }
  }

  // Board cache methods
  async getBoard(boardId: string) {
    return this.get(`board:${boardId}`);
  }

  async setBoard(boardId: string, board: any, ttlSeconds: number = 300) {
    return this.set(`board:${boardId}`, board, ttlSeconds);
  }

  async delBoard(boardId: string) {
    return this.del(`board:${boardId}`);
  }

  // User boards cache methods
  async getUserBoards(userId: string) {
    return this.get(`user-boards:${userId}`);
  }

  async setUserBoards(userId: string, boards: any, ttlSeconds: number = 300) {
    return this.set(`user-boards:${userId}`, boards, ttlSeconds);
  }

  async delUserBoards(userId: string) {
    return this.del(`user-boards:${userId}`);
  }

  // Invalidate all user-related caches
  async invalidateUserCaches(userId: string) {
    await Promise.all([this.delUserPermissions(userId), this.delUserBoards(userId)]);
  }

  // Invalidate all board-related caches
  async invalidateBoardCaches(boardId: string) {
    await Promise.all([
      this.delBoard(boardId),
      this.delPattern(`permissions:*:${boardId}`),
      this.delPattern(`user-boards:*`), // Board changes affect user board lists
    ]);
  }
}

export const cache = CacheService.getInstance();
