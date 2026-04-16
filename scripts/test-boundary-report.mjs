// Unit tests for src/lib/boundaryReport.ts — see file header for rationale.
// Run with: node --test --experimental-strip-types scripts/test-boundary-report.mjs

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

register('./stub-sentry-loader.mjs', import.meta.url);

const { buildBoundaryCapture } = await import('../src/lib/boundaryReport.ts');

describe('buildBoundaryCapture', () => {
  test('stamps error.source=react_boundary and componentStack', () => {
    const payload = buildBoundaryCapture(new Error('x'), {
      componentStack: '\n    at Header\n    at App',
    });
    assert.equal(payload.tags['error.source'], 'react_boundary');
    assert.equal(
      payload.contexts.react.componentStack,
      '\n    at Header\n    at App',
    );
    assert.equal(payload.contexts.react.boundaryName, 'anonymous');
  });

  test('boundaryName flows into both tag and context', () => {
    const payload = buildBoundaryCapture(
      new Error('x'),
      { componentStack: '' },
      { boundaryName: 'HeaderIsland' },
    );
    assert.equal(payload.tags['boundary.name'], 'HeaderIsland');
    assert.equal(payload.contexts.react.boundaryName, 'HeaderIsland');
  });

  test('scope tags are merged but cannot override error.source', () => {
    const payload = buildBoundaryCapture(
      new Error('x'),
      { componentStack: '' },
      {
        tags: {
          'error.source': 'hijacked',
          locale: 'us',
          page_type: 'article',
        },
      },
    );
    assert.equal(payload.tags['error.source'], 'react_boundary'); // not hijacked
    assert.equal(payload.tags.locale, 'us');
    assert.equal(payload.tags.page_type, 'article');
  });

  test('missing componentStack becomes empty string (not "null")', () => {
    const payload = buildBoundaryCapture(
      new Error(),
      { componentStack: null },
    );
    assert.equal(payload.contexts.react.componentStack, '');
  });
});
