import React, { useState, useEffect } from 'react';
import { footerTexts } from './constants';

// Import social media icons from locale assets
import TwitterIcon from './assets/twitter.svg?url';
import TelegramIcon from './assets/telegram.svg?url';
import GithubIcon from './assets/github.svg?url';
import DiscordIcon from './assets/discord.svg?url';
import YoutubeIcon from './assets/youtube.svg?url';
import RSSIcon from './assets/RSS.svg?url';

type Locale = 'us' | 'asia';

interface FooterProps {
  // No props needed - locale extracted from URL
}

/**
 * Extract locale from current URL pathname
 * @returns Current locale from URL or default 'us'
 */
function getLocaleFromURL(): Locale {
  if (typeof window === 'undefined') return 'us';
  const pathname = window.location.pathname;
  const segments = pathname.split('/');
  const localeSegment = segments[1]; // First segment after domain
  return localeSegment === 'asia' || localeSegment === 'us' ? localeSegment : 'us';
}

export default function Footer({}: FooterProps) {
  const [locale, setLocale] = useState<Locale>('us');

  // Extract locale from URL on mount
  useEffect(() => {
    setLocale(getLocaleFromURL());
  }, []);

  const texts = footerTexts[locale] || footerTexts.us;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-[1440px] mx-auto pb-12">
        {/* Newsletter and Disclosure Section - Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 md:p-12 md:pl-12">
            <h3 className="text-xs font-medium mb-4">{texts.newsletter.title}</h3>
            <h4 className="text-xl font-medium mb-4">{texts.newsletter.subtitle}</h4>
            <p className="text-white/60 mb-6">{texts.newsletter.description}</p>
            <div className="flex">
              <input type="email" placeholder={texts.newsletter.emailPlaceholder} disabled className="flex-1 px-4 py-2 bg-gray-100 !text-gray-400 border border-gray-300 rounded-l cursor-not-allowed" />
              <button disabled className="bg-gray-400 px-6 py-2 rounded-r cursor-not-allowed flex items-center">
                {texts.newsletter.subscribeButton}
              </button>
            </div>
          </div>

          <div className="p-6 md:p-12 md:pl-12 border-t md:border-t-0 md:border-l border-gray-800">
            <h3 className="text-[20px] font-medium mb-4">{texts.disclosure.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{texts.disclosure.content}</p>
          </div>
        </div>

        {/* Navigation Links Section - Responsive Layout */}
        <div className="border-t border-gray-800 pt-8">
          <div className="grid grid-cols-2 border-b border-gray-800 pb-8">
            <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 px-6 md:px-12">
              <a href={`/${locale}/news`} className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.news}
              </a>
              <button type="button" className="text-gray-300 hover:text-white text-sm text-left">
                {texts.navigation.podcasts}
              </button>
              <button type="button" className="text-gray-300 hover:text-white text-sm text-left">
                {texts.navigation.newsletters}
              </button>
              <button type="button" className="text-gray-300 hover:text-white text-sm text-left">
                {texts.navigation.events}
              </button>
              <button type="button" className="text-gray-300 hover:text-white text-sm text-left">
                {texts.navigation.roundtables}
              </button>
              <button type="button" className="text-gray-300 hover:text-white text-sm text-left">
                {texts.navigation.analytics}
              </button>
              <button type="button" className="text-gray-300 hover:text-white text-sm text-left">
                {texts.navigation.sitemap}
              </button>
            </div>
            <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 px-6 md:px-12">
              <button type="button" className="text-gray-300 hover:text-white text-sm text-left">
                {texts.navigation.about}
              </button>
              <button type="button" className="text-gray-300 hover:text-white text-sm text-left">
                {texts.navigation.manageCookies}
              </button>
              <button type="button" className="text-gray-300 hover:text-white text-sm text-left">
                {texts.navigation.careers}
              </button>
              <button type="button" className="text-gray-300 hover:text-white text-sm text-left">
                {texts.navigation.termsOfService}
              </button>
              <button type="button" className="text-gray-300 hover:text-white text-sm text-left">
                {texts.navigation.privacyPolicy}
              </button>
              <button type="button" className="text-gray-300 hover:text-white text-sm text-left">
                {texts.navigation.contactUs}
              </button>
            </div>
          </div>

          {/* Logo and Social Media Section - Responsive Layout */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-8 px-6 md:px-12 space-y-6 md:space-y-0">
            <div className="flex flex-col items-center md:items-center ">
              <img src="https://cdn.detake.com/images/logo-white.svg" alt="DeTake Logo" className="w-[124px] mb-2  md:pl-4" />
              <p className="text-white text-[12px]">{texts.company.copyright}</p>
            </div>
            <div className="flex justify-center md:justify-end space-x-5">
              <a href="https://twitter.com/detake" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={texts.social.twitter}>
                <img src={TwitterIcon} alt="Twitter" className="w-6 h-6" />
              </a>
              <a href="https://t.me/detake" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={texts.social.telegram}>
                <img src={TelegramIcon} alt="Telegram" className="w-6 h-6" />
              </a>
              <a href="https://github.com/detake" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={texts.social.github}>
                <img src={GithubIcon} alt="GitHub" className="w-6 h-6" />
              </a>
              <a href="https://discord.gg/detake" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={texts.social.discord}>
                <img src={DiscordIcon} alt="Discord" className="w-6 h-6" />
              </a>
              <a href="https://youtube.com/@detake" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={texts.social.youtube}>
                <img src={YoutubeIcon} alt="YouTube" className="w-6 h-6" />
              </a>
              <a href="/rss" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={texts.social.rss}>
                <img src={RSSIcon} alt="RSS" className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
