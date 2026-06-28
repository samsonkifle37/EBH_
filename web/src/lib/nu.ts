/**
 * NU — Discover Ethiopia (the travel app EBH funnels diaspora users into).
 * NU is the primary business objective; every NU CTA points here. Override the
 * destination per-environment with NEXT_PUBLIC_NU_URL (e.g. an App Store URL or
 * a waitlist landing page) without code changes.
 */
export const NU_URL = process.env.NEXT_PUBLIC_NU_URL ?? "https://nu-discoverethiopia.com/";
export const NU_APP_STORE_URL =
  process.env.NEXT_PUBLIC_NU_APP_STORE_URL ??
  "https://apps.apple.com/gb/app/nu-ethiopia/id6767019413";
// NU is live on Google Play.
export const NU_PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_NU_PLAY_STORE_URL ??
  "https://play.google.com/store/apps/details?id=com.nuethiopia.app&pcampaignid=web_share";
