import { describe, it, expect } from "vitest";
import { missingStripeEnv, devFallbackAllowed, assertStripeProductionConfig, REQUIRED_STRIPE_ENV } from "../config";

const full: Record<string, string> = Object.fromEntries(REQUIRED_STRIPE_ENV.map((k) => [k, "x"]));

describe("missingStripeEnv", () => {
  it("lists unset and blank vars", () => {
    expect(missingStripeEnv({})).toEqual([...REQUIRED_STRIPE_ENV]);
    expect(missingStripeEnv({ ...full, STRIPE_SECRET_KEY: "  " })).toEqual(["STRIPE_SECRET_KEY"]);
  });
  it("is empty when all present", () => {
    expect(missingStripeEnv(full)).toEqual([]);
  });
});

describe("devFallbackAllowed", () => {
  it("is false only in production", () => {
    expect(devFallbackAllowed({ NODE_ENV: "production" })).toBe(false);
    expect(devFallbackAllowed({ NODE_ENV: "development" })).toBe(true);
    expect(devFallbackAllowed({})).toBe(true);
  });
});

describe("assertStripeProductionConfig", () => {
  it("throws in production when any var is missing", () => {
    expect(() => assertStripeProductionConfig({ NODE_ENV: "production" })).toThrow(/missing required Stripe/);
  });
  it("passes in production when all vars are set", () => {
    expect(() => assertStripeProductionConfig({ ...full, NODE_ENV: "production" })).not.toThrow();
  });
  it("never throws outside production", () => {
    expect(() => assertStripeProductionConfig({ NODE_ENV: "development" })).not.toThrow();
  });
});
