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
jose cookie sessions + bcryptjs · Zod · Vitest (30 unit tests: `npm test`).

## Activating real integrations (optional)

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

Levels: 1 email-verified · 2 phone-verified · 3 business-verified · 4 premium.
Public trust score (0–100) = level × 20 + profile completeness × 20
(description, phone, website, socials, hours, 3+ photos).
