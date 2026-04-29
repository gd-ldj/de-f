import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

function getInlineScriptBlocks(source: string): string[] {
  const matches = source.match(/<script is:inline[\s\S]*?<\/script>/g);
  return matches ?? [];
}

function hasLineComment(script: string): boolean {
  return script
    .split('\n')
    .some((line) => line.trimStart().startsWith('//'));
}

test.describe('Inline Script Syntax Guards', () => {
  test('inline scripts do not use line comments that break minified HTML', async () => {
    const filePath = path.join(process.cwd(), 'src/layouts/BaseLayout.astro');
    const source = fs.readFileSync(filePath, 'utf8');
    const inlineScripts = getInlineScriptBlocks(source);

    const scriptsWithLineComments = inlineScripts.filter(hasLineComment);

    expect(
      scriptsWithLineComments,
      'Line comments inside <script is:inline> can swallow the rest of the script after HTML minification.'
    ).toHaveLength(0);
  });
});
