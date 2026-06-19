/** Runs once at server startup (Next.js instrumentation). */
export async function register() {
  // Skip during the build phase — this guards runtime server boot, not the
  // build, so a missing Stripe var can never fail `next build`.
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PHASE !== "phase-production-build") {
    const { assertStripeProductionConfig } = await import("@/lib/payments/config");
    // Fail fast: production must not boot without full Stripe config, otherwise
    // the dev-mode payment fallbacks could grant benefits without Stripe.
    assertStripeProductionConfig();
    // Fail fast: production must not run with a default session signing secret.
    const { assertAuthConfig } = await import("@/lib/authConfig");
    assertAuthConfig();
  }
}
