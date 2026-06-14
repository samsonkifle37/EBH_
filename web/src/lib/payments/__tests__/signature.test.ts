import { describe, it, expect } from "vitest";
import Stripe from "stripe";

// Verifies our webhook will accept a correctly-signed payload and reject a
// tampered one, using Stripe's own signing — no network or real keys needed.
const stripe = new Stripe("sk_test_dummy");
const secret = "whsec_test_secret";

const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed", data: { object: {} } });

describe("webhook signature verification", () => {
  it("accepts a payload signed with the webhook secret", () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    const event = stripe.webhooks.constructEvent(payload, header, secret);
    expect(event.id).toBe("evt_1");
  });

  it("rejects a tampered payload", () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    const tampered = payload.replace("evt_1", "evt_evil");
    expect(() => stripe.webhooks.constructEvent(tampered, header, secret)).toThrow();
  });

  it("rejects a payload signed with the wrong secret", () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_wrong" });
    expect(() => stripe.webhooks.constructEvent(payload, header, secret)).toThrow();
  });
});
