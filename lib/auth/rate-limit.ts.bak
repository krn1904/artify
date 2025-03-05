import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

export async function rateLimit(request: NextRequest) {
  try {
    const ip = request.ip || 'anonymous';
    const key = `rate-limit:${ip}`;
    
    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }
    
    if (requests > MAX_REQUESTS) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Rate limit error:', error);
    return true; // Allow request if rate limiting fails
  }
}