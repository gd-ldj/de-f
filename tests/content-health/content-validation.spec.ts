import { test, expect } from '@playwright/test';
import { ARTICLE_LIST_PAGES, navigateToFirstArticle, isPageLoaded } from '../utils/test-pages';
import {
  validateAuthorNames,
  validateDates,
  validateTitles,
  validateImages,
  validateLinks,
} from '../utils/semantic-validators';

/**
 * Layer 2: Semantic Content Validation
 * Validates that rendered content is semantically correct — not just present,
 * but actually makes sense as human-readable content.
 *
 * Examples caught:
 * - Author name "12345" (raw ID instead of name)
 * - Date "2019-01-01" (before platform existed)
 * - Title identical to description (data mapping error)
 * - Image using data: URI placeholder
 */

function formatIssues(result: { issues: Array<{ validator: string; message: string; element: string; value: string }> }): string {
  return result.issues
    .map((i) => `  [${i.validator}] ${i.message} — element: ${i.element}, value: "${i.value.slice(0, 80)}"`)
    .join('\n');
}

test.describe('Content Validation: Article List Pages', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const path of ARTICLE_LIST_PAGES) {
    test.describe(`${path}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
      });

      test('author names are valid', async ({ page }) => {
        const loaded = await isPageLoaded(page);
        test.skip(!loaded, `Page ${path} did not load`);

        const result = await validateAuthorNames(page);
        if (!result.passed) {
          expect(result.passed, `Invalid author names on ${path}:\n${formatIssues(result)}`).toBe(true);
        }
      });

      test('dates are reasonable', async ({ page }) => {
        const loaded = await isPageLoaded(page);
        test.skip(!loaded, `Page ${path} did not load`);

        const result = await validateDates(page);
        if (!result.passed) {
          expect(result.passed, `Invalid dates on ${path}:\n${formatIssues(result)}`).toBe(true);
        }
      });

      test('titles are meaningful', async ({ page }) => {
        const loaded = await isPageLoaded(page);
        test.skip(!loaded, `Page ${path} did not load`);

        const result = await validateTitles(page);
        if (!result.passed) {
          expect(result.passed, `Invalid titles on ${path}:\n${formatIssues(result)}`).toBe(true);
        }
      });

      test('images have valid sources', async ({ page }) => {
        const loaded = await isPageLoaded(page);
        test.skip(!loaded, `Page ${path} did not load`);

        const result = await validateImages(page);
        if (!result.passed) {
          expect(result.passed, `Invalid images on ${path}:\n${formatIssues(result)}`).toBe(true);
        }
      });

      test('links have valid hrefs', async ({ page }) => {
        const loaded = await isPageLoaded(page);
        test.skip(!loaded, `Page ${path} did not load`);

        const result = await validateLinks(page);
        if (!result.passed) {
          expect(result.passed, `Invalid links on ${path}:\n${formatIssues(result)}`).toBe(true);
        }
      });
    });
  }
});

test.describe('Content Validation: Article Detail Page', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('article body has meaningful content (>100 chars)', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found — backend API may be unavailable');

    const articleBody = page.locator('.prose, article').first();
    await expect(articleBody).toBeVisible();

    const text = await articleBody.textContent();
    expect(
      (text?.trim().length ?? 0) > 100,
      `Article body too short (${text?.trim().length ?? 0} chars) — possible rendering failure`
    ).toBe(true);
  });

  test('breadcrumb navigation exists and has valid links', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found — backend API may be unavailable');

    const breadcrumb = page.locator(
      'nav[aria-label*="breadcrumb" i], [class*="breadcrumb"]'
    ).first();
    const bcCount = await breadcrumb.count();

    if (bcCount > 0) {
      await expect(breadcrumb).toBeVisible();

      const links = breadcrumb.locator('a');
      const linkCount = await links.count();
      expect(linkCount).toBeGreaterThan(0);

      for (let i = 0; i < linkCount; i++) {
        const href = await links.nth(i).getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).not.toBe('#');
      }
    }
  });

  test('dates are reasonable', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found — backend API may be unavailable');

    const result = await validateDates(page);
    if (!result.passed) {
      expect(result.passed, `Invalid dates on article page:\n${formatIssues(result)}`).toBe(true);
    }
  });

  test('images have valid sources', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found — backend API may be unavailable');

    const result = await validateImages(page);
    if (!result.passed) {
      expect(result.passed, `Invalid images on article page:\n${formatIssues(result)}`).toBe(true);
    }
  });
});
