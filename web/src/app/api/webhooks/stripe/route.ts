import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe, webhookSecret, stripeConfigured } from "@/lib/payments/stripe";
import { handleStripeEvent, type WebhookDeps } from "@/lib/payments/webhook";
import { applyWebhookAction } from "@/lib/payments/applier";

export const runtime = "nodejs"; // raw body needed for signature verification

const deps: WebhookDeps = {
  async claimEvent(id, type) {
    try {
      await db.processedStripeEvent.create({ data: { id, type } });
      return true;
    } catch {
      return false; // unique-PK violation → already processed
    }
  },
  async releaseEvent(id) {
    await db.processedStripeEvent.delete({ where: { id } }).catch(() => {});
  },
  apply: applyWebhookAction,
};

export async function POST(req: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }
  const secret = webhookSecret();
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const raw = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    return NextResponse.json({ error: `Signature verification failed: ${e instanceof Error ? e.message : "unknown"}` }, { status: 400 });
  }

  try {
    const result = await handleStripeEvent(event, deps);
    return NextResponse.json({ received: true, ...result });
  } catch (e) {
    // 500 so Stripe retries (the claim was released inside handleStripeEvent)
    return NextResponse.json({ error: e instanceof Error ? e.message : "Handler failed" }, { status: 500 });
  }
}
