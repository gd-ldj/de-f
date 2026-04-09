import { test, expect } from '@playwright/test';
import { TEST_PAGES, navigateToFirstArticle, isPageLoaded } from '../utils/test-pages';

/**
 * P0: Integration Tests — Internationalization (i18n)
 * Verifies translation keys don't leak, language switch works, and hreflang tags exist.
 */

// Patterns that indicate raw i18n keys leaked into rendered content
const I18N_KEY_PATTERNS = [
  /\bcommon\.\w+/,
  /\barticle\.\w+/,
  /\bhome\.\w+/,
  /\bnav\.\w+/,
  /\bfooter\.\w+/,
  /\bauth\.\w+/,
  /\bfilter\.\w+/,
  /\bpagination\.\w+/,
  /\berror\.\w+/,
];

test.describe('i18n: Translation Key Leak Detection', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const [name, path] of Object.entries(TEST_PAGES)) {
    test(`${name} page — no leaked i18n keys`, async ({ page }) => {
      await test.step(`navigate to ${path}`, async () => {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        const loaded = await isPageLoaded(page);
        test.skip(!loaded, `Page ${path} did not load`);
      });

      let textContent = '';
      await test.step('extract all visible text content', async () => {
        textContent = await page.evaluate(() => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const texts: string[] = [];
          let node: Node | null;
          while ((node = walker.nextNode())) {
            const text = node.textContent?.trim();
            if (text && text.length > 0) {
              texts.push(text);
            }
          }
          return texts.join(' ');
        });
      });

      await test.step('scan for leaked i18n key patterns', async () => {
        const leaks: string[] = [];
        for (const pattern of I18N_KEY_PATTERNS) {
          const match = textContent.match(pattern);
          if (match) {
            const context = textContent.substring(
              Math.max(0, textContent.indexOf(match[0]) - 20),
              textContent.indexOf(match[0]) + match[0].length + 20
            );
            if (!context.includes('`') && !context.includes('<code>')) {
              leaks.push(`"${match[0]}" in context: "...${context}..."`);
            }
          }
        }
        expect(leaks, `Found leaked i18n keys on ${path}:\n${leaks.join('\n')}`).toHaveLength(0);
      });
    });
  }
});

test.describe('i18n: Language Switch & hreflang', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('article detail has language switch links', async ({ page }) => {
    await test.step('navigate to first article', async () => {
      const url = await navigateToFirstArticle(page);
      test.skip(!url, 'No article found — API may be unavailable');
    });

    await test.step('verify language switch button/link exists', async () => {
      const langLinks = page.locator(
        'a[hreflang], [data-testid="language-switch"], a[href*="/zh/"], a[href*="/ja/"], button[aria-label*="language"], button[aria-label*="Language"]'
      );
      const count = await langLinks.count();
      expect(count, 'Expected at least one language-related link or button').toBeGreaterThan(0);
    });
  });

  test('article detail has hreflang alternate tags', async ({ page }) => {
    await test.step('navigate to first article', async () => {
      const url = await navigateToFirstArticle(page);
      test.skip(!url, 'No article found — API may be unavailable');
    });

    await test.step('verify <link rel="alternate" hreflang="xx"> tags exist', async () => {
      const hreflangTags = await page.locator('link[rel="alternate"][hreflang]').count();
      expect(hreflangTags, 'Expected hreflang alternate tags on article page').toBeGreaterThan(0);
    });
  });

  test('home page has hreflang tags', async ({ page }) => {
    await test.step('navigate to home page', async () => {
      await page.goto(TEST_PAGES.home);
      await page.waitForLoadState('networkidle');
      const loaded = await isPageLoaded(page);
      test.skip(!loaded, 'Home page did not load');
    });

    await test.step('verify hreflang tags exist', async () => {
      const hreflangTags = await page.locator('link[rel="alternate"][hreflang]').count();
      expect(hreflangTags, 'Expected hreflang tags on home page').toBeGreaterThan(0);
    });
  });
});
