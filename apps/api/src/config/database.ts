import { PrismaClient } from '@prisma/client'

// Database connection health check
export async function checkDatabaseConnection() {
  const prisma = new PrismaClient()
  
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error instanceof Error ? error.message : String(error))
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// Database configuration for different environments
export const getDatabaseConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    url: process.env.DATABASE_URL,
    log: isProduction ? ['error'] : ['query', 'info', 'warn', 'error'],
    errorFormat: isProduction ? 'minimal' : 'pretty',
  }
}