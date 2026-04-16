// Unit tests for src/lib/sentry.ts pure logic.
// Run with: node --test --experimental-strip-types scripts/test-sentry.mjs
//
// TDD strategy: the pure decision functions `classifyApiError` and
// `planApiError` carry all the behaviour we need to guard. The dispatch
// wrappers (`captureApiError`, `setPageScope`, etc.) are thin shims over
// @sentry/astro and are covered by Playwright end-to-end in Phase 5.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// We import the TS source directly; Node 22+ strips types at runtime.
// We can't just `import` because @sentry/astro resolves to a full ESM tree.
// Trick: we only import the *pure* exports that don't touch Sentry at module top-level.
// Since `src/lib/sentry.ts` has `import * as Sentry from '@sentry/astro'` at the top,
// Node will try to resolve it. To keep this test zero-dependency, we stub
// @sentry/astro via an in-process import hook.

import { register } from 'node:module';

// `import.meta.url` is already a file:// URL string — passing it through
// pathToFileURL() double-encodes it into a broken path. Use it directly.
register('./stub-sentry-loader.mjs', import.meta.url);

const sentryLib = await import('../src/lib/sentry.ts');

// =============================================================================

describe('classifyApiError', () => {
  const cases = [
    // expected flag wins over status
    { ctx: { endpoint: 'e', method: 'GET', status: 500, expected: true }, want: 'breadcrumb_expected' },
    { ctx: { endpoint: 'e', method: 'GET', status: 404, expected: true }, want: 'breadcrumb_expected' },
    { ctx: { endpoint: 'e', method: 'GET', expected: true }, want: 'breadcrumb_expected' },

    // 4xx client errors are breadcrumbs by default
    { ctx: { endpoint: 'e', method: 'GET', status: 401 }, want: 'breadcrumb_client_error' },
    { ctx: { endpoint: 'e', method: 'GET', status: 403 }, want: 'breadcrumb_client_error' },
    { ctx: { endpoint: 'e', method: 'GET', status: 404 }, want: 'breadcrumb_client_error' },

    // Everything else is a captured issue
    { ctx: { endpoint: 'e', method: 'GET', status: 500 }, want: 'capture' },
    { ctx: { endpoint: 'e', method: 'GET', status: 502 }, want: 'capture' },
    { ctx: { endpoint: 'e', method: 'GET', status: 400 }, want: 'capture' }, // 400 is NOT auto-downgraded
    { ctx: { endpoint: 'e', method: 'GET', status: 429 }, want: 'capture' },
    { ctx: { endpoint: 'e', method: 'GET' }, want: 'capture' }, // network error, no status
  ];

  for (const { ctx, want } of cases) {
    test(`${JSON.stringify(ctx)} → ${want}`, () => {
      assert.equal(sentryLib.classifyApiError(ctx), want);
    });
  }
});

describe('planApiError', () => {
  test('500 builds a capture plan with tags+contexts', () => {
    const err = new Error('boom');
    const plan = sentryLib.planApiError(err, {
      endpoint: 'fetchArticles',
      method: 'GET',
      status: 500,
      url: 'https://api.example/x',
    });

    assert.equal(plan.type, 'capture');
    assert.equal(plan.error, err);
    assert.deepEqual(plan.payload.tags, {
      'api.endpoint': 'fetchArticles',
      'api.method': 'GET',
      'api.status': '500',
    });
    assert.equal(plan.payload.contexts.api_call.url, 'https://api.example/x');
  });

  test('network error (no status) builds a capture plan with status=unknown', () => {
    const plan = sentryLib.planApiError(new Error('net'), {
      endpoint: 'fetchArticles',
      method: 'GET',
    });
    assert.equal(plan.type, 'capture');
    assert.equal(plan.payload.tags['api.status'], 'unknown');
  });

  test('404 builds a client_error breadcrumb (warning)', () => {
    const plan = sentryLib.planApiError(new Error('nf'), {
      endpoint: 'fetchArticle',
      method: 'GET',
      status: 404,
    });
    assert.equal(plan.type, 'breadcrumb');
    assert.equal(plan.payload.category, 'api.client_error');
    assert.equal(plan.payload.level, 'warning');
    assert.equal(plan.payload.message, 'GET fetchArticle → 404');
    assert.equal(plan.payload.data.status, 404);
  });

  test('expected=true builds an expected breadcrumb even for 500', () => {
    const plan = sentryLib.planApiError(new Error('ok'), {
      endpoint: 'optional',
      method: 'GET',
      status: 500,
      expected: true,
    });
    assert.equal(plan.type, 'breadcrumb');
    assert.equal(plan.payload.category, 'api.expected');
  });

  test('breadcrumb data is a fresh copy, not a reference', () => {
    const ctx = { endpoint: 'e', method: 'GET', status: 404 };
    const plan = sentryLib.planApiError(new Error(), ctx);
    ctx.endpoint = 'mutated';
    assert.equal(plan.payload.data.endpoint, 'e');
  });
});
