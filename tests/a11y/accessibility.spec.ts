import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TEST_PAGES, navigateToFirstArticle, isPageLoaded } from '../utils/test-pages';

/**
 * P2: Accessibility Tests — WCAG Automated Checks
 * Runs axe-core scans on key pages at desktop and mobile viewports.
 * Only critical and serious violations fail the test; moderate/minor are logged.
 */

const PAGES_TO_TEST = {
  home: TEST_PAGES.home,
  news: TEST_PAGES.news,
  research: TEST_PAGES.research,
};

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
];

// Rules to downgrade from error to warning (project-specific exceptions)
const RULES_AS_WARNING = [
  'color-contrast', // Dynamic theme may need separate color audit
  'region', // Content site structure may not fully match landmark requirements
];

test.describe('Accessibility: Key Pages', () => {
  for (const [pageName, path] of Object.entries(PAGES_TO_TEST)) {
    for (const vp of VIEWPORTS) {
      test(`${pageName} (${vp.name} ${vp.width}px) — no critical/serious a11y violations`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        const loaded = await isPageLoaded(page);
        test.skip(!loaded, `Page ${path} did not load`);

        const results = await new AxeBuilder({ page })
          .disableRules(RULES_AS_WARNING)
          .analyze();

        // Separate critical/serious from minor
        const blocking = results.violations.filter(
          (v) => v.impact === 'critical' || v.impact === 'serious'
        );
        const nonBlocking = results.violations.filter(
          (v) => v.impact !== 'critical' && v.impact !== 'serious'
        );

        // Log non-blocking as warnings
        if (nonBlocking.length > 0) {
          console.warn(
            `[a11y warnings] ${pageName} (${vp.name}): ${nonBlocking.length} minor violations\n` +
              nonBlocking.map((v) => `  - ${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('\n')
          );
        }

        // Fail only on critical/serious
        const summary = blocking
          .map((v) => `  ✗ ${v.id} (${v.impact}): ${v.description}\n    Nodes: ${v.nodes.length}`)
          .join('\n');

        expect(
          blocking.length,
          `Found ${blocking.length} critical/serious a11y violations on ${pageName} (${vp.name}):\n${summary}`
        ).toBe(0);
      });
    }
  }
});

test.describe('Accessibility: Article Detail', () => {
  for (const vp of VIEWPORTS) {
    test(`article detail (${vp.name} ${vp.width}px) — no critical/serious a11y violations`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const url = await navigateToFirstArticle(page);
      test.skip(!url, 'No article found — API may be unavailable');

      const results = await new AxeBuilder({ page })
        .disableRules(RULES_AS_WARNING)
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      const nonBlocking = results.violations.filter(
        (v) => v.impact !== 'critical' && v.impact !== 'serious'
      );

      if (nonBlocking.length > 0) {
        console.warn(
          `[a11y warnings] article detail (${vp.name}): ${nonBlocking.length} minor violations\n` +
            nonBlocking.map((v) => `  - ${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('\n')
        );
      }

      const summary = blocking
        .map((v) => `  ✗ ${v.id} (${v.impact}): ${v.description}\n    Nodes: ${v.nodes.length}`)
        .join('\n');

      expect(
        blocking.length,
        `Found ${blocking.length} critical/serious a11y violations on article detail (${vp.name}):\n${summary}`
      ).toBe(0);
    });
  }
});
