import type Stripe from "stripe";
import { interpretEvent, type WebhookAction } from "@/lib/payments/events";

export interface WebhookDeps {
  /** Atomically record the event id. Returns true if newly claimed, false if it already existed (duplicate). */
  claimEvent(eventId: string, type: string): Promise<boolean>;
  /** Undo a claim so Stripe's retry can reprocess (used when apply throws). */
  releaseEvent(eventId: string): Promise<void>;
  apply(action: WebhookAction): Promise<void>;
}

export interface WebhookResult {
  processed: boolean;
  duplicate: boolean;
  ignored?: boolean;
}

/**
 * Idempotent webhook orchestrator. The event id is claimed atomically before
 * any work, so concurrent deliveries and Stripe retries can never double-apply.
 * If apply throws, the claim is released so the retry reprocesses cleanly.
 */
export async function handleStripeEvent(event: Stripe.Event, deps: WebhookDeps): Promise<WebhookResult> {
  const claimed = await deps.claimEvent(event.id, event.type);
  if (!claimed) return { processed: false, duplicate: true };

  const action = interpretEvent(event);
  if (!action) return { processed: true, duplicate: false, ignored: true };

  try {
    await deps.apply(action);
  } catch (e) {
    await deps.releaseEvent(event.id);
    throw e;
  }
  return { processed: true, duplicate: false };
}
