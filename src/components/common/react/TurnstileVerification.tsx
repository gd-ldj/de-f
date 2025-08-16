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
  sitekey: string
  callback?: (token: string) => void
  'error-callback'?: () => void
  'expired-callback'?: () => void
  'before-interactive-callback'?: () => void
  'after-interactive-callback'?: () => void
  'unsupported-callback'?: () => void
  'timeout-callback'?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  action?: string
  cData?: string
  retry?: 'auto' | 'never'
  'retry-interval'?: number
  'refresh-expired'?: 'auto' | 'manual' | 'never'
  language?: string
  appearance?: 'always' | 'execute' | 'interaction-only'
  execution?: 'render' | 'execute'
}

/**
 * Cloudflare Turnstile verification component
 * Integrates with Cloudflare's bot protection service
 */
export const TurnstileVerification: React.FC<TurnstileProps> = ({
  onVerify,
  onError,
  onExpire,
  onLoad,
  size = 'normal',
  theme = 'auto',
  className = '',
  action,
  cData
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | undefined>(undefined)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load Cloudflare Turnstile script
   */
  const loadTurnstileScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.turnstile) {
        resolve()
        return
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="challenges.cloudflare.com"]')
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', reject)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true

      script.onload = () => {
        console.log('[Turnstile] Script loaded successfully')
        resolve()
      }

      script.onerror = (error) => {
        console.error('[Turnstile] Failed to load script:', error)
        reject(new Error('Failed to load Turnstile script'))
      }

      document.head.appendChild(script)
    })
  }

  /**
   * Render Turnstile widget
   */
  const renderWidget = async (): Promise<void> => {
    if (!containerRef.current || !window.turnstile || !ANALYTICS_CONFIG.TURNSTILE_SITE_KEY) {
      return
    }

    try {
      const options: TurnstileOptions = {
        sitekey: ANALYTICS_CONFIG.TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          console.log('[Turnstile] Verification successful')
          setError(null)
          onVerify?.(token)
        },
        'error-callback': () => {
          const error = 'Verification error'
          console.error('[Turnstile] Verification error:', error)
          setError(error)
          onError?.(error)
        },
        'expired-callback': () => {
          console.warn('[Turnstile] Token expired')
          setError('Token expired')
          onExpire?.()
        },
        'timeout-callback': () => {
          console.warn('[Turnstile] Verification timeout')
          setError('Verification timeout')
          onError?.('Verification timeout')
        },
        'unsupported-callback': () => {
          console.error('[Turnstile] Browser not supported')
          setError('Browser not supported')
          onError?.('Browser not supported')
        },
        theme,
        size,
        retry: 'auto',
        'retry-interval': 8000,
        'refresh-expired': 'auto'
      }

      if (action) options.action = action
      if (cData) options.cData = cData

      // Remove existing widget if any
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current)
      }

      // Render new widget
      widgetIdRef.current = window.turnstile.render(containerRef.current, options)
      setIsLoaded(true)
      onLoad?.()

    } catch (error) {
      console.error('[Turnstile] Failed to render widget:', error)
      setError('Failed to render verification widget')
      onError?.('Failed to render verification widget')
    }
  }

  /**
   * Initialize Turnstile
   */
  useEffect(() => {
    const initializeTurnstile = async () => {
      if (!ANALYTICS_CONFIG.TURNSTILE_SITE_KEY) {
        console.warn('[Turnstile] Site key not configured')
        setError('Turnstile not configured')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        await loadTurnstileScript()
        await renderWidget()
      } catch (error) {
        console.error('[Turnstile] Initialization failed:', error)
        setError('Failed to initialize verification')
        onError?.('Failed to initialize verification')
      } finally {
        setIsLoading(false)
      }
    }

    initializeTurnstile()

    // Cleanup on unmount
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, []) // Empty dependency array - only run once

  /**
   * Reset widget when props change
   */
  useEffect(() => {
    if (isLoaded && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
    }
  }, [theme, size, action, cData])

  /**
   * Reset the widget manually
   */
  const reset = (): void => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
      setError(null)
    }
  }

  /**
   * Get current response token
   */
  const getResponse = (): string | undefined => {
    if (widgetIdRef.current && window.turnstile) {
      return window.turnstile.getResponse(widgetIdRef.current)
    }
    return undefined
  }

  // Expose methods via ref
  React.useImperativeHandle(containerRef, () => {
    const element = containerRef.current
    if (!element) {
      return {
        reset: () => {},
        getResponse: () => undefined,
      } as any
    }
    
    return Object.assign(element, {
      reset,
      getResponse
    })
  })

  if (!ANALYTICS_CONFIG.TURNSTILE_SITE_KEY) {
    return (
      <div className={`turnstile-container ${className}`}>
        <div className="text-sm text-muted-foreground">
          Verification not configured
        </div>
      </div>
    )
  }

  return (
    <div className={`turnstile-container ${className}`}>
      <div ref={containerRef} className="turnstile-widget" />
      
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-muted-foreground">Loading verification...</span>
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
          <button 
            onClick={reset}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}

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