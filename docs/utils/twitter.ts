export type TwitterInputSource = 'username' | 'at_username' | 'url_x' | 'url_twitter';

export interface ParseTwitterResult {
  valid: boolean;
  username: string; // 规范化为不含 @ 的用户名
  source?: TwitterInputSource;
  error?: string;
}

// 基础用户名规则：1-15 位，只能包含大小写字母、数字、下划线
const USERNAME_REGEX = /^[A-Za-z0-9_]{1,15}$/;

function validatePlainUsername(username: string): ParseTwitterResult {
  if (!username) {
    return { valid: false, username: '', error: 'Username is required' };
  }
  if (!USERNAME_REGEX.test(username)) {
    return {
      valid: false,
      username: '',
      error: 'Username must be 1-15 characters: letters, numbers, underscores',
    };
  }
  return { valid: true, username };
}

/**
 * 解析并校验 Twitter/X 输入：
 * - 允许纯用户名：可带 @ 且只能位于开头；返回时会移除 @
 * - 允许 https://twitter.com/<username> 与 https://x.com/<username>
 *   且 URL 里的 <username> 不能以 @ 开头
 * - 禁止空格及其他非法字符
 * - 用户名规则：1-15 位，仅字母/数字/下划线
 * - 传入空串将视为有效（便于可选字段场景），返回 username:''
 */
export function parseTwitterInput(input: string): ParseTwitterResult {
  const original = input ?? '';
  const hasWhitespace = /\s/.test(original);
  if (hasWhitespace) {
    return { valid: false, username: '', error: 'Input cannot contain spaces' };
  }

  const raw = original.trim();
  if (raw === '') {
    return { valid: true, username: '' };
  }

  // URL 形式
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase();
      if (host !== 'twitter.com' && host !== 'www.twitter.com' && host !== 'x.com' && host !== 'www.x.com') {
        return { valid: false, username: '', error: 'Only twitter.com or x.com links are allowed' };
      }

      // 取第一个 path segment 作为用户名
      const pathname = url.pathname.replace(/^\/+/, '');
      const firstSeg = pathname.split('/')[0] || '';
      if (!firstSeg) {
        return { valid: false, username: '', error: 'Username is missing in the URL' };
      }
      if (firstSeg.startsWith('@')) {
        return { valid: false, username: '', error: 'Username in URL must not start with @' };
      }

      const baseCheck = validatePlainUsername(firstSeg);
      if (!baseCheck.valid) {
        return { valid: false, username: '', error: baseCheck.error };
      }

      return {
        valid: true,
        username: firstSeg,
        source: host.includes('x.com') ? 'url_x' : 'url_twitter',
      };
    } catch {
      return { valid: false, username: '', error: 'Please enter a valid Twitter username or link' };
    }
  }

  // 非 URL：纯用户名。允许前缀一个 @
  if (raw.includes('@')) {
    const atIndex = raw.indexOf('@');
    if (atIndex !== 0) {
      return { valid: false, username: '', error: 'Only a single @ is allowed at the beginning' };
    }
    const plain = raw.slice(1);
    const baseCheck = validatePlainUsername(plain);
    if (!baseCheck.valid) {
      return { valid: false, username: '', error: baseCheck.error };
    }
    return { valid: true, username: plain, source: 'at_username' };
  }

  const baseCheck = validatePlainUsername(raw);
  if (!baseCheck.valid) {
    return { valid: false, username: '', error: baseCheck.error };
  }
  return { valid: true, username: raw, source: 'username' };
}

export function isValidTwitterInput(input: string): boolean {
  return parseTwitterInput(input).valid;
}

export function getTwitterInputError(input: string): string {
  const res = parseTwitterInput(input);
  return res.valid ? '' : res.error || 'Please enter a valid Twitter username or link';
}

export function toCanonicalXUrl(input: string): string {
  const res = parseTwitterInput(input);
  if (!res.valid || !res.username) return '';
  return `https://x.com/${res.username}`;
}


