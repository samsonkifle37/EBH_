import { db } from "@/lib/db";
import { slugify } from "@/lib/domain/slug";
import { findDuplicate, type MatchCandidate } from "@/lib/domain/match";
import { trustScoreForBusiness } from "@/lib/domain/trust";
import { mapPlaceToBusiness, mapCompanyToBusiness, mapOsmElement } from "@/lib/domain/importMap";
import { searchPlaces, photoProxyUrl } from "@/lib/import/googlePlaces";
import { searchCompanies } from "@/lib/import/companiesHouse";
import { fetchOverpass } from "@/lib/import/openStreetMap";

export type ImportType = "google_places" | "companies_house" | "openstreetmap";

export interface ImportResult {
  jobId: string;
  status: "completed" | "failed";
  found: number;
  imported: number;
  duplicates: number;
  skipped: number;
  errors: string;
}

async function loadCandidates(): Promise<MatchCandidate[]> {
  const rows = await db.business.findMany({
    select: {
      id: true,
      name: true,
      postcode: true,
      phone: true,
      website: true,
      companyNumber: true,
      lat: true,
      lng: true,
      sourceType: true,
      sourceId: true,
      sources: { select: { sourceType: true, sourceId: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    postcode: r.postcode,
    phone: r.phone,
    website: r.website,
    companyNumber: r.companyNumber,
    lat: r.lat,
    lng: r.lng,
    googlePlaceId:
      r.sources.find((s) => s.sourceType === "google_places")?.sourceId ??
      (r.sourceType === "google_places" ? r.sourceId : ""),
  }));
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "business";
  let slug = base;
  for (let i = 2; ; i++) {
    const exists = await db.business.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
    slug = `${base}-${i}`;
  }
}

/**
 * Hard monthly budget for Google searches so usage stays far inside the
 * free tier (1,000 Enterprise text searches/month). Each import run = 1 search.
 */
async function assertGoogleBudget(): Promise<void> {
  const cap = parseInt(process.env.GOOGLE_IMPORT_MONTHLY_CAP ?? "50", 10);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const used = await db.importJob.count({
    where: { type: "google_places", startedAt: { gte: monthStart }, errors: { not: { contains: "monthly Google import cap" } } },
  });
  if (used >= cap) {
    throw new Error(
      `Stopped: monthly Google import cap reached (${used}/${cap} searches this month). ` +
        `This cap keeps usage far below Google's 1,000 free searches/month so nothing can be charged. ` +
        `Raise GOOGLE_IMPORT_MONTHLY_CAP in web/.env if you need more.`
    );
  }
}

export async function runImport(type: ImportType, query: string): Promise<ImportResult> {
  if (type === "google_places") {
    try {
      await assertGoogleBudget();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const blocked = await db.importJob.create({
        data: { type, query, status: "failed", errors: message, finishedAt: new Date() },
      });
      return { jobId: blocked.id, status: "failed", found: 0, imported: 0, duplicates: 0, skipped: 0, errors: message };
    }
  }
  const job = await db.importJob.create({ data: { type, query } });
  const startedAt = Date.now();
  let found = 0;
  let imported = 0;
  let duplicates = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    const existing = await loadCandidates();

    if (type === "google_places") {
      const places = await searchPlaces(query);
      found = places.length;
      for (const place of places) {
        const m = mapPlaceToBusiness(place, query);
        if (!m.name || !m.placeId) { skipped++; continue; }
        if (m.businessStatus && m.businessStatus !== "OPERATIONAL") { skipped++; continue; }
        const dup = findDuplicate(
          { id: "", name: m.name, postcode: m.postcode, phone: m.phone, website: m.website, googlePlaceId: m.placeId, companyNumber: "" },
          existing
        );
        if (dup) {
          duplicates++;
          // refresh real Google data on the matched listing
          await db.business.update({
            where: { id: dup.match.id },
            data: {
              googleRating: m.googleRating,
              googleReviewCount: m.googleReviewCount,
              mapsUrl: m.mapsUrl,
              lastSourceCheckedAt: new Date(),
            },
          });
          await db.businessSource.upsert({
            where: { sourceType_sourceId: { sourceType: "google_places", sourceId: m.placeId } },
            update: { rawData: JSON.stringify(place), fetchedAt: new Date() },
            create: { businessId: dup.match.id, sourceType: "google_places", sourceId: m.placeId, sourceUrl: m.mapsUrl, rawData: JSON.stringify(place) },
          });
          continue;
        }
        const confidence = trustScoreForBusiness({
          phone: m.phone,
          website: m.website,
          companyNumber: "",
          ownerId: null,
          photoCount: m.photoNames.length,
          hasGoogleSource: true,
        });
        const created = await db.business.create({
          data: {
            name: m.name,
            slug: await uniqueSlug(m.name),
            category: m.category,
            city: m.city || "london",
            address: m.address,
            postcode: m.postcode,
            lat: m.lat,
            lng: m.lng,
            phone: m.phone,
            website: m.website,
            openingHours: m.openingHours,
            status: "PENDING",
            sourceType: "google_places",
            sourceId: m.placeId,
            sourceUrl: m.mapsUrl,
            mapsUrl: m.mapsUrl,
            googleRating: m.googleRating,
            googleReviewCount: m.googleReviewCount,
            lastSourceCheckedAt: new Date(),
            dataConfidenceScore: confidence,
            photos: {
              create: m.photoNames.slice(0, 3).map((n, i) => ({ url: photoProxyUrl(n), alt: m.name, sortOrder: i })),
            },
            sources: {
              create: [{ sourceType: "google_places", sourceId: m.placeId, sourceUrl: m.mapsUrl, rawData: JSON.stringify(place) }],
            },
          },
        });
        existing.push({ id: created.id, name: m.name, postcode: m.postcode, phone: m.phone, website: m.website, googlePlaceId: m.placeId, companyNumber: "", lat: m.lat, lng: m.lng });
        imported++;
      }
    } else if (type === "companies_house") {
      const companies = await searchCompanies(query);
      found = companies.length;
      for (const item of companies) {
        const c = mapCompanyToBusiness(item);
        if (!c.name || !c.companyNumber) { skipped++; continue; }
        if (c.companyStatus && c.companyStatus !== "active") { skipped++; continue; }
        const dup = findDuplicate(
          { id: "", name: c.name, postcode: c.postcode, phone: "", website: "", googlePlaceId: "", companyNumber: c.companyNumber },
          existing
        );
        if (dup) {
          duplicates++;
          // corroborate the matched listing with official company data
          await db.business.update({
            where: { id: dup.match.id },
            data: { companyNumber: c.companyNumber, lastSourceCheckedAt: new Date() },
          });
          const matched = await db.business.findUniqueOrThrow({
            where: { id: dup.match.id },
            include: { photos: { select: { id: true } }, sources: { select: { sourceType: true } } },
          });
          await db.business.update({
            where: { id: matched.id },
            data: {
              dataConfidenceScore: trustScoreForBusiness({
                phone: matched.phone,
                website: matched.website,
                companyNumber: c.companyNumber,
                ownerId: matched.ownerId,
                photoCount: matched.photos.length,
                hasGoogleSource: matched.sources.some((s) => s.sourceType === "google_places"),
              }),
            },
          });
          await db.businessSource.upsert({
            where: { sourceType_sourceId: { sourceType: "companies_house", sourceId: c.companyNumber } },
            update: { rawData: JSON.stringify(item), fetchedAt: new Date() },
            create: { businessId: dup.match.id, sourceType: "companies_house", sourceId: c.companyNumber, sourceUrl: c.sourceUrl, rawData: JSON.stringify(item) },
          });
          continue;
        }
        // CH-only records import as PENDING and never auto-publish
        const created = await db.business.create({
          data: {
            name: c.name,
            slug: await uniqueSlug(c.name),
            category: "community-organizations",
            city: c.city || "london",
            address: c.address,
            postcode: c.postcode,
            status: "PENDING",
            sourceType: "companies_house",
            sourceId: c.companyNumber,
            sourceUrl: c.sourceUrl,
            companyNumber: c.companyNumber,
            lastSourceCheckedAt: new Date(),
            dataConfidenceScore: trustScoreForBusiness({
              phone: "",
              website: "",
              companyNumber: c.companyNumber,
              ownerId: null,
              photoCount: 0,
              hasGoogleSource: false,
            }),
            sources: {
              create: [{ sourceType: "companies_house", sourceId: c.companyNumber, sourceUrl: c.sourceUrl, rawData: JSON.stringify(item) }],
            },
          },
        });
        existing.push({ id: created.id, name: c.name, postcode: c.postcode, phone: "", website: "", googlePlaceId: "", companyNumber: c.companyNumber });
        imported++;
      }
    } else {
      // OpenStreetMap (Overpass) — single fixed query, no key, ODbL.
      const elements = await fetchOverpass();
      found = elements.length;
      for (const el of elements) {
        const m = mapOsmElement(el);
        if (!m) { skipped++; continue; }
        const dup = findDuplicate(
          { id: "", name: m.name, postcode: m.postcode, phone: m.phone, website: m.website, googlePlaceId: "", companyNumber: "", lat: m.lat, lng: m.lng },
          existing
        );
        if (dup) {
          duplicates++;
          // attach OSM evidence and recompute confidence on the matched listing
          const matched = await db.business.findUniqueOrThrow({
            where: { id: dup.match.id },
            include: { photos: { select: { id: true } }, sources: { select: { sourceType: true } } },
          });
          await db.business.update({
            where: { id: matched.id },
            data: {
              lastSourceCheckedAt: new Date(),
              dataConfidenceScore: trustScoreForBusiness({
                phone: matched.phone,
                website: matched.website,
                companyNumber: matched.companyNumber,
                ownerId: matched.ownerId,
                photoCount: matched.photos.length,
                hasGoogleSource: matched.sources.some((s) => s.sourceType === "google_places"),
                hasOsmSource: true,
                hasManualLead: matched.sources.some((s) => s.sourceType !== "google_places" && s.sourceType !== "companies_house" && s.sourceType !== "openstreetmap"),
              }),
            },
          });
          await db.businessSource.upsert({
            where: { sourceType_sourceId: { sourceType: "openstreetmap", sourceId: m.sourceId } },
            update: { rawData: JSON.stringify(el), fetchedAt: new Date() },
            create: { businessId: dup.match.id, sourceType: "openstreetmap", sourceId: m.sourceId, sourceUrl: m.sourceUrl, rawData: JSON.stringify(el) },
          });
          continue;
        }
        const created = await db.business.create({
          data: {
            name: m.name,
            slug: await uniqueSlug(m.name),
            category: m.category,
            city: m.city || "london",
            address: m.address,
            postcode: m.postcode,
            lat: m.lat,
            lng: m.lng,
            phone: m.phone,
            website: m.website,
            status: "PENDING",
            sourceType: "openstreetmap",
            sourceId: m.sourceId,
            sourceUrl: m.sourceUrl,
            lastSourceCheckedAt: new Date(),
            dataConfidenceScore: trustScoreForBusiness({
              phone: m.phone,
              website: m.website,
              companyNumber: "",
              ownerId: null,
              photoCount: 0,
              hasGoogleSource: false,
              hasOsmSource: true,
            }),
            sources: {
              create: [{ sourceType: "openstreetmap", sourceId: m.sourceId, sourceUrl: m.sourceUrl, rawData: JSON.stringify(el) }],
            },
          },
        });
        existing.push({ id: created.id, name: m.name, postcode: m.postcode, phone: m.phone, website: m.website, googlePlaceId: "", companyNumber: "", lat: m.lat, lng: m.lng });
        imported++;
      }
    }

    const durationMs = Date.now() - startedAt;
    const result = await db.importJob.update({
      where: { id: job.id },
      data: { status: "completed", found, imported, duplicates, skipped, durationMs, errors: errors.join("; "), finishedAt: new Date() },
    });
    return { jobId: result.id, status: "completed", found, imported, duplicates, skipped, errors: result.errors };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await db.importJob.update({
      where: { id: job.id },
      data: { status: "failed", found, imported, duplicates, skipped, durationMs: Date.now() - startedAt, errors: message, finishedAt: new Date() },
    });
    return { jobId: job.id, status: "failed", found, imported, duplicates, skipped, errors: message };
  }
}
