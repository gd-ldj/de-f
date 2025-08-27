/**
 * Cloudflare Turnstile Token Verification API
 * 验证前端提交的Turnstile令牌的有效性
 */

import type { APIRoute } from 'astro';

// Turnstile验证端点
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// 从环境变量获取密钥
const TURNSTILE_SECRET_KEY = import.meta.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

interface TurnstileVerifyRequest {
  token: string;
  remoteip?: string;
}

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // 检查密钥配置
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

    // 解析请求体
    const body: TurnstileVerifyRequest = await request.json();
    const { token, remoteip } = body;

    if (!token) {
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

    // 获取客户端IP（如果没有提供）
    const clientIP = remoteip || 
                    request.headers.get('cf-connecting-ip') || 
                    request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') ||
                    '127.0.0.1';

    // 构建验证请求
    const verifyData = new FormData();
    verifyData.append('secret', TURNSTILE_SECRET_KEY);
    verifyData.append('response', token);
    verifyData.append('remoteip', clientIP);

    // 向Cloudflare发送验证请求
    const turnstileResponse = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: verifyData,
    });

    if (!turnstileResponse.ok) {
      throw new Error(`Turnstile API error: ${turnstileResponse.status}`);
    }

    const verifyResult: TurnstileVerifyResponse = await turnstileResponse.json();

    // 记录验证结果
    console.log('[Turnstile Verify]', {
      success: verifyResult.success,
      hostname: verifyResult.hostname,
      challenge_ts: verifyResult.challenge_ts,
      errors: verifyResult['error-codes'],
      clientIP,
    });

    // 返回验证结果
    return new Response(JSON.stringify({
      success: verifyResult.success,
      challenge_ts: verifyResult.challenge_ts,
      hostname: verifyResult.hostname,
      ...(verifyResult['error-codes'] && { 
        errors: verifyResult['error-codes'] 
      })
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('[Turnstile Verify] Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    error: 'Method not allowed. Use POST.'
  }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};