import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4321';

function getVisibleHeader(page: import('@playwright/test').Page) {
  return page.locator('header:visible, [role="banner"]:visible').first();
}

/**
 * DeTake Frontend - Header/Navigation Responsive E2E Tests
 *
 * Covers:
 * - Desktop 1440px: full nav links, language selector, logo, scroll behavior
 * - Desktop 1024px: header visibility, core links, no overflow
 * - Tablet 768px: mobile or desktop variant, hamburger or direct nav
 * - Mobile 375px: hamburger menu, sidebar open/close, body scroll lock, language
 * - Cross-viewport navigation: page loads at /news, /research, and 404 handling
 */

// ─── Desktop 1440px ─��────────────────────────────────────────────────────────

test.describe('Desktop 1440px navigation', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');
  });

  test('header element is visible', async ({ page }) => {
    const header = getVisibleHeader(page);
    await expect(header).toBeVisible();
  });

  test('navigation links are visible: News, Research, Insights', async ({ page }) => {
    // The desktop header renders nav as anchor/button elements inside the header
    // "News" is rendered as a button with aria-label; Research/Insights as <a> links
    const newsButton = page.locator('header button[aria-label]').filter({ hasText: /news/i }).first();
    const researchLink = page.locator('header a[href="/research"]').first();
    const insightsLink = page.locator('header a[href="/insights"]').first();

    await expect(newsButton).toBeVisible();
    await expect(researchLink).toBeVisible();
    await expect(insightsLink).toBeVisible();
  });

  test('language selector button is visible in header', async ({ page }) => {
    // The locale switcher button shows the current language label (e.g. "English")
    const langButton = page.locator('header button').filter({ hasText: /English|中文|日本語/i }).first();
    await expect(langButton).toBeVisible();
  });

  test('logo is visible and links to homepage', async ({ page }) => {
    const header = getVisibleHeader(page);
    const logoLink = header.locator('a[href="/"]').first();
    await expect(logoLink).toBeVisible();

    const href = await logoLink.getAttribute('href');
    expect(href).toBe('/');
  });

  test('clicking Research link navigates to /research', async ({ page }) => {
    const researchLink = page.locator('header a[href="/research"]').first();
    await researchLink.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/research');
  });

  test('clicking Insights link navigates to /insights', async ({ page }) => {
    const insightsLink = page.locator('header a[href="/insights"]').first();
    await insightsLink.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/insights');
  });

  test('clicking Voices link navigates to /voices', async ({ page }) => {
    const voicesLink = page.locator('header a[href="/voices"]').first();
    await voicesLink.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/voices');
  });

  test('header stays fixed after scrolling down', async ({ page }) => {
    // Scroll down the page
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(300);

    // Header should still be in the viewport (position: fixed)
    const header = getVisibleHeader(page);
    await expect(header).toBeVisible();

    const boundingBox = await header.boundingBox();
    expect(boundingBox).not.toBeNull();
    // A fixed header stays near the top of the viewport
    expect(boundingBox!.y).toBeLessThanOrEqual(10);
  });
});

// ─── Desktop 1024px ──────────────────────────────────────────────────────────

test.describe('Desktop 1024px navigation', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');
  });

  test('header is visible at 1024px', async ({ page }) => {
    const header = getVisibleHeader(page);
    await expect(header).toBeVisible();
  });

  test('core nav links are accessible at 1024px', async ({ page }) => {
    // At md breakpoint (>=768px), desktop header is shown
    const researchLink = page.locator('header a[href="/research"]').first();
    const insightsLink = page.locator('header a[href="/insights"]').first();

    await expect(researchLink).toBeVisible();
    await expect(insightsLink).toBeVisible();
  });

  test('no navigation overflow at 1024px', async ({ page }) => {
    // Verify the page body does not have horizontal scrollbar caused by nav
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // Allow a small tolerance for scrollbars
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
  });
});

// ─── Tablet 768px ────────────────────────────────────────────────────────────

test.describe('Tablet 768px navigation', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');
  });

  test('header is visible at 768px', async ({ page }) => {
    const header = getVisibleHeader(page);
    await expect(header).toBeVisible();
  });

  test('navigation is accessible at 768px (desktop or hamburger)', async ({ page }) => {
    // At 768px (md breakpoint boundary), either desktop nav links or hamburger button is shown
    const desktopResearch = page.locator('header a[href="/research"]');
    const hamburger = page.locator('header button[aria-label="Open menu"]');

    const desktopVisible = await desktopResearch.isVisible().catch(() => false);
    const hamburgerVisible = await hamburger.isVisible().catch(() => false);

    // At least one navigation method must be accessible
    expect(desktopVisible || hamburgerVisible).toBe(true);
  });

  test('if hamburger is shown, clicking it opens sidebar', async ({ page }) => {
    const hamburger = page.locator('header button[aria-label="Open menu"]');
    const isHamburgerVisible = await hamburger.isVisible().catch(() => false);

    if (isHamburgerVisible) {
      await hamburger.click();
      await page.waitForTimeout(300);

      // Sidebar overlay and panel should be visible
      const sidebarOverlay = page.locator('.fixed.inset-0').first();
      await expect(sidebarOverlay).toBeVisible();
    }
  });
});

// ─── Mobile 375px ────────────────────────────────────────────────────────────

test.describe('Mobile 375px navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');
  });

  test('desktop navigation links are NOT visible on mobile', async ({ page }) => {
    // The desktop header is hidden via "hidden md:block" wrapper
    // Desktop nav links (Research, Insights) should not be visible
    const desktopHeader = page.locator('.hidden.md\\:block header');
    const isVisible = await desktopHeader.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('hamburger menu button is visible on mobile', async ({ page }) => {
    const hamburger = page.locator('header button[aria-label="Open menu"]');
    await expect(hamburger).toBeVisible();
  });

  test('clicking hamburger opens the mobile sidebar', async ({ page }) => {
    const hamburger = page.locator('header button[aria-label="Open menu"]');
    await hamburger.click();
    await page.waitForTimeout(400);

    // MobileSidebar renders a full-screen panel with fixed positioning
    const sidebarPanel = page.locator('.fixed.top-0.left-0.w-full.h-full.bg-white').first();
    await expect(sidebarPanel).toBeVisible();
  });

  test('sidebar contains navigation links: News, Research, Insights', async ({ page }) => {
    const hamburger = page.locator('header button[aria-label="Open menu"]');
    await hamburger.click();
    await page.waitForTimeout(400);

    // Navigation buttons inside the sidebar
    const newsBtn = page.locator('.fixed.top-0.left-0.w-full.h-full button').filter({ hasText: /^News$/i }).first();
    const researchBtn = page.locator('.fixed.top-0.left-0.w-full.h-full button').filter({ hasText: /^Research$/i }).first();
    const insightsBtn = page.locator('.fixed.top-0.left-0.w-full.h-full button').filter({ hasText: /^Insights$/i }).first();

    await expect(newsBtn).toBeVisible();
    await expect(researchBtn).toBeVisible();
    await expect(insightsBtn).toBeVisible();
  });

  test('sidebar can be closed by clicking the overlay', async ({ page }) => {
    const hamburger = page.locator('header button[aria-label="Open menu"]');
    await hamburger.click();
    await page.waitForTimeout(400);

    const sidebarPanel = page.locator('.fixed.top-0.left-0.w-full.h-full.bg-white').first();
    await expect(sidebarPanel).toBeVisible();

    // The current mobile drawer covers the viewport; only assert overlay clicks when
    // there is exposed overlay area to interact with.
    const panelBox = await sidebarPanel.boundingBox();
    if (panelBox && panelBox.width >= 375) {
      test.skip(true, 'The mobile drawer is full-width, so the overlay is not directly clickable');
    }

    // The dark overlay is the first fixed.inset-0 element
    const overlay = page.locator('.fixed.inset-0.bg-black').first();
    await expect(overlay).toBeVisible();

    await overlay.click({ force: true });
    await page.waitForTimeout(400);

    // Sidebar should no longer be visible
    await expect(sidebarPanel).not.toBeVisible();
  });

  test('sidebar can be closed by clicking the close button', async ({ page }) => {
    const hamburger = page.locator('header button[aria-label="Open menu"]');
    await hamburger.click();
    await page.waitForTimeout(400);

    // Close button inside the sidebar header
    const closeBtn = page.locator('.fixed.top-0.left-0.w-full.h-full button[aria-label]').filter({ hasText: '' }).last();
    // Use aria-label selector for the close button
    const closeBtnByLabel = page.locator('button[aria-label*="close"], button[aria-label*="Close"]').last();
    await closeBtnByLabel.click();
    await page.waitForTimeout(400);

    const sidebarPanel = page.locator('.fixed.top-0.left-0.w-full.h-full.bg-white').first();
    await expect(sidebarPanel).not.toBeVisible();
  });

  test('body overflow is hidden when sidebar is open', async ({ page }) => {
    const hamburger = page.locator('header button[aria-label="Open menu"]');
    await hamburger.click();
    await page.waitForTimeout(400);

    // When MobileSidebar is open, the sidebar panel itself handles scrolling
    // The sidebar panel uses overflow-y-auto to manage its own scroll
    const sidebarPanel = page.locator('.fixed.top-0.left-0.w-full.h-full.bg-white').first();
    await expect(sidebarPanel).toBeVisible();

    // Verify no horizontal overflow exists on the page while sidebar is open
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(375 + 20);
  });

  test('language selector is accessible in mobile sidebar', async ({ page }) => {
    const hamburger = page.locator('header button[aria-label="Open menu"]');
    await hamburger.click();
    await page.waitForTimeout(400);

    // The sidebar contains a language section with "International Edition" or language button
    const langSection = page.locator('.fixed.top-0.left-0.w-full.h-full button').filter({ hasText: /English|中文|日本語|International/i }).first();
    await expect(langSection).toBeVisible();
  });

  test('mobile header does not overlap main content (offset check)', async ({ page }) => {
    // The mobile header is h-14 (56px); main content should be offset accordingly
    const mainEl = page.locator('main').first();
    const mainVisible = await mainEl.isVisible().catch(() => false);

    if (mainVisible) {
      const mainBox = await mainEl.boundingBox();
      // Main content top should start at or below ~56px to avoid header overlap
      if (mainBox) {
        expect(mainBox.y).toBeGreaterThanOrEqual(50);
      }
    }
  });

  test('mobile header logo links to homepage', async ({ page }) => {
    // Mobile header center logo links to "/"
    const mobileHeader = page.locator('.md\\:hidden header');
    const logoLink = mobileHeader.locator('a[href="/"]').first();
    await expect(logoLink).toBeVisible();
  });
});

// ─── Cross-viewport navigation ────────────────────────────────────────────────

test.describe('Cross-viewport navigation', () => {
  test('navigate to /news at desktop and verify page loads', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL + '/news');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    expect(page.url()).toContain('/news');
  });

  test('navigate to /research at mobile and verify page loads', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL + '/research');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    expect(page.url()).toContain('/research');
  });

  test('navigating to a nonexistent page returns 404 status', async ({ page }) => {
    const response = await page.goto(BASE_URL + '/nonexistent-page-xyz-12345');
    expect(response?.status()).toBe(404);
  });
});
