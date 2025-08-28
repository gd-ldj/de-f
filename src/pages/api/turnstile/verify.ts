/**
 * Cloudflare Turnstile Token Verification API
 * 验证前端提交的Turnstile令牌的有效性
 */
import type { APIRoute } from 'astro';

// Turnstile verification endpoint
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Get Turnstile secret key from environment variables
const TURNSTILE_SECRET_KEY = import.meta.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

// Request interface for Turnstile verification
interface TurnstileVerifyRequest {
  token: string;
  remoteip?: string;
}

// Response interface from Cloudflare Turnstile API
interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

// API route handler for POST requests
export const POST: APIRoute = async ({ request }) => {
  // Check if Turnstile secret key is configured
  if (!TURNSTILE_SECRET_KEY) {
    console.error('Turnstile secret key not configured');
    return new Response(JSON.stringify({
      success: false,
      error: 'Turnstile verification not configured'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // Parse request body
    const body: TurnstileVerifyRequest = await request.json();
    
    // Validate required fields
    if (!body.token) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Token is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Get client IP address for additional verification
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                    request.headers.get('X-Forwarded-For') || 
                    request.headers.get('X-Real-IP') || 
                    'unknown';

    // Prepare form data for Turnstile verification
    const verifyData = new FormData();
    verifyData.append('secret', TURNSTILE_SECRET_KEY);
    verifyData.append('response', body.token);
    if (clientIP !== 'unknown') {
      verifyData.append('remoteip', clientIP);
    }

    // Send verification request to Cloudflare
    const turnstileResponse = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: verifyData
    });

    if (!turnstileResponse.ok) {
      throw new Error(`Turnstile API error: ${turnstileResponse.status}`);
    }

    const verifyResult: TurnstileVerifyResponse = await turnstileResponse.json();

    // Log verification result for debugging
    console.log('[Turnstile Verify]', {
      success: verifyResult.success,
      hostname: verifyResult.hostname,
      action: verifyResult.action,
      clientIP,
      errors: verifyResult['error-codes']
    });

    // Return verification result
    return new Response(JSON.stringify({
      success: verifyResult.success,
      hostname: verifyResult.hostname,
      action: verifyResult.action,
      challenge_ts: verifyResult.challenge_ts,
      errors: verifyResult['error-codes'] || []
    }), {
      status: verifyResult.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('[Turnstile Verify] Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error during verification'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// Handle unsupported HTTP methods
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    error: 'Method not allowed. Use POST to verify Turnstile tokens.'
  }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'POST'
    }
  });
};