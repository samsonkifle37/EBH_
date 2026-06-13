/**
 * Re-evaluate every pending OpenStreetMap listing through the auto-approval
 * gate. Recovers image/email from the stored OSM rawData (the first import ran
 * before image/email parsing existed), creates a photo when an image exists,
 * and sets status / verification / review-bucket fields accordingly.
 *
 * Run: npx tsx scripts/backfill-osm-autoapprove.ts
 */
import { PrismaClient } from "@prisma/client";
import { mapOsmElement, type OsmElement } from "../src/lib/domain/importMap";
import { evaluateListing, isPlaceholderImage } from "../src/lib/domain/autoApproval";

const db = new PrismaClient();

async function main() {
  const listings = await db.business.findMany({
    where: { sourceType: "openstreetmap", status: "PENDING" },
    include: { photos: { select: { id: true, url: true } }, sources: { where: { sourceType: "openstreetmap" }, select: { rawData: true } } },
  });

  let approved = 0;
  let pendingContact = 0;
  let pendingThreshold = 0;
  let pendingName = 0;
  let needsImage = 0;
  let imagesAdded = 0;
  let emailsAdded = 0;

  for (const b of listings) {
    // recover image/email from the raw OSM element
    let osmImage = "";
    let osmEmail = "";
    const raw = b.sources[0]?.rawData;
    if (raw) {
      try {
        const m = mapOsmElement(JSON.parse(raw) as OsmElement);
        if (m) {
          osmImage = m.imageUrl;
          osmEmail = m.email;
        }
      } catch {
        /* ignore malformed rawData */
      }
    }

    const existingImage = b.photos.find((p) => p.url && !isPlaceholderImage(p.url));
    const hasImage = !!existingImage || (!!osmImage && !isPlaceholderImage(osmImage));
    const email = b.email || osmEmail;

    // create a photo from the OSM image tag if we have one and none exists yet
    if (!existingImage && osmImage && !isPlaceholderImage(osmImage)) {
      await db.businessPhoto.create({ data: { businessId: b.id, url: osmImage, alt: b.name, sortOrder: 0 } });
      imagesAdded++;
    }
    if (!b.email && osmEmail) emailsAdded++;

    const verdict = evaluateListing({
      name: b.name,
      hasImage,
      phone: b.phone,
      website: b.website,
      email,
      hasOsm: true,
      hasGoogle: false,
      hasCompaniesHouse: false,
    });

    await db.business.update({
      where: { id: b.id },
      data: {
        email,
        status: verdict.status,
        verificationStatus: verdict.verificationStatus,
        approvedBy: verdict.approvedBy,
        approvalReason: verdict.approvalReason,
        reviewBucket: verdict.reviewBucket,
      },
    });

    if (verdict.status === "APPROVED") approved++;
    else if (verdict.reviewBucket === "needs_enrichment") needsImage++;
    else if (verdict.approvalReason === "Missing contact information") pendingContact++;
    else if (verdict.approvalReason === "Name needs review") pendingName++;
    else pendingThreshold++;
  }

  console.log(JSON.stringify({
    evaluated: listings.length,
    autoApproved: approved,
    pendingReview: { missingContact: pendingContact, belowThreshold: pendingThreshold, nameNeedsReview: pendingName },
    needsImageQueue: needsImage,
    imagesAddedFromOsmTag: imagesAdded,
    emailsRecovered: emailsAdded,
  }, null, 1));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
