"use client";

import { track } from "@/lib/analytics/client";
import type { PrideEventType } from "@/lib/analytics/events";

type LegacyType = "PHONE_CLICK" | "WEBSITE_CLICK" | "TICKET_CLICK" | "DIRECTION_CLICK" | "BOOKING_CLICK";

interface Props {
  href: string;
  type: LegacyType;
  businessId?: string;
  eventId?: string;
  className?: string;
  children: React.ReactNode;
}

// Map the legacy click taxonomy onto the canonical pride taxonomy. Tickets and
// bookings aren't part of the pride loop, so they only feed legacy analytics.
const PRIDE_ACTION: Partial<Record<LegacyType, PrideEventType>> = {
  PHONE_CLICK: "CONTACT_CLICK",
  WEBSITE_CLICK: "WEBSITE_CLICK",
  DIRECTION_CLICK: "DIRECTIONS_CLICK",
};

export default function TrackedLink({ href, type, businessId, eventId, className, children }: Props) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={className}
      onClick={() => {
        // legacy feed (BusinessAnalyticsDaily)
        const body = JSON.stringify({ type, businessId, eventId });
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
        } else {
          void fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
        }
        // pride loop feed (PrideEvent) — channel resolved server-side from attribution
        const prideAction = PRIDE_ACTION[type];
        if (prideAction && businessId) track(prideAction, { businessId });
      }}
    >
      {children}
    </a>
  );
}
