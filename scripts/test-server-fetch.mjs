// Integration tests for src/lib/serverFetch.ts.
// Run with: node --test --experimental-strip-types scripts/test-server-fetch.mjs
//
// We stub @sentry/astro via the same loader hook as test-sentry.mjs, replace
// global fetch, and assert that ssrFetch routes responses through the
// captureApiError classifier with the right context shape.

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

register('./stub-sentry-loader.mjs', import.meta.url);

const { ssrFetch } = await import('../src/lib/serverFetch.ts');

// -----------------------------------------------------------------------------
// Fetch mocking helpers
// -----------------------------------------------------------------------------

let originalFetch;
let originalWindow;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  originalWindow = globalThis.window;
  // Guarantee "server" semantics for the test regardless of runtime.
  // @ts-ignore
  delete globalThis.window;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow !== undefined) globalThis.window = originalWindow;
});

function fakeFetch(response) {
  globalThis.fetch = async () => response;
}

function fakeFetchThrows(error) {
  globalThis.fetch = async () => {
    throw error;
  };
}

function collectReports() {
  const reports = [];
  const report = (error, ctx) => reports.push({ error, ctx });
  return { reports, report };
}

// -----------------------------------------------------------------------------

describe('ssrFetch Sentry reporting', () => {
  test('ok response does not report', async () => {
    fakeFetch(new Response('ok', { status: 200 }));
    const { reports, report } = collectReports();
    await ssrFetch('https://api.test/x', { _report: report });
    assert.equal(reports.length, 0);
  });

  test('500 response reports as capture-class context (no expected flag)', async () => {
    fakeFetch(new Response('boom', { status: 500 }));
    const { reports, report } = collectReports();
    await ssrFetch('https://api.test/x', {
      endpointName: 'fetchArticles',
      _report: report,
    });
    assert.equal(reports.length, 1);
    assert.equal(reports[0].ctx.endpoint, 'fetchArticles');
    assert.equal(reports[0].ctx.status, 500);
    assert.equal(reports[0].ctx.expected, false);
  });

  test('404 response reports with expected=false by default (planApiError classifies it as breadcrumb_client_error)', async () => {
    fakeFetch(new Response('nf', { status: 404 }));
    const { reports, report } = collectReports();
    await ssrFetch('https://api.test/a', { _report: report });
    assert.equal(reports.length, 1);
    assert.equal(reports[0].ctx.status, 404);
    assert.equal(reports[0].ctx.expected, false);
  });

  test('404 with expectedStatuses=[404] marks expected=true', async () => {
    fakeFetch(new Response('nf', { status: 404 }));
    const { reports, report } = collectReports();
    await ssrFetch('https://api.test/a', {
      endpointName: 'fetchArticle',
      expectedStatuses: [404],
      _report: report,
    });
    assert.equal(reports.length, 1);
    assert.equal(reports[0].ctx.expected, true);
  });

  test('network error reports without status', async () => {
    fakeFetchThrows(new TypeError('net down'));
    const { reports, report } = collectReports();
    await assert.rejects(
      ssrFetch('https://api.test/a', { endpointName: 'fetchArticles', _report: report }),
      /net down/,
    );
    assert.equal(reports.length, 1);
    assert.equal(reports[0].ctx.status, undefined);
    assert.equal(reports[0].ctx.endpoint, 'fetchArticles');
  });

  test('timeout is reported as "SSR fetch timed out" error', async () => {
    // Emulate AbortController behaviour: throw AbortError.
    const abortErr = new DOMException('aborted', 'AbortError');
    fakeFetchThrows(abortErr);
    const { reports, report } = collectReports();
    await assert.rejects(
      ssrFetch('https://api.test/slow', { endpointName: 'x', _report: report }),
      /timed out after 10s/,
    );
    assert.equal(reports.length, 1);
    assert.match(String(reports[0].error), /timed out after 10s/);
  });
});
