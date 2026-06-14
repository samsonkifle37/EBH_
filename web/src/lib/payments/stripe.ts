import Stripe from "stripe";

export type ProductKey = "VERIFIED" | "FEATURED" | "CLAIM";
export type CheckoutMode = "subscription" | "payment";

export interface ProductConfig {
  key: ProductKey;
  label: string;
  mode: CheckoutMode;
  amountPence: number;
  priceEnv: string; // env var holding the Stripe price id
  /** Subscription plan written to business.plan / Subscription.planType. */
  planType?: "VERIFIED" | "FEATURED";
  /** Payment.kind for one-time products. */
  paymentKind?: string;
}

export const PRODUCTS: Record<ProductKey, ProductConfig> = {
  VERIFIED: { key: "VERIFIED", label: "Verified Business", mode: "subscription", amountPence: 299, priceEnv: "STRIPE_PRICE_VERIFIED", planType: "VERIFIED" },
  FEATURED: { key: "FEATURED", label: "Featured Listing", mode: "subscription", amountPence: 499, priceEnv: "STRIPE_PRICE_FEATURED", planType: "FEATURED" },
  CLAIM: { key: "CLAIM", label: "Business Claim", mode: "payment", amountPence: 999, priceEnv: "STRIPE_PRICE_CLAIM", paymentKind: "claim" },
};

export function isProductKey(v: string): v is ProductKey {
  return v === "VERIFIED" || v === "FEATURED" || v === "CLAIM";
}

/** True when a real Stripe secret key is present (otherwise the app runs dev-mode). */
export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function webhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}

/** Resolve the Stripe price id for a product from env; throws if unset. */
export function priceId(product: ProductConfig): string {
  const id = process.env[product.priceEnv];
  if (!id) {
    throw new Error(`Missing ${product.priceEnv} — set the Stripe price id for ${product.label} in web/.env`);
  }
  return id;
}

let client: Stripe | null = null;

/** Singleton Stripe SDK. Throws if STRIPE_SECRET_KEY is not configured. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!client) client = new Stripe(key);
  return client;
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
