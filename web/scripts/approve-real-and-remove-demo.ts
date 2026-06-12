/**
 * One-off migration: approve imported real-source listings and permanently
 * remove all seeded demo/placeholder data.
 * Run: npx tsx scripts/approve-real-and-remove-demo.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const before = {
    businesses: await db.business.count(),
    pendingReal: await db.business.count({
      where: { status: "PENDING", sourceType: { in: ["google_places", "companies_house"] } },
    }),
    demoBusinesses: await db.business.count({ where: { sourceType: "demo" } }),
    demoEvents: await db.event.count({ where: { sourceType: "demo" } }),
    fakeReviews: await db.review.count(),
    ads: await db.ad.count(),
    fakeUsers: await db.user.count({ where: { email: { endsWith: "@example.com" } } }),
  };
  console.log("BEFORE:", JSON.stringify(before));

  // 1. Approve all pending listings from real, verifiable sources
  const approved = await db.business.updateMany({
    where: { status: "PENDING", sourceType: { in: ["google_places", "companies_house"] } },
    data: { status: "APPROVED" },
  });

  // 2. Delete demo businesses (cascades photos, reviews, favorites, follows,
  //    claim requests, analytics events, source rows)
  const demoBiz = await db.business.deleteMany({ where: { sourceType: "demo" } });

  // 3. Delete demo events (cascades sources + analytics)
  const demoEvents = await db.event.deleteMany({ where: { sourceType: "demo" } });

  // 4. Delete placeholder ads
  const ads = await db.ad.deleteMany({});

  // 5. Delete fake reviewer accounts (their reviews lived on demo businesses)
  const fakeUsers = await db.user.deleteMany({ where: { email: { endsWith: "@example.com" } } });

  const after = {
    businesses: await db.business.count(),
    approved: await db.business.count({ where: { status: "APPROVED" } }),
    pending: await db.business.count({ where: { status: "PENDING" } }),
    events: await db.event.count(),
    reviews: await db.review.count(),
    ads: await db.ad.count(),
    users: await db.user.count(),
    demoLeft: await db.business.count({ where: { sourceType: "demo" } }),
  };

  console.log("ACTIONS:", JSON.stringify({
    approvedListings: approved.count,
    deletedDemoBusinesses: demoBiz.count,
    deletedDemoEvents: demoEvents.count,
    deletedAds: ads.count,
    deletedFakeUsers: fakeUsers.count,
  }));
  console.log("AFTER:", JSON.stringify(after));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
