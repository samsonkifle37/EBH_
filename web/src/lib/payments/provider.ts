import { db } from "@/lib/db";
import type { Plan } from "@/lib/types";

export interface CheckoutResult {
  devMode: boolean;
  message: string;
}

/**
 * Stub checkout. With STRIPE_SECRET_KEY set this is where a real Stripe
 * Checkout Session would be created (price IDs per plan). Without a key we
 * apply the upgrade immediately so the full product flow can be exercised.
 */
export async function startCheckout(plan: Plan, businessId: string, userId: string): Promise<CheckoutResult> {
  const business = await db.business.findUnique({ where: { id: businessId } });
  if (!business || business.ownerId !== userId) {
    throw new Error("Business not found or not owned by you");
  }

  if (process.env.STRIPE_SECRET_KEY) {
    return {
      devMode: false,
      message: "Stripe is configured but checkout sessions need price IDs — see README to finish setup.",
    };
  }

  await db.business.update({
    where: { id: businessId },
    data: {
      plan,
      ...(plan === "VERIFIED" && business.verificationLevel < 3 ? { verificationLevel: 3 } : {}),
      ...(plan === "FEATURED" ? { featured: true, verificationLevel: Math.max(business.verificationLevel, 3) } : {}),
      ...(plan === "FREE" ? { featured: false } : {}),
    },
  });

  return {
    devMode: true,
    message: `Dev mode: ${plan === "FREE" ? "downgraded to Free" : `upgraded to ${plan}`} instantly (no payment taken). Add STRIPE_SECRET_KEY to enable real checkout.`,
  };
}
