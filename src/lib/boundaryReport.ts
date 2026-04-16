/**
 * Pure helper for building a Sentry capture payload from a React error
 * boundary event. Split out of SentryErrorBoundary.tsx so the classification
 * logic is unit-testable without a React renderer.
 */

export interface BoundaryErrorInfo {
  /** React-provided component stack, e.g. "\n    at Header\n    at App". */
  componentStack?: string | null;
}

export interface BoundaryScope {
  /** Optional name of the island/boundary (e.g. "HeaderIsland"). */
  boundaryName?: string;
  /**
   * Extra tags the host page wants to attach — typically `locale` and
   * `page_type`, but any string→string map works.
   */
  tags?: Record<string, string>;
}

export interface BoundaryCapturePayload {
  tags: Record<string, string>;
  contexts: {
    react: {
      componentStack: string;
      boundaryName: string;
    };
  };
}

/**
 * Build the Sentry.captureException payload for a React error boundary catch.
 * Invariants:
 *   - Always sets `error.source: 'react_boundary'` for easy filtering.
 *   - Preserves the componentStack so symbolicated source maps can locate
 *     the failing component.
 *   - Never mutates its inputs.
 */
export function buildBoundaryCapture(
  _error: unknown,
  errorInfo: BoundaryErrorInfo,
  scope: BoundaryScope = {},
): BoundaryCapturePayload {
  const tags: Record<string, string> = {
    'error.source': 'react_boundary',
  };
  if (scope.boundaryName) tags['boundary.name'] = scope.boundaryName;
  for (const [k, v] of Object.entries(scope.tags ?? {})) {
    // Scope tags should NOT be able to override the error.source stamp.
    if (!(k in tags)) tags[k] = v;
  }

  return {
    tags,
    contexts: {
      react: {
        componentStack: errorInfo.componentStack ?? '',
        boundaryName: scope.boundaryName ?? 'anonymous',
      },
    },
  };
}
