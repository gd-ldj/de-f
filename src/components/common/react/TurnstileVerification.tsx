import React, { useEffect } from 'react';
import { ANALYTICS_CONFIG } from '@/config/constants';

// Extend Window interface to include Turnstile callback functions
declare global {
  interface Window {
    onTurnstileError?: (error: string) => void;
    onTurnstileExpired?: () => void;
    onTurnstileTimeout?: () => void;
  }
}

/**
 * Turnstile verification component with error handling and bot detection redirect
 * Automatically redirects to 404 page when bot is detected or errors occur
 */
export const TurnstileVerification: React.FC = () => {
  useEffect(() => {
    // Load Turnstile script if not already loaded
    if (!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Setup global error handler for Turnstile
    window.onTurnstileError = (error: string) => {
      console.warn('[Turnstile] Error detected:', error);
      // Redirect to 404 page on error
      window.location.href = '/404';
    };

    // Setup global callback for failed verification (bot detected)
    window.onTurnstileExpired = () => {
      console.warn('[Turnstile] Verification expired or bot detected');
      // Redirect to 404 page when bot is detected
      window.location.href = '/404';
    };

    // Setup callback for verification timeout
    window.onTurnstileTimeout = () => {
      console.warn('[Turnstile] Verification timeout');
      // Redirect to 404 page on timeout
      window.location.href = '/404';
    };
  }, []);

  // Only render if we have a site key configured
  if (!ANALYTICS_CONFIG.TURNSTILE_SITE_KEY) {
    console.warn('Turnstile site key not configured');
    return null;
  }

  return (
    <div>
      {/* Hidden Turnstile widget for automatic verification */}
      <div className="cf-turnstile hidden" data-sitekey={ANALYTICS_CONFIG.TURNSTILE_SITE_KEY} data-theme="light" data-size="normal" data-action="page-verification" data-cdata="auto-verification" data-retry="never" data-refresh-expired="never" data-error-callback="onTurnstileError" data-expired-callback="onTurnstileExpired" data-timeout-callback="onTurnstileTimeout" style={{ marginBottom: '16px' }} />
    </div>
  );
};

export default TurnstileVerification;
