import * as Sentry from '@sentry/astro';

// Only initialize in production. Vite replaces import.meta.env.PROD at build time.
const isProd = import.meta.env.PROD;

if (isProd) {
  // Tracing / replay rates are controlled via env so we can turn the firehose
  // off in an incident without a redeploy. Defaults match the Phase 4 plan:
  //   - 10% baseline performance sampling
  //   - 0% baseline replay (too expensive for every session)
  //   - 100% replay capture on error sessions (high signal, low cost)
  const parseRate = (raw, fallback) => {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback;
  };
  const tracesSampleRate = parseRate(import.meta.env.PUBLIC_SENTRY_TRACES_SAMPLE_RATE, 0.1);
  const replaysSessionSampleRate = parseRate(import.meta.env.PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE, 0);
  const replaysOnErrorSampleRate = parseRate(import.meta.env.PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE, 1);

  Sentry.init({
    dsn: import.meta.env.PUBLIC_SENTRY_DSN || '',

    // Release tracking is required for source maps to work.
    // Vercel exposes VERCEL_GIT_COMMIT_SHA; surface it as PUBLIC_SENTRY_RELEASE at build time.
    release: import.meta.env.PUBLIC_SENTRY_RELEASE || 'unknown',

    // Distinguish preview / production deployments in the Sentry dashboard.
    environment: import.meta.env.PUBLIC_DEPLOY_ENV || 'production',

    // PII review:
    // Default to false to avoid collecting IPs, cookies, auth headers.
    // User identification is attached explicitly via src/lib/sentry.ts#identifyUser.
    sendDefaultPii: false,

    // ---- Integrations (explicit — see Codex review) ----
    // @sentry/astro skips its default snippet when this file exists, so
    // browserTracingIntegration() and replayIntegration() MUST be registered
    // here. Leaving them out silently disables tracing + replay.
    integrations: [
      Sentry.browserTracingIntegration({
        // Trace propagation: by default we do NOT forward sentry-trace /
        // baggage headers cross-origin. Uncomment once the backend API
        // (beta-api.detake.com, api.detake.com, etc.) is whitelisted for
        // these headers in CORS, otherwise the browser will block them.
        //
        // tracePropagationTargets: [/^\//, /^https:\/\/([a-z0-9-]+\.)?detake\.com/],
      }),
      Sentry.replayIntegration({
        // Privacy-first defaults — do not reveal form values or text.
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    tracesSampleRate,
    replaysSessionSampleRate,
    replaysOnErrorSampleRate,

    // ---- Noise filtering (minimum viable version) ----
    ignoreErrors: [
      // ResizeObserver noise that is not actionable.
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Non-Error rejects (usually from third-party scripts).
      'Non-Error promise rejection captured',
      // User-initiated aborts are not bugs.
      'AbortError',
      'The user aborted a request',
      // Common browser extension / network noise.
      'Network request failed',
      'Failed to fetch',
    ],
    denyUrls: [
      // Skip errors originating from browser extensions.
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
      /^safari-extension:\/\//i,
    ],

    beforeSend(event, hint) {
      const error = hint?.originalException;

      // Drop user-cancelled requests.
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }

      return event;
    },
  });
}
