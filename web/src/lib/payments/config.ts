export const REQUIRED_STRIPE_ENV = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_VERIFIED",
  "STRIPE_PRICE_FEATURED",
  "STRIPE_PRICE_CLAIM",
  "NEXT_PUBLIC_SITE_URL",
] as const;

type EnvLike = Record<string, string | undefined>;

export function isProduction(env: EnvLike = process.env): boolean {
  return env.NODE_ENV === "production";
}

/** Dev-mode fallbacks (instant upgrades/grants without Stripe) are only ever allowed outside production. */
export function devFallbackAllowed(env: EnvLike = process.env): boolean {
  return env.NODE_ENV !== "production";
}

/** Required Stripe env vars that are unset or blank. */
export function missingStripeEnv(env: EnvLike = process.env): string[] {
  return REQUIRED_STRIPE_ENV.filter((k) => !env[k] || env[k]!.trim() === "");
}

/** Fail fast: in production, every Stripe env var must be present. Throws otherwise. */
export function assertStripeProductionConfig(env: EnvLike = process.env): void {
  if (!isProduction(env)) return;
  const missing = missingStripeEnv(env);
  if (missing.length > 0) {
    throw new Error(
      `Refusing to start in production: missing required Stripe configuration: ${missing.join(", ")}. ` +
        `Set these in the environment so no dev-mode payment fallbacks can run.`
    );
  }
}
