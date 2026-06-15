// Pure helpers for share attribution. Shares carry URL params
// (?ref=share&business={slug}&channel={channel}); we persist the resolved
// attribution in a first-party cookie for 30 days. No PII, no third parties.

import { SHARE_CHANNELS } from "./events";

export const ATTRIBUTION_COOKIE = "ebh_attr";
export const VISITOR_COOKIE = "ebh_vid";
export const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, seconds

export interface Attribution {
  channel: string; // normalised share channel, e.g. "whatsapp" | "qr"
  business: string; // slug the share pointed at
  ts: number; // epoch ms the attribution was captured
}

function normaliseChannel(raw: string | null | undefined): string {
  const c = (raw ?? "").toLowerCase().trim();
  if (SHARE_CHANNELS.includes(c)) return c;
  // tolerate a few aliases produced by share targets
  if (c === "wa" || c === "whatsapp_share") return "whatsapp";
  if (c === "ig" || c === "story") return "instagram";
  if (c === "link" || c === "copy") return "copy_link";
  return "";
}

/**
 * Parse incoming share params into an Attribution, or null when the request is
 * not a share landing. Accepts a plain record (works with URLSearchParams via
 * Object.fromEntries or Next's searchParams).
 */
export function attributionFromParams(
  params: { ref?: string | null; channel?: string | null; business?: string | null },
  now: number = Date.now(),
): Attribution | null {
  if ((params.ref ?? "").toLowerCase() !== "share") return null;
  const channel = normaliseChannel(params.channel) || "direct";
  const business = (params.business ?? "").trim();
  return { channel, business, ts: now };
}

export function serializeAttribution(a: Attribution): string {
  return JSON.stringify({ c: a.channel, b: a.business, t: a.ts });
}

export function parseAttribution(raw: string | null | undefined, now: number = Date.now()): Attribution | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { c?: string; b?: string; t?: number };
    if (!v || typeof v.c !== "string") return null;
    const ts = typeof v.t === "number" ? v.t : 0;
    if (now - ts > ATTRIBUTION_MAX_AGE * 1000) return null; // expired
    return { channel: v.c, business: v.b ?? "", ts };
  } catch {
    return null;
  }
}

/** Build the share-tracking suffix appended to a profile URL for a channel. */
export function shareParams(businessSlug: string, channel: string): string {
  const p = new URLSearchParams({ ref: "share", business: businessSlug, channel });
  return p.toString();
}
