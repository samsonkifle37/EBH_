# Trust Filter — Auto-Approve High-Confidence Listings — Design

Date: 2026-06-13
Status: Approved (user PRD; extends OSM importer)
Source: "EBH Trust Filter: Auto-Approve Only High-Confidence Listings"

## Goal

Replace "all imported OSM records = pending" with a quality gate that
auto-approves only high-confidence listings, routes the rest into clear review
buckets, and surfaces moderation filters + dashboard metrics — cutting manual
moderation without lowering directory quality.

## Key decisions

1. **Dedicated auto-approval score**, separate from the public trust score.
   Per the PRD table: OSM source +10, website +10, phone +5, email +5, image +5.
   (Public "Trust Score" displayed on listings is unchanged.) A non-OSM source
   that is already a strong signal — Google Places / Companies House — also
   counts +10 so the evaluator generalises, but in practice this runs on OSM
   imports.
2. **Scope**: applied to new OSM imports *and* a one-time re-evaluation of the
   756 OSM records already pending. Google/CH listings (already moderated) are
   left untouched.
3. Auto-approval publishes a listing without human review — that is the stated
   objective; it only triggers when every gate passes.

## Gates (all required to auto-approve)

1. **hasImage** — ≥1 photo whose URL is non-empty and not a placeholder.
2. **hasContact** — phone OR website OR email present.
3. **valid name** — `name.length > 2` and not in the banned set
   (unknown, test, n/a, placeholder, none, null).
4. **not duplicate** — passes the existing dedup engine (already enforced in the
   import pipeline; duplicates never reach evaluation).
5. **autoApprovalScore ≥ 30**.

## Decision → status

- No image → `status=PENDING`, `reviewBucket="needs_enrichment"`,
  `approvalReason="Awaiting image enrichment"`. Hidden from the main queue.
- Image but no contact → `status=PENDING`, bucket "", reason
  "Missing contact information".
- Image + contact + valid name + score ≥ 30 → `status=APPROVED`,
  `verificationStatus="auto_verified"`, `approvedBy="system"`,
  `approvalReason="Trust Threshold Passed"`.
- Image + contact but score < 30 or invalid name → `status=PENDING`, reason
  "Below trust threshold" / "Name needs review".

## Schema additions (Business)

- `email String @default("")`
- `verificationStatus String @default("")` // "" | auto_verified
- `approvedBy String @default("")` // "" | system | <adminId>
- `approvalReason String @default("")`
- `reviewBucket String @default("")` // "" | needs_enrichment

## Domain: lib/domain/autoApproval.ts (TDD)

- `hasValidName(name): boolean`
- `isPlaceholderImage(url): boolean` (empty, picsum placeholder, example.com)
- `autoApprovalScore(ev): number` — OSM/Google/CH +10 each (capped at one
  "source" 10), website +10, phone +5, email +5, image +5.
- `evaluateListing(input): { status, verificationStatus, approvedBy,
  approvalReason, reviewBucket }` implementing the decision table above.

## OSM mapper

Parse `tags.image` (and `tags["image:0"]`) → first image URL; parse
`tags.email` / `tags["contact:email"]` → email. Pipeline creates a photo when an
image URL exists, sets `email`, then runs `evaluateListing` to set status fields.

## Admin filters (/admin/businesses?filter=…)

- `ready_to_approve` — pending, hasImage && hasContact
- `needs_image` — reviewBucket = needs_enrichment
- `needs_contact` — pending, hasImage && !hasContact
- `duplicate_candidates` — listings sharing a normalised name with another
- default queue **excludes** needs_enrichment records.

## Dashboard metrics (/admin/data-quality)

Cards: Approved Automatically (`approvedBy=system`), Pending Review,
Needs Image, Needs Contact Details, Duplicate Candidates, Trust Average
(mean dataConfidenceScore of approved).

## Backfill

Script re-evaluates every pending OSM listing through `evaluateListing` and
reports the resulting split (auto-approved / pending review / needs image).

## Testing

Vitest for `hasValidName`, `isPlaceholderImage`, `autoApprovalScore`,
`evaluateListing` (each decision branch), plus OSM mapper image/email mapping.
