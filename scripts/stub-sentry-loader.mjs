// Node loader hook: replace @sentry/astro with a no-op stub so we can
// import src/lib/sentry.ts in unit tests without pulling the real SDK.
// Also fills in .ts extensions so Astro-style extensionless relative imports
// (e.g. `import from './sentry'`) resolve under Node's strict ESM resolver.

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@sentry/astro') {
    return {
      url: new URL('./sentry-stub.mjs', import.meta.url).href,
      shortCircuit: true,
    };
  }

  // Try extensionless relative imports by appending .ts / .tsx if the bare
  // specifier doesn't exist. This mirrors what the TS/Astro pipeline does.
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !/\.[a-z]+$/i.test(specifier)) {
    try {
      const parent = context.parentURL ? new URL(context.parentURL) : null;
      if (parent) {
        for (const ext of ['.ts', '.tsx', '.mjs', '.js']) {
          const candidate = new URL(specifier + ext, parent);
          if (candidate.protocol === 'file:' && existsSync(fileURLToPath(candidate))) {
            return nextResolve(specifier + ext, context);
          }
        }
      }
    } catch {
      // fall through to default resolver
    }
  }

  return nextResolve(specifier, context);
}
