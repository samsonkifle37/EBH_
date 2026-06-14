import { db } from "@/lib/db";
import type { WebhookAction } from "@/lib/payments/events";
import { grantClaimOwnership } from "@/lib/payments/grant";

/**
 * Prisma-backed applier — the production implementation of WebhookDeps.apply.
 * Each branch mutates exactly one domain area and records a Payment where money
 * moved. Kept separate from the orchestrator so the orchestrator stays testable.
 */
export async function applyWebhookAction(action: WebhookAction): Promise<void> {
  switch (action.type) {
    case "claim_paid":
      await grantClaimOwnership(action.claimId, action.amountPence);
      return;

    case "subscription_active": {
      const planType = action.product; // VERIFIED | FEATURED
      if (action.subscriptionRowId) {
        await db.subscription.update({
          where: { id: action.subscriptionRowId },
          data: {
            status: "active",
            paymentStatus: "paid",
            stripeSubscriptionId: action.stripeSubscriptionId,
            stripeCustomerId: action.stripeCustomerId,
            startDate: new Date(),
          },
        });
      }
      if (action.businessId) {
        await db.business.update({
          where: { id: action.businessId },
          data: { plan: planType, ...(planType === "FEATURED" ? { featured: true } : {}) },
        });
      }
      await db.payment.create({
        data: { kind: "subscription", businessId: action.businessId || null, userId: action.userId || null, amount: action.amountPence, status: "paid", planType },
      });
      return;
    }

    case "subscription_renewed": {
      const sub = await db.subscription.findFirst({ where: { stripeSubscriptionId: action.stripeSubscriptionId } });
      if (!sub) return;
      await db.subscription.update({
        where: { id: sub.id },
        data: { status: "active", paymentStatus: "paid", endDate: action.periodEnd ? new Date(action.periodEnd * 1000) : sub.endDate },
      });
      await db.payment.create({
        data: { kind: "subscription", businessId: sub.businessId, userId: sub.userId, amount: action.amountPence, status: "paid", planType: sub.planType },
      });
      return;
    }

    case "subscription_downgrade": {
      const sub = await db.subscription.findFirst({ where: { stripeSubscriptionId: action.stripeSubscriptionId } });
      if (!sub) return;
      await db.subscription.update({ where: { id: sub.id }, data: { status: "cancelled" } });
      if (sub.businessId) {
        await db.business.update({ where: { id: sub.businessId }, data: { plan: "FREE", featured: false } });
      }
      return;
    }

    case "payment_failed": {
      const sub = await db.subscription.findFirst({ where: { stripeSubscriptionId: action.stripeSubscriptionId } });
      if (!sub) return;
      await db.subscription.update({ where: { id: sub.id }, data: { status: "past_due", paymentStatus: "failed" } });
      return;
    }
  }
}
