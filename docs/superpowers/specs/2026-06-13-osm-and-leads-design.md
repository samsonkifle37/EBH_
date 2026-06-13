# OSM Importer + Manual Lead Capture — Design

Date: 2026-06-13
Status: Approved (user-provided PRD; reuses existing importer architecture)
Source: "PRD: OpenStreetMap Importer & Manual Lead Capture System"

## Goal

Two new free data-acquisition paths feeding the same pending-approval queue:
1. **OpenStreetMap importer** — Overpass API, no key, ODbL-attributed.
2. **Manual lead capture** — structured admin intake for community-sourced leads.

Both reuse ImportJob, BusinessSource, the dedup engine, the trust engine, and
the existing admin import UI. No bespoke workflows.

## Source types

- `openstreetmap` — `sourceId = {type}/{osm_id}` (e.g. `node/123`),
  `sourceUrl = https://www.openstreetmap.org/{type}/{id}`.
- Manual leads use the channel as `sourceType`: `facebook_page`, `instagram`,
  `community_referral`, `flyer`, `other`. A helper `isManualLeadSource()`
  classifies them.

## Trust scoring (extended, evidence-based)

Add two evidence slots (cap stays 100):
- OpenStreetMap source: **+10** (corroborates, not primary)
- Manual lead: **+5** (manually sourced)

`TrustEvidence` gains `hasOsmSource` and `hasManualLead`; `TrustInput` gains the
same as optional (default false) so existing callers are unaffected. Public
score derivation reads the business's `sourceType` + its `BusinessSource` rows.

## Deduplication (extended)

`MatchCandidate` gains optional `lat`/`lng`. `findDuplicate` adds a final
**geo-proximity** check: if both candidate and existing have coordinates and are
within **50 m** (haversine), match with reason `geo_proximity`. Strong signals
(place id, company number, phone, website, name+postcode) still take priority.
`loadCandidates` now selects lat/lng so OSM records match existing listings.

## ImportJob (extended)

Add `skipped Int @default(0)` and `durationMs Int?`. All branches now count
skipped records (missing name, non-operational, dissolved). `ImportResult` gains
`skipped`. Raw errors persist in `errors` (existing field = error_log).

## OSM importer

- `lib/import/openStreetMap.ts`: `fetchOverpass()` POSTs the exact PRD Overpass
  query (`data=`) to `OVERPASS_API_URL` (default
  `https://overpass-api.de/api/interpreter`). A module-level rate limiter
  enforces a **2 s gap between requests**, shared across jobs. Captures HTTP /
  timeout / invalid-JSON / rate-limit / network failures into the job error log.
- `lib/domain/importMap.ts`: `mapOsmElement(el)` → name (skip if null), coords
  (node: lat/lon; way/relation: center.lat/lon), address assembled from
  `addr:housenumber/street/city/postcode`, phone (`phone` → `contact:phone`),
  website (`website` → `contact:website`), opening hours (`opening_hours`),
  category guess from `cuisine`/`amenity`/`shop`, raw tags retained.
- Pipeline: `runImport("openstreetmap", label)` fetches once, maps each element,
  dedups (geo-aware), creates PENDING or attaches an `openstreetmap`
  BusinessSource + recomputes confidence on a match.

## Admin pages

- `/admin/import/openstreetmap` — mirrors `/admin/import/google-places`: a single
  "Run import" button (no query box), job history table, error panel, ODbL note.
- `/admin/import/leads` — fast mobile-friendly form: business name + source type
  (dropdown) + source URL required; optional city, category, phone, website,
  notes. On submit runs dedup; if a likely match exists, returns a warning with
  the existing record and lets the admin "Add anyway". Session activity list
  shows records added this session (name, source, time, status). Creates PENDING
  + a BusinessSource with `created_by_admin`/`created_at` in rawData.
- Both ADMIN-only (403 otherwise), linked from `/admin`.

## Testing

Fixture tests (before live calls) for `mapOsmElement` covering node, way, and
relation, asserting field mapping, address assembly, phone/website extraction,
coordinate extraction, and source-metadata generation (100% mapping coverage).
Plus geo-proximity dedup tests and extended trust tests.

## Out of scope

Self-hosted Overpass (env var supports it). No scraping for leads — manual entry
only. No changes to Google/CH behaviour beyond shared skipped-counting + geo dedup.
