/**
 * IP Lookup API Endpoint
 * Server-side proxy for third-party IP geolocation APIs.
 * Avoids browser-side CORS and rate-limit (429) issues.
 *
 * Same-origin only — no CORS headers, no arbitrary IP query param.
 * Always looks up the requester's own IP (from Cloudflare / X-Forwarded-For).
 *
 * GET /api/ip-lookup
 * Response: { ip, country_name, region, city, timezone, org, asn }
 */

import type { APIRoute } from 'astro'

interface IPLookupResponse {
  ip?: string
  country_name?: string
  region?: string
  city?: string
  timezone?: string
  org?: string
  asn?: string
}

// HTTPS-only third-party providers tried in order
const providers = [
  {
    url: (ip: string) => `https://ipapi.co/${ip}/json/`,
    parser: (data: Record<string, unknown>): IPLookupResponse => ({
      ip: data.ip as string,
      country_name: data.country_name as string,
      region: data.region as string,
      city: data.city as string,
      timezone: data.timezone as string,
      org: data.org as string,
      asn: data.asn as string,
    }),
  },
  {
    url: (ip: string) => `https://ipinfo.io/${ip}/json`,
    parser: (data: Record<string, unknown>): IPLookupResponse => ({
      ip: data.ip as string,
      country_name: data.country as string,
      region: data.region as string,
      city: data.city as string,
      timezone: data.timezone as string,
      org: data.org as string,
      asn: data.asn as string,
    }),
  },
]

// Simple in-memory cache to reduce upstream calls (keyed by IP)
const cache = new Map<string, { data: IPLookupResponse; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Resolve the caller's IP from request headers.
 */
function getCallerIP(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    ''
  )
}

/**
 * GET /api/ip-lookup
 * Same-origin request only — looks up the requester's own IP.
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const targetIP = getCallerIP(request.headers)

    if (!targetIP) {
      return new Response(
        JSON.stringify({ error: 'Could not determine IP address' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Check in-memory cache
    const cached = cache.get(targetIP)
    if (cached && Date.now() < cached.expires) {
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=300',
        },
      })
    }

    // Try each HTTPS-only provider in sequence
    for (const provider of providers) {
      try {
        const response = await fetch(provider.url(targetIP), {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok) {
          const data = await response.json()
          const parsed = provider.parser(data as Record<string, unknown>)

          // Store in cache
          cache.set(targetIP, { data: parsed, expires: Date.now() + CACHE_TTL })

          return new Response(JSON.stringify(parsed), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'private, max-age=300',
            },
          })
        }

        if (response.status === 429) {
          console.warn(`[ip-lookup] Rate limited by provider, trying next…`)
          continue
        }
      } catch (err) {
        console.warn(`[ip-lookup] Provider failed:`, err)
        continue
      }
    }

    // All providers failed — degrade gracefully
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[ip-lookup] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
