import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: 'https://7f2225cc0fd72d5dcb2697971c6fc295@o4508368229498880.ingest.de.sentry.io/4510787241705552',
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/astro/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
