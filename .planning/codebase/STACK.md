# Technology Stack

**Analysis Date:** 2026-04-09

## Languages

**Primary:**
- TypeScript `^5.9.2` — strict mode (`tsconfig.json:2` extends `astro/tsconfigs/strict`), JSX via `react-jsx` (`tsconfig.json:6`)
- Astro component language (`.astro` files) — used for page shells, layouts, SEO

**Secondary:**
- JavaScript — dev scripts only (e.g. `check-no-chinese-us.js`, `playwright.config.js`, `src/scripts/auth-manager.js`)

## Runtime

**Environment:**
- Node.js `>=18.0.0` (`package.json:94`)
- Deployment target: Vercel serverless (SSR) via `@astrojs/vercel` adapter (`astro.config.mts:19`, `:84`)

**Package Manager:**
- pnpm `9.15.3` (pinned via `packageManager` field, `package.json:162`)
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**
- Astro `^5.13.2` (`package.json:53`) — SSR enabled (`output: 'server'`, `astro.config.mts:18`)
- React `^19.2.1` + React DOM `^19.2.1` (`package.json:70-71`) — islands integrated via `@astrojs/react ^4.3.0` (`package.json:38`, `astro.config.mts:25`)
- `@astrojs/sitemap ^3.7.0` with i18n locales `us`→`en-US`, `asia`→`zh-CN` (`astro.config.mts:26-34`)

**i18n (platform):**
- Astro built-in i18n: locales `['us', 'asia']`, default `us`, `prefixDefaultLocale: false` (`astro.config.mts:41-47`)

**Testing:**
- `@playwright/test ^1.58.2` (`package.json:84`) — config at `playwright.config.js`
- `@axe-core/playwright ^4.11.1` for a11y tests (`package.json:83`)
- Default project: Chromium + custom breakpoint viewports (375/768/1024/1440); `FULL_BROWSER=1` unlocks Firefox/WebKit/mobile emulation (`playwright.config.js:17`, `:61-122`)
- Base URL: `http://localhost:4321` (`playwright.config.js:48`); webServer runs `pnpm dev` (`:127`)

**Build / Dev:**
- `@astrojs/check ^0.9.4` — exposed as `pnpm type-check` (`package.json:13, 36`)
- `terser ^5.44.0` (devDep, `package.json:91`) — production minification with `drop_console`, multiple passes, manual vendor chunks `react/react-dom` and `date-fns/lodash` (`astro.config.mts:131-158`)
- `@tailwindcss/vite ^4.1.11` (`package.json:48`) — Tailwind plugin registered in Vite (`astro.config.mts:50, 115`)
- `vite-plugin-node-polyfills ^0.24.0` — dev-only polyfills for `buffer`, `process`, `path`, `util`, `fs`, `os` (`astro.config.mts:51-55`)

## Styling

- Tailwind CSS `^4.1.11` (`package.json:76`) — v4 engine via Vite plugin, no `tailwind.config.js` (config-less v4)
- `class-variance-authority ^0.7.0` (`package.json:56`)
- `clsx ^2.0.0` (`package.json:57`)
- `tailwind-merge ^2.0.0` (`package.json:75`)

## Key Dependencies

**State Management:**
- `jotai ^2.0.0` (`package.json:65`) — global atom store at `src/stores/`

**Data Fetching / Server State:**
- `@tanstack/react-query ^5.0.0` (`package.json:49`)
- Native `fetch` in `src/api/*.ts` modules; SSR-aware base URL via `src/lib/serverFetch.ts`

**UI Primitives:**
- `@radix-ui/react-dialog ^1.0.0` (`package.json:43`)
- `@radix-ui/react-dropdown-menu ^2.0.0` (`package.json:44`)
- `@radix-ui/react-slot ^1.0.0` (`package.json:45`)
- `@radix-ui/react-toast ^1.0.0` (`package.json:46`)
- `lucide-react ^0.400.0` (`package.json:67`) — icon set
- `framer-motion ^12.23.12` (`package.json:59`) — animations
- `recharts ^3.1.0` (`package.json:74`) — charts

**Internationalization:**
- `i18next ^25.3.2` (`package.json:60`)
- `react-i18next ^15.6.0` (`package.json:72`)
- `i18next-browser-languagedetector ^8.2.0` (`package.json:61`)
- `i18next-fs-backend ^2.6.0` (`package.json:62`) — SSR locale loading
- `i18next-http-backend ^3.0.2` (`package.json:63`) — client locale loading
- `astro-i18next ^1.0.0-beta.21` (`package.json:54`)

**Auth / Identity:**
- `@clerk/clerk-react ^5.47.0` (`package.json:41`) — wrapped in `src/components/common/react/IdentityProvider.tsx:31`

**Analytics / Observability:**
- `@sentry/astro ^10.33.0` (`package.json:47`) — registered in `astro.config.mts:35-39, 100-104` (project `detake`, org `tadle`)
- `@vercel/analytics ^1.5.0` (`package.json:52`) — Vercel Web Analytics enabled on the adapter (`astro.config.mts:20-22, 85-87`)
- `@fingerprintjs/fingerprintjs ^5.0.1` (`package.json:42`) — device fingerprint in `src/lib/fingerprint.ts:1`

**Editor / Markdown:**
- `turndown ^7.2.2` (`package.json:77`) — HTML→Markdown conversion
- `@types/turndown ^5.0.6` (devDep, `package.json:88`)

**Forms / Validation:**
- `zod ^3.22.4` (`package.json:80`)
- `joi ^17.11.0` (`package.json:64`)

**Utilities / Crypto:**
- `lodash ^4.17.21` (`package.json:66`)
- `crypto-js ^4.2.0` (`package.json:58`) with `@types/crypto-js ^4.2.2` (devDep)
- `buffer ^6.0.3`, `process ^0.11.10`, `path-browserify ^1.0.1` — browser polyfills (`package.json:55, 68-69`)

## Dev Dependencies

- `@playwright/test ^1.58.2` (`package.json:84`)
- `@axe-core/playwright ^4.11.1` (`package.json:83`)
- `@rollup/plugin-inject ^5.0.5` (`package.json:85`)
- `@types/node ^20.0.0` (`package.json:87`)
- `@types/crypto-js ^4.2.2` (`package.json:86`)
- `@types/turndown ^5.0.6` (`package.json:88`)
- `@types/react ^19.2.0`, `@types/react-dom ^19.2.0` (listed under `dependencies`, `package.json:50-51`)
- `cspell ^8.17.0` — spellcheck gate (`package.json:89, 99-161`)
- `simple-git-hooks ^2.11.1` — pre-push hook runs `pnpm check:no-chinese-us && pnpm check:spelling` (`package.json:90, 96-98`)
- `terser ^5.44.0` (`package.json:91`)

## Configuration

**Path Aliases:**
- `@/*` → `./src/*` (`tsconfig.json:9`)

**Environment Variables (referenced):**
- `PUBLIC_SITE_ENV` — selects `beta` / `web2` / `web3` / `beta_dev` (`src/config/constants.ts:14`)
- `PUBLIC_SOURCE_LANGUAGE` — language prefix for API subdomains (`src/config/constants.ts:45, 54`)
- `SENTRY_DSN` (`astro.config.mts:38, 103`)
- `VERCEL_PROJECT_PRODUCTION_URL` / `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` — fallback to `detake.news` (`astro.config.mts:13`)
- `FULL_BROWSER` — expands Playwright matrix (`playwright.config.js:17`)
- `CI` — toggles retries/workers/screenshots (`playwright.config.js:27-34, 54-57`)

**Build Pipeline (production):**
- Minifier: terser with 2 compression passes, `drop_console`, console/debug/info stripped (`astro.config.mts:131-148`)
- `compressHTML: true` (`astro.config.mts:106`)
- CSS code-splitting and minification enabled (`astro.config.mts:149-150`)
- Manual chunks: `vendor` (react, react-dom), `utils` (date-fns, lodash) (`astro.config.mts:153-157`)

## Scripts (`package.json:6-34`)

```bash
pnpm dev                 # astro dev
pnpm build               # astro build
pnpm preview             # astro preview
pnpm start               # vercel dev
pnpm vercel:simulate     # build + vercel dev
pnpm type-check          # astro check
pnpm check:no-chinese-us # node check-no-chinese-us.js
pnpm check:spelling      # cspell src/**
pnpm test                # playwright test tests/e2e/
pnpm test:all            # playwright test
pnpm test:a11y           # playwright test tests/a11y/
pnpm test:perf           # playwright test tests/performance/
pnpm commit              # ./dev-commit.sh
```

## Platform Requirements

**Development:**
- Node `>=18.0.0`
- pnpm `9.15.3`
- Dev server on port `4321` (Astro default, asserted in `playwright.config.js:48`)

**Production:**
- Vercel (serverless SSR via `@astrojs/vercel`)
- Web Analytics enabled at the adapter level

---

*Stack analysis: 2026-04-09*
