# EBH Web Platform v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the SEO-first Ethiopian Business Hub UK web platform (directory, events, reviews, dashboards, admin, stubbed monetization/AI) running locally on SQLite with zero keys.

**Architecture:** Next.js 15 App Router app in `web/`. Server components read Prisma directly; mutations go through `/api/*` route handlers (reused by mobile in phase 2). Pure domain logic lives in `web/src/lib/domain/` and is unit-tested with Vitest. AI and payments sit behind provider modules with key-free fallbacks.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Prisma + SQLite, jose (session JWT), bcryptjs, zod, Vitest.

**Conventions for every task:** exact paths are relative to `web/` unless prefixed with repo root; commit after each task with a `feat:`/`chore:` message; run `npx vitest run` after any domain change.

---

### Task 1: Scaffold

**Files:** Create `web/` via create-next-app; modify `web/package.json`, repo `.gitignore`.

- [ ] `npx create-next-app@latest web --ts --tailwind --eslint --app --src-dir --use-npm --no-import-alias` (run from repo root; accept defaults non-interactively)
- [ ] `cd web && npm i prisma @prisma/client bcryptjs jose zod && npm i -D vitest @types/bcryptjs tsx`
- [ ] Add scripts to `web/package.json`: `"test": "vitest run"`, `"db:seed": "tsx prisma/seed.ts"`, `"db:setup": "prisma db push && tsx prisma/seed.ts"`
- [ ] Verify `npm run dev` boots, then commit.

### Task 2: Prisma schema + client

**Files:** Create `web/prisma/schema.prisma`, `web/src/lib/db.ts`, `web/.env` (`DATABASE_URL="file:./dev.db"`).

Schema per spec data model. Key constraints: `Review @@unique([businessId, userId])`, `Favorite @@unique([userId, businessId])`, Business `slug @unique`, Event `slug @unique`. Enums as String fields (SQLite) with TS union types in `web/src/lib/types.ts`:

```ts
export const CATEGORIES = ["restaurants","grocery-stores","cafes","travel-agencies","lawyers","accountants","beauty-services","construction","cleaning-services","wedding-services","churches","community-organizations"] as const;
export const CITIES = ["london","birmingham","manchester","leicester","sheffield"] as const;
export const EVENT_TYPES = ["music","community","business","cultural","religious","networking","education"] as const;
```

`db.ts` exports a global-cached PrismaClient. Run `npx prisma db push`, commit.

### Task 3: Domain logic (TDD)

**Files:** Create `web/src/lib/domain/{verification.ts,hours.ts,ratings.ts,slug.ts,concierge.ts,reviewSummary.ts}` + `web/src/lib/domain/__tests__/*.test.ts`, `web/vitest.config.ts`.

Write failing tests first, then implement, for:

- `verificationScore(level, completeness)` → 0–100: `min(100, level*20 + round(completeness*20))`; `profileCompleteness(business)` counts filled optional fields (description≥80 chars, phone, website, socials, hours, ≥3 photos) / 6.
- `isOpenNow(openingHours, now)` — hours JSON `{mon:[{open:"09:00",close:"17:30"}],...}`; handles closed days, overnight spans (close < open), empty.
- `aggregateRating(reviews)` → `{avg, count}` rounded to 1dp, ignores REMOVED.
- `slugify(name)` — lowercase, ascii, hyphens, collapse repeats.
- `parseConciergeQuery(text)` → `{category?, city?, keywords[], capacity?}` (matches category synonyms e.g. "restaurant", "solicitor"→lawyers, "venue"/"wedding venue"→wedding-services; city names; "for N guests" capacity).
- `summarizeReviews(texts[])` → `{loves: string[], dislikes: string[]}` via keyword frequency over positive/negative phrase lexicon (food, service, atmosphere, value, waiting times, parking, price).

Each: write test → `npx vitest run` FAIL → implement → PASS → commit.

### Task 4: Seed data

**Files:** Create `web/prisma/seed.ts`, `web/src/lib/placeholder.ts` (`photoUrl(seed, w, h)` → `https://picsum.photos/seed/${seed}/${w}/${h}`).

Seed exactly per spec: 30 businesses (all 12 categories spread over 5 cities, incl. Abyssinia Restaurant/London/4.8-ish, Habesha Market/Birmingham, Addis Solicitors/London; real-looking addresses, lat/lng per city center ± jitter, hours, 3–5 photos each, mixed plans/featured/verification levels, all APPROVED plus 2 PENDING for admin demo); 12 events across 7 types (incl. Ethiopian New Year–London–Sept 11 2026, Business Expo–Birmingham–Jul 24 2026, Habesha Concert–Manchester–Aug 8 2026; 1 PENDING); demo users admin/owner/organizer/user @ebh.uk (bcrypt "demo1234", roles set; owner owns 3 businesses, organizer owns events); ~80 reviews from 15 users with varied ratings/texts touching summary lexicon themes, some with ownerResponse; 4 ads (one per placement). Run `npm run db:setup`, verify counts via a quick script, commit.

### Task 5: Auth

**Files:** Create `web/src/lib/auth.ts`, `web/src/app/api/auth/{signup,signin,signout}/route.ts`, `web/src/app/auth/{signin,signup}/page.tsx`, `web/src/lib/session.ts`.

- `session.ts`: `createSession(userId, roles)` signs HS256 JWT (secret `process.env.AUTH_SECRET ?? "dev-secret-ebh"`, 30d) into `ebh_session` httpOnly cookie; `getSession()` reads/verifies from `cookies()`; `requireRole(role)` helper throws/redirects.
- `auth.ts`: `signUp(email, password, name)` (zod-validated, bcrypt hash, default role USER), `verifyCredentials`.
- API routes return JSON `{ok}` / 4xx with message; signin/signup pages are simple forms (client components posting fetch, redirect on success) showing demo credentials hint.
- Manual test: sign up, sign in as each demo user. Commit.

### Task 6: UI foundation

**Files:** Create `web/src/components/{Header,Footer,BusinessCard,EventCard,RatingStars,VerifiedBadge,FeaturedBadge,AdSlot,CategoryIcon,EmptyState,SectionHeading}.tsx`; modify `web/src/app/layout.tsx`, `globals.css`.

Design: photography-first cards, large rounded images, minimal text, trust badges (per PRD inspiration: Airbnb/Eventbrite/App Store). Palette: warm Ethiopian-inspired accents (green #078930, yellow #FCDD09, red #DA1212 used sparingly on neutral background), Inter/Geist font. Header: logo "Ethiopian Business Hub UK", nav (Businesses, Events, Concierge, Pricing), Sign In / List Your Business buttons, session-aware (server component reading `getSession()`). `AdSlot placement=` fetches active Ad and renders native-feeling sponsored card labelled "Sponsored". Commit.

### Task 7: Home page

**Files:** Replace `web/src/app/page.tsx`.

Sections per PRD wireframe: hero (headline "Discover Ethiopian Businesses, Events & Services Across the UK", search box → `/businesses?q=`, city chips → `/businesses?city=`, category quick links), Featured Businesses (3–6 featured, BusinessCard with rating/verified score/city/View Profile), AI Concierge teaser (sample prompt + link `/concierge`), Upcoming Events (next 3 by date, Get Tickets), Browse Categories grid (12), AdSlot HOME_HERO, Business Owner CTA banner → `/pricing`. Metadata + Organization JSON-LD. Commit.

### Task 8: Directory

**Files:** Create `web/src/app/businesses/page.tsx`, `web/src/components/FilterBar.tsx`, `web/src/lib/queries/businesses.ts`.

`searchBusinesses({q, category, city, minRating, openNow, verifiedOnly, page})` in queries: Prisma where on APPROVED + filters; q matches name/description/category; compute aggregate ratings; openNow filtered in JS via `isOpenNow`; featured first then rating desc. FilterBar = client component syncing to searchParams. Results grid of BusinessCards, AdSlot SEARCH_RESULTS injected after row 1, empty state. Track SEARCH_IMPRESSION fire-and-forget. Commit.

### Task 9: SEO landing pages + sitemap

**Files:** Create `web/src/app/[category]/[city]/page.tsx`, `web/src/app/sitemap.ts`, `web/src/app/robots.ts`, `web/src/lib/seo.ts`.

`generateStaticParams` = CATEGORIES × CITIES. Page: H1 "Ethiopian {Category} in {City}", intro paragraph, listing grid (reuse query), links to other cities/categories (internal linking), ItemList JSON-LD, canonical. Unknown combos → 404 via validation. `sitemap.ts` enumerates static pages + category/city combos + all business and event slugs. Commit.

### Task 10: Business detail

**Files:** Create `web/src/app/business/[slug]/page.tsx`, `web/src/components/{Gallery,OpeningHoursTable,MapEmbed,ReviewList,ReviewSummaryCard,TrackedLink.tsx}`, `web/src/app/api/track/route.ts`, `web/src/lib/queries/business.ts`.

- Page: gallery (hero + thumbs), name + VerifiedBadge w/ score + FeaturedBadge, rating stars + count, category/city links, description, contact block (phone & website via `TrackedLink` posting `{type, businessId}` to `/api/track` then navigating), socials, OpeningHoursTable with Open now pill, `MapEmbed` (OSM iframe bbox around lat/lng), ReviewSummaryCard (loves/dislikes via `summarizeReviews`), ReviewList with ownerResponse blocks, write-review CTA (signed-in) , claim banner if unclaimed → `/claim/[slug]`, AdSlot BUSINESS_DETAIL.
- Server records LISTING_VIEW on render. LocalBusiness + AggregateRating + Review JSON-LD. `generateMetadata` from business. Commit.

### Task 11: Reviews + favorites

**Files:** Create `web/src/app/api/businesses/[id]/reviews/route.ts` (POST, zod: rating 1–5 int, title ≤80, body 10–2000; 401 if no session; unique violation → 409 "one review per business"), `web/src/app/api/businesses/[id]/favorite/route.ts` (POST toggle), `web/src/app/business/[slug]/review/page.tsx` (form), `web/src/components/FavoriteButton.tsx`. Wire into detail page. Manual test signed-out (blocked) and signed-in (created, duplicate rejected). Commit.

### Task 12: Events

**Files:** Create `web/src/app/events/page.tsx`, `web/src/app/events/[city]/page.tsx`, `web/src/app/event/[slug]/page.tsx`, `web/src/lib/queries/events.ts`.

List: upcoming APPROVED ordered by startsAt, type filter chips, city pages like Task 9 (in sitemap). Detail: poster image, title, date/time, venue + MapEmbed, organizer name, description, priceFrom, Get Tickets `TrackedLink` (TICKET_CLICK) to ticketUrl, EVENT_VIEW on render, Event JSON-LD, AdSlot EVENT_DETAIL. Commit.

### Task 13: AI concierge

**Files:** Create `web/src/lib/ai/provider.ts`, `web/src/app/api/concierge/route.ts`, `web/src/app/concierge/page.tsx`, `web/src/components/ConciergeChat.tsx`.

`provider.ts`: `conciergeReply(message)` → `{text, recommendations: {type:"business"|"event", name, slug, reason}[]}`. Always: `parseConciergeQuery` → search businesses/events (capacity hint biases wedding/venue categories). If `ANTHROPIC_API_KEY` set, POST to Anthropic Messages API (`claude-haiku-4-5`, results as context, no SDK needed — plain fetch) to write `text`; else template a friendly reply from top matches. Chat UI: message list + input + suggested prompts ("Find a wedding venue for 250 guests in London"), renders recommendation cards linking to detail pages. Commit.

### Task 14: Pricing, advertise, claim

**Files:** Create `web/src/app/pricing/page.tsx`, `web/src/app/advertise/page.tsx`, `web/src/app/claim/[slug]/page.tsx`, `web/src/app/api/claim/route.ts`, `web/src/app/api/checkout/route.ts`, `web/src/lib/payments/provider.ts`.

- Pricing: 4 plan cards (Free / Verified £2.99 / Featured £4.99 / AI Toolkit £29) + event promotion £25–£250 + banners £50–£100 rows; CTA → signin or dashboard upgrade.
- `payments/provider.ts`: `startCheckout(plan, businessId)` — if `STRIPE_SECRET_KEY` set, placeholder branch returning "configure price IDs"; else dev-mode: immediately set business.plan (+verificationLevel bump for VERIFIED, featured=true for FEATURED) and return `{devMode: true}`.
- Claim: page explains email/phone verification; POST `/api/claim` creates ClaimRequest with 6-digit code; in dev mode response includes the code; second POST with code verifies → sets ownerId, claimedAt, verificationLevel ≥1 (2 if phone), adds BUSINESS_OWNER role. Commit.

### Task 15: Account page

**Files:** Create `web/src/app/account/page.tsx`. Auth-guarded: profile, favorites grid, my reviews list, followed businesses. Sign out button (POST signout). Commit.

### Task 16: Owner dashboard

**Files:** Create `web/src/app/dashboard/page.tsx`, `web/src/app/dashboard/business/[id]/{page.tsx,edit/page.tsx}`, `web/src/app/api/businesses/[id]/route.ts` (PATCH, owner-guarded, zod), `web/src/app/api/businesses/route.ts` (POST create → PENDING), `web/src/app/api/reviews/[id]/respond/route.ts`, `web/src/app/dashboard/new/page.tsx`, `web/src/components/AnalyticsCards.tsx`.

Dashboard lists owned businesses with plan badges + Upgrade buttons (POST `/api/checkout`). Per-business page: analytics cards (30-day LISTING_VIEW / PHONE_CLICK / WEBSITE_CLICK counts, review count + avg, simple search-rank note), reviews with respond form (sets ownerResponse), edit form (all listing fields + photo URL manager), create-listing form. Commit.

### Task 17: Organizer dashboard

**Files:** Create `web/src/app/dashboard/events/page.tsx`, `web/src/app/dashboard/events/new/page.tsx`, `web/src/app/dashboard/events/[id]/page.tsx`, `web/src/app/api/events/{route.ts,[id]/route.ts}`.

Create (→ PENDING) / edit / list own events; per-event analytics (EVENT_VIEW, TICKET_CLICK). Commit.

### Task 18: Admin

**Files:** Create `web/src/app/admin/page.tsx`, `web/src/app/admin/{businesses,events,reviews,ads}/page.tsx`, `web/src/app/api/admin/{businesses/[id],events/[id],reviews/[id],ads}/route.ts`.

ADMIN-guarded. Queues: pending businesses (approve/reject, set featured, set verificationLevel), pending events, all reviews (remove/restore), ads CRUD (placement, image, headline, target, active dates). Server actions or fetch POSTs; each action revalidates. Commit.

### Task 19: Verification + README

- [ ] `npx vitest run` all pass
- [ ] `npm run build` passes (fix any type/ESLint errors)
- [ ] Smoke test against dev server: home, /businesses?city=birmingham&category=restaurants, /restaurants/london, a business page (track click), review as user@ebh.uk, concierge query, pricing upgrade as owner@ebh.uk, admin approve pending business, sitemap.xml
- [ ] Repo-root `README.md`: what it is, quickstart (`cd web && npm i && npm run db:setup && npm run dev`), demo accounts, key URLs, how to activate Stripe/Anthropic later, phase 2 note
- [ ] Final commit

## Self-review notes

- Spec coverage checked: all spec pages/APIs map to Tasks 5–18; sitemap/robots Task 9; JSON-LD Tasks 7/9/10/12; tests Task 3; seed Task 4; follows feature folded into Account/detail pages (Follow button alongside Favorite — implemented in Task 11 with same toggle pattern, `/api/businesses/[id]/follow`).
- Types consistent: enums live in `lib/types.ts` only; domain functions named as in Task 3 and reused in 8/10/13.
