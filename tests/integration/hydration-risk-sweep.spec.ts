import { expect, test, type Page } from '@playwright/test';
import { TEST_PAGES, isPageLoaded } from '../utils/test-pages';

const HYDRATION_MESSAGE_PATTERN =
  /hydrat|server-rendered|did not match|didn't match|expected server html|tree hydrated|hydrateroot|minified react error/i;

const SWEEP_PAGES = [
  { name: 'home', path: TEST_PAGES.home },
  { name: 'news', path: TEST_PAGES.news },
  { name: 'insights', path: TEST_PAGES.insights },
  { name: 'research', path: TEST_PAGES.research },
  { name: 'voices', path: TEST_PAGES.voices },
  { name: 'tutorials', path: TEST_PAGES.tutorials },
  { name: 'collections detail', path: '/collections/17' },
] as const;

function collectHydrationSignals(page: Page) {
  const pageErrors: string[] = [];
  const consoleSignals: string[] = [];

  page.on('pageerror', (error) => {
    if (HYDRATION_MESSAGE_PATTERN.test(error.message)) {
      pageErrors.push(error.message);
    }
  });

  page.on('console', (message) => {
    if (!['warning', 'error'].includes(message.type())) {
      return;
    }

    const text = message.text();
    if (HYDRATION_MESSAGE_PATTERN.test(text)) {
      consoleSignals.push(`[${message.type()}] ${text}`);
    }
  });

  return { pageErrors, consoleSignals };
}

async function assertNoHydrationSignals(page: Page, path: string) {
  const { pageErrors, consoleSignals } = collectHydrationSignals(page);

  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const loaded = await isPageLoaded(page);
  test.skip(!loaded, `Page ${path} did not load`);

  await page.waitForTimeout(1500);

  expect(
    pageErrors,
    `Found hydration page errors on ${path}:\n${pageErrors.join('\n')}`,
  ).toEqual([]);
  expect(
    consoleSignals,
    `Found hydration console signals on ${path}:\n${consoleSignals.join('\n')}`,
  ).toEqual([]);
}

test.describe('Hydration risk sweep - desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const target of SWEEP_PAGES) {
    test(`${target.name} stays hydration-clean on desktop`, async ({ page }) => {
      await assertNoHydrationSignals(page, target.path);
    });
  }
});

test.describe('Hydration risk sweep - mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const target of SWEEP_PAGES) {
    test(`${target.name} stays hydration-clean on mobile`, async ({ page }) => {
      await assertNoHydrationSignals(page, target.path);
    });
  }
});
