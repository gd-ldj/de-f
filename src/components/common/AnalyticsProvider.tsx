import { useEffect } from 'react';
import { initializeAnalytics } from '../../lib/analytics';

/**
 * Analytics Provider Component
 * Handles the initialization of analytics system in React environment
 * This component should be placed at the root level to ensure analytics is initialized early
 */
export default function AnalyticsProvider({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    // Initialize analytics system on component mount
    const initAnalytics = async () => {
      try {
        const analytics = await initializeAnalytics();

        // Make analytics available globally for debugging
        (window as any).detakeAnalytics = analytics;
      } catch (error) {
        console.error('[DeTake] Failed to initialize analytics:', error);
      }
    };

    initAnalytics();
  }, []); // Empty dependency array ensures this runs only once on mount

  return children ? <>{children}</> : null;
}
