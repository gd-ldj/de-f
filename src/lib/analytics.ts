/**
 * Analytics and User Behavior Tracking System
 * Integrates Cloudflare Visitor ID, Google Analytics, and custom behavior tracking
 */

import { STORAGE_KEYS, ANALYTICS_CONFIG, TRACKING_EVENTS } from '../config/constants'

/**
 * Interface for user behavior event data
 */
export interface BehaviorEvent {
  type: string
  timestamp: number
  data: Record<string, any>
  visitorId: string
  sessionId: string
  pageUrl: string
}

/**
 * Interface for visitor identification data
 */
export interface VisitorData {
  visitorId: string
  gaClientId?: string
  cfVisitorId?: string
  sessionId: string
  firstVisit: number
  lastVisit: number
}

/**
 * Main Analytics class for handling all tracking functionality
 */
export class AnalyticsManager {
  private visitorData: VisitorData | null = null
  private eventQueue: BehaviorEvent[] = []
  private sessionStartTime: number = Date.now()
  private lastActivityTime: number = Date.now()
  private scrollDepth: number = 0
  private maxScrollDepth: number = 0
  private isInitialized: boolean = false
  private heartbeatInterval: number | null = null
  private batchSendInterval: number | null = null

  /**
   * Initialize the analytics system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Generate or retrieve visitor identification
      await this.initializeVisitorId()
      
      // Initialize Google Analytics if configured
      if (ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
        await this.initializeGoogleAnalytics()
      }
      
      // Setup behavior tracking
      this.setupBehaviorTracking()
      
      // Start periodic tasks
      this.startHeartbeat()
      this.startBatchSending()
      
      this.isInitialized = true
      console.log('[Analytics] System initialized successfully')
      
      // Track initial page view
      this.trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer
      })
      
    } catch (error) {
      console.error('[Analytics] Initialization failed:', error)
    }
  }

  /**
   * Generate or retrieve visitor identification using multiple methods
   */
  private async initializeVisitorId(): Promise<void> {
    try {
      // Try to get existing visitor data
      const existingData = this.getStoredVisitorData()
      
      if (existingData && this.isValidVisitorData(existingData)) {
        this.visitorData = existingData
        this.visitorData.lastVisit = Date.now()
        this.visitorData.sessionId = this.generateSessionId()
      } else {
        // Generate new visitor data
        this.visitorData = {
          visitorId: this.generateVisitorId(),
          sessionId: this.generateSessionId(),
          firstVisit: Date.now(),
          lastVisit: Date.now()
        }
      }
      
      // Try to get Cloudflare Visitor ID if available
      await this.getCloudflareVisitorId()
      
      // Store updated visitor data
      this.storeVisitorData()
      
    } catch (error) {
      console.error('[Analytics] Failed to initialize visitor ID:', error)
      // Fallback to basic visitor ID
      this.visitorData = {
        visitorId: this.generateVisitorId(),
        sessionId: this.generateSessionId(),
        firstVisit: Date.now(),
        lastVisit: Date.now()
      }
    }
  }

  /**
   * Get Cloudflare Visitor ID using CF-Connecting-IP or CF-Ray headers
   */
  private async getCloudflareVisitorId(): Promise<void> {
    try {
      // Method 1: Try to get from Cloudflare Analytics API
      if (ANALYTICS_CONFIG.CLOUDFLARE_ANALYTICS_TOKEN) {
        const response = await fetch('/api/cf-visitor-id', {
          headers: {
            'Authorization': `Bearer ${ANALYTICS_CONFIG.CLOUDFLARE_ANALYTICS_TOKEN}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.visitorId) {
            this.visitorData!.cfVisitorId = data.visitorId
            return
          }
        }
      }
      
      // Method 2: Generate from available Cloudflare headers (client-side approximation)
      const cfRay = this.getCfRayFromHeaders()
      if (cfRay) {
        this.visitorData!.cfVisitorId = this.hashString(cfRay)
      }
      
    } catch (error) {
      console.warn('[Analytics] Could not get Cloudflare Visitor ID:', error)
    }
  }

  /**
   * Initialize Google Analytics and get client ID
   */
  private async initializeGoogleAnalytics(): Promise<void> {
    try {
      // Load Google Analytics script
      await this.loadGoogleAnalytics()
      
      // Get or generate GA client ID
      const gaClientId = await this.getGoogleAnalyticsClientId()
      if (gaClientId && this.visitorData) {
        this.visitorData.gaClientId = gaClientId
      }
      
    } catch (error) {
      console.error('[Analytics] Failed to initialize Google Analytics:', error)
    }
  }

  /**
   * Load Google Analytics script dynamically
   */
  private loadGoogleAnalytics(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gtag) {
        resolve()
        return
      }
      
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA_MEASUREMENT_ID}`
      
      script.onload = () => {
        window.dataLayer = window.dataLayer || []
        window.gtag = function() {
          window.dataLayer.push(arguments)
        }
        
        window.gtag('js', new Date())
        window.gtag('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
          send_page_view: false // We'll handle page views manually
        })
        
        resolve()
      }
      
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  /**
   * Get Google Analytics client ID
   */
  private async getGoogleAnalyticsClientId(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!window.gtag) {
        resolve(null)
        return
      }
      
      window.gtag('get', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, 'client_id', (clientId: string) => {
        if (clientId) {
          localStorage.setItem(STORAGE_KEYS.GA_CLIENT_ID, clientId)
          resolve(clientId)
        } else {
          // Fallback to stored client ID
          const storedClientId = localStorage.getItem(STORAGE_KEYS.GA_CLIENT_ID)
          resolve(storedClientId)
        }
      })
    })
  }

  /**
   * Setup behavior tracking event listeners
   */
  private setupBehaviorTracking(): void {
    // Scroll depth tracking
    let scrollTimeout: number | undefined
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = window.setTimeout(() => {
        this.updateScrollDepth()
      }, ANALYTICS_CONFIG.SCROLL_THROTTLE)
    })
    
    // Click tracking
    document.addEventListener('click', (event) => {
      this.trackClickEvent(event)
    })
    
    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackTimeOnPage()
      } else {
        this.sessionStartTime = Date.now()
      }
    })
    
    // Before unload - track final session data
    window.addEventListener('beforeunload', () => {
      this.trackTimeOnPage()
      this.sendQueuedEvents(true) // Force send remaining events
    })
  }

  /**
   * Track user behavior event
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

    // Send to Google Analytics if available
    if (window.gtag && type === TRACKING_EVENTS.PAGE_VIEW) {
      window.gtag('event', 'page_view', {
        page_title: data.title,
        page_location: data.url,
      });
    }

    // console.log('[Analytics] Event tracked:', event)
  }

  /**
   * Track article-specific events
   */
  trackArticleView(articleId: string, title: string, category?: string): void {
    this.trackEvent(TRACKING_EVENTS.ARTICLE_VIEW, {
      articleId,
      title,
      category,
      timestamp: Date.now()
    })
  }

  /**
   * Track article sharing
   */
  trackArticleShare(articleId: string, platform: string): void {
    this.trackEvent(TRACKING_EVENTS.ARTICLE_SHARE, {
      articleId,
      platform,
      timestamp: Date.now()
    })
  }

  /**
   * Update scroll depth tracking
   */
  private updateScrollDepth(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    const currentScrollDepth = Math.round((scrollTop / documentHeight) * 100)
    
    this.scrollDepth = currentScrollDepth
    
    if (currentScrollDepth > this.maxScrollDepth) {
      this.maxScrollDepth = currentScrollDepth
      
      // Track significant scroll milestones
      if (currentScrollDepth >= 25 && currentScrollDepth % 25 === 0) {
        this.trackEvent(TRACKING_EVENTS.SCROLL_DEPTH, {
          depth: currentScrollDepth,
          maxDepth: this.maxScrollDepth
        })
      }
    }
  }

  /**
   * Track click events
   */
  private trackClickEvent(event: MouseEvent): void {
    const target = event.target as HTMLElement
    if (!target) return
    
    const elementInfo = {
      tagName: target.tagName,
      className: target.className,
      id: target.id,
      text: target.textContent?.slice(0, 100) || '',
      href: (target as HTMLAnchorElement).href || null
    }
    
    this.trackEvent(TRACKING_EVENTS.CLICK_EVENT, {
      element: elementInfo,
      coordinates: { x: event.clientX, y: event.clientY }
    })
  }

  /**
   * Track time spent on page
   */
  private trackTimeOnPage(): void {
    const timeOnPage = Date.now() - this.sessionStartTime
    
    this.trackEvent(TRACKING_EVENTS.TIME_ON_PAGE, {
      duration: timeOnPage,
      scrollDepth: this.maxScrollDepth
    })
  }

  /**
   * Start heartbeat to track user engagement
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivityTime
      
      if (timeSinceLastActivity < ANALYTICS_CONFIG.HEARTBEAT_INTERVAL * 2) {
        this.trackEvent(TRACKING_EVENTS.USER_ENGAGEMENT, {
          activeTime: timeSinceLastActivity,
          scrollDepth: this.scrollDepth
        })
      }
    }, ANALYTICS_CONFIG.HEARTBEAT_INTERVAL)
  }

  /**
   * Start batch sending of events
   */
  private startBatchSending(): void {
    this.batchSendInterval = window.setInterval(() => {
      this.sendQueuedEvents()
    }, ANALYTICS_CONFIG.BATCH_SEND_INTERVAL)
  }

  /**
   * Send queued events to analytics endpoint
   */
  private async sendQueuedEvents(force: boolean = false): Promise<void> {
    if (this.eventQueue.length === 0) return
    
    if (!force && this.eventQueue.length < 10) return // Wait for more events unless forced
    
    const eventsToSend = [...this.eventQueue]
    this.eventQueue = []
    
    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: eventsToSend,
          visitorData: this.visitorData
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      console.log(`[Analytics] Sent ${eventsToSend.length} events successfully`)
      
    } catch (error) {
      console.error('[Analytics] Failed to send events:', error)
      // Re-queue events for retry (keep only recent ones)
      this.eventQueue.unshift(...eventsToSend.slice(-50))
    }
  }

  /**
   * Generate unique visitor ID
   */
  private generateVisitorId(): string {
    const timestamp = Date.now().toString(36)
    const randomPart = Math.random().toString(36).substr(2, 9)
    return `${timestamp}-${randomPart}`
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get stored visitor data from localStorage
   */
  private getStoredVisitorData(): VisitorData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VISITOR_ID)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  /**
   * Store visitor data to localStorage
   */
  private storeVisitorData(): void {
    if (this.visitorData) {
      try {
        localStorage.setItem(STORAGE_KEYS.VISITOR_ID, JSON.stringify(this.visitorData))
      } catch (error) {
        console.warn('[Analytics] Failed to store visitor data:', error)
      }
    }
  }

  /**
   * Validate visitor data structure
   */
  private isValidVisitorData(data: any): data is VisitorData {
    return data && 
           typeof data.visitorId === 'string' && 
           typeof data.firstVisit === 'number' &&
           typeof data.lastVisit === 'number'
  }

  /**
   * Get CF-Ray header value (approximation)
   */
  private getCfRayFromHeaders(): string | null {
    // This is a client-side approximation - actual CF-Ray would need server-side handling
    const performanceEntries = performance.getEntriesByType('navigation')
    if (performanceEntries.length > 0) {
      const entry = performanceEntries[0] as PerformanceNavigationTiming
      return entry.name ? this.hashString(entry.name + Date.now()) : null
    }
    return null
  }

  /**
   * Simple hash function for generating IDs
   */
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval)
    }
    if (this.batchSendInterval) {
      window.clearInterval(this.batchSendInterval)
    }
    this.sendQueuedEvents(true) // Send remaining events
  }

  /**
   * Get current visitor data
   */
  getVisitorData(): VisitorData | null {
    return this.visitorData
  }
}

// Global analytics instance
let analyticsInstance: AnalyticsManager | null = null

/**
 * Get or create global analytics instance
 */
export function getAnalytics(): AnalyticsManager {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsManager()
  }
  return analyticsInstance
}

/**
 * Initialize analytics system
 */
export async function initializeAnalytics(): Promise<AnalyticsManager> {
  const analytics = getAnalytics()
  await analytics.initialize()
  return analytics
}

// Type declarations for global objects
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}