import * as Sentry from '@sentry/astro';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  // Derive environment from PUBLIC_SITE_ENV (same logic as client config)
  const siteEnv = process.env.PUBLIC_SITE_ENV || 'beta';
  const environment = siteEnv === 'production' ? 'production' : 'preview';

  Sentry.init({
    dsn: 'https://7f2225cc0fd72d5dcb2697971c6fc295@o4508368229498880.ingest.de.sentry.io/4510787241705552',

    // Use Vercel-injected commit SHA directly.
    release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',

    environment,

    // Tag server-side events with the deployment domain.
    // Use Vercel-injected production URL — no extra env var needed.
    initialScope: {
      tags: {
        domain: process.env.VERCEL_PROJECT_PRODUCTION_URL || 'unknown',
      },
    },

    // PII review: default off. Enable per-request via Sentry.setUser() when needed.
    sendDefaultPii: false,

    // Hardcoded sample rate — change here if needed, no env var required.
    tracesSampleRate: 0.1,

    ignoreErrors: [
      'AbortError',
      'The user aborted a request',
    ],

    beforeSend(event, hint) {
      const error = hint?.originalException;
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      return event;
    },
  });
}
