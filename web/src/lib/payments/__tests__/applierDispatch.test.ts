import { describe, it, expect, vi } from "vitest";
import { handleStripeEvent, type WebhookDeps } from "../webhook";
import type { WebhookAction } from "../events";
import type Stripe from "stripe";

// Proves each Stripe event reaches apply() as the correct action — i.e. the
// right downstream mutation would run — without touching a DB.
function ev(type: string, object: Record<string, unknown>, id = "e"): Stripe.Event {
  return { id, type, data: { object } } as unknown as Stripe.Event;
}

async function dispatch(event: Stripe.Event): Promise<WebhookAction | null> {
  let captured: WebhookAction | null = null;
  const deps: WebhookDeps = {
    claimEvent: vi.fn(async () => true),
    releaseEvent: vi.fn(async () => {}),
    apply: vi.fn(async (a: WebhookAction) => { captured = a; }),
  };
  await handleStripeEvent(event, deps);
  return captured;
}

describe("applier dispatch", () => {
  it("claim checkout → claim_paid", async () => {
    const a = await dispatch(ev("checkout.session.completed", { metadata: { product: "CLAIM", claimId: "c1", userId: "u1", businessId: "b1" }, amount_total: 999, payment_intent: "pi_1" }, "e1"));
    expect(a?.type).toBe("claim_paid");
  });
  it("verified checkout → subscription_active", async () => {
    const a = await dispatch(ev("checkout.session.completed", { metadata: { product: "VERIFIED", businessId: "b1", userId: "u1", subscriptionRowId: "s1" }, subscription: "sub_1", customer: "cus_1", amount_total: 299 }, "e2"));
    expect(a?.type).toBe("subscription_active");
  });
  it("invoice.paid → subscription_renewed", async () => {
    const a = await dispatch(ev("invoice.paid", { subscription: "sub_1", amount_paid: 299, lines: { data: [{ period: { end: 100 } }] } }, "e3"));
    expect(a?.type).toBe("subscription_renewed");
  });
  it("subscription deleted → subscription_downgrade", async () => {
    const a = await dispatch(ev("customer.subscription.deleted", { id: "sub_1" }, "e4"));
    expect(a?.type).toBe("subscription_downgrade");
  });
  it("payment failed → payment_failed", async () => {
    const a = await dispatch(ev("invoice.payment_failed", { subscription: "sub_1" }, "e5"));
    expect(a?.type).toBe("payment_failed");
  });
});
