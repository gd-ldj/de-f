import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Sentry } from '../../../lib/sentry';
import {
  buildBoundaryCapture,
  type BoundaryScope,
} from '../../../lib/boundaryReport';

interface SentryErrorBoundaryProps extends BoundaryScope {
  children: ReactNode;
  /**
   * Fallback rendered when this boundary catches an error. Either a static
   * node or a render prop receiving the caught error and a reset callback.
   */
  fallback?:
    | ReactNode
    | ((args: { error: Error; reset: () => void }) => ReactNode);
}

interface SentryErrorBoundaryState {
  error: Error | null;
}

/**
 * React class error boundary that reports caught errors to Sentry with a
 * `error.source=react_boundary` tag and the React component stack.
 *
 * Why a custom boundary instead of `@sentry/react`'s `ErrorBoundary`:
 *   - Keeps our dependency set at `@sentry/astro` only (no new 1.5MB install).
 *   - Lets us standardize the tag contract via `buildBoundaryCapture` so we
 *     can evolve classification in one pure, testable helper.
 *
 * Usage (wrap each island entry point):
 *   <SentryErrorBoundary boundaryName="HeaderIsland" tags={{ locale }}>
 *     <Header ... />
 *   </SentryErrorBoundary>
 */
export class SentryErrorBoundary extends Component<
  SentryErrorBoundaryProps,
  SentryErrorBoundaryState
> {
  state: SentryErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): SentryErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const payload = buildBoundaryCapture(error, errorInfo, {
      boundaryName: this.props.boundaryName,
      tags: this.props.tags,
    });
    try {
      Sentry.captureException(error, payload);
    } catch {
      // Never let Sentry reporting itself crash the boundary.
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') {
        return fallback({ error, reset: this.reset });
      }
      return fallback ?? null;
    }
    return this.props.children;
  }
}

export default SentryErrorBoundary;
