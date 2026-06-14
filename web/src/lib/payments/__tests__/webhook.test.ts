import { describe, it, expect, vi } from "vitest";
import { handleStripeEvent } from "../webhook";
import type Stripe from "stripe";

function claimEventObj(id: string): Stripe.Event {
  return {
    id,
    type: "checkout.session.completed",
    data: { object: { metadata: { product: "CLAIM", claimId: "c1", userId: "u1", businessId: "b1" }, amount_total: 999, payment_intent: "pi_1" } },
  } as unknown as Stripe.Event;
}

function makeDeps() {
  const seen = new Set<string>();
  const apply = vi.fn(async () => {});
  return {
    apply,
    deps: {
      claimEvent: async (id: string) => (seen.has(id) ? false : (seen.add(id), true)),
      releaseEvent: async (id: string) => void seen.delete(id),
      apply,
    },
  };
}

describe("handleStripeEvent", () => {
  it("claims and applies a recognised event once", async () => {
    const { apply, deps } = makeDeps();
    const r = await handleStripeEvent(claimEventObj("evt_1"), deps);
    expect(r).toEqual({ processed: true, duplicate: false });
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith(expect.objectContaining({ type: "claim_paid", claimId: "c1" }));
  });

  it("is idempotent — the same event id never double-applies", async () => {
    const { apply, deps } = makeDeps();
    await handleStripeEvent(claimEventObj("evt_dup"), deps);
    const second = await handleStripeEvent(claimEventObj("evt_dup"), deps);
    expect(second).toEqual({ processed: false, duplicate: true });
    expect(apply).toHaveBeenCalledTimes(1);
  });

  it("releases the claim if apply throws so a retry can reprocess", async () => {
    const seen = new Set<string>();
    const apply = vi
      .fn<(...args: unknown[]) => Promise<void>>()
      .mockRejectedValueOnce(new Error("db down"))
      .mockResolvedValueOnce(undefined);
    const deps = {
      claimEvent: async (id: string) => (seen.has(id) ? false : (seen.add(id), true)),
      releaseEvent: async (id: string) => void seen.delete(id),
      apply,
    };
    await expect(handleStripeEvent(claimEventObj("evt_fail"), deps)).rejects.toThrow("db down");
    // claim released → the retry reprocesses and succeeds
    const retry = await handleStripeEvent(claimEventObj("evt_fail"), deps);
    expect(retry.duplicate).toBe(false);
    expect(apply).toHaveBeenCalledTimes(2);
  });

  it("marks unrecognised events processed (claimed) without applying", async () => {
    const { apply, deps } = makeDeps();
    const ignored = { id: "evt_x", type: "payment_intent.created", data: { object: {} } } as unknown as Stripe.Event;
    const r = await handleStripeEvent(ignored, deps);
    expect(r).toEqual({ processed: true, duplicate: false, ignored: true });
    expect(apply).not.toHaveBeenCalled();
  });
});
