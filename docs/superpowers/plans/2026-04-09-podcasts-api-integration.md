# Podcasts API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Podcasts pages' dependency on the generic articles API with the dedicated Podcasts list/detail/translation APIs while preserving the existing frontend routes and UI structure.

**Architecture:** Add a dedicated `src/api/podcasts.ts` adapter layer that converts Podcasts API payloads into the subset of the existing `ApiArticle` shape consumed by current list/detail UI. Reuse the current `/voices/podcasts` and podcast detail pages with category-specific branching so the rest of the site remains untouched.

**Tech Stack:** Astro 5, React 19, TypeScript, Playwright, existing SSR fetch utilities

---

## File Map

- Modify: `src/types/index.ts`
  - Add typed Podcast API payloads only if needed for adapter clarity.
- Create: `src/api/podcasts.ts`
  - Fetch Podcasts list/detail/translation and map payloads into UI-facing shapes.
- Modify: `src/components/pages/CategoryPage.tsx`
  - Branch Podcast list loading to dedicated adapter when `category === 'Podcasts'`.
- Modify: `src/components/article/astro/BaseArticlePage.astro`
  - Branch Podcast detail loading and translation loading to dedicated adapter.
- Modify: `src/components/article/astro/PodcastContent.astro`
  - Limit language switch options to languages actually supported by podcast translations.
- Create: `tests/integration/podcasts-adapter.spec.ts`
  - Data contract coverage for Podcasts APIs and adapter assumptions.
- Create: `tests/e2e/podcasts-ui.spec.ts`
  - Page-level regression checks for Podcasts list/detail rendering and language switch.

## Task 1: Podcasts adapter + contract test

**Files:**
- Create: `src/api/podcasts.ts`
- Modify: `src/types/index.ts`
- Create: `tests/integration/podcasts-adapter.spec.ts`

- [ ] **Step 1: Write the failing Playwright API tests for Podcasts list/detail/translation contracts**
- [ ] **Step 2: Run only the new test file and verify it fails for the missing adapter imports/functions**
- [ ] **Step 3: Implement the minimal Podcasts fetch + mapping helpers in `src/api/podcasts.ts`**
- [ ] **Step 4: Re-run the new test file and verify it passes**
- [ ] **Step 5: Run `pnpm type-check` to verify the new adapter compiles cleanly**
- [ ] **Step 6: Commit task 1 with an English conventional commit**

## Task 2: Podcasts list page integration

**Files:**
- Modify: `src/components/pages/CategoryPage.tsx`
- Modify: `tests/e2e/podcasts-ui.spec.ts`

- [ ] **Step 1: Write the failing list-page regression test for `/voices/podcasts`**
- [ ] **Step 2: Run only that test and verify it fails against the current list contract**
- [ ] **Step 3: Implement minimal list-page branching to use `fetchPodcastsList` when category is Podcasts**
- [ ] **Step 4: Re-run the list-page test and verify it passes**
- [ ] **Step 5: Run `pnpm type-check` and targeted Playwright list-page test together**
- [ ] **Step 6: Start the dev server, open `/voices/podcasts`, take screenshots, and manually verify desktop/mobile list UI**
- [ ] **Step 7: Commit task 2 with an English conventional commit**

## Task 3: Podcasts detail + translation integration

**Files:**
- Modify: `src/components/article/astro/BaseArticlePage.astro`
- Modify: `src/components/article/astro/PodcastContent.astro`
- Modify: `tests/e2e/podcasts-ui.spec.ts`

- [ ] **Step 1: Write failing detail-page tests for podcast render + translation switch behavior**
- [ ] **Step 2: Run only those tests and verify they fail before implementation**
- [ ] **Step 3: Implement minimal detail-page branching to use `fetchPodcastDetail` and `fetchTranslatedPodcast`**
- [ ] **Step 4: Restrict Podcast language switch UI to supported languages from the API contract**
- [ ] **Step 5: Re-run the detail-page tests and verify they pass**
- [ ] **Step 6: Run `pnpm type-check` and the targeted Podcasts Playwright suite**
- [ ] **Step 7: Start the dev server, open a podcast detail page, take screenshots, click language switch, and verify transcript/body/video rendering**
- [ ] **Step 8: Commit task 3 with an English conventional commit**
