# Codebase Structure

**Analysis Date:** 2026-04-09

## Directory Layout

```
detake-frontend/
├── astro.config.mts          # Astro + Vercel + Sentry + i18n config (dev/prod split)
├── playwright.config.js      # Playwright e2e config
├── middleware.ts (in src/)   # SSR middleware: lang redirect + HTML minify
├── sentry.client.config.js   # Client Sentry init
├── sentry.server.config.js   # Server Sentry init
├── public/
│   └── locales/              # Translation JSON (en, zh, ja)
├── src/
│   ├── api/                  # Typed backend fetchers
│   ├── assets/               # Static imports bundled by Vite
│   ├── components/           # Astro + React UI
│   ├── config/               # Constants, taxonomy
│   ├── layouts/              # Global page shells
│   ├── lib/                  # Utilities, hooks, i18n, analytics
│   ├── middleware.ts         # SSR middleware entry
│   ├── pages/                # File-based routes + API endpoints
│   ├── scripts/              # Build/maintenance scripts
│   ├── stores/               # Jotai atoms
│   ├── styles/               # Tailwind + global CSS
│   ├── types/                # Shared TS types
│   └── utils/                # Generic helpers
├── tests/                    # Playwright specs (e2e, a11y, integration, ...)
├── docs/                     # Project docs (ANALYTICS_GUIDE, UI_PRIMITIVES, ...)
└── scripts/                  # Repo-level scripts
```

## Directory Purposes

**`src/api/`**
- Purpose: Backend API wrappers, one file per domain
- Files: `articles.ts`, `auth.ts`, `collections.ts`, `learn.ts`, `users.ts`
- Used from: Astro frontmatter (server) and React components (client via React Query)

**`src/assets/`**
- Purpose: Bundled static assets imported by components

**`src/components/`**
- Purpose: All UI components, subdivided by domain and runtime (see "Components" below)

**`src/config/`**
- Purpose: Global constants and domain taxonomy
- Files: `constants.ts` (storage keys, default values, `MULTI_SOURCE_CONFIG`, `IS_DEV_ENV`), `article-taxonomy.ts`

**`src/layouts/`**
- Purpose: Astro layout shells
- Files: `BaseLayout.astro`

**`src/lib/`**
- Purpose: Cross-cutting utilities and hooks
- Files: `i18n.ts`, `analytics.ts`, `serverFetch.ts`, `useAuth.ts`, `useWalletAuth.ts`, `useDeviceType.ts`, `language-utils.ts`, `fingerprint.ts`, `utils.ts`

**`src/pages/`**
- Purpose: Astro file-based routes and API endpoints (see route table below)

**`src/scripts/`**
- Purpose: Build-time and maintenance scripts

**`src/stores/`**
- Purpose: Jotai atoms for global client state
- Files: `index.ts` — `localeAtom`, `userAtom`, `loadingAtom`, `themeAtom`, `mobileMenuOpenAtom`, `searchQueryAtom`, `articlesCacheAtom`, `walletAddressAtom`

**`src/styles/`**
- Purpose: Tailwind v4 base and global CSS

**`src/types/`**
- Purpose: Shared TS type declarations
- Files: `index.ts`

**`src/utils/`**
- Purpose: Generic utility functions not tied to a domain

**`public/locales/`**
- Purpose: i18n source of truth — `en/translation.json`, `zh/translation.json`, `ja/translation.json`
- Imported directly by `src/lib/i18n.ts`

## Components Layout

The `src/components/` tree is divided **by domain first, then by runtime**. The `astro/` subfolder holds `.astro` SSR components; the `react/` subfolder holds `.tsx` islands.

```
src/components/
├── article/
│   ├── astro/        # ArticleContent, BaseArticlePage, LearnContent, PodcastContent, RecentResearch
│   └── react/        # ArticleSidebar, AuthorSection, BonusDistribution, BonusHunters,
│                     # PodcastAuthorCard, PoolInfo, ShareSection, TokenInfoCard, YoutubeEmbed
├── author/           # Author-related UI
├── collections/      # Collection pages / cards
├── common/
│   ├── astro/        # ArticleCard, ArticleLink, FilterBar, HeaderSkeleton,
│   │                 # HeaderWithFallback, Image, ImageSSR, OptimizedHeader, Pagination, SEOArticle
│   ├── react/        # ArticleGrid, ArticleLink, AuthMount, AuthorSearchInput,
│   │                 # CategoryMultiSelect, ClerkApiTokenSync, ConnectWallet,
│   │                 # DraggableFloatingButton, EmailLogin, FilterBar, FilterDropdown,
│   │                 # I18nProvider, IdentityProvider, Image, MultiSelectBase,
│   │                 # Pagination, Skeleton, Toast, TopicMultiSelect, WalletPopover
│   │                 # + footer/, header/ subfolders
│   └── AnalyticsProvider.tsx
├── home/
│   ├── astro/        # MainContent, MobileLayout, NewsSection, ResearchSection,
│   │                 # RightSidebar, Sidebar, ToFollowList, TrendingSection
│   ├── react/        # Login, NewsGrid, ResearchGrid, TrendingGrid
│   └── FollowButton.tsx
├── learn/            # Learn / tutorial UI
├── pages/            # React page wrappers mounted as single islands
│   ├── CategoryPage.tsx
│   └── TopicPage.tsx
└── social/           # Social share / widgets
```

**Why the `astro/` vs `react/` split:**
- `astro/` components render on the server; zero JS ships unless a descendant React island hydrates.
- `react/` components are islands — interactive, hydrated via `client:load`, `client:idle`, or `client:visible` from a consuming `.astro` file.
- Keeping them in sibling folders makes it obvious which runtime each component targets and prevents accidentally importing React hooks into an `.astro` component.

**`components/pages/`** holds full-page React wrappers (e.g. `CategoryPage.tsx`) that are mounted once per route and host their own interactive state — used when a whole page body is effectively one large island.

## Route Table

Astro file-based routes under `src/pages/`. The `us` site locale is served without prefix; `asia` is served under `/asia/...` automatically by Astro's i18n.

### Top-level pages

| Route | File | Description |
|---|---|---|
| `/` | `src/pages/index.astro` | Home page (news grid, trending, research) |
| `/404` | `src/pages/404.astro` | Not found page |
| `/news` | `src/pages/news/index.astro` | News category page |
| `/research` | `src/pages/research/index.astro` | Research category page |
| `/insights` | `src/pages/insights/index.astro` | Insights category page |
| `/voices` | `src/pages/voices/index.astro` | Voices category page |
| `/voices/podcasts` | `src/pages/voices/podcasts/index.astro` | Podcasts listing under Voices |
| `/tutorials` | `src/pages/tutorials/index.astro` | Tutorials listing |
| `/tutorials/[slug]` | `src/pages/tutorials/[slug].astro` | Tutorial detail |
| `/collections` | `src/pages/collections/index.astro` | Collections index |
| `/collections/[collectionId]` | `src/pages/collections/[collectionId]/index.astro` | Collection detail |
| `/collections/[collectionId]/[slug]` | `src/pages/collections/[collectionId]/[slug].astro` | Article in a collection |
| `/authors/[authorName]` | `src/pages/authors/[authorName].astro` | Author profile |
| `/topics/[topic]` | `src/pages/topics/[topic].astro` | Topic page |
| `/article/[category]/[slug]` | `src/pages/article/[category]/[slug].astro` | Canonical article detail |
| `/[userId]/article/[category]/[slug]` | `src/pages/[userId]/article/[category]/[slug].astro` | User-scoped article detail |

### Translated-variant routes (`[translationLang]` segment)

| Route | File |
|---|---|
| `/[translationLang]/article/[category]/[slug]` | `src/pages/[translationLang]/article/[category]/[slug].astro` |
| `/[translationLang]/tutorials/[slug]` | `src/pages/[translationLang]/tutorials/[slug].astro` |
| `/[translationLang]/collections/[collectionId]/[slug]` | `src/pages/[translationLang]/collections/[collectionId]/[slug].astro` |
| `/[translationLang]/[userId]/article/[category]/[slug]` | `src/pages/[translationLang]/[userId]/article/[category]/[slug].astro` |

### API / non-HTML routes

| Route | File | Description |
|---|---|---|
| `/api/cf-headers` | `src/pages/api/cf-headers.ts` | Cloudflare/geolocation headers endpoint |
| `/api/og/[...params]` | `src/pages/api/og/[...params].ts` | Dynamic OG image generation |
| `/api/analytics/events` | `src/pages/api/analytics/events.ts` | Analytics event ingestion |
| `/robots.txt` | `src/pages/robots.txt.ts` | robots.txt generator |
| `/sitemap-articles.xml` | `src/pages/sitemap-articles.xml.ts` | Articles sitemap |
| `/sitemap-categories.xml` | `src/pages/sitemap-categories.xml.ts` | Categories sitemap |

## Multi-Region Routing: How `[translationLang]` Works

Two orthogonal localization mechanisms coexist:

1. **Astro site locale** (`astro.config.mts`): `defaultLocale: 'us'`, `locales: ['us', 'asia']`, `prefixDefaultLocale: false`. Astro handles `/asia/...` prefix routing natively; `us` is prefix-less. Drives sitemap locale mapping (`us → en-US`, `asia → zh-CN`).

2. **Translation language dynamic segment** (`[translationLang]` folder): A separate mechanism for rendering a translated version of the same article. Requests matching `/[translationLang]/article/[category]/[slug]` run through `src/middleware.ts`:
   - `isTranslationPath(pathname)` detects the segment
   - `extractTranslationLanguageFromPath(pathname)` pulls the lang code
   - `getSourceLanguageFromUrl` / `getSourceLanguageFromRequest` decide the source language from hostname (via `MULTI_SOURCE_CONFIG.SOURCE_LANGUAGE_DOMAINS` in `src/config/constants.ts`) or request headers
   - `shouldRedirectToSourceVersion` + `removeTranslationPrefix` may 302 the user to the canonical source-language domain in production

The `[translationLang]` tree currently mirrors the main tree only for article/tutorial/collection/user-article routes — other sections are not translated via this mechanism.

## Where to Add New Code

| Task | Location |
|---|---|
| New top-level page | `src/pages/<slug>/index.astro` (mirror under `src/pages/[translationLang]/` if it needs translation) |
| New API endpoint | `src/pages/api/<name>.ts` |
| New SSR/static component | `src/components/<domain>/astro/<Name>.astro` |
| New interactive widget | `src/components/<domain>/react/<Name>.tsx`, mount with `client:load`/`client:visible` |
| New full-page React island | `src/components/pages/<PageName>.tsx` |
| New backend fetcher | `src/api/<domain>.ts` |
| New global state | New atom in `src/stores/index.ts` |
| New utility hook/helper | `src/lib/` (domain-aware) or `src/utils/` (generic) |
| New constant / taxonomy | `src/config/constants.ts` or `src/config/article-taxonomy.ts` |
| New shared type | `src/types/index.ts` |
| New translation key | `public/locales/{en,zh,ja}/translation.json` (keep all three in sync) |
| New global style | `src/styles/` |

## Naming Conventions

- **Astro components:** PascalCase, `.astro` extension (`BaseArticlePage.astro`)
- **React components:** PascalCase, `.tsx` extension (`FilterBar.tsx`, `CategoryPage.tsx`)
- **Dynamic route segments:** bracketed lowercase (`[slug]`, `[category]`, `[translationLang]`, `[userId]`)
- **Utility / lib files:** kebab-case (`language-utils.ts`, `serverFetch.ts` is an intentional exception)
- **API files:** lowercase domain (`articles.ts`)

## Test Directory Layout

Playwright specs live under `tests/`, organized by test type.

```
tests/
├── a11y/
│   └── accessibility.spec.ts           # Axe-based accessibility checks
├── content-health/
│   ├── content-validation.spec.ts      # Content integrity / copy checks
│   └── pages-health.spec.ts            # Smoke health checks across pages
├── e2e/
│   ├── article-ui.spec.ts              # Article detail UI
│   ├── article.spec.js                 # Article flows
│   ├── category-ui.spec.ts             # Category page UI
│   ├── homepage-ui.spec.ts             # Home page UI
│   ├── homepage.spec.js                # Home page flows
│   ├── navigation-responsive.spec.ts   # Responsive nav
│   ├── navigation.spec.js              # Nav flows
│   └── recent-research.spec.ts         # Recent research section
├── integration/
│   ├── data-contract.spec.ts           # API shape validation
│   ├── filter-pagination.spec.ts       # Filter + pagination integration
│   ├── hydration.spec.ts               # React island hydration
│   └── i18n.spec.ts                    # Locale switching
├── performance/
│   └── web-vitals.spec.ts              # Web vitals thresholds
├── ui-anomaly/
│   └── ui-anomaly.spec.ts              # Visual/layout anomaly detection
└── utils/
    ├── content-scanner.ts              # Content scanning helpers
    ├── data-contract-validator.ts      # Schema validator
    ├── semantic-validators.ts          # Semantic HTML checks
    ├── test-pages.ts                   # Shared page URL list
    └── ui-anomaly-detector.ts          # Anomaly detection helper
```

**Config:** `playwright.config.js` at the repo root.

## Special Files

- **`src/middleware.ts`** — runs on every SSR request; handles translation-path redirects and HTML comment/whitespace removal via `turndown`-assisted stripping.
- **`astro.config.mts`** — dual export: `devDefineConfig` (with heavy node polyfills) vs prod config (terser + chunking). Edits must cover both branches.
- **`sentry.client.config.js` / `sentry.server.config.js`** — Sentry SDK initialization.
- **`check-no-chinese-us.js`** — lint-style script guarding Chinese copy out of the `us` locale.
- **`dev-commit.sh` / `dev-test.sh`** — repo-standard commit and test runners.

---

*Structure analysis: 2026-04-09*
