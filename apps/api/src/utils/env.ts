/**
 * Utility function to safely access environment variables
 * This avoids TypeScript strict mode issues with process.env access
 */
export function getEnv(key: string): string | undefined {
  return process.env[key];
}

/**
 * Get environment variable with fallback
 */
export function getEnvWithFallback(key: string, fallback: string): string {
  return getEnv(key) || fallback;
}

/**
 * Get required environment variable (throws if not found)
 */
export function getRequiredEnv(key: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
