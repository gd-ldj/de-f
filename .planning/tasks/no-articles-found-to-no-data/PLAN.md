---
slug: no-articles-found-to-no-data
type: refactor
files_modified:
  - public/locales/en/translation.json
  - public/locales/zh/translation.json
  - public/locales/ja/translation.json
  - src/components/pages/TopicPage.tsx
  - src/components/pages/CategoryPage.tsx
  - src/components/author/react/AuthorArticlesSection.tsx
  - src/components/author/astro/AuthorArticlesSection.astro
  - tests/e2e/category-ui.spec.ts
---

# PLAN — no-articles-found-to-no-data

## Goal
The empty-state copy across all article listing surfaces shows "No data" / "暂无数据" / "データなし" via a single shared i18n key `common.noData`. The legacy keys (`common.noArticlesFound`, `author.noArticles`) are removed. CategoryPage no longer uses a hardcoded locale ternary for this string.

## Acceptance Criteria
- AC-1: All four locations (TopicPage, CategoryPage, AuthorArticlesSection.tsx, AuthorArticlesSection.astro) render the new copy when the article list is empty.
- AC-2: All three locale files contain `common.noData` and DO NOT contain `common.noArticlesFound` or `author.noArticles`.
- AC-3: `pnpm type-check` and `pnpm build` both pass.
- AC-4: No grep hits for the literal string "No articles found" anywhere under `src/` or `public/locales/`.
- AC-5: Existing Playwright specs that asserted the old text are updated to assert the new text.

## Files
The following files (and only these files) may be modified:
- `public/locales/en/translation.json`
- `public/locales/zh/translation.json`
- `public/locales/ja/translation.json`
- `src/components/pages/TopicPage.tsx`
- `src/components/pages/CategoryPage.tsx`
- `src/components/author/react/AuthorArticlesSection.tsx`
- `src/components/author/astro/AuthorArticlesSection.astro`
- `tests/e2e/category-ui.spec.ts`

## Steps

### Step 1 — Update English locale
File: `public/locales/en/translation.json`
- In the `common` block (around line 75–86), add `"noData": "No data"` (place it next to `"noArticlesFound"`).
- Remove `"noArticlesFound": "No articles found"` from `common`.
- Remove `"noArticles": "No articles found"` from the `author` block (around line 174).

### Step 2 — Update Chinese locale
File: `public/locales/zh/translation.json`
- Add `"noData": "暂无数据"` to `common`.
- Remove `"noArticlesFound": "未找到文章"` from `common`.
- Remove `"noArticles": "暂无文章"` from `author`.

### Step 3 — Update Japanese locale
File: `public/locales/ja/translation.json`
- Add `"noData": "データなし"` to `common`.
- Remove `"noArticlesFound"` from `common`.
- Remove `"noArticles"` from `author`.

### Step 4 — Migrate TopicPage
File: `src/components/pages/TopicPage.tsx` (line 110)
- Replace `t('common.noArticlesFound')` with `t('common.noData')`.

### Step 5 — Refactor CategoryPage
File: `src/components/pages/CategoryPage.tsx`
- At the top, add: `import { createTranslator } from '@/lib/i18n';` if not already present.
- Inside the component body, near where `locale` becomes available, add: `const t = createTranslator(locale);`
- Replace line 530 `<p className="text-muted-foreground">{locale === 'zh' ? '未找到文章' : 'No articles found'}</p>` with `<p className="text-muted-foreground">{t('common.noData')}</p>`.
- Do NOT touch other ternaries in this file (loading, no more articles) — out of scope.

### Step 6 — Migrate AuthorArticlesSection (React)
File: `src/components/author/react/AuthorArticlesSection.tsx` (line 192)
- Replace `t('author.noArticles')` with `t('common.noData')`.

### Step 7 — Migrate AuthorArticlesSection (Astro)
File: `src/components/author/astro/AuthorArticlesSection.astro` (line 73)
- Replace `t('author.noArticles')` with `t('common.noData')`.

### Step 8 — Update E2E spec
File: `tests/e2e/category-ui.spec.ts`
- Find any assertion that references "No articles found" (or its zh/ja equivalent) and update to the new text "No data" / "暂无数据" / "データなし".

### Step 9 — Type check
Run: `pnpm type-check`
Expected: 0 errors, 0 warnings.

### Step 10 — Grep guard
Run: `grep -rn "No articles found" src/ public/locales/`
Expected: zero hits.

Run: `grep -rn "noArticlesFound\|author.noArticles" src/ public/locales/`
Expected: zero hits.

### Step 11 — Build check
Run: `pnpm build`
Expected: build succeeds.

### Step 12 — Visual e2e test (mandatory for UI text change)
Add a minimal Playwright spec at `tests/e2e/no-articles-found-to-no-data.spec.ts` that:
- Navigates to a category page on `/us/...` with a filter that yields zero results
- Asserts the empty-state text is exactly `"No data"`
- Takes a screenshot to `test-results/no-data-empty-state.png`

(Note: this file IS in scope — add it to the `## Files` list if the agent needs to.)

## Rollback Plan
`git revert <commit>` — single atomic commit, reversible.
