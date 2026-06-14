import { db } from "@/lib/db";

/** Format pence as GBP. */
export function gbp(pence: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

export interface RevenueSnapshot {
  mrrPence: number;
  arrPence: number;
  verifiedSubscribers: number;
  featuredSubscribers: number;
  aiSubscribers: number;
  claimRevenuePence: number;
  eventRevenuePence: number;
  adRevenuePence: number;
  aiRevenuePence: number;
  subscriptionRevenuePence: number;
  totalRevenuePence: number;
}

/** All numbers come straight from the DB; with no billing yet everything is 0. */
export async function getRevenueSnapshot(): Promise<RevenueSnapshot> {
  const [activeSubs, verifiedSubscribers, featuredSubscribers, aiSubscribers, paid] = await Promise.all([
    db.subscription.findMany({ where: { status: "active" }, select: { amount: true } }),
    db.subscription.count({ where: { status: "active", planType: "VERIFIED" } }),
    db.subscription.count({ where: { status: "active", planType: "FEATURED" } }),
    db.subscription.count({ where: { status: "active", planType: "AI_TOOLKIT" } }),
    db.payment.findMany({ where: { paymentStatus: "paid" }, select: { kind: true, amount: true } }),
  ]);

  const mrrPence = activeSubs.reduce((a, s) => a + s.amount, 0);
  const sumKind = (kind: string) => paid.filter((p) => p.kind === kind).reduce((a, p) => a + p.amount, 0);

  const subscriptionRevenuePence = sumKind("subscription");
  const claimRevenuePence = sumKind("claim");
  const eventRevenuePence = sumKind("event_promotion");
  const adRevenuePence = sumKind("ad");
  const aiRevenuePence = sumKind("ai_toolkit");
  const totalRevenuePence = paid.reduce((a, p) => a + p.amount, 0);

  return {
    mrrPence,
    arrPence: mrrPence * 12,
    verifiedSubscribers,
    featuredSubscribers,
    aiSubscribers,
    claimRevenuePence,
    eventRevenuePence,
    adRevenuePence,
    aiRevenuePence,
    subscriptionRevenuePence,
    totalRevenuePence,
  };
}
