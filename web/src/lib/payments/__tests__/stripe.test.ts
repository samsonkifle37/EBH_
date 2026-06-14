import { describe, it, expect, afterEach } from "vitest";
import { PRODUCTS, priceId, isProductKey, stripeConfigured } from "../stripe";

afterEach(() => {
  delete process.env.STRIPE_PRICE_VERIFIED;
  delete process.env.STRIPE_SECRET_KEY;
});

describe("PRODUCTS", () => {
  it("defines the three milestone-B products with correct modes and amounts", () => {
    expect(PRODUCTS.VERIFIED.mode).toBe("subscription");
    expect(PRODUCTS.VERIFIED.amountPence).toBe(299);
    expect(PRODUCTS.FEATURED.mode).toBe("subscription");
    expect(PRODUCTS.FEATURED.amountPence).toBe(499);
    expect(PRODUCTS.CLAIM.mode).toBe("payment");
    expect(PRODUCTS.CLAIM.amountPence).toBe(999);
  });

  it("never hardcodes price ids — only env var names", () => {
    expect(PRODUCTS.VERIFIED.priceEnv).toBe("STRIPE_PRICE_VERIFIED");
    expect(PRODUCTS.FEATURED.priceEnv).toBe("STRIPE_PRICE_FEATURED");
    expect(PRODUCTS.CLAIM.priceEnv).toBe("STRIPE_PRICE_CLAIM");
  });
});

describe("priceId", () => {
  it("throws a descriptive error when the env var is missing", () => {
    expect(() => priceId(PRODUCTS.VERIFIED)).toThrow(/STRIPE_PRICE_VERIFIED/);
  });
  it("returns the env value when set", () => {
    process.env.STRIPE_PRICE_VERIFIED = "price_test_123";
    expect(priceId(PRODUCTS.VERIFIED)).toBe("price_test_123");
  });
});

describe("isProductKey / stripeConfigured", () => {
  it("validates product keys", () => {
    expect(isProductKey("VERIFIED")).toBe(true);
    expect(isProductKey("NOPE")).toBe(false);
  });
  it("reports configured only when the secret key exists", () => {
    expect(stripeConfigured()).toBe(false);
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    expect(stripeConfigured()).toBe(true);
  });
});
