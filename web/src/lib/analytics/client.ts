import type { TrackableEvent } from "./events";

export interface TrackOptions {
  businessId?: string;
  channel?: string;
  asset?: string;
  dedupeKey?: string;
}

/**
 * Fire-and-forget client tracking. Uses sendBeacon when available so the event
 * survives navigation (link clicks, downloads), falling back to keepalive fetch.
 * Visitor id + attribution are read server-side from cookies, so the client only
 * sends the action and a little context.
 */
export function track(action: TrackableEvent, opts: TrackOptions = {}): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({ action, ...opts });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/track", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  void fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
