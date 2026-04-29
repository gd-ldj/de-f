/**
 * Map site environments to the only two Sentry environment labels we allow.
 *
 * - beta / local / test-style environments -> dev
 * - production                             -> prod
 *
 * Any missing or unexpected value falls back to `dev` so preview/test traffic
 * never pollutes the production Sentry environment by accident.
 *
 * @param {string | null | undefined} siteEnv
 * @returns {'dev' | 'prod'}
 */
export function resolveSentryEnvironment(siteEnv) {
  const normalizedSiteEnv = String(siteEnv ?? '').trim().toLowerCase();
  return normalizedSiteEnv === 'production' ? 'prod' : 'dev';
}
