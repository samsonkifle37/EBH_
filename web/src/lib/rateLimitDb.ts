import { db } from "@/lib/db";

/** Pure fixed-window decision — unit tested. */
export function evaluateWindow(
  count: number,
  windowStart: Date,
  now: number,
  limit: number,
  windowMs: number,
): { expired: boolean; blocked: boolean } {
  const expired = now - windowStart.getTime() >= windowMs;
  const blocked = !expired && count >= limit;
  return { expired, blocked };
}

/**
 * Durable, fixed-window rate limit backed by the DB (survives serverless cold
 * starts, unlike an in-memory map). Returns true when the request is allowed.
 * Fails OPEN on storage errors so the limiter can never lock everyone out.
 */
export async function rateLimitDb(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  try {
    const row = await db.rateLimit.findUnique({ where: { key } });
    if (!row) {
      await db.rateLimit.create({ data: { key, count: 1, windowStart: new Date(now) } });
      return true;
    }
    const { expired, blocked } = evaluateWindow(row.count, row.windowStart, now, limit, windowMs);
    if (expired) {
      await db.rateLimit.update({ where: { key }, data: { count: 1, windowStart: new Date(now) } });
      return true;
    }
    if (blocked) return false;
    await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
    return true;
  } catch {
    return true;
  }
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") ?? "";
  return xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
