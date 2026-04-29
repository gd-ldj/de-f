import * as Sentry from '@sentry/astro';
import { resolveSentryEnvironment } from './sentry.environment.js';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  // Normalize site environment to the only two Sentry environment labels we use.
  const environment = resolveSentryEnvironment(process.env.PUBLIC_SITE_ENV);

  Sentry.init({
    dsn: 'https://7f2225cc0fd72d5dcb2697971c6fc295@o4508368229498880.ingest.de.sentry.io/4510787241705552',

    // Astro config injects the current git SHA at build time.
    release: __SENTRY_RELEASE__,

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
