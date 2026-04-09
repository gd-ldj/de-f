# External Integrations

**Analysis Date:** 2026-04-09

## APIs & External Services

**Authentication (Clerk):**
- `@clerk/clerk-react ^5.47.0` (`package.json:41`)
- Provider wired at `src/components/common/react/IdentityProvider.tsx:1` — `import { ClerkProvider } from '@clerk/clerk-react'`, mounted around children at `IdentityProvider.tsx:31-36`
- Hooks consumed:
  - `src/lib/useAuth.ts:1` — `useAuth as useClerkAuth`, `useClerk`
  - `src/components/common/react/ClerkApiTokenSync.tsx:1` — syncs Clerk JWT to backend
  - `src/components/common/react/AuthMount.tsx:16` — mounts auth-gated islands
  - `src/components/common/react/WalletPopover.tsx:2` — combined with wallet auth
- Backend exchange endpoint: `POST ${API_BASE_URL}/api/v1/auth/clerk` (`src/api/auth.ts:71`)
- Public frontend but authenticated islands for commenting/sharing/author follow

**Error Tracking (Sentry):**
- `@sentry/astro ^10.33.0` (`package.json:47`)
- Integration registered in Astro config: `astro.config.mts:7` (import), `:35-39` (dev), `:100-104` (prod)
- Config: `project: 'detake'`, `org: 'tadle'`, `dsn: process.env.SENTRY_DSN`
- Enabled in both dev and prod builds

**Device Fingerprinting (FingerprintJS):**
- `@fingerprintjs/fingerprintjs ^5.0.1` (`package.json:42`)
- Implementation: `src/lib/fingerprint.ts:1` — `import FingerprintJS from '@fingerprintjs/fingerprintjs'`
- Exports `getAnonymousPromoteCode()` — loads FP agent, calls `fp.get()`, uses first 8 chars of `visitorId` as stable anonymous promote code (`fingerprint.ts:12-27`)
- Persisted in `localStorage` under `anonymous_promote_code`
- Promise-cached + localStorage-cached to dedupe concurrent calls
- Graceful fallback to random 8-char code on failure (`fingerprint.ts:28-30+`)

**Wallet / Web3 Auth:**
- Custom implementation in `src/lib/useWalletAuth.ts` and `src/components/common/react/ConnectWallet.tsx`, `WalletPopover.tsx`
- Backend exchange endpoint: `POST ${API_BASE_URL}/api/v1/auth/wallet` (`src/api/auth.ts:26`)

## Backend API

**Base URL resolution:** `src/config/constants.ts:12-63` — `SITE_CONFIG.API_BASE_URL` is a computed getter that builds `https://{lang}-{domain}` from:
- `PUBLIC_SITE_ENV` (`beta` | `web2` | `web3` | `beta_dev`, default `beta`)
- `PUBLIC_SOURCE_LANGUAGE` (default `en`)

**API domains by environment (`src/config/constants.ts:17-30`):**

| Env | Client API | SSR API |
|---|---|---|
| `beta` | `beta-api.detake.com` | `beta-ssr-api.detake.com` |
| `web2` | `beta-api.detake.com` | `beta-ssr-api.detake.com` |
| `web3` | `api.detake.com` | `ssr-api.detake.com` |
| `beta_dev` | `preview-api.detake.com` | `preview-ssr-api.detake.com` |

Resolved examples: `https://en-beta-api.detake.com`, `https://zh-api.detake.com`, `https://ja-ssr-api.detake.com` (`constants.ts:41, 50`).

**SSR vs client selection pattern** (used across `src/api/*.ts`):
```ts
const getApiBaseUrl = () =>
  typeof window === 'undefined' ? SSR_API_BASE_URL : API_BASE_URL;
```
See `src/api/articles.ts:8`, `src/api/learn.ts:8`, `src/api/users.ts:8`.

**Shared SSR fetch helper:** `src/lib/serverFetch.ts`

**API Modules (`src/api/`):**

| File | Notable endpoints |
|---|---|
| `src/api/auth.ts` | `POST /api/v1/auth/wallet` (`:26`), `POST /api/v1/auth/clerk` (`:71`) |
| `src/api/articles.ts` | `GET /api/v1/articles/categories` (`:248`), `/api/v1/articles/business-types` (`:274`), `/api/v1/articles/tags` (`:300`), `/api/v1/articles/subcategories` (`:322`), `/api/v1/categories` (`:378`) |
| `src/api/users.ts` | `/api/v1/users/personal` (`:56`) and related user endpoints |
| `src/api/collections.ts` | Collections CRUD |
| `src/api/learn.ts` | Learn/education content |

All API calls use native `fetch` (no axios).

## Data Storage

**Databases:** None direct — all persistence via backend REST API on `*.detake.com` subdomains.

**Client Persistence:**
- `localStorage` — anonymous promote code (`src/lib/fingerprint.ts:15`), session/visitor analytics keys (see `STORAGE_KEYS` in `src/config/constants.ts`), auth token sync (`ClerkApiTokenSync.tsx`)
- Cookies — `ipcountry` (Cloudflare geo) and site language hints

## Deployment & Hosting

**Platform:** Vercel (serverless SSR)
- Adapter: `@astrojs/vercel ^8.2.6` (`package.json:40`)
- Registered: `astro.config.mts:19-23` (dev) and `:84-88` (prod)
- Local parity: `pnpm start` runs `vercel dev` (`package.json:10`)

**Production host resolution:** `astro.config.mts:13`
```ts
const productionHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
  'detake.news';
```

## Analytics & Monitoring

**Vercel Web Analytics:**
- Package: `@vercel/analytics ^1.5.0` (`package.json:52`)
- Enabled on the Vercel adapter: `webAnalytics: { enabled: true }` (`astro.config.mts:20-22, 85-87`)

**Sentry:** See Authentication section above — covers SSR + client runtime errors.

**Custom Analytics Pipeline:** `src/lib/analytics.ts`
- Integrates Cloudflare Visitor ID, GA client ID, device fingerprint into unified `VisitorData` (`analytics.ts:27-38`)
- Helpers in `docs/utils/` imported from `src/lib/analytics.ts:7-10`:
  - `cloudflare-cache.ts` — `getCloudflareData`
  - `ip-detector.ts` — `getComprehensiveIPInfo`
  - `device-signature.ts` — `generateDeviceSignature`
  - `cloudflare-visitor.ts` — `getCloudflareVisitorInfo`
- Cloudflare header passthrough route: `src/pages/api/cf-headers.ts`

**Tracking events / storage keys:** centralized in `src/config/constants.ts` (`STORAGE_KEYS`, `ANALYTICS_CONFIG`, `TRACKING_EVENTS`)

## Internationalization Backends

- `i18next-fs-backend ^2.6.0` — loads locale JSON from filesystem during SSR
- `i18next-http-backend ^3.0.2` — loads locale JSON over HTTP on the client
- Locale files live under `src/locales/**` and `public/locales/**` (latter is cspell-ignored in `package.json:114`)

## CI / Git Hooks

**Pre-push hook** (`simple-git-hooks`, `package.json:96-98`):
```
pnpm check:no-chinese-us && pnpm check:spelling
```
- `check:no-chinese-us` — custom script `check-no-chinese-us.js` blocks Chinese characters leaking into US-locale artifacts
- `check:spelling` — `cspell` scan over `src/**/*.{ts,tsx,js,jsx,astro}` using dictionaries `softwareTerms, typescript, css, html` (`package.json:99-161`)

**Playwright CI knobs** (`playwright.config.js`):
- `forbidOnly` in CI (`:27`), `retries: 2` (`:30`), single worker (`:33`)
- Traces off, screenshots/video off in CI (`:51-57`)

## Required Environment Variables

| Variable | Purpose | Reference |
|---|---|---|
| `PUBLIC_SITE_ENV` | Select API/SSR domain set | `src/config/constants.ts:14` |
| `PUBLIC_SOURCE_LANGUAGE` | Language prefix on API subdomain | `src/config/constants.ts:45, 54` |
| `SENTRY_DSN` | Sentry ingest | `astro.config.mts:38, 103` |
| `VERCEL_PROJECT_PRODUCTION_URL` | Canonical `site` URL | `astro.config.mts:13` |
| `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` | Fallback canonical URL | `astro.config.mts:13` |
| Clerk publishable key | Clerk provider init | `src/components/common/react/IdentityProvider.tsx` |
| `FULL_BROWSER` | Expand Playwright browser matrix | `playwright.config.js:17` |
| `CI` | CI-mode Playwright tuning | `playwright.config.js:27-57` |

**Secrets location:** `.env` family files (not read; may exist at repo root). Never committed.

## Webhooks & Callbacks

**Incoming:** None detected at `src/pages/api/` beyond `cf-headers.ts` passthrough.

**Outgoing:** All server-to-server calls go to DeTake backend (`*-{ssr-}api.detake.com`); no third-party webhooks dispatched from the frontend.

---

*Integration audit: 2026-04-09*
