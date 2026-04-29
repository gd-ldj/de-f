import { useMemo, useState } from 'react';
import { DEPLOY_ENVIRONMENT, SITE_CONFIG } from '@/config/constants';
import { Sentry } from '@/lib/sentry';

type PendingAction = 'message' | 'exception' | null;

interface ActionState {
  kind: 'idle' | 'success' | 'error';
  message: string;
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

function buildMetadata(hostname: string) {
  return {
    source: 'local-test-panel',
    siteEnvironment: SITE_CONFIG.ENVIRONMENT,
    sentryEnvironment: DEPLOY_ENVIRONMENT,
    hostname,
    mode: import.meta.env.MODE,
    timestamp: new Date().toISOString(),
  };
}

export default function SentryTestPanel() {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionState, setActionState] = useState<ActionState>({
    kind: 'idle',
    message: 'Click a button below to send a local Sentry test event.',
  });

  const hostname = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'unknown';
    }

    return window.location.hostname;
  }, []);

  const isLocalhost = LOCAL_HOSTS.has(hostname);
  const isProdBuild = import.meta.env.PROD;

  if (!isLocalhost) {
    return null;
  }

  async function runCapture(kind: Exclude<PendingAction, null>) {
    setPendingAction(kind);

    try {
      const metadata = buildMetadata(hostname);

      if (kind === 'message') {
        const eventId = Sentry.captureMessage('manual.sentry.test_message', {
          level: 'info',
          tags: {
            manual_test: 'true',
            sentry_environment: DEPLOY_ENVIRONMENT,
          },
          extra: metadata,
        });

        setActionState({
          kind: 'success',
          message: `Test message capture requested${eventId ? ` (${eventId})` : ''}.`,
        });
        return;
      }

      const error = new Error('manual.sentry.test_exception');
      error.name = 'ManualSentryTestError';

      const eventId = Sentry.captureException(error, {
        tags: {
          manual_test: 'true',
          sentry_environment: DEPLOY_ENVIRONMENT,
        },
        extra: metadata,
      });

      setActionState({
        kind: 'success',
        message: `Test exception capture requested${eventId ? ` (${eventId})` : ''}.`,
      });
    } catch (error) {
      setActionState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Failed to trigger Sentry test event.',
      });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <section
      data-testid="sentry-test-panel"
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              Local Sentry Test
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                isProdBuild
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isProdBuild ? 'Preview / production build' : 'Dev server (no-op)'}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Manual Sentry test panel</h2>
          <p className="text-sm leading-6 text-slate-700">
            Use this local-only panel to trigger one test message or one test exception. In
            `astro dev`, the SDK does not initialize, so this is a dry run. Use `pnpm build`
            and `pnpm preview:vercel` if you want a real local Sentry event.
          </p>
        </div>

        <dl className="grid gap-3 rounded-xl border border-emerald-100 bg-white p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Site environment</dt>
            <dd data-testid="sentry-site-environment" className="mt-1 font-medium text-slate-900">
              {SITE_CONFIG.ENVIRONMENT}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Sentry environment</dt>
            <dd data-testid="sentry-environment" className="mt-1 font-medium text-slate-900">
              {DEPLOY_ENVIRONMENT}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Build mode</dt>
            <dd className="mt-1 font-medium text-slate-900">{import.meta.env.MODE}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Hostname</dt>
            <dd className="mt-1 font-medium text-slate-900">{hostname}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void runCapture('message')}
            disabled={pendingAction !== null}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {pendingAction === 'message' ? 'Sending test message...' : 'Capture test message'}
          </button>
          <button
            type="button"
            onClick={() => void runCapture('exception')}
            disabled={pendingAction !== null}
            className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-emerald-200 disabled:text-emerald-400"
          >
            {pendingAction === 'exception'
              ? 'Sending test exception...'
              : 'Capture test exception'}
          </button>
        </div>

        <p
          className={`rounded-xl px-4 py-3 text-sm ${
            actionState.kind === 'error'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-slate-900 text-slate-100'
          }`}
        >
          {actionState.message}
        </p>
      </div>
    </section>
  );
}
