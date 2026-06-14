import type Stripe from "stripe";
import { isProductKey, type ProductKey } from "@/lib/payments/stripe";

export type WebhookAction =
  | { type: "claim_paid"; claimId: string; userId: string; businessId: string; amountPence: number; stripePaymentIntentId: string }
  | { type: "subscription_active"; product: ProductKey; subscriptionRowId: string; businessId: string; userId: string; stripeSubscriptionId: string; stripeCustomerId: string; amountPence: number }
  | { type: "subscription_renewed"; stripeSubscriptionId: string; amountPence: number; periodEnd: number | null }
  | { type: "subscription_downgrade"; stripeSubscriptionId: string }
  | { type: "payment_failed"; stripeSubscriptionId: string };

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Pure mapping from a Stripe event to the change EBH should make. Returns null
 * for anything we don't act on (so the webhook still marks it processed).
 */
export function interpretEvent(event: Stripe.Event): WebhookAction | null {
  const obj = event.data.object as unknown as Record<string, unknown>;

  switch (event.type) {
    case "checkout.session.completed": {
      const metadata = (obj.metadata as Record<string, string> | null) ?? {};
      const product = metadata.product;
      if (!product || !isProductKey(product)) return null;

      if (product === "CLAIM") {
        if (!metadata.claimId) return null;
        return {
          type: "claim_paid",
          claimId: metadata.claimId,
          userId: metadata.userId ?? "",
          businessId: metadata.businessId ?? "",
          amountPence: typeof obj.amount_total === "number" ? obj.amount_total : 0,
          stripePaymentIntentId: str(obj.payment_intent),
        };
      }
      // VERIFIED / FEATURED subscription
      return {
        type: "subscription_active",
        product,
        subscriptionRowId: metadata.subscriptionRowId ?? "",
        businessId: metadata.businessId ?? "",
        userId: metadata.userId ?? "",
        stripeSubscriptionId: str(obj.subscription),
        stripeCustomerId: str(obj.customer),
        amountPence: typeof obj.amount_total === "number" ? obj.amount_total : 0,
      };
    }

    case "invoice.paid": {
      const lines = obj.lines as { data?: { period?: { end?: number } }[] } | undefined;
      const periodEnd = lines?.data?.[0]?.period?.end ?? null;
      return {
        type: "subscription_renewed",
        stripeSubscriptionId: str(obj.subscription),
        amountPence: typeof obj.amount_paid === "number" ? obj.amount_paid : 0,
        periodEnd,
      };
    }

    case "customer.subscription.deleted":
      return { type: "subscription_downgrade", stripeSubscriptionId: str(obj.id) };

    case "invoice.payment_failed":
      return { type: "payment_failed", stripeSubscriptionId: str(obj.subscription) };

    default:
      return null;
  }
}
