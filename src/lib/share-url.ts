export type ShareUrlPromoteStrategy = 'path' | 'mask';

const TRANSLATION_SEGMENTS = new Set(['en', 'zh', 'ja', 'fr', 'ar', 'ru', 'de', 'es', 'ko']);

function getPathnameFromUrl(inputUrl: string): string {
  try {
    return new URL(inputUrl, 'https://detake.news').pathname;
  } catch {
    return inputUrl.split(/[?#]/)[0] || '/';
  }
}

function getNormalizedRouteSegments(inputUrl: string): string[] {
  const segments = getPathnameFromUrl(inputUrl).split('/').filter(Boolean);

  if (!segments.length) return segments;

  if (TRANSLATION_SEGMENTS.has(segments[0])) {
    return segments.slice(1);
  }

  return segments;
}

export function getShareUrlPromoteStrategy(inputUrl: string): ShareUrlPromoteStrategy {
  const segments = getNormalizedRouteSegments(inputUrl);

  if (!segments.length) return 'mask';

  if (segments[0] === 'article') {
    return segments.length >= 3 ? 'path' : 'mask';
  }

  if (segments[0] === 'user') {
    return segments.length >= 4 && /^\d+$/.test(segments[1] || '') && segments[2] === 'article'
      ? 'path'
      : 'mask';
  }

  if (segments[0] === 'tutorials') {
    return segments.length === 2 ? 'path' : 'mask';
  }

  if (segments[0] === 'collections') {
    return segments.length === 3 ? 'path' : 'mask';
  }

  return 'mask';
}

export function getPathPromoteCodeFromUrl(inputUrl: string): string | null {
  if (getShareUrlPromoteStrategy(inputUrl) !== 'path') {
    return null;
  }

  const lastSegment = getPathnameFromUrl(inputUrl).split('/').filter(Boolean).pop() || '';
  const match = lastSegment.match(/-([^-]+)$/);
  return match?.[1] || null;
}
