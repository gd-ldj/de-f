/**
 * Cloudflare Visitor ID API Endpoint
 * Generates unique visitor identifiers using Cloudflare data
 */

import type { APIRoute } from 'astro'

export interface CloudflareVisitorResponse {
  visitorId: string
  cfRay?: string
  cfConnectingIp?: string
  cfCountry?: string
  cfTimezone?: string
  cfVisitor?: string
  timestamp: number
}

/**
 * GET /api/cf-visitor-id
 * Generate or retrieve Cloudflare-based visitor ID
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    // Extract Cloudflare headers
    const cfHeaders = {
      cfRay: request.headers.get('cf-ray') || '',
      cfConnectingIp: request.headers.get('cf-connecting-ip') || '',
      cfCountry: request.headers.get('cf-ipcountry') || '',
      cfTimezone: request.headers.get('cf-timezone') || '',
      cfVisitor: request.headers.get('cf-visitor') || '',
      userAgent: request.headers.get('user-agent') || ''
    }

    // Generate visitor ID based on available Cloudflare data
    const visitorId = generateCloudflareVisitorId(cfHeaders)

    const response: CloudflareVisitorResponse = {
      visitorId,
      cfRay: cfHeaders.cfRay || undefined,
      cfConnectingIp: cfHeaders.cfConnectingIp || undefined,
      cfCountry: cfHeaders.cfCountry || undefined,
      cfTimezone: cfHeaders.cfTimezone || undefined,
      cfVisitor: cfHeaders.cfVisitor || undefined,
      timestamp: Date.now()
    }

    console.log('[CF Visitor ID] Generated visitor ID:', {
      visitorId,
      hasRay: !!cfHeaders.cfRay,
      hasIp: !!cfHeaders.cfConnectingIp,
      country: cfHeaders.cfCountry
    })

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    )

  } catch (error) {
    console.error('[CF Visitor ID] Error generating visitor ID:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Failed to generate visitor ID',
        timestamp: Date.now()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

/**
 * POST /api/cf-visitor-id
 * Validate and enhance visitor ID with additional data
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { visitorId, clientData } = body

    if (!visitorId) {
      return new Response(
        JSON.stringify({ error: 'Visitor ID required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract Cloudflare headers
    const cfHeaders = {
      cfRay: request.headers.get('cf-ray') || '',
      cfConnectingIp: request.headers.get('cf-connecting-ip') || '',
      cfCountry: request.headers.get('cf-ipcountry') || '',
      cfTimezone: request.headers.get('cf-timezone') || '',
      cfVisitor: request.headers.get('cf-visitor') || ''
    }

    // Validate visitor ID against Cloudflare data
    const isValid = validateVisitorId(visitorId, cfHeaders)

    // Enhance with additional Cloudflare data
    const enhancedData = {
      visitorId,
      isValid,
      cfData: cfHeaders,
      clientData: clientData || {},
      serverTimestamp: Date.now(),
      fingerprint: generateFingerprint(cfHeaders, clientData)
    }

    console.log('[CF Visitor ID] Enhanced visitor data:', {
      visitorId,
      isValid,
      hasClientData: !!clientData
    })

    return new Response(
      JSON.stringify(enhancedData),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[CF Visitor ID] Error enhancing visitor data:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Failed to enhance visitor data',
        timestamp: Date.now()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

/**
 * Generate Cloudflare-based visitor ID
 */
function generateCloudflareVisitorId(cfHeaders: Record<string, string>): string {
  const components: string[] = []

  // Use CF-Ray as primary identifier if available
  if (cfHeaders.cfRay) {
    components.push(cfHeaders.cfRay)
  }

  // Add hashed IP if available
  if (cfHeaders.cfConnectingIp) {
    components.push(hashString(cfHeaders.cfConnectingIp))
  }

  // Add country and timezone for additional uniqueness
  if (cfHeaders.cfCountry) {
    components.push(cfHeaders.cfCountry)
  }

  // Add user agent hash for browser fingerprinting
  if (cfHeaders.userAgent) {
    components.push(hashString(cfHeaders.userAgent).substring(0, 8))
  }

  // If no Cloudflare data available, generate fallback ID
  if (components.length === 0) {
    components.push(
      'fallback',
      Date.now().toString(36),
      Math.random().toString(36).substring(2, 10)
    )
  }

  // Combine components and add timestamp
  const baseId = components.join('-')
  const timestamp = Date.now().toString(36)
  
  return `cf-${hashString(baseId)}-${timestamp}`
}

/**
 * Validate visitor ID against current Cloudflare data
 */
function validateVisitorId(visitorId: string, cfHeaders: Record<string, string>): boolean {
  try {
    // Basic format validation
    if (!visitorId.startsWith('cf-')) {
      return false
    }

    // Extract components
    const parts = visitorId.split('-')
    if (parts.length < 3) {
      return false
    }

    // Validate timestamp (should be within reasonable range)
    const timestampPart = parts[parts.length - 1]
    const timestamp = parseInt(timestampPart, 36)
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    
    if (isNaN(timestamp) || (now - timestamp) > maxAge) {
      return false
    }

    // Additional validation could include:
    // - Checking if CF-Ray matches expected pattern
    // - Validating IP consistency
    // - Cross-referencing with stored visitor data

    return true

  } catch (error) {
    console.error('[CF Visitor ID] Validation error:', error)
    return false
  }
}

/**
 * Generate browser/device fingerprint
 */
function generateFingerprint(cfHeaders: Record<string, string>, clientData: any): string {
  const components: string[] = []

  // Server-side components
  if (cfHeaders.cfConnectingIp) {
    components.push(hashString(cfHeaders.cfConnectingIp).substring(0, 8))
  }
  
  if (cfHeaders.userAgent) {
    components.push(hashString(cfHeaders.userAgent).substring(0, 8))
  }

  // Client-side components (if provided)
  if (clientData) {
    if (clientData.screenResolution) {
      components.push(hashString(clientData.screenResolution).substring(0, 4))
    }
    
    if (clientData.timezone) {
      components.push(hashString(clientData.timezone).substring(0, 4))
    }
    
    if (clientData.language) {
      components.push(hashString(clientData.language).substring(0, 4))
    }
  }

  return components.join('-') || 'unknown'
}

/**
 * Simple hash function for generating consistent IDs
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}