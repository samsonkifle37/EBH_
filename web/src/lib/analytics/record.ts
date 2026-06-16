import { db } from "@/lib/db";
import { trustV2ForBusiness } from "@/lib/trust";
import { profileCompletion } from "@/lib/domain/profileCompletion";
import { dayKey } from "@/lib/domain/analytics";
import type { TrackableEvent } from "./events";

export interface RecordPrideInput {
  action: TrackableEvent;
  businessId?: string | null;
  visitorId: string;
  channel?: string;
  asset?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  /** Explicit idempotency key. If omitted, one is derived for high-volume events. */
  dedupeKey?: string | null;
}

function signatureCount(json: string): number {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((s) => s && (s.title || s.imageUrl)).length : 0;
  } catch {
    return 0;
  }
}

/**
 * Derive a dedupe key for naturally-repeating events so the stream stays clean
 * and PROFILE_VIEW counts as unique-per-visitor-per-day. Action-specific clicks
 * are left un-deduped (every tap is signal) unless the caller supplies a key.
 */
function autoDedupeKey(input: RecordPrideInput): string | null {
  if (input.dedupeKey) return input.dedupeKey;
  if (input.action === "PROFILE_VIEW" && input.businessId) {
    return `view:${input.visitorId}:${input.businessId}:${dayKey(new Date())}`;
  }
  if (input.action === "SHARE_QR_SCAN" && input.businessId) {
    return `qr:${input.visitorId}:${input.businessId}:${dayKey(new Date())}`;
  }
  return null;
}

/**
 * Canonical write path for the pride loop. Resolves business context
 * (owner/city/category/trust/completion) server-side so dashboards are pure
 * aggregation, applies idempotency, and NEVER throws — analytics must not break
 * a user flow. Returns true when a row was written.
 */
export async function recordPrideEvent(input: RecordPrideInput): Promise<boolean> {
  try {
    let ownerUserId: string | null = null;
    let city = "";
    let category = "";
    let trustScore = 0;
    let completionScore = 0;

    if (input.businessId) {
      const b = await db.business.findUnique({
        where: { id: input.businessId },
        include: {
          photos: { select: { id: true } },
          reviews: { select: { rating: true, status: true } },
          sources: { select: { sourceType: true } },
        },
      });
      if (!b) return false; // unknown business — ignore rather than store orphan
      ownerUserId = b.ownerId;
      city = b.city;
      category = b.category;
      trustScore = trustV2ForBusiness(b).score;
      completionScore = profileCompletion({
        coverImageUrl: b.coverImageUrl,
        founderPhotoUrl: b.founderPhotoUrl,
        founderStory: b.founderStory,
        brandStory: b.brandStory,
        signatureCount: signatureCount(b.signatureItems),
        phone: b.phone,
        website: b.website,
        hoursJson: b.openingHours,
        photoCount: b.photos.length,
      }).score;
    }

    const dedupeKey = autoDedupeKey(input);

    await db.prideEvent.create({
      data: {
        action: input.action,
        businessId: input.businessId ?? null,
        ownerUserId,
        visitorId: input.visitorId || "anon",
        channel: input.channel ?? "",
        asset: input.asset ?? "",
        city,
        category,
        trustScore,
        completionScore,
        referrer: (input.referrer ?? "").slice(0, 512),
        utmSource: (input.utmSource ?? "").slice(0, 128),
        utmMedium: (input.utmMedium ?? "").slice(0, 128),
        utmCampaign: (input.utmCampaign ?? "").slice(0, 128),
        dedupeKey,
      },
    });
    return true;
  } catch (e: unknown) {
    // P2002 = unique violation on dedupeKey → expected idempotent no-op.
    const code = (e as { code?: string })?.code;
    if (code === "P2002") return false;
    // Any other error is swallowed: tracking must never break the user flow.
    return false;
  }
}
