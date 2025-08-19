import React, { useState } from 'react';
import type { Locale } from '@/types';
import copyIcon from '@/assets/imgs/copy.svg';
import { useAuth } from '@/lib/useAuth';

interface ShareSectionProps {
  locale: Locale;
  title: string;
  url: string;
  onClose?: () => void;
}

/**
 * Simple share section component matching UI design
 * Features a clean input field with copy functionality and close button
 * Shows login prompt when user is not authenticated
 */
const ShareSection: React.FC<ShareSectionProps> = ({ locale, title, url, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { isEffectivelyLoggedIn, login } = useAuth();
  const [shareUrl, setShareUrl] = useState(url);
  /**
   * Handle copying URL to clipboard with user feedback
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl); // 使用 shareUrl 而不是 url
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl; // 使用 shareUrl
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateMyCode = () => {
    const mockCode = 'ABCDE';
    const replaced = replaceLastPromoCodeInUrl(shareUrl, mockCode);
    console.log("🚀 ~ handleGenerateMyCode ~ replaced:", replaced)
    setShareUrl(replaced);
    
    // Update browser address bar URL - only update the pathname to avoid CORS issues
    if (typeof window !== 'undefined' && window.history) {
      try {
        // Extract pathname from the replaced URL
        const urlObj = new URL(replaced);
        const newPath = urlObj.pathname + urlObj.search + urlObj.hash;
        window.history.pushState(null, '', newPath);
      } catch (error) {
        console.warn('Failed to update browser URL:', error);
        // Fallback: just update the hash or search params if possible
        const currentUrl = new URL(window.location.href);
        const replacedUrl = new URL(replaced);
        if (currentUrl.origin === replacedUrl.origin) {
          window.history.pushState(null, '', replaced);
        }
      }
    }
  };

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
      const updatedLastSeg = /-[^-]+$/.test(lastSeg)
        ? lastSeg.replace(/-[^-]+$/, `-${newCode}`)
        : `${lastSeg}-${newCode}`;
      u.pathname = pathname.slice(0, lastSlashIdx + 1) + updatedLastSeg;
      return u.toString();
    } catch {
      // Fallback for unexpected input; perform a safe string replace on the last '-' segment
      return inputUrl.replace(/([^/]+?)(-[^-]+)?(\?[^#]*)?(#.*)?$/, (_m, base, _oldCode, qs = '', hash = '') => {
        const updated = /-[^-]+$/.test(base) ? base.replace(/-[^-]+$/, `-${newCode}`) : `${base}-${newCode}`;
        return updated + qs + hash;
      });
    }
  };

  /**
   * Handle login trigger when user is not authenticated
   */
  const handleLoginClick = () => {
    login();
  };

  return (
    <div className="bg-card rounded border border-border p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{locale === 'us' ? 'Share To Earn Passive Income' : '分享赚取被动收入'}</h3>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Login Prompt for Unauthenticated Users */}
        {isEffectivelyLoggedIn && (
          <div className="text-sm text-muted-foreground">
            {locale === 'us' ? (
              <>
                You are viewing the promotional code of xxx.
                <button onClick={handleGenerateMyCode} className="text-primary hover:underline ml-1">
                  Generate your own promotional code now.
                </button>
              </>
            ) : (
              <>
                您正在查看xxx的推广码。
                <button onClick={handleGenerateMyCode} className="text-primary hover:underline ml-1">
                  立即生成您的专属推广码。
                </button>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          {/* URL Input with Copy Button */}
          <div className="relative flex-1">
            <input type="text" value={shareUrl} readOnly className="w-full px-4 py-3 pr-12 border border-border rounded text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="https://xxxxxxxxx" />
            <button onClick={handleCopyLink} className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md transition-all duration-200 ${copied ? 'text-green-600 bg-green-50' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`} title={locale === 'us' ? 'Copy link' : '复制链接'}>
              {copied ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <img src={copyIcon.src} alt="Copy Icon" className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Share to X Platform Button */}
          <svg
            onClick={() => {
              const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
              window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
            }}
            className="w-5 h-5 ml-4 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        {/* Additional login prompt below input for unauthenticated users */}
        {!isEffectivelyLoggedIn && (
          <div className="text-xs text-muted-foreground">
            <span onClick={handleLoginClick} className="text-primary hover:underline cursor-pointer">
              {locale === 'us' ? 'Log in now' : '立即登录'}
            </span>
            <span className="ml-1">{locale === 'us' ? 'to generate your own promotion code' : '生成您的专属推广码'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareSection;
