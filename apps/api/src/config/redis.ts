import { createClient, type RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
      },
    })

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    redisClient.on('connect', () => {
      console.log('🔗 Redis connected')
    })

    redisClient.on('disconnect', () => {
      console.log('🔌 Redis disconnected')
    })

    await redisClient.connect()
  }

  return redisClient
}

export async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.disconnect()
    redisClient = null
  }
}