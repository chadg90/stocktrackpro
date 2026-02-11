/**
 * Simple in-memory rate limiter by IP.
 * For multi-instance deployments consider Redis/Vercel KV.
 */

const store = new Map<string, { count: number; resetAt: number }>();

function getKey(ip: string, prefix: string): string {
  return `${prefix}:${ip}`;
}

function cleanup(): void {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetAt < now) store.delete(key);
  }
}

/**
 * Check rate limit. Returns true if allowed, false if rate limited.
 * @param ip - Client IP (e.g. from x-forwarded-for or x-real-ip)
 * @param prefix - Route identifier (e.g. 'checkout', 'stripe-webhook')
 * @param windowMs - Window in ms
 * @param maxRequests - Max requests per window
 */
export function rateLimit(
  ip: string,
  prefix: string,
  windowMs: number,
  maxRequests: number
): boolean {
  if (!ip) return true;
  cleanup();
  const key = getKey(ip, prefix);
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return '';
}
