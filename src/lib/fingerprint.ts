import FingerprintJS from '@fingerprintjs/fingerprintjs';

const ANON_CODE_KEY = 'anonymous_promote_code';

let promiseCache: Promise<string> | null = null;

/**
 * Get or generate an anonymous promote code based on browser fingerprint.
 * The code is stable across sessions for the same browser.
 * Result is cached in localStorage and in-memory to avoid redundant computation.
 */
export async function getAnonymousPromoteCode(): Promise<string> {
  if (typeof window === 'undefined') return '';

  const cached = localStorage.getItem(ANON_CODE_KEY);
  if (cached) return cached;

  // Deduplicate concurrent calls
  if (promiseCache) return promiseCache;

  promiseCache = (async () => {
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const code = result.visitorId.slice(0, 8);
      localStorage.setItem(ANON_CODE_KEY, code);
      return code;
    } catch (error) {
      console.warn('[Fingerprint] Failed to generate anonymous promote code:', error);
      // Fallback: generate a random 8-char code and persist it
      const fallback = Math.random().toString(36).slice(2, 10);
      localStorage.setItem(ANON_CODE_KEY, fallback);
      return fallback;
    } finally {
      promiseCache = null;
    }
  })();

  return promiseCache;
}

/**
 * Get cached anonymous promote code synchronously.
 * Returns null if not yet generated (caller should use async version).
 */
export function getCachedAnonymousPromoteCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ANON_CODE_KEY);
}
