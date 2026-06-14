import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { PRODUCTS, isProductKey, stripeConfigured, getStripe, priceId, siteUrl, type ProductKey } from "@/lib/payments/stripe";
import { grantClaimOwnership } from "@/lib/payments/grant";

const schema = z.object({
  product: z.string(),
  businessId: z.string().optional(),
  claimId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || !isProductKey(parsed.data.product)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }
  const product = PRODUCTS[parsed.data.product as ProductKey];

  // ---- resolve + authorise the target ----
  let businessId = parsed.data.businessId ?? "";
  let claimId = parsed.data.claimId ?? "";

  if (product.key === "CLAIM") {
    if (!claimId) return NextResponse.json({ error: "claimId required" }, { status: 400 });
    const claim = await db.claimRequest.findUnique({ where: { id: claimId }, select: { id: true, userId: true, status: true, paymentStatus: true, businessId: true } });
    if (!claim || claim.userId !== session.userId) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    if (claim.status !== "approved") return NextResponse.json({ error: "Claim must be approved before payment" }, { status: 409 });
    if (claim.paymentStatus === "paid") return NextResponse.json({ error: "This claim is already paid" }, { status: 409 });
    businessId = claim.businessId;
  } else {
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
    const business = await db.business.findUnique({ where: { id: businessId }, select: { ownerId: true } });
    if (!business || business.ownerId !== session.userId) {
      return NextResponse.json({ error: "Business not found or not owned by you" }, { status: 403 });
    }
  }

  // ---- dev-mode fallback (no Stripe key): apply immediately ----
  if (!stripeConfigured()) {
    if (product.key === "CLAIM") {
      await grantClaimOwnership(claimId, product.amountPence);
      return NextResponse.json({ devMode: true, message: "Dev mode: ownership granted instantly (no payment taken)." });
    }
    await db.business.update({
      where: { id: businessId },
      data: { plan: product.planType!, ...(product.key === "FEATURED" ? { featured: true } : {}) },
    });
    return NextResponse.json({ devMode: true, message: `Dev mode: upgraded to ${product.label} instantly. Add STRIPE_SECRET_KEY for real checkout.` });
  }

  // ---- real Stripe Checkout ----
  const stripe = getStripe();
  const metadata: Record<string, string> = { product: product.key, userId: session.userId, businessId };

  // pre-create a pending Subscription row so the webhook can flip it to active
  if (product.mode === "subscription") {
    const sub = await db.subscription.create({
      data: { businessId, userId: session.userId, planType: product.planType!, amount: product.amountPence, status: "pending", paymentStatus: "pending" },
    });
    metadata.subscriptionRowId = sub.id;
  }
  if (product.key === "CLAIM") metadata.claimId = claimId;

  const checkout = await stripe.checkout.sessions.create({
    mode: product.mode,
    line_items: [{ price: priceId(product), quantity: 1 }],
    metadata,
    ...(product.mode === "subscription" ? { subscription_data: { metadata } } : {}),
    success_url: `${siteUrl()}/owner?checkout=success`,
    cancel_url: `${siteUrl()}/owner?checkout=cancelled`,
  });

  return NextResponse.json({ url: checkout.url });
}
