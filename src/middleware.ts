import { defineMiddleware } from 'astro:middleware';

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

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  if (response.headers.get('content-type')?.includes('text/html')) {
    // Get HTML content
    const html = await response.text();

    // Remove comments and compress
    const minifiedHtml = removeHTMLComments(html);

    // Return new response
    return new Response(minifiedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  return response;
});
