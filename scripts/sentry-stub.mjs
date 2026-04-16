// Minimal @sentry/astro stub used only by scripts/test-sentry.mjs.
// All methods are no-ops; dispatch behaviour is validated via the pure
// `planApiError` function instead of observing side effects here.

function noop() {}
export const addBreadcrumb = noop;
export const captureException = noop;
export const setUser = noop;
export const setTag = noop;
export const setContext = noop;
export const init = noop;

export default {
  addBreadcrumb,
  captureException,
  setUser,
  setTag,
  setContext,
  init,
};
