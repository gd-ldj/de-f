import { test, expect } from '@playwright/test';
import {
  mapPodcastListItemToArticle,
  mapPodcastDetailToArticle,
  mergeTranslatedPodcastIntoArticle,
} from '../../src/api/podcasts';

const API_BASE = 'https://en-beta-api.detake.com';
const PODCAST_ID = 'dtc-Wvf2J1fG';

test.describe('Data Contract: Podcasts adapter', () => {
  test('GET /api/v1/podcasts can be mapped into list cards contract', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/podcasts?page=1&limit=2`);
    expect(response.ok(), `Podcasts API returned ${response.status()}`).toBeTruthy();

    const json = await response.json();
    const list = json.data?.list ?? [];

    expect(Array.isArray(list), 'Expected podcasts list to be an array').toBeTruthy();
    expect(list.length, 'Expected at least one podcast').toBeGreaterThan(0);

    const mapped = mapPodcastListItemToArticle(list[0]);

    expect(mapped.entry_id).toBe(list[0].id);
    expect(mapped.slug).toBe(list[0].id);
    expect(mapped.title).toBe(list[0].title);
    expect(mapped.sub_title).toBe(list[0].description);
    expect(mapped.img_url).toBe(list[0].thumbnail);
    expect(mapped.author_name).toBe(list[0].channel_name);
    expect(mapped.business_type_name).toBe('Podcasts');
    expect(mapped.category_names).toEqual(['Voices']);
    expect(mapped.tags).toEqual([]);
  });

  test('GET /api/v1/podcasts/:id can be mapped into podcast detail contract', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/podcasts/${PODCAST_ID}`);
    expect(response.ok(), `Podcast detail API returned ${response.status()}`).toBeTruthy();

    const json = await response.json();
    const detail = json.data;
    const mapped = mapPodcastDetailToArticle(detail);

    expect(mapped.entry_id).toBe(detail.id);
    expect(mapped.slug).toBe(detail.id);
    expect(mapped.title).toBe(detail.title);
    expect(mapped.author_name).toBe(detail.channel_name);
    expect(mapped.sub_title).toBe(detail.description);
    expect(mapped.img_url).toBe(detail.thumbnail);
    expect(mapped.youtube_url).toBe(detail.youtube_url);
    expect(mapped.youtube_video_id).toBe('j0wJBEZdwLs');
    expect(mapped.transcript).toBe(detail.content);
  });

  test('GET /api/v1/podcasts/translated can be merged into podcast detail contract', async ({ request }) => {
    const detailResponse = await request.get(`${API_BASE}/api/v1/podcasts/${PODCAST_ID}`);
    expect(detailResponse.ok()).toBeTruthy();
    const detailJson = await detailResponse.json();
    const baseArticle = mapPodcastDetailToArticle(detailJson.data);

    const translatedResponse = await request.get(
      `${API_BASE}/api/v1/podcasts/translated?entry_id=${PODCAST_ID}&language=zh`,
    );
    expect(translatedResponse.ok(), `Podcast translation API returned ${translatedResponse.status()}`).toBeTruthy();

    const translatedJson = await translatedResponse.json();
    const merged = mergeTranslatedPodcastIntoArticle(baseArticle, translatedJson.data);

    expect(merged.entry_id).toBe(PODCAST_ID);
    expect(merged.title).toBe(translatedJson.data.title);
    expect(merged.transcript).toBe(translatedJson.data.body);
    expect(merged.language).toBe('zh');
    expect(merged.author_name).toBe(translatedJson.data.channel_name);
    expect(merged.img_url).toBe(translatedJson.data.thumbnail);
  });
});
