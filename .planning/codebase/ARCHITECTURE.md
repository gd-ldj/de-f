# Architecture

**Analysis Date:** 2026-04-09

## Pattern Overview

**Overall:** Astro SSR site with React islands, deployed as Vercel serverless functions. Astro owns routing, page shells, SEO, and static/server-rendered content; React owns interactive widgets.

**Key Characteristics:**
- SSR-first (`output: 'server'` in `astro.config.mts`) with `@astrojs/vercel` adapter
- Multi-region routing via Astro's native i18n (`us` default, `asia` prefixed) plus separate `[translationLang]` dynamic segment for translated article variants
- Clear Astro vs React split by folder convention (`astro/` and `react/` subfolders under each component domain)
- Global state via Jotai; remote data via TanStack React Query (client) and direct fetchers in Astro frontmatter (server)
- Event bus via `document.dispatchEvent` + `CustomEvent` for decoupled filter coordination

## Layers

**Pages / Routing (Astro):**
- Purpose: URL routing, data fetching in frontmatter, SEO meta, page composition
- Location: `src/pages/`
- Contains: `.astro` pages, API routes (`src/pages/api/`), sitemap generators
- Depends on: `src/layouts/BaseLayout.astro`, `src/api/*`, Astro components
- Used by: Astro router (file-based)

**Layouts (Astro):**
- Purpose: Global HTML shell, SEO, analytics, header/footer injection
- Location: `src/layouts/BaseLayout.astro`

**Components — Astro (SSR):**
- Purpose: Server-rendered markup for content-heavy, non-interactive UI (article body, cards, SEO blocks, headers)
- Location: `src/components/**/astro/*.astro`
- Examples: `src/components/article/astro/ArticleContent.astro`, `src/components/home/astro/NewsSection.astro`, `src/components/common/astro/ArticleCard.astro`

**Components — React (Client islands):**
- Purpose: Interactive widgets hydrated on the client via Astro's `client:*` directives
- Location: `src/components/**/react/*.tsx`
- Examples: `src/components/common/react/FilterBar.tsx`, `src/components/pages/CategoryPage.tsx`, `src/components/common/react/header/*`
- Hydrated via `client:load`, `client:idle`, `client:visible` in consuming `.astro` files

**Data Access:**
- Purpose: Backend API wrappers, typed fetchers
- Location: `src/api/` (`articles.ts`, `auth.ts`, `collections.ts`, `learn.ts`, `users.ts`)
- Used by: Astro frontmatter (server fetch) and React components (client fetch via React Query)

**State Management:**
- Purpose: Global client state (user, locale, UI toggles, wallet, cache)
- Location: `src/stores/index.ts` (Jotai atoms)
- Atoms: `localeAtom`, `userAtom`, `loadingAtom`, `themeAtom`, `mobileMenuOpenAtom`, `searchQueryAtom`, `articlesCacheAtom`, `walletAddressAtom`

**Lib / Utilities:**
- Purpose: Cross-cutting helpers — i18n, analytics, auth, server fetch, device detection
- Location: `src/lib/` (`i18n.ts`, `analytics.ts`, `serverFetch.ts`, `useAuth.ts`, `useWalletAuth.ts`, `language-utils.ts`, `fingerprint.ts`, `utils.ts`, `useDeviceType.ts`)

**Middleware:**
- Purpose: Language redirect logic and HTML minification on SSR responses
- Location: `src/middleware.ts`

## Data Flow

**Server-rendered page request:**

1. Astro router matches a file under `src/pages/`
2. `src/middleware.ts` runs — resolves source language from domain/path, optionally redirects
3. Page frontmatter calls a fetcher from `src/api/*` (uses `src/lib/serverFetch.ts`) to pull articles/authors/etc.
4. Page composes Astro components (`src/components/**/astro/*`) with server data
5. React islands inside the page are marked with `client:*` directives; Astro ships their JS only
6. Response streams through middleware HTML minification before returning to Vercel edge

**Client-side interactive flow:**

1. React island hydrates on the client
2. Component reads Jotai atoms from `src/stores/index.ts` for global state
3. Remote data is fetched via TanStack React Query (`@tanstack/react-query`) hitting `src/api/*` wrappers
4. Filter/category interactions dispatch `CustomEvent`s on `document` (see event bus below)
5. Other islands (e.g. `CategoryPage`, `FilterBar`) listen and react without prop drilling

**State Management:**
- Global client state: Jotai atoms in `src/stores/index.ts`
- Remote/server cache: TanStack React Query
- Cross-island coordination: DOM `CustomEvent` bus (no shared store required)
- Persisted state: wallet address synced to `localStorage` via derived Jotai atoms

## Key Abstractions

**BaseLayout:**
- Purpose: Global page shell, SEO meta, OG tags, canonical URLs, analytics bootstrap
- File: `src/layouts/BaseLayout.astro`

**BaseArticlePage:**
- Purpose: Shared article-detail skeleton used by news/research/tutorial/podcast variants
- File: `src/components/article/astro/BaseArticlePage.astro`

**FilterBar + MultiSelects:**
- Purpose: Reusable filter UI with decoupled cross-component coordination via DOM events
- Files: `src/components/common/react/FilterBar.tsx`, `CategoryMultiSelect.tsx`, `TopicMultiSelect.tsx`, `MultiSelectBase.tsx`

**Page React wrappers:**
- Purpose: Heavy interactive page bodies mounted as a single island
- Files: `src/components/pages/CategoryPage.tsx`, `src/components/pages/TopicPage.tsx`

**i18n helper:**
- Purpose: Synchronous translation lookup from pre-loaded JSON (not full runtime i18next chain in SSR)
- File: `src/lib/i18n.ts` — imports `public/locales/{en,zh,ja}/translation.json` directly

## Entry Points

**Astro page router:**
- Location: `src/pages/`
- Triggers: Any HTTP request matching a file route
- Responsibilities: Frontmatter data fetch, Astro/React composition

**API routes:**
- `src/pages/api/cf-headers.ts` — Cloudflare/geolocation headers
- `src/pages/api/og/[...params].ts` — dynamic OG image generation
- `src/pages/api/analytics/events.ts` — analytics ingestion endpoint

**Sitemap / robots:**
- `src/pages/sitemap-articles.xml.ts`, `src/pages/sitemap-categories.xml.ts`, `src/pages/robots.txt.ts`

**Middleware:**
- `src/middleware.ts` — runs on every SSR request

## Multi-Region Routing

**Astro i18n (site-level locales):**
- Configured in `astro.config.mts`: `defaultLocale: 'us'`, `locales: ['us', 'asia']`, `prefixDefaultLocale: false`
- `us` (default English) is served at `/...` with no prefix
- `asia` is served at `/asia/...`
- Sitemap integration maps `us → en-US`, `asia → zh-CN`

**Translation language dynamic segment:**
- Separate mechanism from site locale: `src/pages/[translationLang]/...`
- Used for translated variants of article/tutorial/collection pages:
  - `src/pages/[translationLang]/article/[category]/[slug].astro`
  - `src/pages/[translationLang]/tutorials/[slug].astro`
  - `src/pages/[translationLang]/collections/[collectionId]/[slug].astro`
  - `src/pages/[translationLang]/[userId]/article/[category]/[slug].astro`
- `src/middleware.ts` inspects the segment (`extractTranslationLanguageFromPath`, `isTranslationPath`, `removeTranslationPrefix`) and may redirect to the canonical source-language domain in production
- Source language is derived from hostname via `MULTI_SOURCE_CONFIG.SOURCE_LANGUAGE_DOMAINS` in `src/config/constants.ts`

## i18n Architecture

- **Source files:** `public/locales/{en,zh,ja}/translation.json`
- **SSR path:** `src/lib/i18n.ts` imports the JSON synchronously and exposes key-path lookups — avoids i18next runtime in Astro frontmatter
- **Client path:** React components use `react-i18next` (v15) wired via `src/components/common/react/I18nProvider.tsx`; backends include `i18next-http-backend` and `i18next-fs-backend`
- **Locale detection:** `i18next-browser-languagedetector` plus URL/domain inference in `src/lib/language-utils.ts`
- **Legacy integration:** `astro-i18next` is listed in `package.json` but primary translation lookup is the hand-rolled helper in `src/lib/i18n.ts`

## Event Bus Pattern

Cross-island filter coordination uses DOM `CustomEvent`s instead of shared state.

**Events observed (see `src/components/common/react/FilterBar.tsx`):**
- `filter:clear-all` — dispatched by clear button, consumed by multi-selects
- `category:changed` — emitted when a category is selected
- `subcategory:changed` — emitted when a topic/subcategory changes
- `filter:changed` — aggregate filter mutation notification

**Pattern:**
```ts
document.dispatchEvent(new CustomEvent('filter:clear-all'));
document.addEventListener('category:changed', handler);
```

**Why:** Islands are independently hydrated and may not share a React tree; DOM events avoid coupling them to a common provider.

## Deployment Target

- **Adapter:** `@astrojs/vercel` (serverless functions)
- **Mode:** `output: 'server'` SSR on every request
- **Web analytics:** enabled via adapter option
- **Error monitoring:** `@sentry/astro` integration (org `tadle`, project `detake`)
- **Prod build extras:** `compressHTML`, terser (drop_console, 2 passes), CSS minify/split, manual vendor chunking (`react`, `react-dom`, `date-fns`, `lodash`)

## Cross-Cutting Concerns

- **Logging / errors:** Sentry (`sentry.client.config.js`, `sentry.server.config.js`)
- **Analytics:** `src/lib/analytics.ts` + `src/components/common/AnalyticsProvider.tsx`, ingested via `src/pages/api/analytics/events.ts`
- **Auth:** Clerk-based token sync (`src/components/common/react/ClerkApiTokenSync.tsx`), wallet auth (`src/lib/useWalletAuth.ts`), email login (`src/components/common/react/EmailLogin.tsx`)
- **Device detection:** `src/lib/useDeviceType.ts`
- **Server fetch:** `src/lib/serverFetch.ts` centralizes Astro-side HTTP calls

## Known Architectural Tradeoffs / Constraints

1. **Node polyfills in Vite** (`astro.config.mts` dev branch): `buffer`, `process`, `path-browserify`, etc. are shimmed to satisfy crypto/wallet libs — increases bundle size and adds SSR/browser drift risk.
2. **Two separate language systems** — Astro's native `us`/`asia` i18n and the `[translationLang]` dynamic segment operate on different axes (site region vs article translation). Logic in `src/middleware.ts` and `src/lib/language-utils.ts` must keep both consistent.
3. **Hand-rolled i18n helper** in `src/lib/i18n.ts` coexists with full `i18next` + `astro-i18next` stacks. The hand-rolled one is the SSR source of truth; drift between JSON keys and `react-i18next` runtime is possible.
4. **DOM event bus for filter state** — untyped, discoverable only via grep. Refactoring a filter component risks silently breaking listeners in another island.
5. **Route duplication between prefixed and unprefixed variants** — e.g. `src/pages/article/[category]/[slug].astro` and `src/pages/[translationLang]/article/[category]/[slug].astro` must be kept in sync; same for `tutorials`, `collections`, and `[userId]/article/...`.
6. **Dev vs prod config divergence** — `astro.config.mts` exports two entirely different configs based on `NODE_ENV`. Changes must be mirrored to both branches.
7. **SSR on every request** (no static/ISR) — every page hit runs middleware + frontmatter fetches on Vercel; caching strategy lives in React Query on the client and `src/lib/serverFetch.ts` on the server.

---

*Architecture analysis: 2026-04-09*
