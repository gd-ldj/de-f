import React, { useState } from 'react';
import type { Locale } from '@/types';
import { useAuth } from '@/lib/useAuth';
import Image from '@/components/common/react/Image'
import { followAuthor } from '@/api/users'
import { toast } from '@/components/common/react/Toast'

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

  // Get authentication state and functions
  const { isEffectivelyLoggedIn, login, getValidAccessToken } = useAuth();
  const [subscribing, setSubscribing] = useState(false);

  /**
   * Handle subscribe button click
   * - Ensure user is logged in (open login modal if not)
   * - Retrieve a valid access token from auth hook
   * - Call real backend API to follow/subscribe the author
   * - Show localized success or error toast based on result
   */
  const handleSubscribeClick = async () => {
    if (!isEffectivelyLoggedIn) {
      // User is not logged in, trigger login modal
      login();
      return;
    }

    if (!author.id) {
      // Missing author identifier; cannot proceed
      toast.error(locale === 'us' ? 'Author ID is missing. Please refresh the page and try again.' : '作者ID缺失，无法订阅，请刷新页面后重试');
      return;
    }

    try {
      setSubscribing(true);
      const token = await getValidAccessToken();
      if (!token) throw new Error('Missing access token');

      const res = await followAuthor(token, author.id);
      const successMsg = locale === 'us' ? res.msg.en : res.msg.zh;
      toast.success(successMsg);
    } catch (error) {
      console.error('Subscribe failed:', error);
      toast.error(locale === 'us' ? 'Failed to subscribe. Please try again.' : '订阅失败，请稍后重试');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="mt-12">
      {/* Section Title */}
      <h3 className="text-lg font-medium text-gray-900 mb-6">{locale === 'us' ? 'About the Author' : '关于作者'}</h3>

      {/* Author Info Container */}
      <div className="flex items-start justify-between">
        {/* Left: Avatar and Info */}
        <div className="flex items-center justify-center space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Image src={author.avatar || '/placeholder.svg'} alt={author.name} className="w-12 h-12 rounded-full object-cover" />
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
            <button onClick={handleXClick} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors" aria-label="Follow on X">
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
          )}

          {/* Email Button */}
          {author.email && (
            <button onClick={handleEmailClick} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors" aria-label="Send email">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          )}

          {/* Subscribe Button */}
          <button onClick={handleSubscribeClick} disabled={subscribing || !author.id} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            + {locale === 'us' ? 'Subscribe' : '订阅'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthorSection;