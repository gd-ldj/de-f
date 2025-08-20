import React, { useState, useEffect } from 'react';
import { footerTexts } from './constants';

// Import social media icons from locale assets
import TwitterIcon from './assets/twitter.svg?url';
import TelegramIcon from './assets/telegram.svg?url';
import GithubIcon from './assets/github.svg?url';
import DiscordIcon from './assets/discord.svg?url';
import YoutubeIcon from './assets/youtube.svg?url';
import RSSIcon from './assets/RSS.svg?url';
import DetakeLogo from './assets/detake.svg?url';

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
  return (localeSegment === 'asia' || localeSegment === 'us') ? localeSegment : 'us';
}

export default function Footer({}: FooterProps) {
  const [locale, setLocale] = useState<Locale>('us');
  
  // Extract locale from URL on mount
  useEffect(() => {
    setLocale(getLocaleFromURL());
  }, []);
  
  const texts = footerTexts[locale] || footerTexts.us;

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-[1440px] mx-auto pb-12">
        <div className="grid grid-cols-2 gap-12">
          <div className="p-12 pl-12">
            <h3 className="text-xs font-medium mb-4">{texts.newsletter.title}</h3>
            <h4 className="text-xl font-medium mb-4">{texts.newsletter.subtitle}</h4>
            <p className="text-white/60 mb-6">{texts.newsletter.description}</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder={texts.newsletter.emailPlaceholder} 
                className="flex-1 px-4 py-2 bg-white !text-[#909399] border border-gray-700 rounded-l focus:outline-none focus:border-teal-500" 
              />
              <button className="bg-teal-500 px-6 py-2 rounded-r hover:bg-[#06A17E] flex items-center">
                {texts.newsletter.subscribeButton}
              </button>
            </div>
          </div>

          <div className="p-12 pl-12 border-l border-gray-800">
            <h3 className="text-[20px] font-medium mb-4">{texts.disclosure.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{texts.disclosure.content}</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex justify-between items-center border-b border-gray-800 pb-8 px-12">
            <div className="flex flex-wrap space-x-8">
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.news}
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.podcasts}
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.newsletters}
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.events}
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.roundtables}
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.analytics}
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.sitemap}
              </a>
            </div>
            <div className="flex flex-wrap space-x-8">
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.about}
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.manageCookies}
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.careers}
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.termsOfService}
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.privacyPolicy}
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                {texts.navigation.contactUs}
              </a>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 px-12">
            <div>
              <img src={DetakeLogo} alt="Twitter" className="w-[90px]" />
              <p className="text-white text-[12px] mt-5">{texts.company.copyright}</p>
            </div>
            <div className="flex mt-6 space-x-5">
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