import { useEffect, useState } from 'react';
import { initializeAnalytics } from '../../lib/analytics';

// ---- Types (module-level) ----
// Preloaded event shape used for SSR-to-client analytics bridging
export type PreloadedEvent = { type: string; data?: Record<string, any> };

declare global {
  interface Window {
    __ANALYTICS_PRELOADED_EVENTS?: PreloadedEvent[];
    detakeAnalytics?: any;
  }
}

/**
 * Analytics Provider Component
 * Handles the initialization of analytics system in React environment.
 * Additionally, it bridges SSR-declared events to client-side analytics by:
 *  - Flushing preloaded events from window.__ANALYTICS_PRELOADED_EVENTS
 *  - Scanning DOM for elements that declare data-analytics-event
 *  - Observing DOM mutations to capture late/hydrated elements
 */
export default function AnalyticsProvider({ children }: { children?: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  /**
   * Parse an analytics event from a DOM element's data-analytics-event attribute.
   * Returns null if parsing fails or if attribute is missing.
   */
  const parseEventFromElement = (el: Element): PreloadedEvent | null => {
    try {
      const payload = el.getAttribute('data-analytics-event');
      if (!payload) return null;
      const evt = JSON.parse(payload);
      if (!evt || typeof evt.type !== 'string') return null;
      return { type: evt.type, data: evt.data ?? {} };
    } catch (e) {
      console.warn('[AnalyticsProvider] Failed to parse data-analytics-event:', e);
      return null;
    }
  };

  /**
   * Process a single element: parse its event, send it via analytics, and mark as processed.
   */
  const processElementEvent = (analytics: any, el: Element) => {
    if ((el as HTMLElement).hasAttribute('data-analytics-processed')) return;
    const evt = parseEventFromElement(el);
    if (!evt) return;
    try {
      analytics.trackEvent(evt.type, evt.data || {});
      (el as HTMLElement).setAttribute('data-analytics-processed', 'true');
    } catch (err) {
      console.warn('[AnalyticsProvider] Failed to track element event:', err);
    }
  };

  /**
   * Scan the entire document for unprocessed analytics declarations and process them.
   * This is used once on mount, but can be re-used if necessary.
   */
  const scanDocumentForEvents = (analytics: any) => {
    try {
      const nodes = document.querySelectorAll('[data-analytics-event]:not([data-analytics-processed])');
      nodes.forEach((el) => processElementEvent(analytics, el));
    } catch (e) {
      console.warn('[AnalyticsProvider] Failed during document scan:', e);
    }
  };

  useEffect(() => {
    if (!isClient) return;
    
    let observer: MutationObserver | null = null;

    // Initialize analytics system on component mount
    const initAnalytics = async () => {
      try {
        const analytics = await initializeAnalytics();

        // Make analytics available globally for debugging
        window.detakeAnalytics = analytics;

        // 1) Flush preloaded events from window
        try {
          const preloaded = window.__ANALYTICS_PRELOADED_EVENTS;
          if (Array.isArray(preloaded) && preloaded.length > 0) {
            preloaded.forEach((evt) => {
              try {
                if (evt && typeof evt.type === 'string') {
                  analytics.trackEvent(evt.type, evt.data || {});
                }
              } catch (err) {
                console.warn('[AnalyticsProvider] Failed to flush preloaded event:', err);
              }
            });
            // Clear the queue after flushing to avoid duplicates
            window.__ANALYTICS_PRELOADED_EVENTS = [];
          }
        } catch (err) {
          console.warn('[AnalyticsProvider] Error while flushing preloaded events:', err);
        }

        // 2) Initial scan for SSR-declared DOM events
        scanDocumentForEvents(analytics);

        // 3) Observe DOM changes to capture late/hydrated nodes with analytics declarations
        try {
          observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
              // Process added nodes directly
              m.addedNodes.forEach((node) => {
                if (!(node instanceof Element)) return;
                // If the node itself has an event declaration
                if (node.hasAttribute('data-analytics-event')) {
                  processElementEvent(analytics, node);
                }
                // Also check descendants
                const descendants = node.querySelectorAll('[data-analytics-event]:not([data-analytics-processed])');
                descendants.forEach((el) => processElementEvent(analytics, el));
              });
            }
          });

          observer.observe(document.documentElement, { childList: true, subtree: true });
        } catch (err) {
          console.warn('[AnalyticsProvider] Failed to initialize MutationObserver:', err);
        }
      } catch (error) {
        console.error('[DeTake] Failed to initialize analytics:', error);
      }
    };

    initAnalytics();

    // Cleanup
    return () => {
      try {
        if (observer) observer.disconnect();
      } catch (e) {
        // no-op
      }
    };
  }, [isClient]); // Run when client-side hydration is complete

  return children ? <>{children}</> : null;
}
