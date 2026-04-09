# DeTake Frontend

## Identity
- **Name**: DeTake Frontend (`detake-web`)
- **Product**: Crypto news and analysis platform — public-facing reader site
- **Companion**: `detake-admin-frontend` (content authoring backend, Next.js)

## Core Value
Deliver fast, SEO-optimized, multi-region crypto news, research, tutorials and podcast content to a global audience, in English (US region) and Simplified Chinese (Asia region).

## Stack (authoritative)
- **Framework**: Astro 5.13 (SSR via @astrojs/vercel)
- **Interactivity**: React 19 islands
- **Styling**: Tailwind CSS v4 (CSS-native)
- **Language**: TypeScript 5.9 strict
- **Package manager**: pnpm 9.15
- **Deployment**: Vercel
- **State**: Jotai (global), TanStack Query (data fetching)
- **UI primitives**: Radix UI + lucide-react icons
- **i18n**: i18next + astro-i18next, locales `en / zh / ja`
- **Routing**: `/us` (default, English) and `/asia` (Chinese) prefixes
- **Testing**: Playwright (e2e, a11y, integration, perf, content-health)
- **Analytics**: Vercel Analytics + Sentry

## Scope & Boundaries
### In scope
- Reader-facing pages: home, article list/detail, topic, category, tutorials, research, news, voices (podcasts), insights
- SEO: metadata, OG, sitemap, canonical, robots
- i18n content rendering (not authoring)
- Performance, accessibility, visual polish
- Playwright coverage for critical flows

### Out of scope
- Content authoring / editing (lives in `detake-admin-frontend`)
- User accounts / auth (frontend is public)
- Backend API implementation (consumed, not owned)
- Payment / subscriptions

## Success Signals
- Lighthouse performance ≥ 90 on article detail & home
- Zero console errors in production
- Type-check + build clean on main
- Playwright e2e suite green on CI
- No visible regressions across `/us` and `/asia` prefixes

## Governance
- All commits in English, Conventional Commits format
- Never commit `.planning/` docs (managed by GSD with `commit_docs: false`)
- UI changes require Playwright verification (see `CLAUDE.md` §UI 自验证)
- Branching: single-branch workflow (GSD `branching_strategy: none`)
