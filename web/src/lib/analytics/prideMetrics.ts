import { db } from "@/lib/db";
import { trustV2ForBusiness } from "@/lib/trust";
import { profileCompletion } from "@/lib/domain/profileCompletion";
import {
  SHARE_DISTRIBUTION_ACTIONS,
  isShareChannel,
  type PrideEventType,
} from "./events";
import { shareRate, median, average, rankChannels, type ChannelCount } from "./shareMetrics";

const DIST = SHARE_DISTRIBUTION_ACTIONS as readonly string[];
const CONTACT_ACTIONS = new Set<string>(["CONTACT_CLICK", "WEBSITE_CLICK", "DIRECTIONS_CLICK"]);
const MIN_SEGMENT = 3; // hide share-rate for segments too small to be meaningful

function signatureCount(json: string): number {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((s) => s && (s.title || s.imageUrl)).length : 0;
  } catch {
    return 0;
  }
}

// ---- North-Star -----------------------------------------------------------

export interface PlatformPride {
  claimedTotal: number;
  claimedWithShare: number;
  shareRate: number; // %
}

/** Platform Share Rate: claimed businesses with >=1 distribution share. */
export async function getPlatformPride(): Promise<PlatformPride> {
  const [claimedTotal, sharers] = await Promise.all([
    db.business.count({ where: { ownerId: { not: null } } }),
    db.prideEvent.findMany({
      where: { action: { in: DIST as PrideEventType[] }, business: { is: { ownerId: { not: null } } } },
      select: { businessId: true },
      distinct: ["businessId"],
    }),
  ]);
  const claimedWithShare = sharers.filter((s) => s.businessId).length;
  return { claimedTotal, claimedWithShare, shareRate: shareRate(claimedTotal, claimedWithShare) };
}

/** Share Rate within one category, or null when the segment is too small. */
export async function getCategoryShareRate(category: string): Promise<number | null> {
  const [claimed, sharers] = await Promise.all([
    db.business.count({ where: { ownerId: { not: null }, category } }),
    db.prideEvent.findMany({
      where: { action: { in: DIST as PrideEventType[] }, business: { is: { ownerId: { not: null }, category } } },
      select: { businessId: true },
      distinct: ["businessId"],
    }),
  ]);
  if (claimed < MIN_SEGMENT) return null;
  return shareRate(claimed, sharers.filter((s) => s.businessId).length);
}

// ---- Per-business (owner dashboard) ---------------------------------------

export interface BusinessShareMetrics {
  hasShared: boolean;
  totalShares: number; // distribution shares
  shareKitOpens: number;
  uniqueSharers: number;
  byChannel: ChannelCount[];
  totalViews: number;
  shareViews: number; // views attributed to a share
  shareContacts: number; // contact/website/directions attributed to a share
  firstShareAt: Date | null;
  lastShareAt: Date | null;
}

export async function getBusinessShareMetrics(businessId: string): Promise<BusinessShareMetrics> {
  const events = await db.prideEvent.findMany({
    where: { businessId },
    select: { action: true, channel: true, visitorId: true, createdAt: true },
  });

  const channelCounts: Record<string, number> = {};
  const sharers = new Set<string>();
  let totalShares = 0;
  let shareKitOpens = 0;
  let totalViews = 0;
  let shareViews = 0;
  let shareContacts = 0;
  let firstShareAt: Date | null = null;
  let lastShareAt: Date | null = null;

  for (const e of events) {
    if (e.action === "SHARE_KIT_OPENED") shareKitOpens++;
    if (DIST.includes(e.action)) {
      totalShares++;
      const ch = e.channel || "direct";
      channelCounts[ch] = (channelCounts[ch] ?? 0) + 1;
      if (e.visitorId && e.visitorId !== "system") sharers.add(e.visitorId);
      if (!firstShareAt || e.createdAt < firstShareAt) firstShareAt = e.createdAt;
      if (!lastShareAt || e.createdAt > lastShareAt) lastShareAt = e.createdAt;
    }
    if (e.action === "PROFILE_VIEW") {
      totalViews++;
      if (isShareChannel(e.channel)) shareViews++;
    }
    if (CONTACT_ACTIONS.has(e.action) && isShareChannel(e.channel)) shareContacts++;
  }

  return {
    hasShared: totalShares > 0,
    totalShares,
    shareKitOpens,
    uniqueSharers: sharers.size,
    byChannel: rankChannels(channelCounts),
    totalViews,
    shareViews,
    shareContacts,
    firstShareAt,
    lastShareAt,
  };
}

// ---- Admin (platform-wide) ------------------------------------------------

export interface AdminPride {
  platform: PlatformPride;
  sharesPerClaimed: number;
  medianDaysToFirstShare: number | null;
  byCity: SegmentRate[];
  byCategory: SegmentRate[];
  completionSharers: number;
  completionNonSharers: number;
  trustSharers: number;
  trustNonSharers: number;
}

export interface SegmentRate {
  key: string;
  total: number;
  shared: number;
  rate: number;
}

export async function getAdminPride(): Promise<AdminPride> {
  // Claimed businesses are a bounded set (ownership is granted on review), so we
  // can compute completion/trust per business here. If this set grows large,
  // materialise into BusinessShareMetrics (see rollout notes).
  const claimed = await db.business.findMany({
    where: { ownerId: { not: null } },
    include: {
      photos: { select: { id: true } },
      reviews: { select: { rating: true, status: true } },
      sources: { select: { sourceType: true } },
    },
  });

  const shareGroups = claimed.length
    ? await db.prideEvent.groupBy({
        by: ["businessId"],
        where: { action: { in: DIST as PrideEventType[] }, businessId: { in: claimed.map((c) => c.id) } },
        _count: { _all: true },
        _min: { createdAt: true },
      })
    : [];
  const shareByBiz = new Map(shareGroups.map((g) => [g.businessId!, { count: g._count._all, first: g._min.createdAt }]));

  const totalShareEvents = shareGroups.reduce((a, g) => a + g._count._all, 0);
  const sharesPerClaimed = claimed.length ? Math.round((totalShareEvents / claimed.length) * 10) / 10 : 0;

  const ttfs: number[] = [];
  const completionShared: number[] = [];
  const completionNot: number[] = [];
  const trustShared: number[] = [];
  const trustNot: number[] = [];
  const cityTot = new Map<string, number>();
  const cityShared = new Map<string, number>();
  const catTot = new Map<string, number>();
  const catShared = new Map<string, number>();

  for (const b of claimed) {
    const s = shareByBiz.get(b.id);
    const has = !!s;
    if (s?.first && b.claimedAt) {
      const days = (s.first.getTime() - b.claimedAt.getTime()) / 86_400_000;
      if (days >= 0) ttfs.push(days);
    }
    const trust = trustV2ForBusiness(b).score;
    const completion = profileCompletion({
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
    (has ? completionShared : completionNot).push(completion);
    (has ? trustShared : trustNot).push(trust);

    const city = b.city || "—";
    const cat = b.category || "—";
    cityTot.set(city, (cityTot.get(city) ?? 0) + 1);
    catTot.set(cat, (catTot.get(cat) ?? 0) + 1);
    if (has) {
      cityShared.set(city, (cityShared.get(city) ?? 0) + 1);
      catShared.set(cat, (catShared.get(cat) ?? 0) + 1);
    }
  }

  const segment = (tot: Map<string, number>, shared: Map<string, number>): SegmentRate[] =>
    [...tot.entries()]
      .filter(([, t]) => t >= MIN_SEGMENT)
      .map(([key, t]) => ({ key, total: t, shared: shared.get(key) ?? 0, rate: shareRate(t, shared.get(key) ?? 0) }))
      .sort((a, b) => b.rate - a.rate || b.total - a.total);

  return {
    platform: {
      claimedTotal: claimed.length,
      claimedWithShare: shareByBiz.size,
      shareRate: shareRate(claimed.length, shareByBiz.size),
    },
    sharesPerClaimed,
    medianDaysToFirstShare: ttfs.length ? Math.round(median(ttfs) * 10) / 10 : null,
    byCity: segment(cityTot, cityShared),
    byCategory: segment(catTot, catShared),
    completionSharers: Math.round(average(completionShared)),
    completionNonSharers: Math.round(average(completionNot)),
    trustSharers: Math.round(average(trustShared)),
    trustNonSharers: Math.round(average(trustNot)),
  };
}
