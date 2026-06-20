# EBH Design System — Mobile Bottom Navigation

**Status: 🚫 LOCKED — NON-NEGOTIABLE**  
**Date locked: 2026-06-20**  
**Implemented in: `web/src/components/MobileBottomNav.tsx`**

The mobile bottom navigation is a core product rule. It must not be changed without
explicit approval from the product owner.

All future design iterations, A/B tests, refactors, feature additions, and AI-generated
layouts must preserve this navigation structure.

Any proposal that changes the order, labels, quantity, icons, or behaviour of these tabs
must be rejected unless specifically requested.

---

## Locked tab structure

Exactly **5 tabs** in this **exact order**:

| # | Label | Route | Icon | Notes |
|---|-------|-------|------|-------|
| 1 | Home | `/` | House | Exact match |
| 2 | Search | `/search` | Magnifying Glass | Forwards to `/businesses` |
| 3 | List Business | `/list-business` | Plus Circle | **Primary CTA — elevated treatment** |
| 4 | For Businesses | `/for-businesses` | Briefcase | Replaces Messages |
| 5 | Profile | `/profile` | User | Redirects to `/account` or sign-in |

**No overflow menu. No horizontal scrolling. Maximum 5 tabs.**

---

## Tab information architecture

### 1. Home `/`
Discovery, featured businesses, search entry point, popular categories, events, recommendations.

### 2. Search `/search`
Advanced search, filters, categories, cities, saved searches. Routes to `/businesses`.

### 3. List Business `/list-business` ⭐ PRIMARY CTA
- Add a new business
- Claim an existing business  
- Start verification

Visual treatment: highest emphasis, elevated circular button, larger touch target.

### 4. For Businesses `/for-businesses`
Dedicated owner hub:
- Owner dashboard & analytics
- Verification benefits
- Pricing
- Trust score explanation
- Advertising options
- Event promotion
- Help centre & support

**Replaces: Messages** — the app does not require a messaging tab.

### 5. Profile `/profile`
User account management:
- Sign in
- Saved businesses
- Reviews
- Notifications
- Preferences
- Account deletion
- Privacy settings

---

## Design requirements

- Fixed to bottom of viewport
- Respects iOS safe-area insets (`env(safe-area-inset-bottom)`)
- Respects Android gesture navigation areas
- Persists across all primary screens
- Remains visible during navigation
- Never scrolls with content
- Minimum touch target: **44 × 44 px**

### Visual style

| Element | Value |
|---------|-------|
| Background | White |
| Active state | EBH Green (`#15613e`) |
| Inactive state | Neutral Gray |
| Top border | 1px `border-neutral-200` |
| Shadow | Subtle `shadow-[0_-1px_4px_rgba(0,0,0,0.07)]` |

### Hidden on
- `/admin/*` — admin has its own nav
- `/auth/*` — authentication flows
- `/owner/*` — owner dashboard has its own nav
- `/dashboard/*` — dashboard has its own nav
- `md:` breakpoint and above — desktop uses the header nav

---

## Homepage simplification rules

The homepage must NOT repeat navigation elements that exist in the bottom nav.

**Allowed once:**
1. Hero headline
2. Search bar
3. Single location entry point
4. Popular categories
5. Featured businesses
6. Events (optional)
7. Trust indicators

**Do NOT repeat:** category filters, city chips, search inputs, navigation actions.
Each action should exist only once. Optimise for clarity over feature density.

---

## Future features

Any future functionality must fit inside one of the five existing tabs.

**Do NOT add:** Messages tab, Notifications tab, More tab, Settings tab.

Place those features inside **Profile** or **For Businesses** without changing the bottom navigation.

---

## Acceptance criteria

The mobile app passes review only if:
- [ ] Bottom navigation matches this specification exactly
- [ ] Navigation order never changes
- [ ] No duplicate filters exist on the homepage
- [ ] "For Businesses" replaces "Messages"
- [ ] Navigation remains persistent across all primary screens
- [ ] Safe-area support works correctly (`env(safe-area-inset-bottom)`)
- [ ] All tabs are accessible via keyboard and screen readers (`aria-label`, `aria-current`)
- [ ] Minimum 44 × 44 px touch targets
