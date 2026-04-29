import { expect, test } from '@playwright/test';
import {
  getHomeHighlightsArticles,
  getHomeTopGridLayout,
  hasBottomHomeSections,
  hasItems,
  hasNewsGroups,
  hasRightSidebarContent,
} from '../../src/components/home/home-section-visibility';

const mockArticle = {
  entry_id: 'mock-1',
  slug: 'mock-1',
  title: 'Mock article',
  sub_title: '',
  img_url: '',
  created_at: '2026-04-29T00:00:00.000Z',
  business_type_name: 'News',
  body: 'Mock body',
  author: {
    name: 'DeTake',
    avatar_url: '',
    bio: '',
  },
};

test.describe('Home section visibility helpers', () => {

  test('getHomeHighlightsArticles prefers newsAll when rich legacy data exists', () => {
    const legacyArticle = {
      ...mockArticle,
      entry_id: 'legacy-1',
      slug: 'legacy-1',
      title: 'Legacy article',
    };

    expect(
      getHomeHighlightsArticles({
        highlights: [mockArticle],
        newsAll: [legacyArticle],
      }),
    ).toEqual([legacyArticle]);
  });

  test('getHomeHighlightsArticles falls back to highlights when newsAll is empty', () => {
    expect(
      getHomeHighlightsArticles({
        highlights: [mockArticle],
        newsAll: [],
      }),
    ).toEqual([mockArticle]);
  });
  test('hasItems returns false for empty and true for populated lists', () => {
    expect(hasItems([])).toBe(false);
    expect(hasItems([mockArticle])).toBe(true);
  });

  test('hasNewsGroups only returns true when at least one group has articles', () => {
    expect(hasNewsGroups([])).toBe(false);
    expect(
      hasNewsGroups([
        { tag: 'News', data: [] },
        { tag: 'Markets', data: [] },
      ]),
    ).toBe(false);
    expect(
      hasNewsGroups([
        { tag: 'News', data: [] },
        { tag: 'Markets', data: [mockArticle] },
      ]),
    ).toBe(true);
  });

  test('hasRightSidebarContent returns true when topics or most read exist', () => {
    expect(hasRightSidebarContent([], [])).toBe(false);
    expect(hasRightSidebarContent([{ name: 'OpenAI', description: '' }], [])).toBe(true);
    expect(hasRightSidebarContent([], [mockArticle])).toBe(true);
  });

  test('hasBottomHomeSections tracks news, insights, and research visibility', () => {
    expect(
      hasBottomHomeSections({
        news: [],
        insights: [],
        research: [],
      }),
    ).toBe(false);

    expect(
      hasBottomHomeSections({
        news: [],
        insights: [mockArticle],
        research: [],
      }),
    ).toBe(true);
  });

  test('desktop top grid expands latest when main content is missing', () => {
    expect(
      getHomeTopGridLayout({
        hasLatest: true,
        hasMainContent: false,
      }),
    ).toEqual({
      latest: 'col-span-9 py-5',
      main: null,
      right: 'col-span-3 space-y-6 py-5',
    });
  });

  test('desktop top grid collapses to right rail only when both latest and main are missing', () => {
    expect(
      getHomeTopGridLayout({
        hasLatest: false,
        hasMainContent: false,
      }),
    ).toEqual({
      latest: null,
      main: null,
      right: 'col-span-12 space-y-6 py-5',
    });
  });
});
