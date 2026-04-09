# CONTEXT — no-articles-found-to-no-data

## Description
Replace the empty-state copy "No articles found" with "No data" across all list/category/author pages, in all three languages, and refactor the one hardcoded ternary into a proper i18n key.

## Scope
- 4 call sites that currently render "No articles found" or its localized equivalent
- 2 i18n keys (`common.noArticlesFound`, `author.noArticles`) consolidated to a single new `common.noData` key
- The hardcoded ternary in CategoryPage.tsx is refactored to use the new key

## Decisions
- **D-01**: Introduce one new i18n key `common.noData` instead of editing both existing keys in place. Reason: clearer semantics ("data" is broader than "articles") and avoids leaving stale `noArticlesFound` text in any callsite the grep might miss.
- **D-02**: Delete the old keys `common.noArticlesFound` and `author.noArticles` after migrating callers. Reason: avoid dead translation keys.
- **D-03**: All three locales updated: en `"No data"`, zh `"暂无数据"`, ja `"データなし"`.
- **D-04**: CategoryPage.tsx adopts `createTranslator(locale)` (the same helper TopicPage already uses) for the new key. Other ternaries in CategoryPage (loading, no more articles) are NOT touched in this task — out of scope.
- **D-05**: AuthorArticlesSection (both `.tsx` and `.astro`) — the React version uses `react-i18next`'s `useTranslation`, the Astro version uses a server-side `t()`. Confirm the patterns before editing; the migration is mechanical.

## Relevant Files
### Read-only references
- `src/components/pages/TopicPage.tsx:20` — example usage of `createTranslator(locale)` pattern
- `src/lib/i18n` — translator helpers

### Files to modify
- `public/locales/en/translation.json` — add `common.noData`, remove `common.noArticlesFound` + `author.noArticles`
- `public/locales/zh/translation.json` — same
- `public/locales/ja/translation.json` — same
- `src/components/pages/TopicPage.tsx` — swap `t('common.noArticlesFound')` → `t('common.noData')`
- `src/components/pages/CategoryPage.tsx` — import + initialize `createTranslator`, swap hardcoded ternary for `t('common.noData')`
- `src/components/author/react/AuthorArticlesSection.tsx` — swap `t('author.noArticles')` → `t('common.noData')`
- `src/components/author/astro/AuthorArticlesSection.astro` — same swap

## Constraints
- TypeScript strict — no `any`
- Tailwind v4 only, no style changes (this task is text-only)
- Must keep both `/us` and `/asia` locale prefixes working
- Must not break existing Playwright specs that assert empty-state text (check `tests/e2e/category-ui.spec.ts`)

## Dependencies
- None blocking
- Soft dependency: any in-flight work touching the same translation files would conflict — none known

## i18n Keys
| Key | en | zh | ja |
|---|---|---|---|
| `common.noData` (new) | No data | 暂无数据 | データなし |
| `common.noArticlesFound` | _removed_ | _removed_ | _removed_ |
| `author.noArticles` | _removed_ | _removed_ | _removed_ |

## Verification Plan
1. `pnpm type-check` — must pass
2. `pnpm build` — must pass
3. Visual: open `/us/news?category=does-not-exist` (or any filter that returns empty) → see "No data"
4. Visual: open `/asia/news?...` empty state → see "暂无数据"
5. Visual: open an empty author page `/us/authors/<id>` → see "No data"
6. Run `tests/e2e/category-ui.spec.ts` — update any assertion that hardcodes "No articles found"
7. Grep `git diff` for any remaining "No articles found" string in `src/` and `public/locales/`

## Commit Message
```
refactor(i18n): replace "No articles found" empty state with "No data"

- Introduce common.noData (en/zh/ja) and remove the now-unused
  common.noArticlesFound and author.noArticles keys
- Migrate TopicPage, CategoryPage, AuthorArticlesSection (tsx + astro)
  to the new key
- Refactor CategoryPage's hardcoded locale ternary to use the
  createTranslator helper, matching TopicPage's pattern
```
