// Per-IP sliding-window rate limiter. In-memory; sufficient for a single
// instance. For multi-instance production, swap the `store` Map for a Redis
// or Upstash Redis implementation.

type Bucket = {
  // Timestamps of recent hits, in ms.
  hits: number[];
};

const buckets = new Map<string, Bucket>();

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function prune(bucket: Bucket, windowMs: number, now: number): void {
  const cutoff = now - windowMs;
  let i = 0;
  while (i < bucket.hits.length && bucket.hits[i] < cutoff) {
    i++;
  }
  if (i > 0) bucket.hits.splice(0, i);
}

export function rateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  prune(bucket, options.windowMs, now);
  if (bucket.hits.length >= options.max) {
    const oldest = bucket.hits[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, options.windowMs - (now - oldest)),
    };
  }
  bucket.hits.push(now);
  return {
    allowed: true,
    remaining: options.max - bucket.hits.length,
    resetMs: options.windowMs,
  };
}

// Periodic cleanup so the Map doesn't grow forever in long-running processes.
if (typeof setInterval !== "undefined") {
  const GC = setInterval(
    () => {
      const now = Date.now();
      for (const [key, bucket] of buckets.entries()) {
        prune(bucket, 60 * 60 * 1000, now);
        if (bucket.hits.length === 0) buckets.delete(key);
      }
    },
    5 * 60 * 1000,
  );
  // Don't keep the process alive just for the GC.
  if (typeof (GC as any).unref === "function") (GC as any).unref();
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "x-ratelimit-remaining": String(result.remaining),
    "x-ratelimit-reset": String(Math.ceil(result.resetMs / 1000)),
  };
}
