import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiters per Tech Spec §5.4
const limiters = {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 req/min per IP
    analytics: true,
    prefix: "ratelimit:auth",
  }),
  checkout: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 req/min per IP
    analytics: true,
    prefix: "ratelimit:checkout",
  }),
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 req/hour per IP
    analytics: true,
    prefix: "ratelimit:contact",
  }),
  products: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 req/min per IP
    analytics: true,
    prefix: "ratelimit:products",
  }),
  admin: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 req/min per user
    analytics: true,
    prefix: "ratelimit:admin",
  }),
} as const;

export type RateLimitType = keyof typeof limiters;

export async function checkRateLimit(
  identifier: string,
  type: RateLimitType
): Promise<{ success: boolean; response?: NextResponse }> {
  try {
    const { success, limit, remaining, reset } =
      await limiters[type].limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return {
        success: false,
        response: NextResponse.json(
          {
            error: {
              code: "RATE_LIMITED",
              message: "Too many requests. Please try again later.",
            },
          },
          {
            status: 429,
            headers: {
              "Retry-After": retryAfter.toString(),
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        ),
      };
    }

    return { success: true };
  } catch {
    // If Redis is unavailable, allow the request
    console.warn("Rate limiter unavailable, allowing request");
    return { success: true };
  }
}