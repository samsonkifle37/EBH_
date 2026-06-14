/** Runs once at server startup (Next.js instrumentation). */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertStripeProductionConfig } = await import("@/lib/payments/config");
    // Fail fast: production must not boot without full Stripe config, otherwise
    // the dev-mode payment fallbacks could grant benefits without Stripe.
    assertStripeProductionConfig();
  }
}
