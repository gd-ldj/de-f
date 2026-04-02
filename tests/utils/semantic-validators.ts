import type { Page } from '@playwright/test';

/**
 * Semantic content validators for DeTake pages.
 * Validates that rendered content makes sense (not just that elements exist).
 */

export interface ValidationIssue {
  validator: string;
  message: string;
  element: string;
  value: string;
}

export interface ValidationResult {
  passed: boolean;
  issues: ValidationIssue[];
}

function createResult(issues: ValidationIssue[]): ValidationResult {
  return { passed: issues.length === 0, issues };
}

/**
 * Validate author names in article cards.
 * Rules: not empty, not pure digits, 2-100 chars, no `[` or `{` anomalies.
 */
export async function validateAuthorNames(page: Page): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];

  // ArticleCard renders author in: span.text-foreground.uppercase (inside cards)
  const authorElements = page.locator(
    [
      '.article-card-vertical .text-foreground.uppercase',
      '.article-card-horizontal .text-foreground.uppercase',
      // Fallback: any uppercase author-like span near "by" text
      '.text-foreground.uppercase',
    ].join(', ')
  );

  const count = await authorElements.count();

  for (let i = 0; i < count; i++) {
    const el = authorElements.nth(i);
    const isVisible = await el.isVisible().catch(() => false);
    if (!isVisible) continue;

    const text = (await el.textContent())?.trim() ?? '';
    const selector = `author[${i}]`;

    if (!text) {
      issues.push({ validator: 'authorName', message: 'Author name is empty', element: selector, value: text });
      continue;
    }

    if (/^\d+$/.test(text)) {
      issues.push({ validator: 'authorName', message: 'Author name is pure digits', element: selector, value: text });
    }

    if (text.length < 2 || text.length > 100) {
      issues.push({ validator: 'authorName', message: `Author name length (${text.length}) out of range [2, 100]`, element: selector, value: text });
    }

    if (/[\[{]/.test(text)) {
      issues.push({ validator: 'authorName', message: 'Author name contains suspicious characters', element: selector, value: text });
    }
  }

  return createResult(issues);
}

/**
 * Validate dates on the page.
 * Rules: parseable as Date, not in the future (>1 year), not before 2020.
 */
export async function validateDates(page: Page): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];

  // ArticleCard uses <time> in horizontal layout and <span> in vertical layout
  const dateElements = page.locator('time, .article-card-vertical .text-muted-foreground');
  const count = await dateElements.count();

  for (let i = 0; i < count; i++) {
    const el = dateElements.nth(i);
    const isVisible = await el.isVisible().catch(() => false);
    if (!isVisible) continue;

    // Prefer datetime attribute, fallback to text content
    const datetime = await el.getAttribute('datetime').catch(() => null);
    const text = (await el.textContent())?.trim() ?? '';

    const dateStr = datetime ?? text;
    if (!dateStr) continue;

    // Try to parse the date
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      // Text content might be a formatted date string like "Jan 1, 2024"
      // Only flag if it looks like it should be a date (from <time> element or datetime attr)
      if (datetime) {
        issues.push({ validator: 'date', message: 'Date is not parseable', element: `date[${i}]`, value: dateStr });
      }
      continue;
    }

    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const earliest = new Date(2020, 0, 1);

    if (parsed > oneYearFromNow) {
      issues.push({ validator: 'date', message: 'Date is too far in the future (>1 year)', element: `date[${i}]`, value: dateStr });
    }

    if (parsed < earliest) {
      issues.push({ validator: 'date', message: 'Date is before 2020', element: `date[${i}]`, value: dateStr });
    }
  }

  return createResult(issues);
}

/**
 * Validate titles in article cards.
 * Rules: not empty, not same as description, 5-500 chars.
 */
export async function validateTitles(page: Page): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];

  // ArticleCard uses h3 (horizontal) and h4 (vertical) for titles
  const cards = page.locator('.article-card-vertical, .article-card-horizontal, article');
  const cardCount = await cards.count();

  for (let i = 0; i < cardCount; i++) {
    const card = cards.nth(i);
    const isVisible = await card.isVisible().catch(() => false);
    if (!isVisible) continue;

    const titleEl = card.locator('h3, h4').first();
    const titleCount = await titleEl.count();
    if (titleCount === 0) continue;

    const title = (await titleEl.textContent())?.trim() ?? '';
    const selector = `card[${i}].title`;

    if (!title) {
      issues.push({ validator: 'title', message: 'Title is empty', element: selector, value: title });
      continue;
    }

    if (title.length < 5 || title.length > 500) {
      issues.push({ validator: 'title', message: `Title length (${title.length}) out of range [5, 500]`, element: selector, value: title.slice(0, 100) });
    }

    // Check if title equals description
    const descEl = card.locator('p.text-muted-foreground').first();
    const descCount = await descEl.count();
    if (descCount > 0) {
      const desc = (await descEl.textContent())?.trim() ?? '';
      if (desc && title === desc) {
        issues.push({ validator: 'title', message: 'Title is identical to description', element: selector, value: title.slice(0, 100) });
      }
    }
  }

  return createResult(issues);
}

/**
 * Validate images in article cards.
 * Rules: src not empty, not data: URI, not a known placeholder.
 */
export async function validateImages(page: Page): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];

  const images = page.locator('.article-card-vertical img, .article-card-horizontal img, article img');
  const count = await images.count();

  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    const isVisible = await img.isVisible().catch(() => false);
    if (!isVisible) continue;

    const src = await img.getAttribute('src');
    const selector = `img[${i}]`;

    if (!src || src.trim() === '') {
      issues.push({ validator: 'image', message: 'Image src is empty', element: selector, value: src ?? '' });
      continue;
    }

    if (src.startsWith('data:')) {
      issues.push({ validator: 'image', message: 'Image uses data: URI (likely placeholder)', element: selector, value: src.slice(0, 80) });
    }

    if (/placeholder|dummy|example\.(png|jpg|svg)/i.test(src)) {
      issues.push({ validator: 'image', message: 'Image appears to be a placeholder', element: selector, value: src });
    }
  }

  return createResult(issues);
}

/**
 * Validate links in article cards.
 * Rules: href not empty, not `#`, not `javascript:`.
 */
export async function validateLinks(page: Page): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];

  const links = page.locator('.article-card-vertical a, .article-card-horizontal a, article a');
  const count = await links.count();

  for (let i = 0; i < count; i++) {
    const link = links.nth(i);
    const isVisible = await link.isVisible().catch(() => false);
    if (!isVisible) continue;

    const href = await link.getAttribute('href');
    const selector = `link[${i}]`;

    if (!href || href.trim() === '') {
      issues.push({ validator: 'link', message: 'Link href is empty', element: selector, value: href ?? '' });
      continue;
    }

    if (href === '#') {
      issues.push({ validator: 'link', message: 'Link href is just "#"', element: selector, value: href });
    }

    if (href.startsWith('javascript:')) {
      issues.push({ validator: 'link', message: 'Link uses javascript: protocol', element: selector, value: href });
    }
  }

  return createResult(issues);
}
