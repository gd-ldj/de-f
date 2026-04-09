# Coding Conventions

**Analysis Date:** 2026-04-09

Derived from reading `CLAUDE.md`, `package.json`, `tsconfig.json`, and sampled components under `src/components/`.

## Project-Level Conventions (from CLAUDE.md)

- **Stack:** Astro 5.13.2 (SSR) + React 19 + TypeScript 5.9 strict + Tailwind CSS v4.
- **Package manager:** `pnpm` only. Never `npm` / `yarn` / `bun`.
- **Communication:** Chinese in chat; English in code comments and commit messages.
- **Routing:** Multi-locale prefixes `/us/...` and `/asia/...`.
- **State / data:** Jotai for global state, TanStack React Query for requests. i18next + astro-i18next for i18n.
- **Pre-submit:** Must pass `pnpm type-check` before committing.
- **Security mindset:** Assume malicious user input; escape/validate on frontend. Use debouncing for API calls; generate a unique msg id from user features + random for each submission to avoid duplicate submissions; lock trigger controls during long operations.
- **Detailed UI/design rules:** `docs/UI_PRIMITIVES.md` (color tokens, typography, interaction states, layout system, self-check lists).

## File Naming

Sampled from `src/components/`:

- **Astro components:** PascalCase `.astro` — e.g. `src/components/article/astro/ArticleContent.astro`, `src/components/common/astro/HeaderWithFallback.astro`, `src/components/common/astro/Pagination.astro`.
- **React components:** PascalCase `.tsx` — e.g. `src/components/common/react/FilterBar.tsx`, `src/components/pages/CategoryPage.tsx`, `src/components/common/react/header/DesktopHeader.tsx`.
- **Lowercase exceptions** exist for a few entry files: `src/components/common/react/header/mobile.tsx`, `header/Index.tsx` — prefer PascalCase for new files.
- **Utility / lib / hooks / types** files: kebab-case — e.g. `src/lib/language-utils.ts`, `tests/utils/test-pages.ts`, `tests/utils/ui-anomaly-detector.ts`.
- **Directories:** lowercase (`article/`, `common/`, `home/`, `pages/`) with `astro/` and `react/` subfolders to split rendering layer.

Global rule (user CLAUDE.md): components PascalCase, everything else kebab-case.

## Astro vs React Split

- **Default to Astro** for page structure, SEO, and static content. Astro files live under `src/components/**/astro/` and `src/pages/`.
- **React islands** (`.tsx`) live under `src/components/**/react/` and are mounted from `.astro` files with `client:*` directives.
- Observed directives in `src/pages/**/*.astro`: `client:load` is the dominant choice for auth/footer/share islands (e.g. `<AuthMount client:load />`, `<Footer client:load locale={locale} />`). Use `client:idle` / `client:visible` when hydration can defer.
- **Avoid wrapping static content in React** — keep non-interactive markup in `.astro`.
- Pages live in `src/pages/` following Astro file-based routing; layout shell in `src/layouts/BaseLayout.astro`.

## Astro Frontmatter Pattern

From `src/components/article/astro/ArticleContent.astro`:

```astro
---
import type { Locale, ApiArticle, TranslationLanguage } from '@/types'
import { createTranslator } from '@/lib/i18n'
import Image from '@/components/common/astro/ImageSSR.astro'

interface Props {
  article: ApiArticle
  locale: Locale
  // ...
}

const { article, locale, category } = Astro.props
const t = createTranslator(locale)
---
```

- Use `interface Props` (not `type`).
- Destructure from `Astro.props`.
- Use the `@/*` path alias (configured in `tsconfig.json` → `"paths": { "@/*": ["./src/*"] }`).
- No trailing semicolons inside Astro frontmatter is common; follow the existing file's style.

## React Component Pattern

From `src/components/common/react/FilterBar.tsx`:

```tsx
import { useState, useEffect, useRef } from 'react';
import TopicMultiSelect from '@/components/common/react/TopicMultiSelect';
import { createTranslator } from '@/lib/i18n';
import type { Locale } from '@/types';

export interface FilterBarProps {
  locale: Locale;
  authorName?: string;
  viewMode?: 'list' | 'grid';
}

export default function FilterBar({ locale, authorName = '', viewMode = 'grid' }: FilterBarProps) {
  const [categoryActive, setCategoryActive] = useState(false);
  // ...
}
```

- **Function components only** — no class components.
- Props interface `export interface <Name>Props` above the component.
- Default export is acceptable for island entry components; internal shared utilities/types should prefer **named exports** (global rule).
- Hooks imported directly from `'react'` (React 19).
- i18n via `createTranslator(locale)` from `@/lib/i18n`, never hard-coded strings in new code.

## Import Conventions

Observed order (top of `FilterBar.tsx`, `ArticleContent.astro`):

1. React / framework imports (`react`, `astro`).
2. Absolute project imports via `@/*` alias — components, lib, config.
3. Type-only imports with `import type { ... } from '@/types'`.
4. No relative `../../..` chains — always prefer `@/...`.

## TypeScript

`tsconfig.json` extends `astro/tsconfigs/strict`:

- **Strict mode on.** No `any` — use `unknown` and narrow, or define a proper type. Document reason in chat if `any` is unavoidable.
- **Prefer `interface`** over `type` (union/intersection is the only exception).
- **No `enum`** — use `as const` object literals.
- **JSX:** `react-jsx` with `jsxImportSource: "react"`.
- **Path alias:** `@/*` → `./src/*` — use everywhere.
- Shared domain types live in `src/types/` and are imported as `import type { Locale, ApiArticle } from '@/types'`.

## Styling (Tailwind CSS v4)

- Tailwind v4 only (`tailwindcss@^4.1.11`, `@tailwindcss/vite`). No v3 patterns.
- Design tokens, color palette, typography, and interaction states are defined in `docs/UI_PRIMITIVES.md` — consult before adding new styles.
- **Mobile-first breakpoints:** `sm:640 md:768 lg:1024 xl:1280 2xl:1536`.
- **Avoid arbitrary values** `[...]` unless there is no token equivalent. Exceptions found in the codebase (e.g. `max-w-[1440px]`, `mt-[56px]`, `.layout-two-column-fixed-1440`) are intentional layout constants — reuse them rather than inventing new magic numbers.
- Compose dynamic classes with `clsx` + `tailwind-merge` (both are dependencies); a `cn()` helper is the expected pattern.
- Avoid `@apply` outside `src/styles/global.css`.
- Reusable complex styles should become components, not inline `style` props.

## i18n Keys

- Translation files: `public/locales/{en,zh,ja}/translation.json` (single `translation.json` namespace per locale).
- **Nested namespaced keys.** From `public/locales/en/translation.json`:

  ```json
  {
    "navigation": {
      "allCategories": "All Categories",
      "openMenu": "Open menu",
      "expandNewsCategories": "Expand news categories"
    },
    "locale": { "northAmerica": "North America" }
  }
  ```

- Top-level namespaces observed: `navigation`, `locale`, `article.*`, `common.*`. New keys must reuse existing namespaces where possible; never mutate or rename existing keys (they are load-bearing across US/Asia).
- Consume via `createTranslator(locale)` in both Astro and React; do not import `react-i18next` directly in new components unless necessary.
- Recent locale additions (see `git log`): `podcast` namespace across en/zh/ja — follow the same pattern when adding a new feature area.

## Linting / Formatting / Checks

No ESLint/Prettier configured at repo root. Enforcement is done via:

- **`pnpm type-check`** — `astro check`. Must be green before commit.
- **`pnpm check:spelling`** — cspell over `src/**/*.{ts,tsx,js,jsx,astro}` using the `cspell` config inside `package.json`. Project-specific words (e.g. `DeTake`, `defi`, `fingerprintjs`, `Pectra`) are in that allowlist — add new domain terms there rather than disabling the check.
- **`pnpm check:no-chinese-us`** — `check-no-chinese-us.js` guards the US locale against accidental Chinese characters.
- **`simple-git-hooks` pre-push** runs both `check:no-chinese-us` and `check:spelling` (see `package.json` → `simple-git-hooks.pre-push`). Run `pnpm prepare` once after cloning to install the hook.
- **Never bypass hooks** with `--no-verify`.

## Git / Commits

Rules combined from the project `CLAUDE.md` and `dev-commit.sh`:

- **All commit messages in English.** Chat in Chinese, commits in English — no exceptions.
- **Conventional Commits:** `<type>: <description>`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, etc.
- **Use the helper script:** `./dev-commit.sh <type> "<message>"` (aliased as `pnpm commit`). Example: `./dev-commit.sh feat "add podcast category page"`.
- Do not auto-commit or push without explicit user instruction.
- Never use `--force` or `--no-verify`.
- Do not commit broken builds — type-check must pass.

## Security & Robustness (from CLAUDE.md §三.7)

Prescriptive rules for all new frontend code:

- Debounce all API-triggering inputs.
- Lock/disable trigger controls during in-flight long operations until success or error recovery.
- Generate a unique msg id from user fingerprint + random value, attach via header/cookie, to prevent duplicate submissions.
- Escape/filter user text for XSS/CSRF on the client — do not rely solely on the backend.
- Text inputs must define explicit regex validation and max length.
- Assume the user is hostile by default.

---

*Convention analysis: 2026-04-09*
