/**
 * Analytics Events API Endpoint
 * Handles collection and processing of user behavior data
 */

import type { APIRoute } from 'astro'
import type { BehaviorEvent, VisitorData } from '../../../lib/analytics'

export interface AnalyticsRequest {
  events: BehaviorEvent[]
  visitorData: VisitorData
}

export interface AnalyticsResponse {
  success: boolean
  message: string
  processed: number
}

/**
 * POST /api/analytics/events
 * Collect and process user behavior events
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body: AnalyticsRequest = await request.json()
    const { events, visitorData } = body

    // Validate request data
    if (!events || !Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No events provided',
          processed: 0
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!visitorData || !visitorData.visitorId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid visitor data',
          processed: 0
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get client information from headers
    const clientInfo = {
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || '',
      referer: request.headers.get('referer') || '',
      cfRay: request.headers.get('cf-ray') || '',
      cfConnectingIp: request.headers.get('cf-connecting-ip') || '',
      cfCountry: request.headers.get('cf-ipcountry') || '',
      cfVisitorId: request.headers.get('cf-visitor') || ''
    }

    // Process and validate events
    const processedEvents = events.map(event => ({
      ...event,
      clientInfo,
      serverTimestamp: Date.now(),
      processed: true
    }))

    // Filter out potentially fraudulent events
    const validEvents = await filterFraudulentEvents(processedEvents, visitorData, clientInfo)

    // Log events for debugging (in production, send to analytics service)
    console.log('[Analytics API] Processed events:', {
      totalEvents: events.length,
      validEvents: validEvents.length,
      visitorId: visitorData.visitorId,
      sessionId: visitorData.sessionId,
      clientInfo
    })

    // In a real implementation, you would:
    // 1. Store events in a database (e.g., ClickHouse, BigQuery)
    // 2. Send to analytics services (e.g., Google Analytics, Mixpanel)
    // 3. Process for real-time dashboards
    // 4. Apply fraud detection algorithms

    // For now, we'll simulate successful processing
    await simulateEventProcessing(validEvents)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Events processed successfully',
        processed: validEvents.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[Analytics API] Error processing events:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        processed: 0
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

/**
 * Extract client IP address from request
 */
function getClientIP(request: Request): string {
  // Try Cloudflare headers first
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) return cfConnectingIp

  // Try other common headers
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }

  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) return xRealIp

  // Fallback to connection info (may not be available in all environments)
  return 'unknown'
}

/**
 * Filter out potentially fraudulent events
 * Implements basic fraud detection logic
 */
async function filterFraudulentEvents(
  events: any[],
  visitorData: VisitorData,
  clientInfo: any
): Promise<any[]> {
  const validEvents: any[] = []
  const suspiciousPatterns = {
    tooManyEvents: false,
    suspiciousUserAgent: false,
    rapidClicks: false,
    impossibleScrolling: false
  }

  // Check for too many events in short time
  const eventTimes = events.map(e => e.timestamp).sort((a, b) => a - b)
  const timeSpan = eventTimes[eventTimes.length - 1] - eventTimes[0]
  if (events.length > 50 && timeSpan < 10000) { // 50+ events in 10 seconds
    suspiciousPatterns.tooManyEvents = true
  }

  // Check for suspicious user agent
  const userAgent = clientInfo.userAgent.toLowerCase()
  const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'headless']
  if (botPatterns.some(pattern => userAgent.includes(pattern))) {
    suspiciousPatterns.suspiciousUserAgent = true
  }

  // Check for rapid clicking patterns
  const clickEvents = events.filter(e => e.type === 'click_event')
  if (clickEvents.length > 10) {
    const clickTimes = clickEvents.map(e => e.timestamp).sort((a, b) => a - b)
    let rapidClicks = 0
    for (let i = 1; i < clickTimes.length; i++) {
      if (clickTimes[i] - clickTimes[i - 1] < 100) { // Clicks less than 100ms apart
        rapidClicks++
      }
    }
    if (rapidClicks > 5) {
      suspiciousPatterns.rapidClicks = true
    }
  }

  // Check for impossible scrolling patterns
  const scrollEvents = events.filter(e => e.type === 'scroll_depth')
  if (scrollEvents.length > 0) {
    const scrollDepths = scrollEvents.map(e => e.data.depth)
    const maxJump = Math.max(...scrollDepths.slice(1).map((depth, i) => 
      Math.abs(depth - scrollDepths[i])
    ))
    if (maxJump > 50) { // Scroll jump > 50% in single event
      suspiciousPatterns.impossibleScrolling = true
    }
  }

  // Log suspicious patterns
  const suspiciousCount = Object.values(suspiciousPatterns).filter(Boolean).length
  if (suspiciousCount > 0) {
    console.warn('[Analytics API] Suspicious patterns detected:', {
      visitorId: visitorData.visitorId,
      patterns: suspiciousPatterns,
      clientInfo
    })
  }

  // Filter events based on fraud detection
  for (const event of events) {
    let isValid = true

    // Skip events if too many suspicious patterns
    if (suspiciousCount >= 2) {
      isValid = false
    }

    // Additional event-specific validation
    if (event.type === 'click_event' && suspiciousPatterns.rapidClicks) {
      isValid = false
    }

    if (event.type === 'scroll_depth' && suspiciousPatterns.impossibleScrolling) {
      isValid = false
    }

    if (isValid) {
      validEvents.push({
        ...event,
        fraudScore: suspiciousCount,
        validatedAt: Date.now()
      })
    }
  }

  return validEvents
}

/**
 * Simulate event processing (replace with real implementation)
 */
async function simulateEventProcessing(events: any[]): Promise<void> {
  // In a real implementation, this would:
  // 1. Store events in a time-series database
  // 2. Update real-time analytics dashboards
  // 3. Trigger alerts for unusual patterns
  // 4. Send data to third-party analytics services
  
  // For now, just log the processing
  console.log(`[Analytics API] Simulated processing of ${events.length} events`)
  
  // Simulate async processing delay
  await new Promise(resolve => setTimeout(resolve, 10))
}

/**
 * GET /api/analytics/events
 * Health check endpoint
 */
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      service: 'analytics-events',
      timestamp: Date.now()
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}