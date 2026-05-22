import { Request, Response, NextFunction } from "express";

interface BucketEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, BucketEntry>();

function getKey(req: Request): string {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    ?? req.socket.remoteAddress
    ?? "unknown";
  return ip;
}

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}

setInterval(cleanup, 60_000);

export function createRateLimiter(opts: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = getKey(req);
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + opts.windowMs });
      next();
      return;
    }

    if (entry.count >= opts.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({
        error: opts.message ?? "Too many requests. Please wait and try again.",
        retryAfter,
      });
      return;
    }

    entry.count += 1;
    next();
  };
}

export const aiGenerationLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 30,
  message: "AI generation rate limit reached. Please wait a moment before generating again.",
});

export const strictLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 10,
  message: "Too many requests. Please slow down.",
});
