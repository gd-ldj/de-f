import type { Page, Locator } from '@playwright/test';

/**
 * Poison pattern scanner for DeTake pages.
 * Detects rendering bugs like [object Object], undefined, raw i18n keys, etc.
 */

export interface ScanMatch {
  pattern: string;
  text: string;
  selector: string;
}

export interface ScanResult {
  passed: boolean;
  matches: ScanMatch[];
}

// Poison patterns that indicate rendering bugs
const POISON_PATTERNS: Array<{ regex: RegExp; label: string }> = [
  { regex: /\[object\s+Object\]/i, label: '[object Object]' },
  { regex: /\{\{[^}]+\}\}/, label: 'unrendered template variable' },
  { regex: /\bTODO\b/i, label: 'TODO marker' },
  { regex: /\bFIXME\b/i, label: 'FIXME marker' },
  { regex: /\bPLACEHOLDER\b/i, label: 'PLACEHOLDER marker' },
];

// i18n raw key patterns (e.g., common.loadMore, article.by, navigation.home)
const I18N_KEY_PATTERN = /\b(?:common|article|navigation|footer|header|category|topic|auth|error|search|filter|home|page)\.\w+(?:\.\w+)*/;

// Patterns that are only poison in structural UI elements, not in article body
const STRICT_PATTERNS: Array<{ regex: RegExp; label: string }> = [
  { regex: /\bundefined\b/, label: 'undefined' },
  { regex: /\bnull\b/, label: 'null' },
  { regex: /\bNaN\b/, label: 'NaN' },
];

// Selectors for structural UI elements (strict checking)
const STRUCTURAL_SELECTORS = [
  // Card metadata areas
  '.article-card-vertical',
  '.article-card-horizontal',
  // Author areas
  '.text-foreground.uppercase',
  // Navigation and breadcrumbs
  'nav[aria-label*="breadcrumb"]',
  '[class*="breadcrumb"]',
  // Header and footer
  'header',
  'footer',
  // Tag/category labels
  '.text-primary.uppercase',
  '[class*="category"]',
  // Date elements
  'time',
];

// Selectors for article body (lenient checking — crypto articles may mention "null", "undefined")
const ARTICLE_BODY_SELECTORS = ['.prose', 'article'];

/**
 * Scan the entire visible page for poison patterns.
 * Uses strict rules on structural UI and lenient rules on article body.
 */
export async function scanPageForPoisonPatterns(page: Page): Promise<ScanResult> {
  const matches: ScanMatch[] = [];

  // 1. Scan structural UI elements with all patterns (including strict)
  for (const selector of STRUCTURAL_SELECTORS) {
    const elements = page.locator(selector);
    const count = await elements.count();

    for (let i = 0; i < count; i++) {
      const el = elements.nth(i);
      const isVisible = await el.isVisible().catch(() => false);
      if (!isVisible) continue;

      const text = await el.textContent().catch(() => '');
      if (!text) continue;

      // Check all poison patterns + strict patterns + i18n
      for (const { regex, label } of [...POISON_PATTERNS, ...STRICT_PATTERNS]) {
        if (regex.test(text)) {
          matches.push({ pattern: label, text: text.slice(0, 200), selector });
        }
      }

      if (I18N_KEY_PATTERN.test(text)) {
        const keyMatch = text.match(I18N_KEY_PATTERN);
        matches.push({
          pattern: 'raw i18n key',
          text: keyMatch?.[0] ?? text.slice(0, 200),
          selector,
        });
      }
    }
  }

  // 2. Scan article body with lenient patterns only (no strict patterns)
  for (const selector of ARTICLE_BODY_SELECTORS) {
    const elements = page.locator(selector);
    const count = await elements.count();

    for (let i = 0; i < count; i++) {
      const el = elements.nth(i);
      const isVisible = await el.isVisible().catch(() => false);
      if (!isVisible) continue;

      const text = await el.textContent().catch(() => '');
      if (!text) continue;

      for (const { regex, label } of POISON_PATTERNS) {
        if (regex.test(text)) {
          matches.push({ pattern: label, text: text.slice(0, 200), selector });
        }
      }

      if (I18N_KEY_PATTERN.test(text)) {
        const keyMatch = text.match(I18N_KEY_PATTERN);
        matches.push({
          pattern: 'raw i18n key',
          text: keyMatch?.[0] ?? text.slice(0, 200),
          selector,
        });
      }
    }
  }

  return {
    passed: matches.length === 0,
    matches,
  };
}

/**
 * Scan a specific element (and its descendants) for poison patterns.
 * Uses strict rules (all patterns).
 */
export async function scanElementForPoisonPatterns(
  page: Page,
  selector: string
): Promise<ScanResult> {
  const matches: ScanMatch[] = [];
  const elements = page.locator(selector);
  const count = await elements.count();

  for (let i = 0; i < count; i++) {
    const el = elements.nth(i);
    const isVisible = await el.isVisible().catch(() => false);
    if (!isVisible) continue;

    const text = await el.textContent().catch(() => '');
    if (!text) continue;

    for (const { regex, label } of [...POISON_PATTERNS, ...STRICT_PATTERNS]) {
      if (regex.test(text)) {
        matches.push({ pattern: label, text: text.slice(0, 200), selector });
      }
    }

    if (I18N_KEY_PATTERN.test(text)) {
      const keyMatch = text.match(I18N_KEY_PATTERN);
      matches.push({
        pattern: 'raw i18n key',
        text: keyMatch?.[0] ?? text.slice(0, 200),
        selector,
      });
    }
  }

  return {
    passed: matches.length === 0,
    matches,
  };
}
