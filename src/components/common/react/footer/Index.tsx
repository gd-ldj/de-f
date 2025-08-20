import { Mail } from "lucide-react";
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
  locale: Locale
}

export default function Footer({ locale = 'us' }: FooterProps) {
  const texts = footerTexts[locale] || footerTexts.us;

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-[1440px] mx-auto pb-12">
        <div className="grid grid-cols-2 gap-12">
          <div className="p-12 pl-12">
            <h3 className="text-lg font-semibold mb-4">{texts.newsletter.title}</h3>
            <h4 className="text-xl font-bold mb-4">{texts.newsletter.subtitle}</h4>
            <p className="text-gray-300 mb-6">{texts.newsletter.description}</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder={texts.newsletter.emailPlaceholder} 
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-teal-500" 
              />
              <button className="bg-teal-500 px-6 py-2 rounded-r-lg hover:bg-teal-600 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {texts.newsletter.subscribeButton}
              </button>
            </div>
          </div>

          <div className="p-12 pl-12 border-l border-gray-800">
            <h3 className="text-lg font-semibold mb-4">{texts.disclosure.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{texts.disclosure.content}</p>
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
              <h2 className="text-2xl font-bold">{texts.company.logo}</h2>
              <p className="text-gray-400 text-sm mt-4">{texts.company.copyright}</p>
            </div>
            <div className="flex space-x-4">
              <a href="https://twitter.com/detake" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={texts.social.twitter}>
                <img src={TwitterIcon} alt="Twitter" className="w-5 h-5" />
              </a>
              <a href="https://t.me/detake" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={texts.social.telegram}>
                <img src={TelegramIcon} alt="Telegram" className="w-5 h-5" />
              </a>
              <a href="https://github.com/detake" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={texts.social.github}>
                <img src={GithubIcon} alt="GitHub" className="w-5 h-5" />
              </a>
              <a href="https://discord.gg/detake" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={texts.social.discord}>
                <img src={DiscordIcon} alt="Discord" className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@detake" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={texts.social.youtube}>
                <img src={YoutubeIcon} alt="YouTube" className="w-5 h-5" />
              </a>
              <a href="/rss" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={texts.social.rss}>
                <img src={RSSIcon} alt="RSS" className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}