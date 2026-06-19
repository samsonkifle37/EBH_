// Auth signing-secret config. No production fallback: a missing/weak AUTH_SECRET
// would let anyone forge session tokens, so we refuse to run with a default in
// production (asserted at boot via instrumentation.ts).

const DEV_FALLBACK = "dev-secret-ebh-change-in-production";

export function getAuthSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV !== "production") return DEV_FALLBACK;
  throw new Error("AUTH_SECRET is missing or too short (<16 chars) in production. Refusing to sign sessions with a default secret.");
}

/** Throws in production if AUTH_SECRET isn't set — call at server boot. */
export function assertAuthConfig(): void {
  getAuthSecret();
}
