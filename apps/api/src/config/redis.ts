import { createClient, type RedisClientType } from 'redis';
import { getEnvWithFallback } from '../utils/env.js';

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      url: getEnvWithFallback('REDIS_URL', 'redis://localhost:6379'),
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) return false; // Stop retrying after 5 attempts
          return Math.min(retries * 50, 1000);
        },
        connectTimeout: 5000,
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('🔗 Redis connected');
    });

    redisClient.on('disconnect', () => {
      console.log('🔌 Redis disconnected');
    });

    try {
      await redisClient.connect();
      console.log('✅ Redis connection successful');
    } catch (error) {
      console.warn('⚠️ Redis connection failed, continuing without Redis:', error);
      redisClient = null;
      throw error;
    }
  }

  return redisClient;
}

export async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
}
