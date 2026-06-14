# Milestone B — Stripe Integration — Design

Date: 2026-06-14
Status: Approved (user confirmed pay-to-activate + subscription split)
Source: "Milestone B — Stripe integration"

## Decisions (confirmed)

- **Paid claim = pay-to-activate**: charge £9.99 only after an admin approves
  the claim; ownership is granted by the **webhook** on successful payment.
- **Products**: Verified £2.99/mo and Featured £4.99/mo are recurring
  **subscriptions**; paid claim £9.99 is a **one-time** payment. AI Toolkit out
  of scope.
- **No hardcoded Stripe IDs** — price ids come from env.
- **Dev-mode fallback**: when Stripe env is absent, checkout and claim activation
  apply immediately (as the prior stub did) so the app stays usable pre-keys.
  Live behaviour activates automatically once `STRIPE_SECRET_KEY` is set.

## Env (user adds real values later)

```
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
STRIPE_PRICE_VERIFIED, STRIPE_PRICE_FEATURED, STRIPE_PRICE_CLAIM,
NEXT_PUBLIC_SITE_URL
```

## Files

- `lib/payments/stripe.ts` — singleton `getStripe()`, `stripeConfigured()`,
  and a typed `PRODUCTS` map: VERIFIED/FEATURED (mode `subscription`, planType,
  amount pence, price env key) + CLAIM (mode `payment`, 999). `priceId(product)`
  reads env and throws a descriptive error if missing.
- `lib/payments/events.ts` — **pure** `interpretEvent(event) → WebhookAction |
  null`. Maps Stripe events to intent:
  - `checkout.session.completed`: metadata.product CLAIM → `claim_paid`;
    VERIFIED/FEATURED → `subscription_active`.
  - `invoice.paid` → `subscription_renewed`.
  - `customer.subscription.deleted` → `subscription_downgrade`.
  - `invoice.payment_failed` → `payment_failed`.
  - anything else → null.
- `lib/payments/webhook.ts` — `handleStripeEvent(event, deps)`: idempotency
  (`deps.isProcessed`/`markProcessed`) then `deps.apply(action)`. Generic over
  deps so it unit-tests with an in-memory store + mock applier; the route backs
  deps with Prisma.
- `lib/payments/grant.ts` — `grantClaimOwnership(db, claimId, paymentAmount)`:
  single source of truth used by the webhook applier *and* the admin dev
  fallback. Sets claim `paymentStatus=paid`, business `ownerId/claimedAt/level`,
  adds BUSINESS_OWNER role, writes a `Payment{kind:"claim"}` row. Idempotent
  (no-op if already owned).
- `app/api/checkout/route.ts` — rewritten. Validates product + target, owner/
  claimant guard. Configured → create Checkout session (subscription or payment)
  with metadata {product, businessId?, userId, claimId?, subscriptionRowId?},
  pre-create a `Subscription{status:pending}` row for subs, return `{url}`.
  Not configured → dev-mode immediate apply (`{devMode:true,message}`).
- `app/api/webhooks/stripe/route.ts` — `runtime=nodejs`; read raw body;
  `stripe.webhooks.constructEvent(raw, sig, whsec)`; build Prisma-backed deps;
  `handleStripeEvent`. Returns 400 on bad signature, 200 otherwise.
- `app/api/admin/claims/[id]/route.ts` — approve no longer grants ownership when
  Stripe is configured (sets `approved`, awaits payment). When **not**
  configured, dev fallback calls `grantClaimOwnership` immediately.
- UI: `UpgradeButtons` + pricing redirect to `data.url` when present (else show
  dev message). New "Activate ownership — £9.99" button on an approved,
  unpaid claim (claim page) → checkout product CLAIM.

## Schema

Add `ProcessedStripeEvent { id String @id  // stripe event id; type String;
createdAt DateTime @default(now()) }`. Subscription/Payment already have all
needed columns (stripeCustomerId, stripeSubscriptionId, currentPeriodEnd,
stripePaymentId, amount, planType, status, paymentStatus).

## Applier (route deps, Prisma-backed)

- `subscription_active`: mark the pre-created Subscription row `active`, set
  stripeSubscriptionId/customerId/currentPeriodEnd, set business.plan =
  planType (+ featured=true for FEATURED), write `Payment{kind:"subscription"}`.
- `subscription_renewed`: keep active, extend currentPeriodEnd, write Payment.
- `subscription_downgrade`: subscription `cancelled`; business.plan=FREE,
  featured=false.
- `payment_failed`: subscription `past_due` (kept; auto-downgrade on the delete
  event Stripe sends after retries exhaust).
- `claim_paid`: `grantClaimOwnership`.

## Tests (Vitest, no DB / no real keys)

- `events.test.ts`: each event type → correct action; unknown → null.
- `webhook.test.ts`: idempotency (same event id twice → apply called once) via
  Map-backed store; apply receives the interpreted action.
- `stripe.test.ts`: `priceId` throws when env missing; PRODUCTS shape/modes.
- signature: `constructEvent` accepts a `generateTestHeaderString` payload with a
  known secret and rejects a tampered one.
- applier dispatch: a mock-deps test asserting each action calls the right dep.

## Smoke test (later, needs keys)

`stripe listen --forward-to localhost:3000/api/webhooks/stripe`, card 4242…,
one subscription + one claim activation, confirm rows + ownership + revenue,
then **revert all test rows** (subscriptions, payments, processed events,
ownership). Test mode only; no live charges.
