import { defineMiddleware } from 'astro:middleware';
import { getSourceLanguageFromUrl, getSourceLanguageFromRequest, extractTranslationLanguageFromPath, shouldRedirectToSourceVersion, removeTranslationPrefix, isTranslationPath } from '@/lib/language-utils';
import { MULTI_SOURCE_CONFIG, IS_DEV_ENV } from '@/config/constants';

// HTML comment removal function
function removeHTMLComments(html: string): string {
  return (
    html
      // Remove HTML comments but preserve conditional comments (<!--[if IE]>...< ![endif]-->)
      .replace(/<!--(?!\[if)(?!.*\[endif\])[\s\S]*?-->/g, '')
      // Compress excessive whitespace characters
      .replace(/\s+/g, ' ')
      // Remove leading and trailing whitespace
      .trim()
  );
}

/**
 * Middleware processing order:
 * 1. Language redirect (if needed)
 * 2. HTML minification (for text/html responses)
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { url, redirect } = context;
  const { pathname, search, hash } = url;
  const hostname = url.hostname;
  // Step 1: Check for language redirect
  if (!IS_DEV_ENV && isTranslationPath(pathname)) {
    const allConfiguredDomains = Object.values(MULTI_SOURCE_CONFIG.SOURCE_LANGUAGE_DOMAINS).flat();
    const isKnownDomain = allConfiguredDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)) || /^(en|zh|ja)\./.test(hostname);
    const sourceLanguage = isKnownDomain ? getSourceLanguageFromUrl(url) : getSourceLanguageFromRequest(context.request, hostname);
    const translationLanguage = extractTranslationLanguageFromPath(pathname);

    // Redirect if translation language matches source language
    // Example: ja.detake.com/ja/article/... → ja.detake.com/article/...
    if (shouldRedirectToSourceVersion(sourceLanguage, translationLanguage)) {
      const newPathname = removeTranslationPrefix(pathname);
      const redirectUrl = `${newPathname}${search}${hash}`;
      return redirect(redirectUrl, 301);
    }
  }
  // Step 2: Continue to route handler
  const response = await next();

  // Step 3: HTML minification (only for HTML responses)
  if (!IS_DEV_ENV && response.headers.get('content-type')?.includes('text/html')) {
    try {
      const html = await response.text();
      const minifiedHtml = removeHTMLComments(html);

      return new Response(minifiedHtml, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      return response;
    }
  }

  return response;
});
