import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { test, expect } from '@playwright/test';

test.describe('Sentry environment config', () => {
  test('shared helper maps site environments to dev/prod', async () => {
    const helperPath = path.join(process.cwd(), 'sentry.environment.js');

    expect(
      fs.existsSync(helperPath),
      'Expected a shared Sentry environment helper so client/server configs stay consistent.'
    ).toBe(true);

    const helperModule = await import(pathToFileURL(helperPath).href);

    expect(helperModule.resolveSentryEnvironment('beta')).toBe('dev');
    expect(helperModule.resolveSentryEnvironment('production')).toBe('prod');
    expect(helperModule.resolveSentryEnvironment(undefined)).toBe('dev');
    expect(helperModule.resolveSentryEnvironment('staging')).toBe('dev');
  });

  test('client and server Sentry configs use the shared environment helper', async () => {
    const clientConfig = fs.readFileSync(
      path.join(process.cwd(), 'sentry.client.config.js'),
      'utf8'
    );
    const serverConfig = fs.readFileSync(
      path.join(process.cwd(), 'sentry.server.config.js'),
      'utf8'
    );

    expect(clientConfig).toContain("from './sentry.environment.js'");
    expect(serverConfig).toContain("from './sentry.environment.js'");
    expect(clientConfig).toContain('resolveSentryEnvironment');
    expect(serverConfig).toContain('resolveSentryEnvironment');
  });

  test('app constants reuse the shared Sentry environment mapping', async () => {
    const constantsFile = fs.readFileSync(path.join(process.cwd(), 'src/config/constants.ts'), 'utf8');

    expect(constantsFile).toContain("from '../../sentry.environment.js'");
    expect(constantsFile).toContain('resolveSentryEnvironment(publicEnv.PUBLIC_SITE_ENV)');
  });

  test('build config injects a shared Sentry release into client and server SDKs', async () => {
    const astroConfig = fs.readFileSync(path.join(process.cwd(), 'astro.config.mts'), 'utf8');
    const clientConfig = fs.readFileSync(
      path.join(process.cwd(), 'sentry.client.config.js'),
      'utf8'
    );
    const serverConfig = fs.readFileSync(
      path.join(process.cwd(), 'sentry.server.config.js'),
      'utf8'
    );

    expect(astroConfig).toContain('__SENTRY_RELEASE__');
    expect(clientConfig).toContain('release: __SENTRY_RELEASE__');
    expect(serverConfig).toContain('release: __SENTRY_RELEASE__');
  });
});
