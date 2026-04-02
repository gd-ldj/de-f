import type { Page } from '@playwright/test';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface Anomaly {
  type: string;
  severity: 'error' | 'warning';
  message: string;
  element: string;
  details?: Record<string, unknown>;
}

export interface AnomalyResult {
  passed: boolean;
  anomalies: Anomaly[];
}

function result(anomalies: Anomaly[]): AnomalyResult {
  return {
    passed: anomalies.filter((a) => a.severity === 'error').length === 0,
    anomalies,
  };
}

// ─────────────────────────────────────────────
// 1. Broken Images Detection
// ─────────────────────────────────────────────

export async function detectBrokenImages(page: Page): Promise<AnomalyResult> {
  const anomalies = await page.evaluate(() => {
    const issues: Anomaly[] = [];
    const imgs = document.querySelectorAll('img');

    for (const img of imgs) {
      // Skip decorative images
      if (img.getAttribute('alt') === '' || img.getAttribute('role') === 'presentation') {
        continue;
      }

      // Skip invisible images (display:none, zero size containers)
      const rect = img.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;

      const style = getComputedStyle(img);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      if (img.complete && img.naturalWidth === 0) {
        issues.push({
          type: 'broken-image',
          severity: 'error',
          message: `Image failed to load: ${img.src?.slice(0, 120) || '(no src)'}`,
          element: describeElement(img),
          details: { src: img.src, alt: img.alt },
        });
      } else if (!img.complete) {
        issues.push({
          type: 'broken-image',
          severity: 'warning',
          message: `Image still loading: ${img.src?.slice(0, 120) || '(no src)'}`,
          element: describeElement(img),
          details: { src: img.src },
        });
      }
    }
    return issues;

    function describeElement(el: Element): string {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const cls = el.className && typeof el.className === 'string'
        ? `.${el.className.split(' ').slice(0, 2).join('.')}`
        : '';
      return `${tag}${id}${cls}`;
    }
  });

  return result(anomalies);
}

// ─────────────────────────────────────────────
// 2. Overflow Detection
// ─────────────────────────────────────────────

export async function detectOverflow(page: Page, viewportWidth: number): Promise<AnomalyResult> {
  const anomalies = await page.evaluate(
    ({ vw }) => {
      const issues: Anomaly[] = [];

      // Check document-level horizontal overflow
      const scrollW = document.documentElement.scrollWidth;
      if (scrollW > vw + 1) {
        issues.push({
          type: 'overflow',
          severity: 'error',
          message: `Document horizontal overflow: scrollWidth=${scrollW}px > viewport=${vw}px (${scrollW - vw}px excess)`,
          element: 'html',
          details: { scrollWidth: scrollW, viewportWidth: vw },
        });
      }

      // Check key containers for child overflow
      const containers = document.querySelectorAll(
        'main, header, footer, [class*="article-card-"]'
      );
      for (const container of containers) {
        const cRect = container.getBoundingClientRect();
        if (cRect.width === 0) continue;

        for (const child of container.children) {
          const childRect = child.getBoundingClientRect();
          if (childRect.width === 0) continue;

          const overflowRight = childRect.right - cRect.right;
          if (overflowRight > 2) {
            issues.push({
              type: 'overflow',
              severity: 'warning',
              message: `Child overflows parent by ${Math.round(overflowRight)}px to the right`,
              element: describeElement(child),
              details: {
                parent: describeElement(container),
                overflowPx: Math.round(overflowRight),
              },
            });
          }
        }
      }

      return issues;

      function describeElement(el: Element): string {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className && typeof el.className === 'string'
          ? `.${el.className.split(' ').slice(0, 2).join('.')}`
          : '';
        return `${tag}${id}${cls}`;
      }
    },
    { vw: viewportWidth }
  );

  return result(anomalies);
}

// ─────────────────────────────────────────────
// 3. Invisible / Empty Content Detection
// ─────────────────────────────────────────────

export async function detectInvisibleContent(page: Page): Promise<AnomalyResult> {
  const anomalies = await page.evaluate(() => {
    const issues: Anomaly[] = [];

    // Critical elements that should never be empty
    const criticalSelectors = [
      { selector: 'header', label: 'Header' },
      { selector: 'main', label: 'Main content' },
    ];

    for (const { selector, label } of criticalSelectors) {
      const el = document.querySelector(selector);
      if (!el) {
        issues.push({
          type: 'empty-container',
          severity: 'error',
          message: `${label} element (<${selector}>) not found in DOM`,
          element: selector,
        });
        continue;
      }

      const text = el.textContent?.trim() || '';
      const imgs = el.querySelectorAll('img');
      if (text.length === 0 && imgs.length === 0) {
        issues.push({
          type: 'empty-container',
          severity: 'error',
          message: `${label} is empty — no visible text or images`,
          element: selector,
        });
      }
    }

    // Article cards should not be empty if they exist
    const cards = document.querySelectorAll(
      '[class*="article-card-vertical"], [class*="article-card-horizontal"]'
    );
    for (const card of cards) {
      const text = card.textContent?.trim() || '';
      if (text.length === 0) {
        issues.push({
          type: 'empty-container',
          severity: 'error',
          message: 'Article card is empty — no visible text',
          element: describeElement(card),
        });
      }
    }

    // Headings should not be empty strings
    const headings = document.querySelectorAll('h1, h2, h3, h4');
    for (const h of headings) {
      const style = getComputedStyle(h);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      const text = h.textContent?.trim() || '';
      if (text.length === 0) {
        issues.push({
          type: 'empty-container',
          severity: 'warning',
          message: `Empty heading <${h.tagName.toLowerCase()}> found`,
          element: describeElement(h),
        });
      }
    }

    return issues;

    function describeElement(el: Element): string {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const cls = el.className && typeof el.className === 'string'
        ? `.${el.className.split(' ').slice(0, 2).join('.')}`
        : '';
      return `${tag}${id}${cls}`;
    }
  });

  return result(anomalies);
}

// ─────────────────────────────────────────────
// 4. Layout Anomalies Detection
// ─────────────────────────────────────────────

interface LayoutContext {
  pagePath: string;
  viewportWidth: number;
}

export async function detectLayoutAnomalies(
  page: Page,
  ctx: LayoutContext
): Promise<AnomalyResult> {
  const { pagePath, viewportWidth } = ctx;
  const isDesktop = viewportWidth >= 1024;
  const isMobile = viewportWidth < 768;

  const anomalies = await page.evaluate(
    ({ path, desktop, mobile }) => {
      const issues: Anomaly[] = [];

      // Homepage layout checks
      if (path === '/') {
        if (desktop) {
          // Desktop homepage should have 3-column grid (grid-cols-12 with 3+6+3)
          const gridContainer = document.querySelector('.grid.grid-cols-12');
          if (!gridContainer) {
            issues.push({
              type: 'layout-anomaly',
              severity: 'error',
              message: 'Homepage desktop: expected 3-column grid (grid-cols-12) not found',
              element: 'main',
            });
          } else {
            const cols = gridContainer.children;
            if (cols.length >= 3) {
              const rects = Array.from(cols)
                .slice(0, 3)
                .map((c) => c.getBoundingClientRect());

              // Verify left → center → right ordering
              if (!(rects[0].x < rects[1].x && rects[1].x < rects[2].x)) {
                issues.push({
                  type: 'layout-anomaly',
                  severity: 'error',
                  message: `Homepage: columns not in left→center→right order (x: ${rects.map((r) => Math.round(r.x)).join(', ')})`,
                  element: describeElement(gridContainer),
                });
              }
            }
          }
        }

        if (mobile) {
          // Mobile homepage: main sections should stack vertically
          const mainEl = document.querySelector('main');
          if (mainEl) {
            const sections = mainEl.querySelectorAll(':scope > div, :scope > section');
            const rects = Array.from(sections).map((s) => s.getBoundingClientRect());
            for (let i = 1; i < rects.length; i++) {
              if (rects[i].width > 0 && rects[i - 1].width > 0) {
                // Sections that overlap horizontally more than 50% but not stacked vertically
                const overlapX =
                  Math.min(rects[i].right, rects[i - 1].right) -
                  Math.max(rects[i].x, rects[i - 1].x);
                const overlap = overlapX > rects[i].width * 0.5;
                if (!overlap && rects[i].y < rects[i - 1].bottom - 5) {
                  issues.push({
                    type: 'layout-anomaly',
                    severity: 'warning',
                    message: 'Mobile homepage: sections appear to be side-by-side instead of stacked',
                    element: describeElement(sections[i]),
                  });
                }
              }
            }
          }
        }
      }

      // Article detail page layout checks
      if (path.includes('/article/') || path.includes('/news/') || path.includes('/research/')) {
        if (desktop) {
          const twoCol = document.querySelector('.layout-two-column-fixed-1440');
          if (twoCol) {
            const children = Array.from(twoCol.children);
            if (children.length >= 2) {
              const mainRect = children[0].getBoundingClientRect();
              const sideRect = children[1].getBoundingClientRect();
              if (sideRect.x < mainRect.x) {
                issues.push({
                  type: 'layout-anomaly',
                  severity: 'error',
                  message: 'Article detail: sidebar is positioned left of main content',
                  element: '.layout-two-column-fixed-1440',
                });
              }
            }
          }
        }
      }

      // List pages: should have article cards
      const listPaths = ['/news', '/research', '/insights'];
      if (listPaths.some((lp) => path === lp || path.startsWith(lp + '/'))) {
        const cards = document.querySelectorAll(
          '[class*="article-card-"], a[href*="/article/"]'
        );
        if (cards.length === 0) {
          issues.push({
            type: 'layout-anomaly',
            severity: 'warning',
            message: `List page (${path}): no article cards found — API may be unavailable`,
            element: 'main',
          });
        }
      }

      return issues;

      function describeElement(el: Element): string {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className && typeof el.className === 'string'
          ? `.${el.className.split(' ').slice(0, 2).join('.')}`
          : '';
        return `${tag}${id}${cls}`;
      }
    },
    { path: pagePath, desktop: isDesktop, mobile: isMobile }
  );

  return result(anomalies);
}

// ─────────────────────────────────────────────
// 5. Text Readability Detection
// ─────────────────────────────────────────────

export async function detectTextReadabilityIssues(page: Page): Promise<AnomalyResult> {
  const anomalies = await page.evaluate(() => {
    const issues: Anomaly[] = [];
    const MIN_FONT_SIZE = 12;

    // Sample visible text elements
    const textElements = document.querySelectorAll('p, span, a, li, td, th, label');
    let checkedCount = 0;

    for (const el of textElements) {
      if (checkedCount > 100) break; // Limit to avoid performance issues

      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const text = el.textContent?.trim() || '';
      if (text.length === 0) continue;

      checkedCount++;

      const fontSize = parseFloat(style.fontSize);
      if (fontSize > 0 && fontSize < MIN_FONT_SIZE) {
        issues.push({
          type: 'text-readability',
          severity: 'warning',
          message: `Text too small: ${fontSize}px (min ${MIN_FONT_SIZE}px): "${text.slice(0, 40)}"`,
          element: describeElement(el),
          details: { fontSize, text: text.slice(0, 60) },
        });
      }
    }

    // Check heading hierarchy: h1 > h2 > h3 > h4
    const headingTags = ['h1', 'h2', 'h3', 'h4'] as const;
    const headingSizes: Record<string, number[]> = {};

    for (const tag of headingTags) {
      headingSizes[tag] = [];
      const elements = document.querySelectorAll(tag);
      for (const el of elements) {
        const style = getComputedStyle(el);
        if (style.display === 'none') continue;
        const fontSize = parseFloat(style.fontSize);
        if (fontSize > 0) headingSizes[tag].push(fontSize);
      }
    }

    // Verify heading sizes decrease: h1 >= h2 >= h3 >= h4
    for (let i = 0; i < headingTags.length - 1; i++) {
      const current = headingSizes[headingTags[i]];
      const next = headingSizes[headingTags[i + 1]];
      if (current.length === 0 || next.length === 0) continue;

      const avgCurrent = current.reduce((a, b) => a + b, 0) / current.length;
      const avgNext = next.reduce((a, b) => a + b, 0) / next.length;

      if (avgNext > avgCurrent + 2) {
        issues.push({
          type: 'text-readability',
          severity: 'warning',
          message: `Heading hierarchy: <${headingTags[i + 1]}> (avg ${Math.round(avgNext)}px) is larger than <${headingTags[i]}> (avg ${Math.round(avgCurrent)}px)`,
          element: headingTags[i + 1],
          details: { [`${headingTags[i]}Avg`]: avgCurrent, [`${headingTags[i + 1]}Avg`]: avgNext },
        });
      }
    }

    // Check text-on-background contrast (same color = invisible)
    const criticalText = document.querySelectorAll('h1, h2, h3, h4, p, a');
    let contrastChecked = 0;
    for (const el of criticalText) {
      if (contrastChecked > 50) break;

      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      const text = el.textContent?.trim() || '';
      if (text.length === 0) continue;

      contrastChecked++;

      const color = style.color;
      const bgColor = style.backgroundColor;

      // Only flag when text color exactly matches bg color (transparent bg is fine)
      if (
        color === bgColor &&
        bgColor !== 'rgba(0, 0, 0, 0)' &&
        bgColor !== 'transparent'
      ) {
        issues.push({
          type: 'text-readability',
          severity: 'error',
          message: `Text color matches background: both are ${color}`,
          element: describeElement(el),
          details: { color, bgColor, text: text.slice(0, 40) },
        });
      }
    }

    return issues;

    function describeElement(el: Element): string {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const cls = el.className && typeof el.className === 'string'
        ? `.${el.className.split(' ').slice(0, 2).join('.')}`
        : '';
      return `${tag}${id}${cls}`;
    }
  });

  return result(anomalies);
}

// ─────────────────────────────────────────────
// 6. Interactive Elements Detection
// ─────────────────────────────────────────────

export async function detectInteractionIssues(page: Page): Promise<AnomalyResult> {
  const anomalies = await page.evaluate(() => {
    const issues: Anomaly[] = [];

    // Check header navigation links are accessible
    const header = document.querySelector('header');
    if (header) {
      const navLinks = header.querySelectorAll('a, button');
      for (const link of navLinks) {
        const rect = link.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        const style = getComputedStyle(link);
        if (style.display === 'none' || style.visibility === 'hidden') continue;

        // Check if the element is occluded by another element
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;

        // Only check elements within viewport
        if (centerX < 0 || centerY < 0) continue;
        if (centerX > window.innerWidth || centerY > window.innerHeight) continue;

        const topEl = document.elementFromPoint(centerX, centerY);
        if (topEl && topEl !== link && !link.contains(topEl) && !(link as Element).closest?.('[data-radix-popper-content-wrapper]')) {
          // Check if the occluding element is a parent or sibling in the same interactive group
          if (!topEl.closest('a, button')?.contains(link)) {
            issues.push({
              type: 'interaction-issue',
              severity: 'warning',
              message: `Header link/button may be occluded by another element`,
              element: describeElement(link),
              details: {
                occludedBy: describeElement(topEl),
                position: { x: Math.round(centerX), y: Math.round(centerY) },
              },
            });
          }
        }
      }
    }

    // Check article card title links are clickable (sample first 5)
    const articleLinks = document.querySelectorAll(
      '[class*="article-card-"] a, a[href*="/article/"]'
    );
    let checked = 0;
    for (const link of articleLinks) {
      if (checked >= 5) break;

      const rect = link.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      // Only check elements within viewport
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;
      if (centerX < 0 || centerY < 0) continue;
      if (centerX > window.innerWidth || centerY > window.innerHeight) continue;

      checked++;

      const topEl = document.elementFromPoint(centerX, centerY);
      // Valid if: topEl IS the link, is a child of it, or both share the same card container
      const isChild = link.contains(topEl);
      const isInSameCard = topEl?.closest('[class*="article-card-"]') === link.closest('[class*="article-card-"]');
      const isInAnyLink = !!topEl?.closest('a');
      if (topEl && topEl !== link && !isChild && !isInSameCard && !isInAnyLink) {
        issues.push({
          type: 'interaction-issue',
          severity: 'error',
          message: `Article link is occluded and not clickable`,
          element: describeElement(link),
          details: {
            href: (link as HTMLAnchorElement).href?.slice(0, 100),
            occludedBy: describeElement(topEl),
          },
        });
      }
    }

    return issues;

    function describeElement(el: Element): string {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const cls = el.className && typeof el.className === 'string'
        ? `.${el.className.split(' ').slice(0, 2).join('.')}`
        : '';
      return `${tag}${id}${cls}`;
    }
  });

  return result(anomalies);
}

// ─────────────────────────────────────────────
// Aggregate runner
// ─────────────────────────────────────────────

export interface AllDetectorsResult {
  brokenImages: AnomalyResult;
  overflow: AnomalyResult;
  invisibleContent: AnomalyResult;
  layoutAnomalies: AnomalyResult;
  textReadability: AnomalyResult;
  interactionIssues: AnomalyResult;
}

export async function runAllDetectors(
  page: Page,
  ctx: LayoutContext
): Promise<AllDetectorsResult> {
  const [brokenImages, overflow, invisibleContent, layoutAnomalies, textReadability, interactionIssues] =
    await Promise.all([
      detectBrokenImages(page),
      detectOverflow(page, ctx.viewportWidth),
      detectInvisibleContent(page),
      detectLayoutAnomalies(page, ctx),
      detectTextReadabilityIssues(page),
      detectInteractionIssues(page),
    ]);

  return {
    brokenImages,
    overflow,
    invisibleContent,
    layoutAnomalies,
    textReadability,
    interactionIssues,
  };
}
