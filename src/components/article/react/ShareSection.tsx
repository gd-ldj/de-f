import React, { useState } from 'react';
import type { Locale } from '@/types';
import copyIcon from '@/assets/imgs/copy.svg';

interface ShareSectionProps {
  locale: Locale;
  title: string;
  url: string;
  onClose?: () => void;
}

/**
 * Simple share section component matching UI design
 * Features a clean input field with copy functionality and close button
 */
const ShareSection: React.FC<ShareSectionProps> = ({ locale, title, url, onClose }) => {
  const [copied, setCopied] = useState(false);

  /**
   * Handle copying URL to clipboard with user feedback
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-card rounded border border-border p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{locale === 'us' ? 'Share To Earn Passive Income' : '分享赚取被动收入'}</h3>
      </div>
      <div className="flex items-center justify-between">
        {/* URL Input with Copy Button */}
        <div className="relative flex-1">
          <input type="text" value={url} readOnly className="w-full px-4 py-3 pr-12 border border-border rounded text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="https://xxxxxxxxx" />
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
          className="w-5 h-5 ml-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
    </div>
  );
};

export default ShareSection;
