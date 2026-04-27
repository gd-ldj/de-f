import * as Sentry from '@sentry/astro';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  const parseRate = (raw, fallback) => {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback;
  };
  const tracesSampleRate = parseRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.1);

  Sentry.init({
    dsn: process.env.SENTRY_DSN || '',

    // Prefer explicit SENTRY_RELEASE; fall back to Vercel's commit SHA.
    release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',

    environment: process.env.DEPLOY_ENV || 'production',

    // Tag server-side events with the deployment domain.
    // Set SENTRY_DOMAIN per Vercel project / deployment to distinguish the
    // three production domains. Falls back to VERCEL_PROJECT_PRODUCTION_URL.
    initialScope: {
      tags: {
        domain: process.env.SENTRY_DOMAIN || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'unknown',
      },
    },

    // PII review: default off. Enable per-request via Sentry.setUser() when needed.
    sendDefaultPii: false,

    // Phase 4: 10% default tracing on the server. Same env override as client
    // so we can throttle both sides from one place if Sentry quota spikes.
    tracesSampleRate,

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
