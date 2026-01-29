import * as Sentry from '@sentry/astro';

const isProd = import.meta.env.PROD;

if (isProd) {
  Sentry.init({
    dsn: import.meta.env.PUBLIC_SENTRY_DSN || '',
    sendDefaultPii: true,
    tracesSampleRate: 0,
  });
}
