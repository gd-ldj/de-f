/**
 * Cloudflare Headers API Endpoint
 * Provides access to Cloudflare-specific headers and client information
 * Based on comprehensive Cloudflare header collection
 */

import type { APIRoute } from 'astro'
import { createHash } from 'crypto'

interface CloudflareData {
  cfRay: string
  cfConnectingIp: string
  cfCountry: string
  cfTimezone: string
  cfVisitor: string
  userAgent: string
}

function generateCloudflareVisitorId(data: CloudflareData): string {
  // Use CF-Ray as primary identifier if available
  if (data.cfRay) {
    return `cf_${data.cfRay}`
  }
  
  // Create a hash from available Cloudflare data
  const hashInput = [
    data.cfConnectingIp,
    data.cfCountry,
    data.cfTimezone,
    data.cfVisitor,
    data.userAgent
  ].filter(Boolean).join('|')
  
  if (hashInput) {
    const hash = createHash('sha256').update(hashInput).digest('hex')
    return `cf_${hash.substring(0, 16)}`
  }
  
  // Fallback to timestamp-based ID
  return `cf_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export interface CloudflareHeadersResponse {
  success: boolean
  headers: Record<string, string>
  clientIP: string
  country: string
  visitorInfo?: any
  visitorId: string
  timestamp: string
  requestId: string
}

/**
 * GET /api/cf-headers
 * Returns Cloudflare headers and client information
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const headers = request.headers
    
    // Extract Cloudflare-specific headers
    const cfHeaders: Record<string, string> = {}
    
    // Common Cloudflare headers
    const cfHeaderNames = [
      'cf-ray',
      'cf-connecting-ip',
      'cf-ipcountry',
      'cf-visitor',
      'cf-request-id',
      'cf-worker',
      'cf-cache-status',
      'cf-edge-cache',
      'cf-apo-via',
      'cf-polished',
      'cf-super-bot-fight-mode',
      'cf-mitigated',
      'cf-bot-score',
      'cf-threat-score',
      'cf-warp-tag-id',
      'cf-access-authenticated-user-email',
      'cf-access-jwt-assertion',
      'cf-access-client-id',
      'cf-access-client-secret',
      'cf-access-token',
      'cf-team-domain',
      'cf-access-user-id',
      'cf-access-groups',
      'cf-access-user-email',
      'cf-access-user-name',
      'cf-access-user-uuid',
      'cf-access-authenticated-user-id',
      'cf-access-cert-fingerprint',
      'cf-access-cert-serial',
      'cf-access-cert-issuer',
      'cf-access-cert-subject',
      'cf-access-cert-presented',
      'cf-access-cert-revoked',
      'cf-access-cert-verified',
    ]
    
    // Extract Cloudflare headers
    cfHeaderNames.forEach(headerName => {
      const value = headers.get(headerName)
      if (value) {
        cfHeaders[headerName] = value
      }
    })
    
    // Also include some standard headers that might be useful
    const standardHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-forwarded-proto',
      'x-forwarded-host',
      'x-forwarded-port',
      'user-agent',
      'accept-language',
      'accept-encoding',
      'accept',
      'host',
      'referer',
      'origin',
      'sec-ch-ua',
      'sec-ch-ua-mobile',
      'sec-ch-ua-platform',
      'sec-fetch-dest',
      'sec-fetch-mode',
      'sec-fetch-site',
      'sec-fetch-user',
    ]
    
    standardHeaders.forEach(headerName => {
      const value = headers.get(headerName)
      if (value) {
        cfHeaders[headerName] = value
      }
    })
    
    // Get client IP from various sources
    const clientIP =
      headers.get('cf-connecting-ip') ||
      headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headers.get('x-real-ip') ||
      headers.get('x-client-ip') ||
      headers.get('x-forwarded') ||
      headers.get('forwarded-for') ||
      headers.get('forwarded') ||
      'unknown'
    
    // Get country from Cloudflare
    const country = headers.get('cf-ipcountry') || 'unknown'
    
    // Get visitor info from cf-visitor header
    let visitorInfo = null
    const cfVisitor = headers.get('cf-visitor')
    if (cfVisitor) {
      try {
        visitorInfo = JSON.parse(cfVisitor)
      } catch (error) {
        console.warn('Failed to parse cf-visitor header:', error)
      }
    }
    
    // Generate visitor ID based on available Cloudflare data
    const visitorId = generateCloudflareVisitorId({
      cfRay: headers.get('cf-ray') || '',
      cfConnectingIp: headers.get('cf-connecting-ip') || '',
      cfCountry: headers.get('cf-ipcountry') || '',
      cfTimezone: headers.get('cf-timezone') || '',
      cfVisitor: headers.get('cf-visitor') || '',
      userAgent: headers.get('user-agent') || ''
    })

    // Prepare response data
    const responseData: CloudflareHeadersResponse = {
      success: true,
      headers: cfHeaders,
      clientIP,
      country,
      visitorInfo,
      visitorId,
      timestamp: new Date().toISOString(),
      requestId: headers.get('cf-ray') || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    console.log('[CF Headers] Request processed:', {
      clientIP: clientIP || 'unknown',
      country: country || 'unknown',
      cfHeadersCount: Object.keys(cfHeaders).filter(key => key.startsWith('cf-')).length,
      totalHeadersCount: Object.keys(cfHeaders).length,
      cfRay: headers.get('cf-ray') || 'none'
    })

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    )
  } catch (error) {
    console.error('[CF Headers] Error processing request:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to retrieve Cloudflare headers',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

/**
 * OPTIONS /api/cf-headers
 * Handle CORS preflight requests
 */
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}