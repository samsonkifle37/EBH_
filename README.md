# Ethiopian Business Hub UK

**Discover • Connect • Support** — the digital home of Ethiopian businesses,
events and community across the United Kingdom.

This is **Phase 1** of the Habesha Connect UK PRD: the SEO-first web platform.
Phase 2 (React Native/Expo mobile apps) will reuse the same database and
`/api/*` routes.

## Quickstart

```bash
cd web
npm install
npm run db:setup    # creates SQLite db and seeds demo data
npm run dev         # → http://localhost:3000
```

No accounts or API keys needed — everything runs locally.

## Demo accounts (password: `demo1234`)

| Email | Role | What to try |
|---|---|---|
| `user@ebh.uk` | Registered user | Save favourites, write reviews, follow businesses |
| `owner@ebh.uk` | Business owner | `/dashboard` — analytics, respond to reviews, upgrade plans |
| `organizer@ebh.uk` | Event organizer | `/dashboard/events` — create events, ticket analytics |
| `admin@ebh.uk` | Platform admin | `/admin` — approve listings/events, moderate reviews, manage ads |

## Key URLs

- `/` — home: featured businesses, events, categories, AI concierge, ad slots
- `/businesses` — directory with category/city/rating/open-now/verified filters
- `/restaurants/london` (etc.) — 60 statically generated SEO landing pages (12 categories × 5 cities)
- `/business/<slug>` — listing with gallery, hours, map, reviews, AI review summary, LocalBusiness JSON-LD
- `/events`, `/events/london`, `/event/<slug>` — events with Event JSON-LD and tracked ticket clicks
- `/concierge` — AI concierge chat
- `/pricing`, `/advertise` — monetization (Free / Verified £2.99 / Featured £4.99 / AI Toolkit £29, ads £50–£100/mo, event promotion £25–£250)
- `/claim/<slug>` — business claiming with email/phone verification codes
- `/sitemap.xml`, `/robots.txt`

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma 6 + SQLite ·
jose cookie sessions + bcryptjs · Zod · Vitest (40 unit tests: `npm test`).

## Real data & importers

The platform only publishes **real, source-tracked, admin-approved** listings.
Every listing records `sourceType` (google_places / companies_house /
owner_submitted / admin_created / demo), source id + URL, and a
`BusinessSource` evidence row. Imports always land in the **pending approval
queue** — nothing auto-publishes.

- **`ALLOW_DEMO_DATA`** (`web/.env`) — the 31 seeded demo businesses and 12
  demo events are flagged `demo` and only visible when this is `"true"`
  (local default). **Production must set `"false"`**: demo listings then 404,
  vanish from search/home/sitemap/SEO pages, and category pages show
  "No verified businesses listed yet."
- **`GOOGLE_PLACES_API_KEY`** — enables `/admin/import/google-places`
  (preset queries like "Ethiopian restaurant London"). Imports real trading
  businesses with Google rating/review-count (linked to Google Maps — review
  text is never copied; missing rating shows "No rating yet"). Requires a
  billing-enabled Google Cloud project with Places API (New).
- **`COMPANIES_HOUSE_API_KEY`** (free) — enables `/admin/import/companies-house`
  (name terms like "Habesha", "Abyssinia"). Matches corroborate existing
  listings (+15 trust, "CH ✓"); unmatched companies import as pending only.
- **OpenStreetMap** (`/admin/import/openstreetmap`) — **no key, no billing**,
  ODbL-licensed. One Overpass query pulls Ethiopian/Eritrean businesses across
  the UK; throttled to one request / 2 s (`OVERPASS_API_URL` overrides the
  endpoint). Matches corroborate existing listings (+10 trust); the rest import
  as pending. Source links to openstreetmap.org are retained on every record.
- **Manual lead capture** (`/admin/import/leads`) — a fast intake form (not a
  scraper) for businesses found via Facebook, Instagram, referrals, flyers and
  events. Each lead is pending with +5 trust and full source attribution; the
  form warns on likely duplicates and shows a session activity list.
- **Dedup & merge** — importers match on place id, company number, phone,
  website, name+postcode, and **geo-proximity (within 50 m)**; admins can merge
  duplicates, reassign category/city, and monitor everything at
  `/admin/data-quality`.
- **Auto-approval trust filter** — new OSM imports are auto-published only when
  they pass every gate: has image, has contact (phone/website/email), valid
  name, not a duplicate, and an auto-approval score ≥ 30 (OSM/Google/CH +10,
  website +10, phone/email +5, image +5). Auto-approved listings are tagged
  `approvedBy=system` / `verificationStatus=auto_verified`. Listings with no
  image go to a **Needs-image enrichment queue** (`reviewBucket=needs_enrichment`)
  that is hidden from the main moderation queue; image-but-no-contact stays
  pending. `/admin/businesses` has filter chips (Ready to approve · Needs
  contact · Needs image · Duplicate candidates · Auto-approved) and
  `/admin/data-quality` shows the matching metric cards. Note: OpenStreetMap
  rarely stores photos, so most OSM records land in the Needs-image queue until
  enriched (Google match or owner claim) rather than auto-approving.
- **Trust Score (0–100, evidence only)**: +30 Google Place · +20 phone ·
  +20 website · +15 Companies House match · +10 owner claimed ·
  +10 OpenStreetMap · +5 photos · +5 manual lead. OSM/leads corroborate but are
  not primary verification.

## Activating other integrations (optional)

Edit `web/.env`:

- `ANTHROPIC_API_KEY` — the concierge answers with Claude (`claude-haiku-4-5`)
  grounded in live directory results. Without a key it uses a built-in
  retrieval engine over the database (still fully functional).
- `STRIPE_SECRET_KEY` — placeholder branch for real checkout. Without it,
  plan upgrades apply instantly in dev mode so the full flow is testable.
- `AUTH_SECRET` — set a long random string in production.
- `SITE_URL` — public URL for sitemap/JSON-LD when deployed.
- Database: swap the Prisma datasource to Postgres (e.g. Supabase/Neon) at
  deploy time; the schema is portable.

## Project layout

```
docs/superpowers/   design spec + implementation plan
web/                Next.js app
  prisma/           schema + seed (31 businesses, 12 events, 76 reviews)
  src/lib/domain/   pure, unit-tested business logic
  src/lib/ai/       concierge provider (Claude + fallback)
  src/lib/payments/ checkout provider (Stripe stub + dev mode)
  src/app/          pages and /api routes
```

## Trust Engine V2

The public **Trust Score (0–100)** drives ranking and is the foundation of every
monetization decision. It is additive, capped at 100, and never invented:

| Signal | Points |
|---|---|
| Verified subscription (paid tier) | +20 |
| Owner claimed | +20 |
| Google Places listing | +15 |
| Companies House match | +10 |
| OpenStreetMap listing | +5 |
| Community lead | +2 |
| Phone / Website | +5 each |
| Email | +3 |
| Photos | +2 each (max +10) |
| Reviews | +1 each (max +5) plus +5 if avg ≥ 4 with ≥3 reviews |
| Recent activity (event in last 30 days) | +5 |
| Profile completion (description, address, hours, social) | +2.5 each (max +10) |

Admins see the exact per-factor breakdown at `/admin/business/[id]`
("why this score"). The directory ranks by featured → trust → rating.
`lib/domain/trustV2.ts` is the pure, tested engine; `lib/trust.ts` derives the
inputs from a business record.

## Analytics

Tracked events: listing views, phone/website/direction/share/booking clicks
(+ event views & ticket clicks). Raw `AnalyticsEvent` rows roll up into
`BusinessAnalyticsDaily` (`lib/analytics/rollup.ts`, idempotent), read back by
`lib/analytics/summary.ts`. The owner dashboard
(`/dashboard/business/[id]?days=7|30|90`) shows metric cards, an inline trend
chart, and a "top interactions" breakdown. Share/Directions buttons on the
public listing generate the new event types.

## Privilege model & production safety

Ownership and paid benefits cannot be obtained without admin approval or a Stripe
webhook:

- **Self-created listings** (`POST /api/businesses`) set `submittedById` (the
  creator can edit/manage the pending listing) but **not** `ownerId` — so no
  `BUSINESS_OWNER` role and no +20 owner trust. An admin approving the listing
  (`/api/admin/businesses/[id]` action `approve`) grants ownership + role at that
  point; only then does owner trust apply.
- **Claims** grant ownership only on admin approval + Stripe-paid webhook
  (dev-mode grant outside production).
- **Subscriptions / featured / plan** change only via the signed Stripe webhook
  (or admin `feature` action).
- **Fail-fast**: `src/instrumentation.ts` calls `assertStripeProductionConfig()`
  at startup — in `NODE_ENV=production` the server refuses to boot unless all
  Stripe env vars are present. Dev-mode payment fallbacks are additionally gated
  by `devFallbackAllowed()` so they can never run in production.

## Payments (Stripe — Milestone B)

Real Stripe Checkout + webhooks, activated by env (dev-mode fallback otherwise):

```
STRIPE_SECRET_KEY="sk_test_…"
STRIPE_WEBHOOK_SECRET="whsec_…"
STRIPE_PRICE_VERIFIED="price_…"   # recurring £2.99/mo (subscription)
STRIPE_PRICE_FEATURED="price_…"   # recurring £4.99/mo (subscription)
STRIPE_PRICE_CLAIM="price_…"      # one-time £9.99 (payment)
NEXT_PUBLIC_SITE_URL="https://…"
```

- **Products** (`lib/payments/stripe.ts`, no hardcoded ids): Verified/Featured
  are subscriptions; claim is one-time. Price ids come from env.
- **Checkout** `POST /api/checkout` `{product, businessId|claimId}` → returns a
  Stripe Checkout `url`. Owner/claimant-guarded. Pre-creates a pending
  `Subscription` row for subs. **Without keys** it applies the upgrade/claim
  immediately (dev mode) so the app stays usable.
- **Webhook** `POST /api/webhooks/stripe` — raw-body signature verification;
  **idempotent** via the `ProcessedStripeEvent` table (event id claimed before
  work, released if the handler throws so retries reprocess but never
  double-grant). Handles `checkout.session.completed`, `invoice.paid`,
  `customer.subscription.deleted`, `invoice.payment_failed`.
- **Pay-to-activate claims**: admin approval endorses a claim but ownership is
  granted by the webhook on the £9.99 payment (`grantClaimOwnership`, idempotent,
  writes a `Payment{kind:"claim"}`). With no keys, approval grants immediately.
- **Auto-downgrade**: subscription deletion → `plan=FREE`, `featured=false`;
  failed payment → `past_due`.
- Local webhook testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
- Tests: event interpretation, idempotency (same event twice = one grant),
  signature verify/reject, applier dispatch (105 unit tests total).

## Ownership & monetisation foundation (pre-Stripe)

Claiming is **admin-reviewed**, not instant: a signed-in user submits an
evidence form on `/claim/[slug]` → a `ClaimRequest` is created
(`status=pending`, `paymentStatus=pending_payment`, **no ownership change**) →
an admin reviews at `/admin/claims` and approves / rejects / requests more
evidence. Only **approve** sets `business.ownerId`, grants the `BUSINESS_OWNER`
role, and (via Trust V2's owner-claimed factor) adds +20 trust. Claiming is free
for now; payment wires in with Stripe (Milestone B).

Owners manage their listings under `/owner` (`/owner/businesses`,
`/owner/business/[id]` + `/analytics` + `/reviews`), gated to
`business.ownerId === session.userId`. No claimed business → an empty state
pointing them to find and claim one.

Founder/admin money views: `/admin/revenue` (MRR, ARR, subscribers, revenue by
stream — real DB queries, all £0 until billing is on), `/admin/payments`,
`/admin/event-promotions`. Future-ready tables exist and are unwired:
`Subscription`, `Payment`, `FeaturedSubscription`, `EventPromotion`,
`AdCampaign`, `AiToolkitSubscription` (Stripe columns already present so
Milestone B needs no migration).

## Auto-approval review buckets

New OSM imports auto-publish only when every gate passes (image, contact, valid
name, not duplicate, auto-approval score ≥ 30). Otherwise they route to a review
bucket — `needs_enrichment` (no image) or `needs_contact_info` (image but no
contact) — both hidden from the main moderation queue. `/admin/businesses`
filter chips: Ready to approve · Needs contact · Needs image · Duplicate
candidates · Recently auto approved.
