# EBH Real Data Population Upgrade — Design

Date: 2026-06-12
Status: Approved (user-provided requirements doc; decisions below)
Source: User spec "EBH Real Data Population Upgrade"

## Goal

Only real, source-tracked businesses and events appear publicly. All imports land
in a pending admin-approval queue. Seeded demo data is flagged and hidden unless
`ALLOW_DEMO_DATA=true`.

## Decisions / deviations from the raw spec

1. **SQLite + Prisma stays.** Spec table names map to Prisma models:
   `business_sources`→BusinessSource, `event_sources`→EventSource,
   `import_jobs`→ImportJob. `business_verification` is consolidated into the
   existing Business verification fields plus BusinessSource evidence rows
   (one table fewer, same information, simpler joins).
2. **Demo data is disabled, not deleted**, via `sourceType="demo"` +
   `ALLOW_DEMO_DATA` env flag (default **false** = hidden). Local .env sets
   `true` so the local site stays browsable; production must set `false` or
   omit. This satisfies "delete or disable in production".
3. **Google reviews are not stored.** Only `googleRating`, `googleReviewCount`,
   and `mapsUrl` (link out) per Places ToS. Missing rating → "No rating yet".
4. **Trust score becomes evidence-based** and replaces the old
   completeness-based score everywhere it is displayed:
   +30 Google Place, +20 phone, +20 website, +15 Companies House match,
   +10 owner claimed, +5 photos (≥1). Max 100. Shown as
   "Trust Score: N/100 — based on verified public data".
5. **Importers require keys** (`GOOGLE_PLACES_API_KEY`,
   `COMPANIES_HOUSE_API_KEY` in web/.env). Without keys the admin UI shows
   setup instructions and jobs fail gracefully with a recorded error. Google
   uses Places API (New) `places:searchText` + photo media endpoint; Companies
   House uses `GET /search/companies` with the key as basic-auth username.
6. **Companies House records never auto-publish.** They import as
   `status=PENDING` and are primarily used to corroborate (match) Places/owner
   listings; admin may approve a CH-only record manually.

## Schema additions

Business gains: `sourceType` ("google_places"|"companies_house"|
"owner_submitted"|"admin_created"|"demo"), `sourceId`, `sourceUrl`,
`lastSourceCheckedAt`, `dataConfidenceScore` (0-100), `googleRating?`,
`googleReviewCount?`, `mapsUrl`, `companyNumber`.

- **BusinessSource**: businessId, sourceType, sourceId, sourceUrl, rawData
  (JSON), fetchedAt. Unique (sourceType, sourceId). A business matched in both
  systems has two rows.
- **EventSource**: eventId, sourceType ("owner_submitted"|"admin_created"|
  "demo"), sourceId, sourceUrl, createdAt.
- **ImportJob**: type ("google_places"|"companies_house"), query, status
  ("running"|"completed"|"failed"), found, imported, duplicates, errors (text),
  startedAt, finishedAt.

Seed updates: all seeded businesses/events get sourceType="demo" + an
*Source row; demo reviews stay attached to demo businesses (hidden together).

## Pipeline

Import (admin-triggered, per query) → normalize fields → dedup against existing
(place id / company number / phone / website / name+postcode similarity) →
insert as PENDING with source row + confidence score, or record as duplicate
(optionally attach CH source row to the matched business and bump confidence)
→ admin queue (approve / reject / merge / edit category / assign city / mark
verified) → public.

Matching logic in `lib/domain/match.ts` (pure, tested): normalized name
(strip LTD/LIMITED/punctuation), phone normalization (UK +44 → 0), website
host comparison, postcode-prefix match. `findDuplicate(candidate, existing[])`
returns match + reason.

## Admin surface

- `/admin/import/google-places` — preset query list from the spec, custom
  query box, runs import, shows job results.
- `/admin/import/companies-house` — preset name terms from the spec, runs
  search import.
- `/admin/data-quality` — totals (imported/pending/approved/rejected/
  duplicates), missing phone/website/photos, CH-matched, sourceless (flagged).
- `/admin/businesses` queue gains: merge-into picker, category/city edit,
  verification level set (existing approve/reject stay).

## Public UI changes

- Trust score line on business pages + cards use evidence-based score.
- Google-sourced listings show Google rating ("4.5★ on Google (123)") linking
  to mapsUrl; platform reviews shown separately; "No rating yet" / "No reviews
  yet. Be the first to review." empty states.
- Every unclaimed listing: "Own this business? Claim this listing from
  £2.99/month."
- SEO category/city pages with no real approved listings: "No verified
  businesses listed yet. Are you a business owner? List your business."
- Events show only organizer/admin-created or approved submissions; no
  attendee counts anywhere.

## Acceptance verification

Tests pass (existing + new trust/match/importer-mapping tests), build passes,
smoke: demo flag off hides all demo data and SEO pages show empty states;
import endpoints fail gracefully without keys; final report with counts.
