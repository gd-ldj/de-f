/**
 * Analytics and User Behavior Tracking System
 * Integrates Cloudflare Visitor ID, Google Analytics, and custom behavior tracking
 */

import { STORAGE_KEYS, ANALYTICS_CONFIG, TRACKING_EVENTS } from '../config/constants';
import { getCloudflareData } from '../../docs/utils/cloudflare-cache';

import { generateDeviceSignature } from '../../docs/utils/device-signature';
import { getCloudflareVisitorInfo } from '../../docs/utils/cloudflare-visitor';

/**
 * Interface for user behavior event data
 */
export interface BehaviorEvent {
  type: string;
  timestamp: number;
  data: Record<string, any>;
  visitorId: string;
  sessionId: string;
  pageUrl: string;
}

/**
 * Interface for visitor identification data
 */
export interface VisitorData {
  visitorId: string;
  gaClientId?: string;
  cfVisitorId?: string;
  cloudflareVisitorId?: string;
  realIp?: string;
  vpnIp?: string;
  userFingerprint?: string;
  sessionId: string;
  firstVisit: number;
  lastVisit: number;
}

/**
 * Main Analytics class for handling all tracking functionality
 */
export class AnalyticsManager {
  private visitorData: VisitorData | null = null;
  private eventQueue: BehaviorEvent[] = [];
  private sessionStartTime: number = Date.now();
  private lastActivityTime: number = Date.now();
  private scrollDepth: number = 0;
  private maxScrollDepth: number = 0;
  private isInitialized: boolean = false;
  private heartbeatInterval: number | null = null;
  private batchSendInterval: number | null = null;

  /**
   * Initialize the analytics system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Generate or retrieve visitor identification
      await this.initializeVisitorId();

      // Initialize Google Analytics if configured
      if (ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
        await this.initializeGoogleAnalytics();
      }

      // Setup behavior tracking
      this.setupBehaviorTracking();

      // Start periodic tasks
      this.startHeartbeat();
      this.startBatchSending();

      this.isInitialized = true;
      console.log('[Analytics] System initialized successfully');

      // Track initial page view, merge article-specific data if available
      const pageData = (window as any).__ANALYTICS_PAGE_DATA || {};
      this.trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        ...pageData,
      });
    } catch (error) {
      console.error('[Analytics] Initialization failed:', error);
    }
  }

  /**
   * Generate or retrieve visitor identification using multiple methods
   */
  private async initializeVisitorId(): Promise<void> {
    try {
      // Try to get existing visitor data
      const existingData = this.getStoredVisitorData();

      if (existingData && this.isValidVisitorData(existingData)) {
        this.visitorData = existingData;
        this.visitorData.lastVisit = Date.now();
        this.visitorData.sessionId = this.generateSessionId();
      } else {
        // Generate new visitor data
        this.visitorData = {
          visitorId: this.generateVisitorId(),
          sessionId: this.generateSessionId(),
          firstVisit: Date.now(),
          lastVisit: Date.now(),
        };
      }
       await this.getAdditionalVisitorInfo()
      // Try to get Cloudflare Visitor ID if available
      await this.getCloudflareVisitorId();

      // Store updated visitor data
      this.storeVisitorData();
    } catch (error) {
      console.error('[Analytics] Failed to initialize visitor ID:', error);
      // Fallback to basic visitor ID
      this.visitorData = {
        visitorId: this.generateVisitorId(),
        sessionId: this.generateSessionId(),
        firstVisit: Date.now(),
        lastVisit: Date.now(),
      };
    }
  }

  /**
   * Get Cloudflare Visitor ID using cf-headers API
   */
  private async getCloudflareVisitorId(): Promise<void> {
    try {
      // Get visitor ID from cf-headers API which includes all Cloudflare data
      const response = await fetch('/api/cf-headers');

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.visitorId) {
          this.visitorData!.cfVisitorId = data.visitorId;
          return;
        }
      }

      // Fallback: Generate from available Cloudflare headers (client-side approximation)
      const cfRay = this.getCfRayFromHeaders();
      if (cfRay) {
        this.visitorData!.cfVisitorId = this.hashString(cfRay);
      }
    } catch (error) {
      console.warn('[Analytics] Could not get Cloudflare Visitor ID:', error);
    }
  }

  /**
   * Get additional visitor information including Cloudflare visitor ID, real IP, VPN IP, and user fingerprint
   */
  private async getAdditionalVisitorInfo(): Promise<void> {
    try {
      // Get Cloudflare visitor ID (enhanced version)
      await this.getEnhancedCloudflareInfo();

      // Generate user fingerprint
      this.visitorData!.userFingerprint = await this.generateUserFingerprint();

    } catch (error) {
      console.warn('[Analytics] Could not get additional visitor info:', error);
    }
  }

  /**
   * Get enhanced Cloudflare information including visitor ID and real IP.
   * Uses server-side Cloudflare headers via /api/cf-headers instead of
   * third-party IP APIs (ipapi.co, ip-api.com) which cause CORS and
   * rate-limit errors in the browser.
   */
  private async getEnhancedCloudflareInfo(): Promise<void> {
    try {
      // Get Cloudflare visitor information
      const cloudflareInfo = await getCloudflareVisitorInfo();
      if (cloudflareInfo.visitorId) {
        this.visitorData!.cloudflareVisitorId = cloudflareInfo.visitorId;
      }

      // Get IP data from server-side Cloudflare headers (no CORS issues)
      const cloudflareData = await getCloudflareData();
      if (cloudflareData.realIP || cloudflareData.clientIP) {
        this.visitorData!.realIp = cloudflareData.realIP || cloudflareData.clientIP;
      }

    } catch (error) {
      console.warn('[Analytics] Could not get enhanced Cloudflare info:', error);
    }
  }

  /**
   * Generate user fingerprint based on browser characteristics
   */
  private async generateUserFingerprint(): Promise<string> {
    try {
      // Use the advanced device signature generator from docs/utils
      const deviceSignature = await generateDeviceSignature();
      return deviceSignature;
    } catch (error) {
      console.warn('[Analytics] Could not generate device signature, falling back to simple fingerprint:', error);
      
      // Fallback to simple fingerprint if device signature fails
      try {
        const fingerprint = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenResolution: `${screen.width}x${screen.height}`,
          colorDepth: screen.colorDepth,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          cookieEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack,
          hardwareConcurrency: navigator.hardwareConcurrency || 0,
          deviceMemory: (navigator as any).deviceMemory || 0,
          webglVendor: this.getWebGLVendor(),
          webglRenderer: this.getWebGLRenderer(),
        };

        const fingerprintString = JSON.stringify(fingerprint);
        return this.hashString(fingerprintString);
      } catch (fallbackError) {
        console.warn('[Analytics] Fallback fingerprint also failed:', fallbackError);
        return this.hashString(navigator.userAgent + Date.now());
      }
    }
  }

  /**
   * Get WebGL vendor information for fingerprinting
   */
  private getWebGLVendor(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          return gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown';
        }
      }
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get WebGL renderer information for fingerprinting
   */
  private getWebGLRenderer(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
        }
      }
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Initialize Google Analytics and get client ID
   */
  private async initializeGoogleAnalytics(): Promise<void> {
    try {
      // Load Google Analytics script
      await this.loadGoogleAnalytics();

      // Get or generate GA client ID
      const gaClientId = await this.getGoogleAnalyticsClientId();
      if (gaClientId && this.visitorData) {
        this.visitorData.gaClientId = gaClientId;
      }

    } catch (error) {
      console.error('[Analytics] Failed to initialize Google Analytics:', error);
    }
  }

  /**
   * Load Google Analytics script dynamically
   */
  private loadGoogleAnalytics(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.gtag === 'function') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA_MEASUREMENT_ID}`;

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer.push(arguments);
        };

        // Set user_id globally before config so it's included from the first hit
        const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (storedUserId) {
          window.gtag('set', { user_id: storedUserId });
        }

        window.gtag('js', new Date());
        window.gtag('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
          send_page_view: false, // We'll handle page views manually
          ...(storedUserId && { user_id: storedUserId }),
          ...(this.visitorData?.cfVisitorId && {
            custom_map: {
              custom_dimension_1: 'cfVisitorId',
            },
          }),
        });

        resolve();
      };

      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Get Google Analytics client ID
   */
  private async getGoogleAnalyticsClientId(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!window.gtag) {
        resolve(null);
        return;
      }

      window.gtag('get', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, 'client_id', (clientId: string) => {
        if (clientId) {
          localStorage.setItem(STORAGE_KEYS.GA_CLIENT_ID, clientId);
          resolve(clientId);
        } else {
          // Fallback to stored client ID
          const storedClientId = localStorage.getItem(STORAGE_KEYS.GA_CLIENT_ID);
          resolve(storedClientId);
        }
      });
    });
  }

  /**
   * Set GA4 user_id for cross-device tracking
   * Call after login success; pass null on logout to clear.
   */
  setUserId(userId: string | null): void {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('set', { user_id: userId });
  }

  /**
   * Setup behavior tracking event listeners
   */
  private setupBehaviorTracking(): void {
    // Scroll depth tracking
    let scrollTimeout: number | undefined;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        this.updateScrollDepth();
      }, ANALYTICS_CONFIG.SCROLL_THROTTLE);
    });

    // Click tracking
    document.addEventListener('click', (event) => {
      this.trackClickEvent(event);
    });

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackTimeOnPage();
      } else {
        this.sessionStartTime = Date.now();
      }
    });

    // Before unload - track final session data
    window.addEventListener('beforeunload', () => {
      this.trackTimeOnPage();
      this.sendQueuedEvents(true); // Force send remaining events
    });
  }

  /**
   * Track user behavior event
   *
   * This method is the central entry point for recording analytics events.
   * It enriches incoming data with environment metadata, enqueues the event
   * for batch sending to our custom analytics endpoint, and (optionally)
   * forwards a subset of events to Google Analytics when available.
   */
  trackEvent(type: string, data: Record<string, any> = {}): void {
    if (!this.visitorData) {
      console.warn('[Analytics] Cannot track event - visitor data not initialized');
      return;
    }

    const event: BehaviorEvent = {
      type,
      timestamp: Date.now(),
      data: {
        ...data,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      visitorId: this.visitorData.visitorId,
      sessionId: this.visitorData.sessionId,
      pageUrl: window.location.href,
    };

    this.eventQueue.push(event);
    this.lastActivityTime = Date.now();

    // Forward to Google Analytics if available
    if (window.gtag) {
      // Common custom dimensions for all events
      const currentUserId = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.USER_ID) : null;
      const commonParams = {
        ...(currentUserId && { c_user_id: currentUserId }),
        ...(this.visitorData.cfVisitorId && { cf_id: this.visitorData.cfVisitorId }),
        ...(this.visitorData.cloudflareVisitorId && { cloudflare_visitor_id: this.visitorData.cloudflareVisitorId }),
        ...(this.visitorData.realIp && { real_ip: this.visitorData.realIp }),
        ...(this.visitorData.vpnIp && { vpn_ip: this.visitorData.vpnIp }),
        ...(this.visitorData.userFingerprint && { user_fingerprint: this.visitorData.userFingerprint }),
      };

      // Page view - enriched with article data on article pages
      if (type === TRACKING_EVENTS.PAGE_VIEW) {
        window.gtag('event', 'page_view', {
          page_title: data.title,
          page_location: data.url,
          article_id: data.articleId || undefined,
          author_id: data.authorId || undefined,
          promote_code: data.promoteCode || undefined,
          ...commonParams,
        });
      }

      // Forward specific custom UI events to GA4 with recommended/eventful names
      // - HEADER_USER_BUTTON_CLICK -> select_content (button)
      // - WALLET_BUTTON_CLICK -> login (method=wallet) or select_content (disconnect)
      if (type === TRACKING_EVENTS.HEADER_USER_BUTTON_CLICK) {
        window.gtag('event', 'select_content', {
          content_type: 'button',
          item_id: 'header_user_button',
          has_token: Boolean((data as any).hasToken),
          locale: (data as any).locale || undefined,
          ...commonParams,
        });
      } else if (type === TRACKING_EVENTS.WALLET_BUTTON_CLICK) {
        const intent = (data as any).intent;
        if (intent === 'login') {
          window.gtag('event', 'login', {
            method: 'wallet',
            ...commonParams,
          });
        } else {
          window.gtag('event', 'select_content', {
            content_type: 'button',
            item_id: 'wallet_disconnect_button',
            ...commonParams,
          });
        }
      }

      // Additional key interactions mapping to GA4
      // NOTE: We use GA4 recommended names where applicable; otherwise, custom events are used.
      // This aims to keep reports meaningful while avoiding double-counting with enhanced measurement.
      if (type === TRACKING_EVENTS.ARTICLE_SHARE) {
        // Map share action to GA4 recommended 'share' event with article info
        window.gtag('event', 'share', {
          method: (data as any).platform || 'unknown',
          content_type: 'article',
          item_id: (data as any).articleId || (data as any).articleUrl || undefined,
          ...commonParams,
        });
      } else if (type === TRACKING_EVENTS.SCROLL_DEPTH) {
        // GA4 has auto 'scroll' (90%) via enhanced measurement; here we send granular percent
        window.gtag('event', 'scroll', {
          percent_scrolled: (data as any).depth,
          max_depth: (data as any).maxDepth,
          ...commonParams,
        });
      } else if (type === TRACKING_EVENTS.TIME_ON_PAGE) {
        // Custom event to capture time on page in ms
        window.gtag('event', 'time_on_page', {
          duration_ms: (data as any).duration,
          max_scroll_depth: (data as any).scrollDepth,
          ...commonParams,
        });
      } else if (type === TRACKING_EVENTS.SEARCH_EVENT) {
        // Map search to GA4 'search' with search_term
        const d: any = data as any;
        const term = d.query || d.keyword || d.term || d.text;
        if (term) {
          window.gtag('event', 'search', {
            search_term: term,
            ...commonParams,
          });
        }
      } else if (type === TRACKING_EVENTS.LOGIN_ATTEMPT) {
        // Use a custom event for attempt to avoid duplication with successful 'login'
        window.gtag('event', 'login_attempt', {
          method: (data as any).method || type || 'wallet',
          ...commonParams,
        });
      } else if (type === TRACKING_EVENTS.LOGIN_SUCCESS) {
        // Map success to GA4 'login' (recommended)
        window.gtag('event', 'login', {
          method: (data as any).method || type || 'wallet',
          ...commonParams,
        });
      } else if (type === TRACKING_EVENTS.LOGIN_FAILURE) {
        // Use a custom event for failure (GA4 doesn't have a dedicated failure event)
        window.gtag('event', 'login_failure', {
          method: (data as any).method || type || 'wallet',
          error_code: (data as any).errorCode || undefined,
          reason: (data as any).reason || undefined,
          ...commonParams,
        });
      }
    }

    // console.log('[Analytics] Event tracked:', event)
  }

  /**
   * Track article sharing
   */
  trackArticleShare(articleId: string, platform: string): void {
    this.trackEvent(TRACKING_EVENTS.ARTICLE_SHARE, {
      articleId,
      platform,
      timestamp: Date.now(),
    });
  }

  /**
   * Update scroll depth tracking
   */
  private updateScrollDepth(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentScrollDepth = Math.round((scrollTop / documentHeight) * 100);

    this.scrollDepth = currentScrollDepth;

    if (currentScrollDepth > this.maxScrollDepth) {
      this.maxScrollDepth = currentScrollDepth;

      // Track significant scroll milestones
      if (currentScrollDepth >= 25 && currentScrollDepth % 25 === 0) {
        this.trackEvent(TRACKING_EVENTS.SCROLL_DEPTH, {
          depth: currentScrollDepth,
          maxDepth: this.maxScrollDepth,
        });
      }
    }
  }

  /**
   * Track click events
   */
  private trackClickEvent(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    const elementInfo = {
      tagName: target.tagName,
      className: target.className,
      id: target.id,
      text: target.textContent?.slice(0, 100) || '',
      href: (target as HTMLAnchorElement).href || null,
    };

    this.trackEvent(TRACKING_EVENTS.CLICK_EVENT, {
      element: elementInfo,
      coordinates: { x: event.clientX, y: event.clientY },
    });
  }

  /**
   * Track time spent on page
   */
  private trackTimeOnPage(): void {
    const timeOnPage = Date.now() - this.sessionStartTime;

    this.trackEvent(TRACKING_EVENTS.TIME_ON_PAGE, {
      duration: timeOnPage,
      scrollDepth: this.maxScrollDepth,
    });
  }

  /**
   * Start heartbeat to track user engagement
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivityTime;

      if (timeSinceLastActivity < ANALYTICS_CONFIG.HEARTBEAT_INTERVAL * 2) {
        this.trackEvent(TRACKING_EVENTS.USER_ENGAGEMENT, {
          activeTime: timeSinceLastActivity,
          scrollDepth: this.scrollDepth,
        });
      }
    }, ANALYTICS_CONFIG.HEARTBEAT_INTERVAL);
  }

  /**
   * Start batch sending of events
   */
  private startBatchSending(): void {
    this.batchSendInterval = window.setInterval(() => {
      this.sendQueuedEvents();
    }, ANALYTICS_CONFIG.BATCH_SEND_INTERVAL);
  }

  /**
   * Send queued events to analytics endpoint
   */
  private async sendQueuedEvents(force: boolean = false): Promise<void> {
    //TODO: API not provided yet, skip sending for now
    return;

    if (this.eventQueue.length === 0) return;

    if (!force && this.eventQueue.length < 10) return; // Wait for more events unless forced

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          visitorData: this.visitorData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      console.log(`[Analytics] Sent ${eventsToSend.length} events successfully`);
    } catch (error) {
      console.error('[Analytics] Failed to send events:', error);
      // Re-queue events for retry (keep only recent ones)
      this.eventQueue.unshift(...eventsToSend.slice(-50));
    }
  }

  /**
   * Generate unique visitor ID
   */
  private generateVisitorId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 11);
    return `${timestamp}-${randomPart}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get stored visitor data from localStorage
   */
  private getStoredVisitorData(): VisitorData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Store visitor data to localStorage
   */
  private storeVisitorData(): void {
    if (this.visitorData) {
      try {
        localStorage.setItem(STORAGE_KEYS.VISITOR_ID, JSON.stringify(this.visitorData));
      } catch (error) {
        console.warn('[Analytics] Failed to store visitor data:', error);
      }
    }
  }

  /**
   * Validate visitor data structure
   */
  private isValidVisitorData(data: any): data is VisitorData {
    return data && typeof data.visitorId === 'string' && typeof data.firstVisit === 'number' && typeof data.lastVisit === 'number';
  }

  /**
   * Get CF-Ray header value (approximation)
   */
  private getCfRayFromHeaders(): string | null {
    // This is a client-side approximation - actual CF-Ray would need server-side handling
    const performanceEntries = performance.getEntriesByType('navigation');
    if (performanceEntries.length > 0) {
      const entry = performanceEntries[0] as PerformanceNavigationTiming;
      return entry.name ? this.hashString(entry.name + Date.now()) : null;
    }
    return null;
  }

  /**
   * Simple hash function for generating IDs
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
    }
    if (this.batchSendInterval) {
      window.clearInterval(this.batchSendInterval);
    }
    this.sendQueuedEvents(true); // Send remaining events
  }

  /**
   * Get current visitor data
   */
  getVisitorData(): VisitorData | null {
    return this.visitorData;
  }
}

// Global analytics instance
let analyticsInstance: AnalyticsManager | null = null;

/**
 * Get or create global analytics instance
 */
export function getAnalytics(): AnalyticsManager {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsManager();
  }
  return analyticsInstance;
}

/**
 * Initialize analytics system
 */
export async function initializeAnalytics(): Promise<AnalyticsManager> {
  const analytics = getAnalytics();
  await analytics.initialize();
  return analytics;
}

// Type declarations for global objects
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
