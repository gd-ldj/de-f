/**
 * Cloudflare Turnstile Verification Component
 * Provides bot protection and fraud detection
 */

import React, { useEffect, useRef, useState } from 'react'
import { ANALYTICS_CONFIG } from '../../../config/constants'

export interface TurnstileProps {
  onVerify?: (token: string) => void
  onError?: (error: string) => void
  onExpire?: () => void
  onLoad?: () => void
  size?: 'normal' | 'compact'
  theme?: 'light' | 'dark' | 'auto'
  className?: string
  action?: string
  cData?: string
}

export interface TurnstileInstance {
  render: (container: string | HTMLElement, options: TurnstileOptions) => string | undefined
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
  getResponse: (widgetId?: string) => string | undefined
}

export interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  action?: string;
  cData?: string;
  retry?: 'auto' | 'never';
  'retry-interval'?: number;
  'refresh-expired'?: 'auto' | 'manual' | 'never';
}

/**
 * Cloudflare Turnstile verification component
 */
export const TurnstileVerification: React.FC<TurnstileProps> = ({ onVerify, onError, onExpire, onLoad, size = 'normal', theme = 'auto', className = '', action, cData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [autoVerified, setAutoVerified] = useState(false);
  const [isInvisible, setIsInvisible] = useState(true);

  // Generate unique container ID
  const containerId = React.useMemo(() => `turnstile-${Math.random().toString(36).substring(2, 15)}`, []);

  /**
   * Load Cloudflare Turnstile script
   */
  const loadTurnstileScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.turnstile) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src*="challenges.cloudflare.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Turnstile script'));

      document.head.appendChild(script);
    });
  };

  /**
   * Render Turnstile widget
   */
  const renderWidget = async (): Promise<void> => {
    if (!window.turnstile || !ANALYTICS_CONFIG.TURNSTILE_SITE_KEY) {
      return;
    }

    try {
      const options: TurnstileOptions = {
        sitekey: ANALYTICS_CONFIG.TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          setError(null);
          setAutoVerified(true);
          setNeedsInteraction(false);
          onVerify?.(token);
        },
        'error-callback': () => {
          // 当验证失败时，显示交互式验证
          setIsInvisible(false);
          setNeedsInteraction(true);
          const error = 'Verification required';
          setError(error);
          onError?.(error);
        },
        'expired-callback': () => {
          setAutoVerified(false);
          setError('Token expired');
          onExpire?.();
        },
        theme,
        size: isInvisible ? 'compact' : size, // 隐形模式使用紧凑尺寸
        retry: 'auto',
        'retry-interval': 8000,
        'refresh-expired': 'auto',
      };

      if (action) options.action = action;
      if (cData) options.cData = cData;

      // Remove existing widget if any
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (removeError) {
          console.warn('[Turnstile] Failed to remove existing widget:', removeError);
        }
        widgetIdRef.current = undefined;
      }

      // Make sure the container element exists in DOM
      const containerElement = document.getElementById(containerId);
      if (!containerElement) {
        throw new Error(`Container element with ID ${containerId} not found in DOM`);
      }

      // Clear existing content
      containerElement.innerHTML = '';

      // Render widget using container ID
      widgetIdRef.current = window.turnstile.render(`#${containerId}`, options);

      if (widgetIdRef.current) {
        setIsLoaded(true);
        onLoad?.();
      } else {
        throw new Error('Widget render returned empty ID');
      }
    } catch (error) {
      console.error('[Turnstile] Failed to render widget:', error);
      setError('Failed to render verification widget');
      onError?.('Failed to render verification widget');
    }
  };

  /**
   * Initialize Turnstile with user-friendly approach
   */
  useEffect(() => {
    const initializeTurnstile = async () => {
      if (!ANALYTICS_CONFIG.TURNSTILE_SITE_KEY) {
        // 如果没有配置，暂时允许通过验证
        console.warn('[Turnstile] Site key not configured, auto-verifying');
        setAutoVerified(true);
        onVerify?.('dev-bypass-token');
        return;
      }

      // 先假设用户是合法的，进行后台验证
      setAutoVerified(true);
      onVerify?.('pending-verification');

      // Check if container exists in DOM
      const containerElement = document.getElementById(containerId);
      if (!containerElement) {
        // Retry after a short delay
        setTimeout(initializeTurnstile, 100);
        return;
      }

      setIsLoading(false); // 不显示加载状态，用户无感知
      setError(null);

      try {
        await loadTurnstileScript();

        // Ensure Turnstile API is available
        if (!window.turnstile) {
          throw new Error('Turnstile API not available after script load');
        }

        await renderWidget();
      } catch (error) {
        console.error('[Turnstile] Background verification failed:', error);
        // 后台验证失败时，显示交互式验证
        setIsInvisible(false);
        setNeedsInteraction(true);
        setAutoVerified(false);
        setError('Please complete verification');
        onError?.('Verification required');
      }
    };

    const timeoutId = setTimeout(initializeTurnstile, 50);

    return () => {
      clearTimeout(timeoutId);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.warn('[Turnstile] Failed to cleanup widget:', error);
        }
      }
    };
  }, []);

  /**
   * Reset widget when props change
   */
  useEffect(() => {
    if (isLoaded && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [theme, size, action, cData]);

  /**
   * Reset the widget manually
   */
  const reset = (): void => {
    setError(null);

    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (resetError) {
        console.warn('[Turnstile] Reset failed, re-rendering widget:', resetError);
        renderWidget();
      }
    } else {
      renderWidget();
    }
  };

  if (!ANALYTICS_CONFIG.TURNSTILE_SITE_KEY) {
    return (
      <div className={`turnstile-container ${className}`}>
        <div className="text-sm text-muted-foreground">Turnstile not configured</div>
      </div>
    );
  }

  return (
    <div className={`turnstile-container ${className}`}>
      {/* 自动验证成功状态 - 无感知 */}

      {/* 交互式验证组件 - 仅在需要时显示 */}
      {(needsInteraction || !isInvisible) && (
        <div>
          <div id={containerId} ref={containerRef} className="turnstile-widget" style={{ minHeight: '65px' }} />

          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading verification...</span>
            </div>
          )}

          {error && needsInteraction && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              {error}
              <button onClick={reset} className="ml-2 underline hover:no-underline">
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* 隐形验证容器 - 始终存在但隐藏 */}
      {isInvisible && !needsInteraction && (
        <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }}>
          <div id={containerId} ref={containerRef} className="turnstile-widget" />
        </div>
      )}
    </div>
  );
};

/**
 * Hook for using Turnstile verification
 */
export const useTurnstile = () => {
  const [isVerified, setIsVerified] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = (verificationToken: string) => {
    setToken(verificationToken)
    setIsVerified(true)
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setIsVerified(false)
    setToken(null)
  }

  const handleExpire = () => {
    setIsVerified(false)
    setToken(null)
    setError('Verification expired')
  }

  const reset = () => {
    setIsVerified(false)
    setToken(null)
    setError(null)
  }

  return {
    isVerified,
    token,
    error,
    handleVerify,
    handleError,
    handleExpire,
    reset
  }
}

// Type declarations for Turnstile global object
declare global {
  interface Window {
    turnstile?: TurnstileInstance
  }
}

export default TurnstileVerification