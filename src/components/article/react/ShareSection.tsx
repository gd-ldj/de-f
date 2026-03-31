import React, { useEffect, useState } from 'react';
import type { Locale } from '@/types';
import copyIcon from '@/assets/imgs/copy.svg';
import { useAuth } from '@/lib/useAuth';
import { useWalletAuth } from '@/lib/useWalletAuth';
import { createTranslator } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { TRACKING_EVENTS } from '@/config/constants';

interface ShareSectionProps {
  locale: Locale;
  title: string;
  url: string;
  articleId?: string;
  onClose?: () => void;
}

/**
 * Simple share section component matching UI design
 * Features a clean input field with copy functionality and close button
 * Shows login prompt when user is not authenticated
 */
const ShareSection: React.FC<ShareSectionProps> = ({ locale, title, url, articleId, onClose }) => {
  const t = createTranslator(locale);
  const [copied, setCopied] = useState(false);
  const { isEffectivelyLoggedIn, isLoading: isAuthLoading, authenticated: isSignedIn, login } = useAuth();
  const [shareUrl, setShareUrl] = useState(url);
  const { promoteCode: myPromoteCode } = useWalletAuth();

  /**
   * Extract promo code from the last URL segment if it follows the pattern "-<code>".
   * Returns the code string if present, otherwise null.
   */
  const getPromoCodeFromUrl = (inputUrl: string): string | null => {
    try {
      const u = new URL(inputUrl);
      const lastSeg = (u.pathname.split('/').pop() || '').trim();
      const match = lastSeg.match(/-([^-]+)$/);
      const code = match ? match[1] : null;
      return code || null;
    } catch {
      // Fallback: best-effort extraction from a plain string
      const match = inputUrl.match(/([^/]+?)-([^-]+)(?:\?|#|$)/);
      const code = match ? match[2] : null;
      return code || null;
    }
  };

  /**
   * Centralized evaluation for whether the cross-promo prompt should be visible.
   * The rule: show only if logged in AND the share URL's code is different from user's own code.
   */
  const evaluateShouldShowPrompt = (targetUrl: string, userCode?: string | null, loggedIn?: boolean) => {
    const urlPromoCode = getPromoCodeFromUrl(targetUrl);
    const urlMaskCode = (() => {
      try {
        const urlObj = new URL(targetUrl);
        const maskValue = urlObj.searchParams.get('mask');
        return maskValue && maskValue.length > 0 ? maskValue : null;
      } catch {
        const match = targetUrl.match(/[?&]mask=([^&#]+)/);
        return match && match[1] ? match[1] : null;
      }
    })();
    const isUserCodeMatch = (code?: string | null) => !!(code && userCode && code === userCode);
    return !!(loggedIn && !(isUserCodeMatch(urlPromoCode) || isUserCodeMatch(urlMaskCode)));
  };

  // 将分享链接的域名替换为当前访问域名，避免环境配置导致的域名不一致
  const normalizeShareUrl = (inputUrl: string) => {
    if (typeof window === 'undefined') return inputUrl;
    try {
      const parsedUrl = new URL(inputUrl, window.location.href);
      return `${window.location.origin}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    } catch {
      return inputUrl;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      setShareUrl((prev) => normalizeShareUrl(prev));
      return;
    }
    const currentHref = window.location.href;
    const shouldUseCurrent = (() => {
      try {
        const urlObj = new URL(currentHref);
        if (urlObj.searchParams.has('mask')) return true;
      } catch {
        if (/[?&]mask=/.test(currentHref)) return true;
      }
      return !!getPromoCodeFromUrl(currentHref);
    })();
    const nextUrl = shouldUseCurrent ? currentHref : url;
    setShareUrl(normalizeShareUrl(nextUrl));
  }, [url]);

  // Local state for controlling the prompt visibility so we can update it right after actions.
  const [shouldShowPrompt, setShouldShowPrompt] = useState<boolean>(() => evaluateShouldShowPrompt(shareUrl, myPromoteCode, isEffectivelyLoggedIn));

  // Keep the prompt state in sync if any dependency changes externally.
  useEffect(() => {
    setShouldShowPrompt(evaluateShouldShowPrompt(shareUrl, myPromoteCode, isEffectivelyLoggedIn));
  }, [shareUrl, myPromoteCode, isEffectivelyLoggedIn]);

  /**
   * Replace the last promo code segment in the article URL.
   * This function finds the last path segment and replaces the trailing "-<code>" part.
   * If no code exists, it appends "-<code>" to the last segment.
   */
  const replaceLastPromoCodeInUrl = (inputUrl: string, newCode: string) => {
    try {
      const u = new URL(inputUrl);
      const pathname = u.pathname;
      const lastSlashIdx = pathname.lastIndexOf('/');
      const lastSeg = pathname.slice(lastSlashIdx + 1);
      const updatedLastSeg = /-[^-]+$/.test(lastSeg) ? lastSeg.replace(/-[^-]+$/, `-${newCode}`) : `${lastSeg}-${newCode}`;
      u.pathname = pathname.slice(0, lastSlashIdx + 1) + updatedLastSeg;
      return u.toString();
    } catch {
      return inputUrl.replace(/([^/]+?)(-[^-]+)?(\?[^#]*)?(#.*)?$/, (_m, base, _oldCode, qs = '', hash = '') => {
        const updated = /-[^-]+$/.test(base) ? base.replace(/-[^-]+$/, `-${newCode}`) : `${base}-${newCode}`;
        return updated + qs + hash;
      });
    }
  };

  /**
   * Handle generating a link with the user's own promo code and update the URL state.
   * Using the locally stored promo code ensures the prompt condition re-evaluates
   * and hides itself when the link already contains the user's code.
   */
  const handleGenerateMyCode = () => {
    const targetCode = myPromoteCode || 'detake';
    const hasMaskParam = (() => {
      try {
        const urlObj = new URL(shareUrl, typeof window === 'undefined' ? 'https://detake.news' : window.location.href);
        return urlObj.searchParams.has('mask');
      } catch {
        return /[?&]mask=/.test(shareUrl);
      }
    })();
    const replaced = hasMaskParam ? shareUrl : replaceLastPromoCodeInUrl(shareUrl, targetCode);
    const replacedWithMask = (() => {
      try {
        const urlObj = new URL(replaced, typeof window === 'undefined' ? 'https://detake.news' : window.location.href);
        if (!urlObj.searchParams.has('mask')) return replaced;
        urlObj.searchParams.set('mask', targetCode);
        return urlObj.toString();
      } catch {
        if (!/[?&]mask=/.test(replaced)) return replaced;
        return replaced.replace(/([?&]mask=)[^&#]*/g, `$1${targetCode}`);
      }
    })();
    setShareUrl(replacedWithMask);

    // Immediately update the prompt state after generating new link
    setShouldShowPrompt(evaluateShouldShowPrompt(replacedWithMask, myPromoteCode, isEffectivelyLoggedIn));

    // Update browser address bar URL - only update the pathname to avoid CORS issues
    if (typeof window !== 'undefined' && window.history) {
      try {
        // Extract pathname from the replaced URL
        const urlObj = new URL(replacedWithMask);
        const newPath = urlObj.pathname + urlObj.search + urlObj.hash;
        window.history.pushState(null, '', newPath);
      } catch (error) {
        console.warn('Failed to update browser URL:', error);
        // Fallback: just update the hash or search params if possible
        const currentUrl = new URL(window.location.href);
        const replacedUrl = new URL(replacedWithMask);
        if (currentUrl.origin === replacedUrl.origin) {
          window.history.pushState(null, '', replacedWithMask);
        }
      }
    }
  };

  /**
   * Handle copying the current shareUrl to clipboard with user feedback.
   * Uses the modern Clipboard API with a safe fallback for older browsers.
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Handle login trigger when user is not authenticated
   */
  const handleLoginClick = () => {
    login();
  };

  return (
    <motion.div initial={{ opacity: 0, maxHeight: 0, overflow: 'hidden' }} animate={{ opacity: 1, maxHeight: '500px', overflow: 'visible' }} transition={{ duration: 0.8, ease: 'easeInOut' }} className="w-full bg-white px-6 pt-5 pb-8 mx-auto border-b border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-foreground">{t('article.shareToEarn')}</h3>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Login Prompt for Unauthenticated Users */}
        {shouldShowPrompt && (
          <div className="text-sm text-muted-foreground">
            <>
              {t('article.viewingPromoCode')}
              <button onClick={handleGenerateMyCode} className="text-primary hover:underline ml-1">
                {t('article.generateYourCode')}
              </button>
            </>
          </div>
        )}

        <div className="flex items-center justify-between">
          {/* URL Input with Copy Button */}
          <div className="relative flex-1">
            <input
              type="text"
              value={shareUrl}
              readOnly
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={(e) => e.currentTarget.classList.add('ring-2', 'ring-primary', 'border-transparent')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('ring-2', 'ring-primary', 'border-transparent')}
              className="w-full px-4 py-3 pr-12 border border-border rounded text-sm text-muted-foreground outline-none transition-shadow"
              placeholder={t('article.shareUrlPlaceholder')}
            />
            <button onClick={handleCopyLink} className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md transition-all duration-200 ${copied ? 'text-green-600 bg-green-50' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`} title={t('article.copyLink')}>
              {copied ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <img src={copyIcon.src} alt={t('article.copyIconAlt')} className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Share to X Platform Button */}
          <svg
            onClick={() => {
              const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;

              // Track Twitter share event
              try {
                if (typeof window !== 'undefined' && (window as any).detakeAnalytics) {
                  (window as any).detakeAnalytics.trackEvent(TRACKING_EVENTS.ARTICLE_SHARE, {
                    platform: 'twitter',
                    articleId,
                    articleTitle: title,
                    articleUrl: shareUrl,
                    shareUrl: twitterShareUrl,
                  });
                }
              } catch (err) {
                console.warn('[Analytics] Failed to track Twitter share:', err);
              }

              window.open(twitterShareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
            }}
            className="w-5 h-5 ml-4 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        {/* Additional login prompt below input for unauthenticated users */}
        {!isAuthLoading && !isSignedIn && !isEffectivelyLoggedIn && (
          <div className="text-xs text-muted-foreground">
            <span onClick={handleLoginClick} className="text-primary hover:underline cursor-pointer">
              {t('article.loginNow')}
            </span>
            <span className="ml-1">{t('article.generatePromoCode')}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ShareSection;
