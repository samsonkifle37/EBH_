// Pure computations for the pride/share dashboards. No DB, no I/O — fully unit
// tested. The DB layer (prideMetrics.ts) feeds these plain numbers/rows.

import { CHANNEL_LABELS } from "./events";

/** North-Star: % of claimed businesses that have shared at least once. */
export function shareRate(claimedTotal: number, claimedWithShare: number): number {
  if (claimedTotal <= 0) return 0;
  return Math.round((claimedWithShare / claimedTotal) * 1000) / 10; // 1 dp percent
}

export interface ChannelCount {
  channel: string;
  label: string;
  count: number;
}

/** Rank channels by volume, biggest first, with display labels. */
export function rankChannels(counts: Record<string, number>): ChannelCount[] {
  return Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([channel, count]) => ({ channel, label: CHANNEL_LABELS[channel] ?? channel, count }))
    .sort((a, b) => b.count - a.count || a.channel.localeCompare(b.channel));
}

export function bestChannel(counts: Record<string, number>): ChannelCount | null {
  return rankChannels(counts)[0] ?? null;
}

/** Median of a numeric list (returns 0 for empty). */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export interface OwnerInsightInput {
  hasShared: boolean;
  totalShares: number;
  shareViews: number; // profile views attributed to shares
  shareContacts: number; // contact/website/directions clicks attributed to shares
  completionScore: number;
  platformShareRate: number; // %
  categoryShareRate: number | null; // %, null when category has too little data
}

/**
 * Generate 1–3 plain-English, owner-facing insights. Ordered most-actionable
 * first. Deterministic so it can be tested.
 */
export function ownerInsights(i: OwnerInsightInput): string[] {
  const out: string[] = [];

  if (!i.hasShared) {
    out.push(
      i.completionScore < 80
        ? "Finish your profile, then share it — complete profiles get noticeably more clicks when shared."
        : "You haven't shared your profile yet. One WhatsApp share is the single biggest thing you can do to get seen.",
    );
    return out.slice(0, 3);
  }

  if (i.shareViews > 0) {
    const conv = i.shareContacts > 0 ? ` and ${i.shareContacts} turned into a call, visit or website click` : "";
    out.push(`Your shares brought in ${i.shareViews} profile ${i.shareViews === 1 ? "view" : "views"}${conv}.`);
  } else {
    out.push("Your share is live — views from it will show up here as people open your profile.");
  }

  if (i.categoryShareRate != null && i.platformShareRate > 0) {
    out.push(
      `You're sharing — ${pct(i.platformShareRate)} of all claimed businesses do, and ${pct(i.categoryShareRate)} in your category. You're ahead of most.`,
    );
  }

  if (i.totalShares < 3) {
    out.push("Share again on a different channel (a QR poster in your window works brilliantly) to reach new people.");
  } else if (i.completionScore >= 80) {
    out.push("Your profile is strong and you're sharing consistently — keep it up and ask happy customers to leave a review.");
  }

  return out.slice(0, 3);
}

function pct(n: number): string {
  return `${Math.round(n)}%`;
}
