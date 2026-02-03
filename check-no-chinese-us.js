// 检查源码中是否包含会出现在页面上的中文字符
// 由于当前项目使用 SSR（output: 'server' + vercel adapter），不会生成 dist/ 这类静态 HTML 目录
// 因此这里改为：在构建前/后扫描源码文件，防止在页面模板中硬编码中文

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import ts from 'typescript';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 需要扫描的目录，仅限会直接渲染 DOM 的模板 / 组件
const ROOT_DIR = __dirname;
const INCLUDE_DIRS = ['src/components', 'src/pages', 'src/layouts', 'public'];

// 需要忽略的目录（允许出现中文，比如文档、翻译文件等）
const IGNORE_DIRS = ['docs', 'src/locales', 'node_modules', '.git'];

// 仅检查这些后缀的模板文件（HTML / React JSX / Astro）
const ALLOWED_EXTS = new Set(['.astro', '.tsx', '.jsx', '.html']);

// 使用 Unicode Script=Han + 常见 CJK 标点范围检测中文字符
const chineseRegexp = /[\p{Script=Han}\u3000-\u303F\uFF00-\uFFEF]/u;

function isIgnored(fullPath) {
  const relative = path.relative(ROOT_DIR, fullPath);
  if (relative.startsWith('..')) return true;
  const segments = relative.split(path.sep);
  return segments.some((seg, index) => {
    const partial = segments.slice(0, index + 1).join(path.sep);
    return IGNORE_DIRS.includes(partial);
  });
}

function* walk(dir) {
  if (isIgnored(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!isIgnored(fullPath)) {
        yield* walk(fullPath);
      }
    } else if (entry.isFile()) {
      if (isIgnored(fullPath)) continue;
      const ext = path.extname(entry.name);
      if (ALLOWED_EXTS.has(ext)) {
        yield fullPath;
      }
    }
  }
}

function hasChineseInReactDom(filePath, content) {
  const ext = path.extname(filePath);
  const scriptKind = ext === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.JSX;

  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, scriptKind);

  let found = false;

  function visit(node) {
    if (found) return;

    // JSX 文本节点，例如 <div>这里的文本</div>
    if (ts.isJsxText(node)) {
      const text = node.getText(sourceFile);
      if (chineseRegexp.test(text)) {
        found = true;
        return;
      }
    }

    // JSX 属性中的字符串，例如 <div title="中文标题" />
    if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const text = node.initializer.text;
      if (chineseRegexp.test(text)) {
        found = true;
        return;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return found;
}

let hasError = false;

for (const include of INCLUDE_DIRS) {
  const targetDir = path.join(ROOT_DIR, include);
  if (!fs.existsSync(targetDir)) continue;
  for (const filePath of walk(targetDir)) {
    const ext = path.extname(filePath);
    const rawContent = fs.readFileSync(filePath, 'utf8');

    if (ext === '.astro') {
      // Astro：只检查模板区域，忽略 frontmatter JS
      const content = rawContent.replace(/^---[\s\S]*?---\s*/u, '');
      if (chineseRegexp.test(content)) {
        hasError = true;
        const relativePath = path.relative(ROOT_DIR, filePath);
        console.error(`[check-no-chinese] Found Chinese characters in source file: ${relativePath}`);
      }
      continue;
    }

    if (ext === '.tsx' || ext === '.jsx') {
      // React：使用 TypeScript AST，只检查 JSX 文本和 JSX 属性字符串
      if (hasChineseInReactDom(filePath, rawContent)) {
        hasError = true;
        const relativePath = path.relative(ROOT_DIR, filePath);
        console.error(`[check-no-chinese] Found Chinese characters in React JSX: ${relativePath}`);
      }
      continue;
    }

    // 纯 HTML 模板：直接整体检测
    if (ext === '.html') {
      if (chineseRegexp.test(rawContent)) {
        hasError = true;
        const relativePath = path.relative(ROOT_DIR, filePath);
        console.error(`[check-no-chinese] Found Chinese characters in HTML file: ${relativePath}`);
      }
      continue;
    }
  }
}

if (hasError) {
  console.error('[check-no-chinese] Chinese characters detected in source files (excluding locales/docs). Failing check.');
  process.exit(1);
} else {
  console.log('[check-no-chinese] No Chinese characters found in source files (excluding locales/docs).');
}
