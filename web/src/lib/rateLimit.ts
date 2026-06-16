// Best-effort in-memory rate limiter. Note: serverless instances are ephemeral
// and not shared, so this caps abuse per warm instance rather than globally — a
// pragmatic first line of defence. Pair with a durable store later if needed.

const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    hits.set(key, arr);
    return false; // blocked
  }
  arr.push(now);
  hits.set(key, arr);
  return true; // allowed
}

/** Derive a client key from forwarded headers (best-effort). */
export function clientKey(req: Request, prefix: string): string {
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `${prefix}:${ip}`;
}
