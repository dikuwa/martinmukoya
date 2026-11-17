import { isIP } from "node:net";
import { getRedis } from "@/lib/cache";

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetSeconds: number;
  unavailable?: boolean;
};

export async function rateLimit(
  key: string,
  options: { limit: number; windowSeconds: number }
): Promise<RateLimitResult> {
  const unavailable = { success: false, remaining: 0, resetSeconds: options.windowSeconds, unavailable: true };
  if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) return unavailable;

  try {
    // Increment and expiry must be atomic so a failed expiry cannot leave a permanent counter.
    const current = await getRedis().eval<[number], number>(
      `local count = redis.call('INCR', KEYS[1])
       if count == 1 or redis.call('TTL', KEYS[1]) < 0 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
       return count`,
      [key], [options.windowSeconds]
    );
    if (!Number.isSafeInteger(current) || current < 1) return unavailable;
    return {
      success: current <= options.limit,
      remaining: Math.max(options.limit - current, 0),
      resetSeconds: options.windowSeconds
    };
  } catch {
    return unavailable;
  }
}

export function getClientIp(request: Pick<Request, "headers">) {
  // shortcut: other hosts share one bucket, configure a trusted proxy before deploying elsewhere.
  const ip = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.trim() : undefined;
  return ip && isIP(ip) ? ip : "unknown";
}
