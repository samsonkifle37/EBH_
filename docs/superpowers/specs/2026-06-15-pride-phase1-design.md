# EBH Pride — Phase 1 Design

Date: 2026-06-15
Status: Approved (user-tightened scope)
North-star: monthly profile shares per claimed business.

## Scope (4 features only; defer all leaderboards/prestige/recap)

1. Rich profile: cover image, founder photo + story, brand story, signature
   items, verification panel.
2. Day-one badges: Founder Verified, Early Supporter, Verified Business.
3. Profile-completion engine: score, single next action, celebration.
4. Share engine: profile card, Instagram story, QR poster — auto-generated.

## Principles enforced

Owner is hero · profile = mini brand site · trust → NU (after trust) · no public
negative metrics · every achievement makes a shareable asset · premium at zero
data · founder story mandatory at claim · zero manual design for assets.

## Schema (Prisma/Neon; all nullable/defaulted so `db push` is safe)

- Business: `coverImageUrl String @default("")`, `founderName @default("")`,
  `founderPhotoUrl @default("")`, `founderStory @default("")`,
  `brandStory @default("")`, `yearFounded Int?`, `signatureItems String @default("[]")` (JSON array of {title, description, imageUrl}).
- ClaimRequest: `founderName @default("")`, `founderStory @default("")`.

Vercel build runs `prisma db push`, applying these to Neon on deploy.

## Logic (pure, tested)

- `lib/domain/badges.ts` → `earnedBadges(b)`: 
  - Founder Verified: ownerId set.
  - Verified Business: verificationLevel ≥ 2 OR plan !== "FREE".
  - Early Supporter: claimedAt set AND before EARLY_SUPPORTER_CUTOFF (constant; every current claimant qualifies — pride on day one).
  Returns [{key,label,explanation,tier}]; never empty for a claimed business.
- `lib/domain/profileCompletion.ts` → `profileCompletion(b)`: weighted signals
  (cover, founder photo, founder story, brand story, ≥1 signature item, phone,
  website, hours, ≥3 photos) → {score 0-100, items:[{label,done,points}],
  nextAction}. nextAction = highest-points incomplete item.

## Public profile redesign (/business/[slug])

Add, in order under the gallery: badge rail → founder block (photo + name +
story) → brand story (+ year founded) → signature items cards → verification
panel ("what's verified" from sources/level/CH/Google + last verified). Keep
reviews + NU callout. Premium empty states (no zeros). Owner-only "Share / get
your kit" entry.

## Claim flow

Claim form adds **required** founder name + founder story (min length). `/api/claim`
validates + stores on ClaimRequest. Admin approve (and dev-mode grant + Stripe
webhook grant via grantClaimOwnership) copies founderName/founderStory →
Business if the business has none yet.

## Owner dashboard (/owner/business/[id])

Completion ring + "Your next step: …" + badge chips earned. Celebration when
100%. Edit form (/dashboard/business/[id]/edit) extended with the rich fields.

## Share engine

`qrcode` dep. Routes (runtime nodejs): `/api/share/[slug]/card` (1200×630),
`/story` (1080×1920), `/poster` (1080×1350) via `next/og` ImageResponse —
dark-gold, ኑ motif, business name, location, top badge, QR to profile,
"Proud member of Ethiopian Business Hub UK." Owner "Share kit" page links/downloads
the three + logs `SHARE_CLICK`/share events. No manual design.

## Verify

tsc + vitest (badges, completion); deploy to Vercel (build pushes schema +
compiles); confirm profile + each share image render live.

## Risks / assumptions

- next/og asset routes must be public (no auth) so social scrapers fetch them —
  but they expose only public business info; fine.
- QR generation in nodejs runtime via qrcode.toDataURL embedded as <img>.
- Founder photo/cover upload UI: Phase 1 accepts image URLs in the edit form
  (no blob upload yet) to keep scope tight; flagged for Phase 2.
