import { getRedis } from "@/lib/cache";

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetSeconds: number;
};

export async function rateLimit(
  key: string,
  options: { limit: number; windowSeconds: number }
): Promise<RateLimitResult> {
  if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
    return {
      success: true,
      remaining: options.limit,
      resetSeconds: options.windowSeconds
    };
  }

  const redis = getRedis();
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, options.windowSeconds);
  }

  return {
    success: current <= options.limit,
    remaining: Math.max(options.limit - current, 0),
    resetSeconds: options.windowSeconds
  };
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}
