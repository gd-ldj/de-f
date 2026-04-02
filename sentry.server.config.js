import * as Sentry from '@sentry/astro';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || '',
    sendDefaultPii: true,
  });
}
