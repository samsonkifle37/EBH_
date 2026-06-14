# Privilege Hardening — Design

Date: 2026-06-14
Status: Approved (from privilege audit; Rec 2 + Rec 1 Option B)

## Rec 2 — fail fast in production; no dev fallbacks in prod

- `lib/payments/config.ts`: `REQUIRED_STRIPE_ENV` list, pure `missingStripeEnv(env)`,
  `devFallbackAllowed(env)` (`NODE_ENV !== "production"`), and
  `assertStripeProductionConfig(env)` which throws if any var is missing while
  `NODE_ENV === "production"`.
- `src/instrumentation.ts` `register()` calls the assert on nodejs startup → the
  server refuses to boot in production without all Stripe env vars.
- Harden the two dev-fallback branches (`api/checkout`, `api/admin/claims/[id]`)
  with `devFallbackAllowed()`: in production they return/throw instead of
  applying, so no benefit is ever granted without Stripe.

## Rec 1 Option B — self-created listings: manage yes, owner benefits no

- Schema: add `Business.submittedById String?` (the creator) distinct from
  `ownerId` (the verified owner).
- `POST /api/businesses`: set `submittedById = user`, `ownerId = null`,
  status PENDING. **Do not** add BUSINESS_OWNER role; **do not** set ownerId
  (so no +20 owner trust, no owner-based ranking/verification).
- Edit rights (`PATCH /api/businesses/[id]`) and the owner area
  (`getOwnedBusiness`, `listOwnedBusinesses`) accept `ownerId === user` **or**
  `submittedById === user`, so the creator can manage their pending listing.
  Listings shown with a "Pending approval" badge when not yet owned.
- Admin approve (`POST /api/admin/businesses/[id]` action `approve`): when the
  business has `submittedById` and no `ownerId`, the same transaction grants
  ownership (`ownerId = submittedById`, `claimedAt`) and the BUSINESS_OWNER role.
  Owner trust (+20) only then applies. Imported listings (no submitter) are
  unaffected.

## Trust impact

`computeTrustV2` Owner-Claimed +20 keys off `ownerId`, which is now only set by
(a) admin approval of a submitted listing, (b) admin approval of a claim, or
(c) the Stripe-paid claim webhook. A self-created pending listing has
`ownerId = null` → 0 owner trust until approved.

## Tests

- `config.test.ts`: `missingStripeEnv` detects blanks; `assert` throws in prod
  when missing, passes in dev and when all present.
- Existing trust test already proves no +20 without ownership.
- Build + dev-mode smoke (create listing → no role/owner/trust → admin approve →
  ownership+role granted), reverted.
