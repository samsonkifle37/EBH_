# Real Data Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Source-tracked real data only: importers (Google Places, Companies House) into a pending queue, dedup/matching, evidence-based trust scores, demo-data kill switch, data-quality dashboard.

**Architecture:** New Prisma models (BusinessSource, EventSource, ImportJob) + source fields on Business. Pure logic (trust, matching, response mapping) in `lib/domain/`, HTTP clients in `lib/import/`, admin-guarded API routes + admin pages. A single `allowDemoData()` flag gates every public query.

**Tech Stack:** unchanged (Next 16, Prisma 6/SQLite, Vitest).

All paths relative to `web/`. Commit after each task.

### Task 1: Schema + flag + seed marking
- [ ] Add source fields to Business; add BusinessSource, EventSource, ImportJob models; `npx prisma db push`
- [ ] `lib/flags.ts`: `allowDemoData()` → `process.env.ALLOW_DEMO_DATA === "true"`
- [ ] Seed: mark all businesses/events `sourceType:"demo"`, create demo *Source rows; set `ALLOW_DEMO_DATA=true` + key placeholders in `.env`; reseed
- [ ] Commit

### Task 2: Trust + matching domain logic (TDD)
- [ ] `lib/domain/trust.ts`: `trustScore({hasGooglePlace, hasPhone, hasWebsite, hasCompaniesHouseMatch, ownerClaimed, hasPhotos})` = 30/20/20/15/10/5, cap 100. Tests first.
- [ ] `lib/domain/match.ts`: `normalizeName` (lowercase, strip ltd/limited/the/punct), `normalizePhone` (+44→0, digits only), `websiteHost`, `findDuplicate(candidate, existing[])` matching on placeId, companyNumber, phone, host, name+postcode-prefix → `{index, reason} | null`. Tests first.
- [ ] Replace public score display source: business queries compute evidence-based trust score (uses BusinessSource rows + fields). Keep verificationLevel badge logic.
- [ ] Commit

### Task 3: Importer clients + mappers (TDD on mappers)
- [ ] `lib/domain/importMap.ts`: `mapPlaceToBusiness(place)` (Places API New searchText result → business fields incl. category guess from query, city detection from address, weekday hours → OpeningHours JSON) and `mapCompanyToBusiness(item)` (CH search item → fields, registered office address). Tests with fixture JSON.
- [ ] `lib/import/googlePlaces.ts`: `searchPlaces(query)` POST `https://places.googleapis.com/v1/places:searchText` with `X-Goog-Api-Key` + field mask (id, displayName, formattedAddress, location, nationalPhoneNumber, websiteUri, regularOpeningHours, rating, userRatingCount, businessStatus, photos, googleMapsUri). Throws descriptive error without key.
- [ ] `lib/import/companiesHouse.ts`: `searchCompanies(term)` GET `https://api.company-information.service.gov.uk/search/companies?q=` basic auth key. Same error handling.
- [ ] `lib/import/pipeline.ts`: `runImport(type, query, adminUserId)` — creates ImportJob, fetches, maps, dedups via `findDuplicate` against all businesses (CH dup → attach CH source to matched business, set companyNumber, recompute confidence), inserts PENDING businesses with photos (Google photo media URLs) + source rows, updates job counts/errors.
- [ ] Commit

### Task 4: Admin import UI + APIs
- [ ] `app/api/admin/import/route.ts` POST {type, query} (ADMIN-guarded) → runImport result
- [ ] `app/admin/import/google-places/page.tsx` + `app/admin/import/companies-house/page.tsx`: preset query buttons (spec lists), custom input, recent ImportJobs table, key-missing banner with setup instructions
- [ ] Commit

### Task 5: Admin queue enhancements + merge
- [ ] `app/api/admin/businesses/[id]/route.ts`: extend PATCH actions — approve/reject (existing), `merge` {intoId} (move sources/photos/reviews/favorites/claims, delete record), `update` {category, city, verificationLevel}
- [ ] `/admin/businesses`: show source badge + confidence per row, merge-into select, category/city editors, verification level setter
- [ ] Commit

### Task 6: Demo gating + public UI
- [ ] All public queries (home, directory, SEO pages, business/event detail, sitemap, concierge retrieval) exclude `sourceType:"demo"` unless `allowDemoData()`
- [ ] Business page: trust line "Trust Score: N/100 · Based on verified public data"; Google rating block w/ maps link or "No rating yet"; "No reviews yet. Be the first to review."; claim CTA "Own this business? Claim this listing from £2.99/month." on all unclaimed
- [ ] SEO + directory empty state: "No verified businesses listed yet. Are you a business owner? List your business." → /pricing
- [ ] Events: require ticketUrl-or-venue fields on create (zod already); EventSource row on create (owner_submitted / admin_created)
- [ ] Commit

### Task 7: Data quality dashboard
- [ ] `app/admin/data-quality/page.tsx`: counts — total, by sourceType, pending/approved/rejected, duplicates (from ImportJob sums), missing phone/website/photos, CH-matched, **sourceless (flagged red)**; link rows to admin queue
- [ ] Commit

### Task 8: Verify + report
- [ ] `npx vitest run` (old + new) pass; `npm run build` pass
- [ ] Smoke: `ALLOW_DEMO_DATA=false` run → home/directory/SEO show empty states, zero demo listings, sitemap excludes demo; flag true restores; import route without key returns clear error + failed job recorded
- [ ] README section "Real data & importers"; final report (records disabled, imports run, pending/approved counts, API errors)
- [ ] Commit + merge
