# Ethiopian Business Hub UK — Web Platform v1 Design

Date: 2026-06-11
Status: Approved (user approved web-first scope; SQLite + stubbed integrations per recommendation)
Source: PRD v1.0 "Habesha Connect UK"

## Goal

Build the SEO-first Next.js web platform for discovering Ethiopian businesses and
events across the UK. This is phase 1 of the PRD; the Expo mobile app (phase 2)
will reuse the same database and API routes.

Everything must run locally with zero external accounts or API keys. Payments and
AI are built behind clean interfaces with working fallbacks, activated later by
adding `STRIPE_SECRET_KEY` / `ANTHROPIC_API_KEY`.

## Out of scope (later phases)

- iOS/Android apps (phase 2 — same API)
- Real Stripe checkout (UI + plan logic built; checkout is a stub that upgrades
  the account in dev mode)
- Live Claude API calls (concierge + review summaries work via DB-backed
  retrieval fallback; Claude path activates with an API key)
- Email/SMS verification sending (verification flows exist; codes are shown in
  dev mode instead of sent)
- Companies House / ID verification (manual admin approval stands in)
- Push notifications, business messaging, ticket sales commission

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS, in `web/` at repo root
  (leaves room for `mobile/` in phase 2)
- Prisma + SQLite (swap to Postgres via datasource change at deploy time)
- Auth: signed HTTP-only cookie sessions (jose JWT) + bcryptjs password hashing.
  Roles: USER, BUSINESS_OWNER, EVENT_ORGANIZER, ADMIN (a user may hold several).
- Images: deterministic photo placeholders (picsum.photos seeded by slug) with
  graceful local fallback; gallery upload stores files under `public/uploads`
- Maps: OpenStreetMap embed per business lat/lng (no key needed)
- Tests: Vitest for core domain logic (search filtering, open-now computation,
  verification score, rating aggregation, concierge retrieval)

## Data model (Prisma)

- **User**: email, passwordHash, name, roles, createdAt
- **Business**: name, slug, category (enum from PRD list), description, address,
  city, postcode, lat/lng, phone, website, socials (JSON), openingHours (JSON,
  per-day open/close), verificationLevel (0–4), verificationScore (0–100),
  featured (bool), plan (FREE | VERIFIED | FEATURED), status (PENDING | APPROVED
  | REJECTED), ownerId?, claimedAt?
- **BusinessPhoto**: businessId, url, alt, sortOrder
- **Review**: businessId, userId (unique together), rating 1–5, title, body,
  status (VISIBLE | REMOVED), ownerResponse?, ownerRespondedAt?
- **Favorite**: userId + businessId (unique)
- **Follow**: userId + businessId or organizerId
- **Event**: title, slug, type (enum from PRD), description, imageUrl, startsAt,
  endsAt, venueName, address, city, lat/lng, ticketUrl, priceFrom?, organizerId,
  status (PENDING | APPROVED | REJECTED), featured
- **ClaimRequest**: businessId, userId, method (EMAIL | PHONE), code, status
- **AnalyticsEvent**: type (LISTING_VIEW | PHONE_CLICK | WEBSITE_CLICK |
  EVENT_VIEW | TICKET_CLICK | SEARCH_IMPRESSION), businessId?, eventId?, createdAt
- **Ad**: placement (HOME_HERO | SEARCH_RESULTS | BUSINESS_DETAIL | EVENT_DETAIL),
  imageUrl, headline, targetUrl, active, startsAt, endsAt

Derived (computed, not stored): average rating, review count, "open now".
Verification score = function of level + profile completeness.

## Pages (App Router)

Public, SEO-indexed:
- `/` — hero search, city chips, category grid, featured businesses, upcoming
  events, AI concierge teaser, ad slot, "List My Business" CTA (per PRD wireframe)
- `/businesses` — directory with filters: category, city, min rating, open now,
  verified only; full-text search; featured pinned with "Featured Partner" badge
- `/[category]/[city]` — SEO landing pages (e.g. `/restaurants/london`),
  statically generated for every category × city with content
- `/business/[slug]` — gallery, details, hours + open-now, OSM map, verification
  badge + score, reviews + owner responses, AI review summary, claim CTA,
  tracked phone/website clicks, ad slot
- `/events`, `/events/[city]`, `/event/[slug]` — event discovery + detail with
  ticket link (tracked), organizer, map
- `/concierge` — AI concierge chat
- `/pricing` — Free / Verified £2.99 / Featured £4.99 / AI Toolkit £29 /
  event promotion & banner ads explainer
- `/advertise`, `/claim/[slug]`, `/auth/signin`, `/auth/signup`
- `sitemap.xml`, `robots.txt`

JSON-LD on relevant pages: LocalBusiness, Event, Review/AggregateRating,
Organization. Per-page metadata (title/description/OG) throughout.

Authenticated dashboards:
- `/account` — favorites, follows, my reviews
- `/dashboard` (business owner) — my listings, edit listing, photos, respond to
  reviews, analytics (views, phone clicks, website clicks, review count),
  upgrade plan (stub checkout)
- `/dashboard/events` (organizer) — create/manage events, attendee analytics
- `/admin` — approve/reject businesses & events, moderate reviews, manage
  featured placements and ads

## API routes

REST under `/app/api/*` (shared with mobile in phase 2): auth
(signup/signin/signout/session), businesses CRUD + claim + reviews + favorite,
events CRUD, analytics track, concierge chat, admin moderation actions, stub
checkout. Server components query Prisma directly; API routes exist for
mutations and future mobile use.

## AI design

`lib/ai/provider.ts` exposes `conciergeReply()` and `summarizeReviews()`.
- With `ANTHROPIC_API_KEY`: calls Claude (claude-haiku-4-5) with DB search
  results as context.
- Without: retrieval fallback — parse query for category/city/keywords, rank DB
  matches, return structured recommendations; review summary falls back to
  keyword/sentiment frequency over review texts ("Customers love / dislike").
The UI is identical either way.

## Seed data

~30 realistic Ethiopian businesses across London, Birmingham, Manchester,
Leicester, Sheffield covering all 12 PRD categories (incl. the PRD examples:
Abyssinia Restaurant, Habesha Market, Addis Solicitors); ~12 events across all
7 types; ~15 users with ~80 reviews; demo accounts: admin@ebh.uk,
owner@ebh.uk, organizer@ebh.uk, user@ebh.uk (password: demo1234); sample ads
and featured placements so every monetization surface renders.

## Error handling & quality

- Zod validation on all API inputs; friendly 404/empty states; auth guards by
  role; one-review-per-user enforced at DB level (unique constraint)
- Vitest unit tests for domain logic listed above
- `npm run build` must pass; manual smoke test of core flows before done

## Success criteria for this phase

A visitor can search/browse/filter businesses and events on SEO-clean URLs; a
user can register, review, favorite; an owner can claim, edit, respond, see
analytics, "upgrade"; an organizer can create events; an admin can moderate —
all locally with `npm run dev` and zero keys.
