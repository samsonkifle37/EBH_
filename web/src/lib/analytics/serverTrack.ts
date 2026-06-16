import { cookies } from "next/headers";
import { recordPrideEvent } from "./record";
import { VISITOR_COOKIE } from "./attribution";
import type { TrackableEvent } from "./events";

/**
 * Fire-and-forget server-side view event for non-business pages (trust/support
 * surfaces). Reads the anonymous visitor id from the cookie set in middleware.
 */
export async function trackServerView(action: TrackableEvent): Promise<void> {
  try {
    const jar = await cookies();
    const visitorId = jar.get(VISITOR_COOKIE)?.value || "anon";
    void recordPrideEvent({ action, visitorId });
  } catch {
    /* never break a page render for analytics */
  }
}
