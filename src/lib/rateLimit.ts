interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodically clean expired rate limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((record, key) => {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * In-memory sliding window rate limiter to mitigate brute-force and DDoS attacks.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return {
      allowed: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetTime: now + options.windowMs,
    };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      limit: options.limit,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    limit: options.limit,
    remaining: options.limit - existing.count,
    resetTime: existing.resetTime,
  };
}
