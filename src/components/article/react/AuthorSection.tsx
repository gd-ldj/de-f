import React, { useState } from 'react';
import type { Locale } from '@/types';
import Image from '@/components/common/react/Image'
import { followAuthor } from '@/api/users'
import { toast } from '@/components/common/react/Toast'
import { createTranslator } from '@/lib/i18n';
import { avatarPlaceholderUrl } from '@/config/assets';
import { useWalletAuth } from '@/lib/useWalletAuth';
import { requestAuthClientOpen } from '@/lib/auth-client-events';

interface Author {
  id?: string;
  name: string;
  bio?: string;
  avatar?: string;
  twitter?: string;
  email?: string;
}

interface AuthorSectionProps {
  author: Author;
  locale: Locale;
}

/**
 * Author information section component with social links and subscription
 * Displays author avatar, name, bio and action buttons for X, email and subscribe
 */
const AuthorSection: React.FC<AuthorSectionProps> = ({ author, locale }) => {
  const t = createTranslator(locale);
  /**
   * Handle X (Twitter) link click
   */
  const handleXClick = () => {
    if (author.twitter) {
      window.open(`https://twitter.com/${author.twitter}`, '_blank');
    }
  };

  /**
   * Handle email click
   */
  const handleEmailClick = () => {
    if (author.email) {
      window.open(`mailto:${author.email}`, '_blank');
    }
  };

  const { accessToken } = useWalletAuth();
  const [subscribing, setSubscribing] = useState(false);

  /**
   * Handle subscribe button click
   * - Ensure user is logged in (open login modal if not)
   * - Retrieve a valid access token from auth hook
   * - Call real backend API to follow/subscribe the author
   * - Show localized success or error toast based on result
   */
  const handleSubscribeClick = async () => {
    if (!accessToken) {
      requestAuthClientOpen('sign-in');
      return;
    }

    if (!author.id) {
      // Missing author identifier; cannot proceed
      toast.error(t('author.subscribeMissingId'));
      return;
    }

    try {
      setSubscribing(true);
      const res = await followAuthor(accessToken, author.id);
      const successMsg = locale === 'zh' ? res.msg.zh : res.msg.en;
      toast.success(successMsg);
    } catch (error) {
      console.error('Subscribe failed:', error);
      toast.error(t('author.subscribeFailed'));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="my-6 md:my-12">
      {/* Section Title */}
      <h3 className="text-lg font-medium text-gray-900 mb-6">{t('article.aboutAuthor')}</h3>

      {/* Author Info Container */}
      <div className="flex items-start justify-between">
        {/* Left: Avatar and Info */}
        <div className="flex items-center justify-center space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Image src={author.avatar || avatarPlaceholderUrl} fallbackSrc={avatarPlaceholderUrl} alt={author.name} className="w-12 h-12 rounded-full object-cover" />
          </div>

          {/* Author Details */}
          <div className="flex-1">
            {/* Author Name */}
            <h4 className="text-lg font-medium text-primary">{author.name}</h4>

            {/* Author Bio */}
            {author.bio && <p className="text-gray-600 text-sm leading-relaxed">{author.bio}</p>}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-5 ml-4">
          {/* X (Twitter) Button */}
          {author.twitter && (
            <button onClick={handleXClick} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors" aria-label={t('author.followOnX')}>
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
          )}

          {/* Email Button */}
          {author.email && (
            <button onClick={handleEmailClick} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors" aria-label={t('author.sendEmail')}>
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          )}

          {/* Subscribe Button */}
          <button onClick={handleSubscribeClick} disabled={true || subscribing || !author.id} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            + {t('author.subscribe')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthorSection;
