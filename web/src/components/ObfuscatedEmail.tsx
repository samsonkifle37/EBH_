"use client";

import { track } from "@/lib/analytics/client";

/**
 * Renders the address from separate parts and only builds the `mailto:` link on
 * click — so there's no harvestable mailto in the static HTML. Fires
 * CONTACT_CLICK on use. Keyboard accessible.
 */
export default function ObfuscatedEmail({ user, domain, className }: { user: string; domain: string; className?: string }) {
  function open() {
    track("CONTACT_CLICK");
    window.location.href = `mailto:${user}@${domain}`;
  }
  return (
    <button type="button" onClick={open} className={className} aria-label={`Email ${user} at ${domain}`}>
      <span>{user}</span>
      <span aria-hidden>@</span>
      <span>{domain}</span>
    </button>
  );
}
