import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export const tags = {
  projects: "projects",
  blogPosts: "blog-posts",
  leads: "leads",
  contactMessages: "contact-messages",
  testimonials: "testimonials",
  faqs: "faqs",
  chatSessions: "chat-sessions",
  analytics: "analytics",
  settings: "settings",
  dashboard: "dashboard",
  notifications: "notifications"
} as const;

export function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!
    });
  }

  return redis;
}

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
    return fetcher();
  }

  const cache = getRedis();
  const cached = await cache.get<T>(key);

  if (cached !== null) {
    return cached;
  }

  const value = await fetcher();
  await cache.set(key, value, { ex: ttlSeconds });
  return value;
}

export async function invalidateTag(tag: string) {
  if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
    return;
  }

  const cache = getRedis();
  let cursor = 0;

  do {
    const [nextCursor, keys] = await cache.scan(cursor, {
      match: `tag:${tag}:*`,
      count: 100
    });

    if (keys.length > 0) {
      await cache.del(...keys);
    }

    cursor = Number(nextCursor);
  } while (cursor !== 0);
}
