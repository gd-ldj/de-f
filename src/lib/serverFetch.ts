import * as Sentry from '@sentry/astro';

const isServer = typeof window === 'undefined';

export interface SsrFetchOptions extends RequestInit {
  endpointName?: string;
}

export async function ssrFetch(input: string | URL, init?: SsrFetchOptions): Promise<Response> {
  const response = await fetch(input, init);

  if (isServer && !response.ok) {
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

