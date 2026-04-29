import * as Sentry from '@sentry/astro';
import { resolveSentryEnvironment } from './sentry.environment.js';

// Only initialize in production. Vite replaces import.meta.env.PROD at build time.
const isProd = import.meta.env.PROD;

if (isProd) {
  // Normalize site environment to the only two Sentry environment labels we use.
  const environment = resolveSentryEnvironment(import.meta.env.PUBLIC_SITE_ENV);

  Sentry.init({
    dsn: 'https://7f2225cc0fd72d5dcb2697971c6fc295@o4508368229498880.ingest.de.sentry.io/4510787241705552',

    // Release tracking is required for source maps to work.
    // Astro config injects the current git SHA at build time.
    release: __SENTRY_RELEASE__,

    // Distinguish daily dev/test traffic from online production traffic.
    environment,

    // Tag every event with the domain the user is visiting.
    // Three production domains share one Sentry project; this tag lets us
    // filter and alert per-domain in the dashboard.
    initialScope: {
      tags: {
        domain: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      },
    },

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

    // Hardcoded sample rates — change here if needed, no env var required.
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,

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
