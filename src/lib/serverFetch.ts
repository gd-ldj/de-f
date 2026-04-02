import * as Sentry from '@sentry/astro';

const isServer = typeof window === 'undefined';
const isProdEnv = process.env.NODE_ENV === 'production';

export interface SsrFetchOptions extends RequestInit {
  endpointName?: string;
}

export async function ssrFetch(input: string | URL, init?: SsrFetchOptions): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let response: Response;
  try {
    response = await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === 'AbortError') {
      const url = typeof input === 'string' ? input : input.toString();
      throw new Error(`SSR fetch timed out after 10s: ${url}`);
    }
    throw error;
  }
  clearTimeout(timeoutId);

  if (isServer && isProdEnv && !response.ok) {
    try {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';

      Sentry.captureException(new Error('SSR fetch failed'), {
        tags: {
          'ssr.fetch': 'true',
          endpointName: init?.endpointName || '',
        },
        extra: {
          url,
          method,
          status: response.status,
          statusText: response.statusText,
        },
      });
    } catch (error) {
      console.error('Failed to report SSR fetch error to Sentry', error);
    }
  }

  return response;
}
