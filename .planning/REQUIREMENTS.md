# Requirements

> Tracks high-level product requirements and their verification status.
> Populated as phases/tasks reference requirements.

| ID | Requirement | Status | Verified By |
|----|-------------|--------|-------------|
| R-001 | Multi-region routing (`/us` default, `/asia`) | ✓ verified | astro.config.mts + existing pages |
| R-002 | Three-locale i18n (en / zh / ja) | ✓ verified | src/locales/ |
| R-003 | SEO metadata (OG, canonical, sitemap, robots) | ✓ verified | BaseLayout.astro + sitemap generators |
| R-004 | Article list + detail pages | ✓ verified | src/pages/article/ + ArticleContent components |
| R-005 | Podcast category under Voices with YouTube embed | ✓ verified | task voices-podcasts-category |
| R-006 | Playwright test coverage (e2e / a11y / perf / integration) | ✓ verified | tests/ directory |
| R-007 | Vercel SSR deployment | ✓ verified | @astrojs/vercel adapter |
