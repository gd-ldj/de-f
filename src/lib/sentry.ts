import * as Sentry from '@sentry/astro';

// =============================================================================
// Error classification (pure functions, unit-tested in scripts/test-sentry.mjs)
// =============================================================================

export interface ApiErrorContext {
  /** Logical endpoint name, e.g. 'fetchArticles'. */
  endpoint: string;
  method: string;
  status?: number;
  url?: string;
  /**
   * Set to true when the caller knows this failure is an acceptable fallback
   * (e.g. 404 → null article, 401 → anonymous view). Such errors become
   * breadcrumbs instead of Sentry issues.
   */
  expected?: boolean;
}

export type ApiErrorDisposition =
  | 'capture'
  | 'breadcrumb_expected'
  | 'breadcrumb_client_error';

/**
 * Decide how an API error should be reported.
 * Pure, side-effect-free. Unit-tested.
 */
export function classifyApiError(ctx: ApiErrorContext): ApiErrorDisposition {
  if (ctx.expected) return 'breadcrumb_expected';
  if (ctx.status !== undefined && [401, 403, 404].includes(ctx.status)) {
    return 'breadcrumb_client_error';
  }
  return 'capture';
}

// ---- Breadcrumb payload shape (keeps test pure, no Sentry types needed) ----
export interface PlannedBreadcrumb {
  type: 'breadcrumb';
  payload: {
    category: string;
    message: string;
    level: 'warning' | 'info' | 'error';
    data: Record<string, unknown>;
  };
}

export interface PlannedCapture {
  type: 'capture';
  error: unknown;
  payload: {
    tags: Record<string, string>;
    contexts: { api_call: Record<string, unknown> };
  };
}

export type PlannedApiErrorAction = PlannedBreadcrumb | PlannedCapture;

/**
 * Build a side-effect-free description of what should happen for this error.
 * `captureApiError` then dispatches the plan to the real Sentry SDK.
 *
 * Splitting plan/dispatch lets us unit-test the full pipeline without mocking.
 */
export function planApiError(error: unknown, ctx: ApiErrorContext): PlannedApiErrorAction {
  const disposition = classifyApiError(ctx);

  if (disposition === 'breadcrumb_expected') {
    return {
      type: 'breadcrumb',
      payload: {
        category: 'api.expected',
        message: `${ctx.method} ${ctx.endpoint} → ${ctx.status ?? 'unknown'}`,
        level: 'warning',
        data: { ...ctx },
      },
    };
  }

  if (disposition === 'breadcrumb_client_error') {
    return {
      type: 'breadcrumb',
      payload: {
        category: 'api.client_error',
        message: `${ctx.method} ${ctx.endpoint} → ${ctx.status}`,
        level: 'warning',
        data: { ...ctx },
      },
    };
  }

  return {
    type: 'capture',
    error,
    payload: {
      tags: {
        'api.endpoint': ctx.endpoint,
        'api.method': ctx.method,
        'api.status': String(ctx.status ?? 'unknown'),
      },
      contexts: {
        api_call: { ...ctx } as Record<string, unknown>,
      },
    },
  };
}

// =============================================================================
// Dispatch layer (thin wrapper around @sentry/astro)
// =============================================================================

/**
 * Route an API error to Sentry according to classifyApiError.
 * - capture                  → Sentry issue with tags/context
 * - breadcrumb (expected)    → breadcrumb (category: api.expected)
 * - breadcrumb (client err)  → breadcrumb (category: api.client_error)
 */
export function captureApiError(error: unknown, ctx: ApiErrorContext): void {
  const plan = planApiError(error, ctx);
  if (plan.type === 'breadcrumb') {
    Sentry.addBreadcrumb(plan.payload);
  } else {
    Sentry.captureException(plan.error, plan.payload);
  }
}

// =============================================================================
// User / page scope
// =============================================================================

export interface SentryUser {
  id: string;
  username?: string;
}

export function identifyUser(user: SentryUser): void {
  Sentry.setUser({ id: user.id, username: user.username });
}

export function clearUser(): void {
  Sentry.setUser(null);
}

export interface PageScope {
  /** Astro locale prefix, e.g. 'us' or 'asia'. */
  locale: 'us' | 'asia' | string;
  /** Logical page category: 'home' | 'article' | 'category' | 'topic' | 'podcast' | ... */
  pageType: string;
  /** Optional Astro route pattern, e.g. '/us/article/[slug]'. */
  routePattern?: string;
}

export function setPageScope(ctx: PageScope): void {
  Sentry.setTag('locale', ctx.locale);
  Sentry.setTag('page_type', ctx.pageType);
  if (ctx.routePattern) Sentry.setTag('route', ctx.routePattern);
}

// =============================================================================
// Business breadcrumbs
// =============================================================================

/** Record a semantically meaningful user action (not every UI click). */
export function addBusinessBreadcrumb(
  action: string,
  data?: Record<string, unknown>,
): void {
  Sentry.addBreadcrumb({
    category: 'business',
    message: action,
    data,
    level: 'info',
  });
}

/**
 * Record a UI interaction with an explicit component name,
 * mapping to ui.component_name on the Sentry issue page.
 *
 * Prefer the Vite plugin's reactComponentAnnotation for automatic coverage;
 * reserve this helper for Astro templates or non-React interactions.
 */
export function addComponentBreadcrumb(
  componentName: string,
  action: string,
  data?: Record<string, unknown>,
): void {
  Sentry.addBreadcrumb({
    category: 'ui.click',
    message: `${componentName}: ${action}`,
    data: {
      'ui.component_name': componentName,
      ...data,
    },
    level: 'info',
  });
}

export { Sentry };
