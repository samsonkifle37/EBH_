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

## Verification & trust model

Levels: 1 email-verified · 2 phone-verified · 3 business-verified · 4 premium
(shown as badges). The public **Trust Score (0–100)** is evidence-based, never
invented: +30 Google Place exists · +20 phone · +20 website · +15 Companies
House match · +10 owner claimed · +10 OpenStreetMap source · +5 photos ·
+5 manual lead (capped at 100). OpenStreetMap and manual leads corroborate a
listing but are weaker than Google Places, so they never act as primary
verification. Displayed on every listing as
"Trust Score: N/100 · Based on verified public data".
