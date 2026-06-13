# Milestone A — Trust Engine V2, Analytics, Auto-Approval — Design

Date: 2026-06-13
Status: Approved (user chose Milestone A; Stripe-dependent phases deferred to B)
Source: "EBH Monetization & Trust Infrastructure" — Phases 4, 5, 6

## Scope

Key-free foundation the rest of the monetization spec rests on. No Stripe.
1. **Phase 5 — Trust Engine V2**: richer 0–100 score with an admin "why this
   score" breakdown panel.
2. **Phase 4 — Analytics**: new event types, a `business_analytics_daily`
   aggregate table + rollup, and 7/30/90-day owner dashboards with trends.
3. **Phase 6 — Auto-approval**: close the gaps vs the spec — add the
   `needs_contact_info` review bucket and the exact moderation filters.

Out of scope (Milestone B+): Stripe subscriptions, featured ranking purchase,
paid claiming, ads platform, event promotion, AI copilot, revenue dashboard.
`verifiedSubscription` is wired into the trust model now but is only ever true
once Milestone B can set it; until then it contributes 0.

## Phase 5 — Trust Engine V2

New module `lib/domain/trustV2.ts` returns a score **and a breakdown** so the
admin panel can explain it. Additive, capped at 100:

| Factor | Points |
|---|---|
| Verified subscription (paid tier active) | +20 |
| Owner claimed | +20 |
| Google Places source | +15 |
| Companies House match | +10 |
| OpenStreetMap source | +5 |
| Manual lead source | +2 |
| Phone present | +5 |
| Website present | +5 |
| Email present | +3 |
| Photos | +2 each, max +10 |
| Reviews | +1 per review max +5, plus +5 if avg ≥ 4.0 (≥3 reviews) |
| Recent activity (any tracked event in last 30 days) | +5 |
| Profile completion (description ≥ 80, address, hours, ≥1 social) | +2.5 each, max +10 |

`computeTrustV2(input) → { score, breakdown: {label, points}[] }`. The public
"Trust Score" displayed on listings and used for ranking switches to this V2
score (replacing the previous evidence-only score). `dataConfidenceScore` is
refreshed to the V2 score on import and on a recompute helper.

Admin: a per-business panel at `/admin/business/[id]` (admin-only) renders the
breakdown rows with points, plus identity/source facts.

## Phase 4 — Analytics

- Extend tracked event types: add `SHARE_CLICK`, `DIRECTION_CLICK`,
  `BOOKING_CLICK` (existing: LISTING_VIEW, PHONE_CLICK, WEBSITE_CLICK,
  EVENT_VIEW, TICKET_CLICK, SEARCH_IMPRESSION). `/api/track` accepts them.
- New model `BusinessAnalyticsDaily` (businessId, date, views, phoneClicks,
  websiteClicks, directionClicks, shareClicks, bookingClicks; unique
  [businessId, date]).
- `lib/analytics/rollup.ts`: `rollupDaily(sinceDays)` aggregates AnalyticsEvent
  into daily rows (idempotent upsert). Runnable as a script; the owner
  dashboard calls it opportunistically for the business being viewed.
- `lib/analytics/summary.ts`: `getBusinessAnalytics(businessId, days)` → totals,
  per-day series (for a trend sparkline), and top traffic event breakdown over
  7/30/90 days, read from the daily table.
- Owner dashboard (`/dashboard/business/[id]`) gains a period switcher
  (7/30/90) with metric cards, a simple inline SVG trend chart, and a
  "top interactions" breakdown. Tracked via existing `TrackedLink` plus new
  share/directions buttons on the public business page.

## Phase 6 — Auto-approval gap-closing

- `evaluateListing`: image-present-but-no-contact now sets
  `reviewBucket = "needs_contact_info"` (was reason-only). No-image stays
  `needs_enrichment`.
- `/admin/businesses` filters renamed/added to match spec exactly:
  Ready To Approve · Needs Image · Needs Contact · Duplicate Candidates ·
  Recently Auto Approved (auto-approved in last 7 days). `needs_contact` filter
  keys off the `needs_contact_info` bucket.
- Trust threshold in the gate stays at the auto-approval score (Milestone-A note:
  the auto-approval score from the trust-filter PRD is unchanged; only the
  public/ranking Trust Score is upgraded to V2).

## Data model changes

- `Business`: no new columns (tier/is_verified/verified_since arrive in
  Milestone B). `verifiedSubscription` for trust is derived as
  `plan !== "FREE"` until B introduces real subscriptions.
- New: `BusinessAnalyticsDaily`.

## Testing

Vitest: `computeTrustV2` (each factor + cap + breakdown sums to score),
`rollupDaily` aggregation math (pure helper over event arrays), analytics
period bucketing. Build passes; live smoke of dashboard + admin trust panel.
