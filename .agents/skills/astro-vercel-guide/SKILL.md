---
name: "astro-vercel-guide"
description: "Provides best practices and configuration guidelines for deploying Astro applications on Vercel. Invoke when user asks about Astro deployment, Vercel configuration, or troubleshooting deployment issues."
---

# Astro on Vercel: Best Practices & Configuration Guide

> **Note:** The source of truth for this guide is located at `.agents/astro-vercel-guide.md`.

This skill provides expert guidance for deploying Astro applications on Vercel, based on official documentation from Astro and Vercel.

## Core Concepts

### 1. Rendering Modes (`output` in `astro.config.mjs`)
- **`static` (Default):** Pre-renders all pages at build time. Best for performance, SEO, and content-heavy sites.
  - *Vercel Features:* Can still use Image Optimization & Analytics via adapter config.
- **`server` (SSR):** Renders pages on every request. Best for dynamic content (auth, personalization, real-time data).
  - *Vercel Deployment:* Deploys as Vercel Serverless Functions.
- **`hybrid`:** A mix of static and server rendering.
  - Set `output: 'hybrid'` in config.
  - Use `export const prerender = false;` in component files to opt-out of static generation for specific dynamic pages.

### 2. Adapter Installation & Configuration
You **must** use the `@astrojs/vercel` adapter to enable SSR or Vercel-specific features.

**Installation:**
```bash
npx astro add vercel
# OR
npm install @astrojs/vercel
```

**Configuration (`astro.config.mjs`):**
```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server', // or 'static' | 'hybrid'
  adapter: vercel({
    // Enable Vercel features here
    webAnalytics: { enabled: true },
    imageService: true,
    isr: true, // Enable Incremental Static Regeneration
  }),
});
```

## Vercel Features Integration

### Image Optimization
- **Enable:** Set `imageService: true` in the `vercel()` adapter options.
- **Usage:** Use Astro's built-in `<Image />` component (`import { Image } from 'astro:assets'`).
- **Dev Mode:** Vercel's optimization only works in production. For local dev, you might need `devImageService: 'sharp'` or similar if the Vercel service isn't emulated.

### Web Analytics
- **Enable:** Set `webAnalytics: { enabled: true }` in the adapter options.
- **Dashboard:** View analytics in the Vercel project dashboard.

### Incremental Static Regeneration (ISR)
- **Concept:** Update static content without a full rebuild.
- **Enable:** Set `isr: true` (or a config object with `expiration`) in adapter options.
- **Usage:** In `hybrid` or `server` mode, use `export const prerender = true` for static pages, or configure ISR expiration for specific routes if supported.

### Edge Middleware
- **Enable:** Set `edgeMiddleware: true` in adapter options.
- **Function:** Runs Astro middleware on Vercel Edge Network (closer to user, lower latency) before the request hits the serverless function.

## Configuration Checklist

When reviewing an Astro project for Vercel deployment, verify:

1.  [ ] **Adapter:** Is `@astrojs/vercel` installed and imported in `astro.config.mjs`?
2.  [ ] **Output Mode:** Is `output` set correctly (`static`, `server`, or `hybrid`) for the project's needs?
3.  [ ] **Image Optimization:** Is `imageService: true` enabled if using `<Image />`?
4.  [ ] **Function Configuration:**
    *   `maxDuration`: Increase if server functions are timing out (default is usually 10s or 60s depending on plan).
    *   `functionPerRoute`: Consider `true` to split API routes if bundle size is an issue, though `false` (bundling) is often faster for cold starts.
5.  [ ] **Dynamic Routes:** Are dynamic pages correctly identifying as `prerender = false` (in hybrid mode)?

## Common Troubleshooting

-   **Cold Starts:** Large serverless functions can have slow cold starts. Use `includeFiles`/`excludeFiles` in adapter config to control bundle size.
-   **Timeouts:** If an API route takes too long, increase `maxDuration` in the adapter config (up to 900s for Pro).
-   **Missing Assets:** If your SSR function needs to read files at runtime, ensure they are included via `includeFiles`.
-   **Clean URLs:** Vercel handles clean URLs automatically. Ensure Astro's `trailingSlash` config matches your Vercel project settings to avoid redirect loops.
