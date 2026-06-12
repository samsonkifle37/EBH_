/** Feature the 6 highest-rated, most-reviewed real Google-sourced listings. */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const top = await db.business.findMany({
    where: { status: "APPROVED", sourceType: "google_places", googleRating: { gte: 4.5 } },
    orderBy: [{ googleReviewCount: "desc" }],
    take: 6,
    select: { id: true, name: true, city: true, googleRating: true, googleReviewCount: true },
  });
  for (const b of top) {
    await db.business.update({ where: { id: b.id }, data: { featured: true } });
  }
  console.log(JSON.stringify(top.map((b) => ({ name: b.name, city: b.city, rating: b.googleRating, reviews: b.googleReviewCount })), null, 1));
}

main().finally(() => db.$disconnect());
