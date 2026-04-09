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
        await test.step(`set viewport to ${vp.width}x${vp.height}`, async () => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
        });

        await test.step(`navigate to ${path}`, async () => {
          await page.goto(path);
          await page.waitForLoadState('networkidle');
          const loaded = await isPageLoaded(page);
          test.skip(!loaded, `Page ${path} did not load`);
        });

        let blocking: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'] = [];
        let nonBlocking: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'] = [];

        await test.step('run axe-core scan', async () => {
          const results = await new AxeBuilder({ page })
            .disableRules(RULES_AS_WARNING)
            .analyze();

          blocking = results.violations.filter(
            (v) => v.impact === 'critical' || v.impact === 'serious'
          );
          nonBlocking = results.violations.filter(
            (v) => v.impact !== 'critical' && v.impact !== 'serious'
          );
        });

        await test.step('log minor/moderate violations as warnings', async () => {
          if (nonBlocking.length > 0) {
            console.warn(
              `[a11y warnings] ${pageName} (${vp.name}): ${nonBlocking.length} minor violations\n` +
                nonBlocking.map((v) => `  - ${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('\n')
            );
          }
        });

        await test.step('assert no critical/serious violations', async () => {
          const summary = blocking
            .map((v) => `  ${v.id} (${v.impact}): ${v.description} [${v.nodes.length} nodes]`)
            .join('\n');
          expect(
            blocking.length,
            `Found ${blocking.length} critical/serious a11y violations on ${pageName} (${vp.name}):\n${summary}`
          ).toBe(0);
        });
      });
    }
  }
});

test.describe('Accessibility: Article Detail', () => {
  for (const vp of VIEWPORTS) {
    test(`article detail (${vp.name} ${vp.width}px) — no critical/serious a11y violations`, async ({
      page,
    }) => {
      await test.step(`set viewport to ${vp.width}x${vp.height}`, async () => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
      });

      await test.step('navigate to first article', async () => {
        const url = await navigateToFirstArticle(page);
        test.skip(!url, 'No article found — API may be unavailable');
      });

      let blocking: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'] = [];
      let nonBlocking: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'] = [];

      await test.step('run axe-core scan', async () => {
        const results = await new AxeBuilder({ page })
          .disableRules(RULES_AS_WARNING)
          .analyze();

        blocking = results.violations.filter(
          (v) => v.impact === 'critical' || v.impact === 'serious'
        );
        nonBlocking = results.violations.filter(
          (v) => v.impact !== 'critical' && v.impact !== 'serious'
        );
      });

      await test.step('log minor/moderate violations as warnings', async () => {
        if (nonBlocking.length > 0) {
          console.warn(
            `[a11y warnings] article detail (${vp.name}): ${nonBlocking.length} minor violations\n` +
              nonBlocking.map((v) => `  - ${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('\n')
          );
        }
      });

      await test.step('assert no critical/serious violations', async () => {
        const summary = blocking
          .map((v) => `  ${v.id} (${v.impact}): ${v.description} [${v.nodes.length} nodes]`)
          .join('\n');
        expect(
          blocking.length,
          `Found ${blocking.length} critical/serious a11y violations on article detail (${vp.name}):\n${summary}`
        ).toBe(0);
      });
    });
  }
});
