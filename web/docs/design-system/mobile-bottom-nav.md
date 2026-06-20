# EBH Mobile Bottom Navigation — LOCKED

> **Status: 🚫 NON-NEGOTIABLE.** Order, labels, quantity, icons, and behaviour
> must not change without explicit product-owner approval. AI-generated layouts,
> A/B tests, refactors and new features must preserve this structure.

## The five tabs (exact order)

| # | Label | Route | Icon | Notes |
|---|-------|-------|------|-------|
| 1 | Home | `/` | House | Discovery, featured, search entry, popular categories, events |
| 2 | Search | `/search` | Magnifying glass | Advanced search, filters, **categories + cities** |
| 3 | List Business | `/list-business` | Plus circle | **Primary conversion** — elevated pill, larger target |
| 4 | For Businesses | `/for-businesses` | Briefcase | Owner hub — **replaces Messages**. Dashboard, analytics, verification, pricing, advertising, events, support |
| 5 | Profile | `/profile` | User | Account: sign in, saved, reviews, notifications, privacy, deletion |

```
[Home] [Search] [List Business (+)] [For Businesses] [Profile]
```

## Rules

- **Exactly 5 tabs.** No overflow menu, no horizontal scroll, max 5.
- **Fixed** to the bottom of the viewport; never scrolls with content; persists across primary screens.
- Hidden on owner/admin/auth dashboards (`/admin`, `/auth`, `/owner`, `/dashboard`) which have their own nav.
- **Safe areas:** respects iOS safe-area insets (`env(safe-area-inset-bottom)`) and Android gesture areas.
- **Touch targets ≥ 44 × 44 px.**
- **Visual:** white background, 1px top divider, very subtle elevation. Active = EBH green (`--color-ebh-green`); inactive = neutral gray.
- **a11y:** keyboard navigable, `aria-current="page"` on the active tab, `aria-label` per tab.

## Future features

Anything new must fit **inside one of the five tabs** — typically Profile or For
Businesses. Do **not** add Messages, Notifications, More, or Settings tabs.

## Implementation

- Component: [`src/components/MobileBottomNav.tsx`](../../src/components/MobileBottomNav.tsx)
- Mounted once in [`src/app/layout.tsx`](../../src/app/layout.tsx); content wrapper carries `pb-20 md:pb-0` so nothing hides behind the bar.
- Hidden at `md` and up (desktop uses the header nav).
