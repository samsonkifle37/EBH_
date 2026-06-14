# Ownership & Monetisation Foundation (pre-Stripe) — Design

Date: 2026-06-14
Status: Approved (user: build non-Stripe foundation before Milestone B)
Source: "Build the non-Stripe foundation first"

## Goal

Make claiming, ownership, revenue tracking and monetisation **structurally
ready** without any Stripe wiring. No checkout, webhooks, card forms, or payment
collection. Claims are free for now and flagged `pending_payment`.

## 1. Claim model — replace code-verification with admin review

The existing `ClaimRequest` is code/OTP-based and auto-grants ownership, which
contradicts "do not change ownership until admin approves." Repurpose it into an
admin-reviewed, evidence-based claim:

- Keep `method`/`code` columns nullable (legacy, unused) to avoid a destructive
  migration.
- Add: `claimantName`, `claimantEmail`, `claimantPhone`, `evidenceUrl`, `notes`,
  `paymentStatus` (default `pending_payment`), `reviewedAt`, `reviewedBy`.
- Status values become: `pending | approved | rejected | needs_more_evidence`
  (default `pending`).

Ownership (`business.ownerId`) is set **only** when an admin approves a claim.
That means the Trust Engine V2's `ownerClaimed` (already keyed off `ownerId`)
automatically gives +20 only after approval — requirement 6 satisfied with no
trust-engine change.

## 2. Public "Claim This Business" UX

- `/business/[slug]` claim banner → links to the rebuilt `/claim/[slug]`.
- New evidence form (`ClaimForm` client component) collecting name, email,
  phone, evidence URL, message. Requires sign-in.
- `POST /api/claim` (rewritten): creates a `ClaimRequest` with
  `status=pending`, `paymentStatus=pending_payment`. Does **not** touch
  ownership or listing status. Blocks duplicate open claims by the same user and
  already-owned businesses. Old `ClaimFlow` component + OTP logic removed.

## 3. Owner dashboard `/owner/*`

New routes, all gated to `business.ownerId === session.userId`:
- `/owner` → overview + list of owned businesses (or empty state:
  "You have not claimed a business yet. Find your business and submit a claim.")
- `/owner/businesses` → full list
- `/owner/business/[id]` → summary (details, plan, trust, quick links)
- `/owner/business/[id]/analytics` → reuses `getBusinessAnalytics` + TrendChart
  (7/30/90)
- `/owner/business/[id]/reviews` → reviews + RespondForm
A shared `requireOwner(id)` guard returns the business or 404/redirect.

## 4. Revenue dashboard `/admin/revenue`

Real DB queries only (all tables empty now → £0). Cards: MRR, ARR, Verified
subscribers, Featured subscribers, Claim revenue, Event promotion revenue, Ad
revenue, AI toolkit revenue, Total revenue. MRR = sum of active subscription
monthly amounts; ARR = MRR×12; revenues = sum of `paid` payments by category.
Everything resolves to 0/£0 with the empty schema — no fake numbers.

## 5. Monetisation models (future-ready, not wired)

New Prisma models, all with `businessId?`, `userId?`, `planType`, `status`,
`amount` (Int pence), `currency` (default "gbp"), `startDate?`, `endDate?`,
`createdAt`, `updatedAt`, and a `paymentStatus` where relevant
(`pending | paid | failed | refunded | cancelled`):
- `Subscription` (planType: VERIFIED | FEATURED | AI_TOOLKIT; stripe* columns
  nullable, added now so Milestone B needs no migration)
- `Payment` (kind: subscription | claim | event_promotion | ad | ai_toolkit)
- `FeaturedSubscription`
- `EventPromotion` (eventId, package: BRONZE|SILVER|GOLD)
- `AdCampaign` (placement, impressions, clicks)
- `AiToolkitSubscription`

These are created empty; no code writes to them yet beyond what later milestones
add. They exist so revenue queries and Stripe wiring drop in cleanly.

## 6. Trust integration

No change needed beyond #1: `ownerId` is set only on admin approval, so
`computeTrustV2`'s Owner Claimed +20 already applies only to approved claims.
Add a regression test asserting pending claims don't grant it.

## 7. Admin navigation

Add admin home cards + a shared admin nav for: Claims (`/admin/claims`,
badge = pending count), Revenue (`/admin/revenue`), Payments (`/admin/payments`,
empty state), Ads (existing `/admin/ads`), Event Promotions
(`/admin/event-promotions`, empty state).

## Admin claim review `/admin/claims`

Lists claims newest-first with status filter. Actions via
`POST /api/admin/claims/[id]` (ADMIN-guarded): `approve` (sets
`business.ownerId`, `claimedAt`, adds BUSINESS_OWNER role to the claimant,
status=approved, reviewedAt/By), `reject`, `needs_more_evidence`. Approve is
idempotent-safe (refuses if already owned by someone else).

## Testing

Vitest: a pure `claimTransition(current, action)` helper validating the status
machine (pending→approved/rejected/needs_more_evidence; terminal approved).
Trust regression: pending claim (no ownerId) → no +20; approved (ownerId) → +20.
Build passes; live smoke of claim submit → admin approve → owner dashboard.

## Out of scope (Milestone B, needs Stripe)

Checkout, webhooks, real subscriptions, payment collection, paid claiming,
billing, card forms.
