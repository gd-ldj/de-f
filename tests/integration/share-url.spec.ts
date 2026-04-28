import { test, expect } from '@playwright/test';
import { getPathPromoteCodeFromUrl, getShareUrlPromoteStrategy } from '../../src/lib/share-url';

test.describe('Share URL promote strategy', () => {
  test('non-article pages use mask strategy', () => {
    expect(getShareUrlPromoteStrategy('https://en.dev.detake.com/topics/ai-agents')).toBe('mask');
    expect(getShareUrlPromoteStrategy('https://en.dev.detake.com/tutorials')).toBe('mask');
    expect(getShareUrlPromoteStrategy('https://en.dev.detake.com/collections/17')).toBe('mask');

    expect(getPathPromoteCodeFromUrl('https://en.dev.detake.com/topics/ai-agents')).toBeNull();
    expect(getPathPromoteCodeFromUrl('https://en.dev.detake.com/tutorials')).toBeNull();
  });

  test('detail pages use path strategy', () => {
    expect(getShareUrlPromoteStrategy('https://en.dev.detake.com/tutorials/what-is-a-black-hole-xG0zT')).toBe('path');
    expect(getShareUrlPromoteStrategy('https://en.dev.detake.com/collections/17/my-shared-slug-xG0zT')).toBe('path');
    expect(getShareUrlPromoteStrategy('https://en.dev.detake.com/article/news/my-shared-slug-xG0zT')).toBe('path');
    expect(getShareUrlPromoteStrategy('https://en.dev.detake.com/fr/tutorials/what-is-a-black-hole-xG0zT')).toBe('path');
    expect(getShareUrlPromoteStrategy('https://en.dev.detake.com/user/42/article/news/my-shared-slug-xG0zT')).toBe('path');

    expect(getPathPromoteCodeFromUrl('https://en.dev.detake.com/tutorials/what-is-a-black-hole-xG0zT')).toBe('xG0zT');
    expect(getPathPromoteCodeFromUrl('https://en.dev.detake.com/article/news/my-shared-slug-maskE2E1')).toBe('maskE2E1');
  });
});
