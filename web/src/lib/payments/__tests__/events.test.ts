import { describe, it, expect } from "vitest";
import { interpretEvent } from "../events";
import type Stripe from "stripe";

function ev(type: string, object: Record<string, unknown>): Stripe.Event {
  return { id: "evt_1", type, data: { object } } as unknown as Stripe.Event;
}

describe("interpretEvent", () => {
  it("maps a CLAIM checkout to claim_paid", () => {
    const a = interpretEvent(
      ev("checkout.session.completed", {
        metadata: { product: "CLAIM", claimId: "c1", userId: "u1", businessId: "b1" },
        amount_total: 999,
        payment_intent: "pi_1",
      })
    );
    expect(a).toEqual({ type: "claim_paid", claimId: "c1", userId: "u1", businessId: "b1", amountPence: 999, stripePaymentIntentId: "pi_1" });
  });

  it("maps a VERIFIED checkout to subscription_active", () => {
    const a = interpretEvent(
      ev("checkout.session.completed", {
        metadata: { product: "VERIFIED", businessId: "b1", userId: "u1", subscriptionRowId: "s1" },
        subscription: "sub_1",
        customer: "cus_1",
        amount_total: 299,
      })
    );
    expect(a).toEqual({
      type: "subscription_active",
      product: "VERIFIED",
      subscriptionRowId: "s1",
      businessId: "b1",
      userId: "u1",
      stripeSubscriptionId: "sub_1",
      stripeCustomerId: "cus_1",
      amountPence: 299,
    });
  });

  it("maps invoice.paid to subscription_renewed", () => {
    const a = interpretEvent(
      ev("invoice.paid", { subscription: "sub_1", amount_paid: 299, lines: { data: [{ period: { end: 1893456000 } }] } })
    );
    expect(a).toEqual({ type: "subscription_renewed", stripeSubscriptionId: "sub_1", amountPence: 299, periodEnd: 1893456000 });
  });

  it("maps customer.subscription.deleted to downgrade", () => {
    const a = interpretEvent(ev("customer.subscription.deleted", { id: "sub_1" }));
    expect(a).toEqual({ type: "subscription_downgrade", stripeSubscriptionId: "sub_1" });
  });

  it("maps invoice.payment_failed to payment_failed", () => {
    const a = interpretEvent(ev("invoice.payment_failed", { subscription: "sub_1" }));
    expect(a).toEqual({ type: "payment_failed", stripeSubscriptionId: "sub_1" });
  });

  it("ignores unrelated events and CLAIM-less sessions", () => {
    expect(interpretEvent(ev("payment_intent.created", {}))).toBeNull();
    expect(interpretEvent(ev("checkout.session.completed", { metadata: {} }))).toBeNull();
  });
});
