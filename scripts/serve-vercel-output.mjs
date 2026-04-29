import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || '4322');
const projectRoot = process.cwd();
const staticRoot = path.resolve(projectRoot, '.vercel/output/static');
const entryPath = path.resolve(projectRoot, '.vercel/output/_functions/entry.mjs');

if (!fs.existsSync(entryPath)) {
  console.error(
    '[preview:vercel] Missing .vercel/output build artifacts. Run `pnpm build` first.'
  );
  process.exit(1);
}

const { default: handler } = await import(entryPath);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

const platformScriptStubs = new Map([
  [
    '/_vercel/insights/script.js',
    'window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};',
  ],
  [
    '/_vercel/speed-insights/script.js',
    'window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments);};',
  ],
]);

function resolveStaticPath(urlPathname) {
  const normalizedPath = urlPathname.endsWith('/') ? `${urlPathname}index.html` : urlPathname;
  const candidate = path.resolve(staticRoot, `.${normalizedPath}`);

  if (!candidate.startsWith(staticRoot)) {
    return null;
  }

  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    return null;
  }

  return candidate;
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || '/', `http://${host}:${port}`);
    const platformStub = platformScriptStubs.get(requestUrl.pathname);

    if (platformStub) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
      res.end(platformStub);
      return;
    }

    const staticFile = resolveStaticPath(decodeURIComponent(requestUrl.pathname));

    if (staticFile) {
      const extension = path.extname(staticFile).toLowerCase();
      res.statusCode = 200;
      res.setHeader('Content-Type', mimeTypes[extension] || 'application/octet-stream');
      fs.createReadStream(staticFile).pipe(res);
      return;
    }

    await handler(req, res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(error instanceof Error ? error.stack || error.message : String(error));
  }
});

server.listen(port, host, () => {
  console.log(`[preview:vercel] Listening at http://${host}:${port}`);
});
