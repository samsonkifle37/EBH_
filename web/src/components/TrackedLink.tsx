"use client";

interface Props {
  href: string;
  type: "PHONE_CLICK" | "WEBSITE_CLICK" | "TICKET_CLICK" | "DIRECTION_CLICK" | "BOOKING_CLICK";
  businessId?: string;
  eventId?: string;
  className?: string;
  children: React.ReactNode;
}

export default function TrackedLink({ href, type, businessId, eventId, className, children }: Props) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={className}
      onClick={() => {
        const body = JSON.stringify({ type, businessId, eventId });
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
        } else {
          void fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
        }
      }}
    >
      {children}
    </a>
  );
}
