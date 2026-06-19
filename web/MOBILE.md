# EBH Native App (Capacitor) — Build & Release Runbook

Hybrid architecture: the native shell loads the production web app in a WebView;
native features are bridged via Capacitor plugins. Source of truth = the Next.js
app. App name **Ethiopian Business Hub**, App ID **uk.ebh.app**.

---

## What's in the repo now (committed, web-verified)

- `capacitor.config.ts` — appId/appName, `server.url` = prod, `appendUserAgent: "EBHApp"`, splash/status-bar/push config. **No localhost, no secrets.**
- `src/lib/native/platform.ts` — client native detection (UA-based, SSR-safe) + lazy plugin wrappers (`nativeShare`, `tapHaptic`, `nativePickPhoto`).
- `src/lib/native/server.ts` — `isNativeRequest()` (UA) for server-side gating.
- `components/NativeBootstrap.tsx` — splash hide, status bar, Android back, deep-link routing, native offline overlay (mounted in layout; no-op on web).
- `components/NativePushPrompt.tsx` — soft-ask → permission → register → `POST /api/devices`.
- Payments gated out of native: `/pricing`, `UpgradeButtons`, `ClaimActivateButton`, **and `POST /api/checkout` 403s native requests** (Apple 3.1.1 / Play Billing).
- Native share (`ShareButton`) + native camera (`ImageUploadField`).
- `prisma`: `DeviceToken` model; `POST/DELETE /api/devices`.
- `next.config.ts` — security headers (HSTS, nosniff, Referrer-Policy, X-Frame-Options DENY, Permissions-Policy) + **CSP in Report-Only** (tighten + enforce after native validation).

Installed plugins: app, browser, camera, device, geolocation, haptics, network, preferences, push-notifications, share, status-bar, splash-screen.

---

## ⛔ Blocked — needs a Mac/Android SDK + accounts (cannot run on this Windows box)

```bash
# from web/ — generate native projects (Mac for iOS; Android Studio/SDK for Android)
npx cap add ios
npx cap add android
npx cap sync
# iOS build/run: macOS + Xcode (or cloud Mac CI: Codemagic / Ionic Appflow / GitHub Actions macOS)
npx cap open ios
npx cap open android
```

External dependencies to provision:
- **Apple Developer Program** ($99/yr) + **Google Play Console** ($25).
- **macOS/Xcode** or a cloud-Mac CI for iOS builds.
- **Firebase project** → `google-services.json` (Android FCM) + APNs key (iOS push).
- **Custom domain `ethiopianbh.com`** (recommended) → switch `PROD_URL` in `capacitor.config.ts`.
- **App icons & splash** (`@capacitor/assets`): iOS 1024 (no alpha), Android adaptive (432 fg + bg) + 512, splash 2732².

---

## Deep links (to wire during native build)

- iOS Universal Links: host `/.well-known/apple-app-site-association` (no extension, `application/json`) with the app's Team ID + bundle.
- Android App Links: host `/.well-known/assetlinks.json` with the SHA-256 signing cert.
- Custom scheme `ebh://` handled in `NativeBootstrap` (`appUrlOpen`). Map `https://ethiopianbh.com/business/[slug]`, `/event/[slug]`, `/claim/[slug]` → in-app routes.

## Push (server send — needs FCM/APNs creds)

`DeviceToken` + `/api/devices` store tokens. A send service (FCM HTTP v1 / APNs) is **not** wired (needs credentials) — hook it into: claim approval (`grant.ts`), review responses, event reminders, trust-score changes.

---

## Payment strategy (decided)

Digital subscriptions are **web-only**. Native apps show status + benefits, **no purchase UI, no external checkout link** (iOS), enforced at UI **and** API (`/api/checkout` → 403 on native). ✅ Apple 3.1.1 / Play Billing compliant.

## Privacy — Apple labels / Play Data Safety

| Data | Collected | Linked | Purpose | Tracking |
|---|---|---|---|---|
| Email, name | Yes | Yes | Account / app functionality | No |
| Content (reviews, claims, founder story, photos) | Yes | Yes | App functionality | No |
| Coarse location (opt-in) | Yes | No | "Near me" discovery | No |
| Anonymous analytics id (`ebh_vid`) | Yes | No | Analytics | No |
| Diagnostics (after Sentry) | Yes | No | App functionality | No |

Sharing: **none**. Encryption in transit: **yes**. Deletion: **in-app + web URL**. **No Advertising ID, no IDFA, no ATT, no background location.** In-app: Privacy `/privacy`, Terms `/terms`, Account deletion `/account`, Report `/report` — all exist.

## Store assets checklist
iOS icon 1024 · Android adaptive+512 · splash · real screenshots (iPhone 6.7"/6.5", iPad if enabled; Android phone+7"+10"; feature graphic 1024×500) · descriptions matching features · **no placeholder/mockups**.

---

## Release

**TestFlight:** signed release build · reviewer demo account (real, non-public) · review notes (web-only upgrades, location opt-in) · push verified on device · deep links resolve · offline overlay verified · no localhost.
**Play Internal/Closed testing:** signed AAB, current target SDK · Data Safety submitted · permissions minimal · **closed test (12 testers × 14 days)** if a new personal account · staged rollout.
**Crash reporting:** add `@sentry/capacitor` + `@sentry/nextjs` with `SENTRY_DSN` (env); upload source maps; alert on crash-free-rate drop. *(Not installed — needs DSN.)*
**Rollback:** web regressions roll back instantly via **Vercel redeploy/rollback** (no store release). Native-shell issues → halt **staged rollout** (Play) / **phased release** (App Store) and resubmit prior binary.

---

## Remaining blockers & Go/No-Go

| Blocker | Type |
|---|---|
| `cap add ios/android` + binaries | needs Mac/Android SDK |
| Apple/Play/Firebase accounts | external |
| Custom domain + AASA/assetlinks | external + config |
| App icons/splash/screenshots | asset creation |
| Push send service | needs FCM/APNs creds |
| Deploy security batch (`AUTH_SECRET`) + rotate demo/Neon/Google creds | prod env / ops |
| QR scanner + "near me" | scaffolding present; wire during native build (QR needs `@capacitor-mlkit/barcode-scanning`) |
| CSP enforce (from Report-Only) | validate in native build first |

**Go/No-Go: NO GO** to submit (no binary yet). The web-side native layer, compliance gating, and security headers are **done and verified (tsc + 221 tests + lint)**; the path to GO is the external/native steps above.
