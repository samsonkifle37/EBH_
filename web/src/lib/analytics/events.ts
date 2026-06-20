// Canonical event taxonomy for the EBH "pride loop". One enum, used everywhere
// (client tracking, server tracking, validation, aggregation) so the North-Star
// metric is computed from a single, well-typed source of truth.

export const PRIDE_EVENTS = [
  "CLAIM_APPROVED",
  "PROFILE_VIEW",
  "SHARE_KIT_OPENED",
  "SHARE_IMAGE_GENERATED",
  "SHARE_DOWNLOAD",
  "SHARE_COPY_LINK",
  "SHARE_WHATSAPP",
  "SHARE_INSTAGRAM",
  "SHARE_QR_SCAN",
  "CONTACT_CLICK",
  "WEBSITE_CLICK",
  "DIRECTIONS_CLICK",
] as const;

export type PrideEventType = (typeof PRIDE_EVENTS)[number];

const PRIDE_EVENT_SET = new Set<string>(PRIDE_EVENTS);
export function isPrideEvent(v: unknown): v is PrideEventType {
  return typeof v === "string" && PRIDE_EVENT_SET.has(v);
}

// Trust/support surface events — not part of the Share Rate loop, but tracked
// through the same privacy-respecting first-party pipeline.
export const SUPPORT_EVENTS = [
  "ABOUT_VIEW",
  "HELP_ARTICLE_VIEW",
  "REPORT_SUBMITTED",
  "SAFETY_VIEW",
  "SUPPORT_EMAIL_CLICKED",
  "SUPPORT_CARD_CLICKED",
  "ABUSE_FLOW_OPENED",
] as const;
export type SupportEventType = (typeof SUPPORT_EVENTS)[number];

// "Website essentials" events — owner profile-building + website performance.
export const WEBSITE_EVENTS = [
  "LOGO_ADDED",
  "SERVICES_ADDED",
  "FAQ_ADDED",
  "PROFILE_UPDATED",
  "TRUST_BREAKDOWN_VIEW",
  "WEBSITE_SCORE_VIEW",
  "WEBSITE_MODE_VIEW",
  "IMAGE_UPLOADED",
] as const;
export type WebsiteEventType = (typeof WEBSITE_EVENTS)[number];

// Admin/ops events — user management, direct creation, location, image ops.
export const ADMIN_EVENTS = [
  "USER_UPDATED",
  "USER_SUSPENDED",
  "USER_ROLE_CHANGED",
  "USER_DELETED",
  "ADMIN_BUSINESS_CREATED",
  "ADMIN_EVENT_CREATED",
  "ADMIN_LEAD_CREATED",
  "CITY_ADDED",
  "IMAGE_DELETED",
  "IMAGE_REORDERED",
] as const;
export type AdminEventType = (typeof ADMIN_EVENTS)[number];

// Homepage discovery chip navigation events.
export const DISCOVERY_EVENTS = ["CITY_CHIP_CLICKED", "CATEGORY_CHIP_CLICKED"] as const;
export type DiscoveryEventType = (typeof DISCOVERY_EVENTS)[number];

/** Every event the /api/analytics/track endpoint will accept. */
export const TRACKABLE_EVENTS = [...PRIDE_EVENTS, ...SUPPORT_EVENTS, ...WEBSITE_EVENTS, ...ADMIN_EVENTS, ...DISCOVERY_EVENTS] as const;
export type TrackableEvent = (typeof TRACKABLE_EVENTS)[number];

// Every event in the share family.
export const SHARE_ACTIONS: readonly PrideEventType[] = [
  "SHARE_KIT_OPENED",
  "SHARE_IMAGE_GENERATED",
  "SHARE_DOWNLOAD",
  "SHARE_COPY_LINK",
  "SHARE_WHATSAPP",
  "SHARE_INSTAGRAM",
  "SHARE_QR_SCAN",
] as const;

// A "real" outward distribution of the profile — what the North-Star counts as a
// share. Opening the kit or previewing the generated image is intent, not a
// share, so they are deliberately excluded.
export const SHARE_DISTRIBUTION_ACTIONS: readonly PrideEventType[] = [
  "SHARE_DOWNLOAD",
  "SHARE_COPY_LINK",
  "SHARE_WHATSAPP",
  "SHARE_INSTAGRAM",
  "SHARE_QR_SCAN",
] as const;

export function isShareAction(a: string): boolean {
  return (SHARE_ACTIONS as readonly string[]).includes(a);
}
export function isDistributionShare(a: string): boolean {
  return (SHARE_DISTRIBUTION_ACTIONS as readonly string[]).includes(a);
}

// Attribution channels. "direct" / "" = not attributed to a share.
export const CHANNELS = [
  "whatsapp",
  "instagram",
  "qr",
  "copy_link",
  "download",
  "web_share",
  "direct",
] as const;
export type Channel = (typeof CHANNELS)[number];

export const SHARE_CHANNELS: readonly string[] = ["whatsapp", "instagram", "qr", "copy_link", "download", "web_share"];

/** True when a channel string represents traffic that arrived via a share. */
export function isShareChannel(channel: string | null | undefined): boolean {
  return !!channel && SHARE_CHANNELS.includes(channel);
}

export const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  qr: "QR poster",
  copy_link: "Copied link",
  download: "Downloaded asset",
  web_share: "Device share",
  direct: "Direct / search",
};
