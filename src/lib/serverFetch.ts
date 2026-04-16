import { captureApiError, type ApiErrorContext } from './sentry';

const isServer = typeof window === 'undefined';

export interface SsrFetchOptions extends RequestInit {
  /** Logical endpoint name for Sentry tags, e.g. 'fetchArticles'. */
  endpointName?: string;
  /**
   * HTTP status codes that are acceptable fallback outcomes for this caller
   * (e.g. 404 for optional lookups). Failed responses whose status matches
   * become Sentry breadcrumbs instead of issues.
   */
  expectedStatuses?: number[];
  /**
   * Injection seam for tests — defaults to the shared captureApiError helper.
   * Production callers should not pass this.
   */
  _report?: (error: unknown, ctx: ApiErrorContext) => void;
}

/**
 * Server-side fetch wrapper with timeout, consistent Sentry reporting,
 * and noise-aware error classification:
 *   - Network/timeouts                 → Sentry issue
 *   - 5xx response                     → Sentry issue
 *   - 401/403/404 (or expectedStatuses)→ Sentry breadcrumb (no issue)
 *
 * All classification logic lives in `src/lib/sentry.ts#planApiError` and is
 * unit-tested in `scripts/test-sentry.mjs`.
 */
export async function ssrFetch(
  input: string | URL,
  init?: SsrFetchOptions,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  const url = typeof input === 'string' ? input : input.toString();
  const method = init?.method || 'GET';
  const endpoint = init?.endpointName || url;
  const report = init?._report ?? captureApiError;

  let response: Response;
  try {
    response = await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    clearTimeout(timeoutId);

    const isAbort = error instanceof DOMException && error.name === 'AbortError';
    const thrown = isAbort
      ? new Error(`SSR fetch timed out after 10s: ${url}`)
      : error;

    if (isServer) {
      try {
        report(thrown, { endpoint, method, url });
      } catch (reportErr) {
        console.error('Failed to report SSR fetch error to Sentry', reportErr);
      }
    }

    throw thrown;
  }
  clearTimeout(timeoutId);

  if (isServer && !response.ok) {
    try {
      const expected = init?.expectedStatuses?.includes(response.status) ?? false;
      report(new Error(`SSR fetch failed: ${method} ${url} → ${response.status}`), {
        endpoint,
        method,
        url,
        status: response.status,
        expected,
      });
    } catch (error) {
      console.error('Failed to report SSR fetch error to Sentry', error);
    }
  }

  return response;
}
