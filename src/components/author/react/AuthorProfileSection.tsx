import React, { useState } from 'react';
import type { Locale } from '@/types';
import type { AuthorProfile } from '@/api/users';
import { useAuth } from '@/lib/useAuth';
import Image from '@/components/common/react/Image';
import { followAuthor } from '@/api/users';
import { toast } from '@/components/common/react/Toast';
import { createTranslator } from '@/lib/i18n';
import { avatarPlaceholderUrl } from '@/config/assets';

interface AuthorProfileSectionProps {
  authorProfile: AuthorProfile;
  locale: Locale;
}

/**
 * Author profile section component with avatar, bio, stats and action buttons
 * Displays author information, follower count, article count and subscribe button
 */
const AuthorProfileSection: React.FC<AuthorProfileSectionProps> = ({ authorProfile, locale }) => {
  const t = createTranslator(locale);
  // Get authentication state and functions
  const { isEffectivelyLoggedIn, login, getValidAccessToken } = useAuth();
  const [subscribing, setSubscribing] = useState(false);

  /**
   * Handle X (Twitter) link click
   */
  const handleXClick = () => {
    if (authorProfile.twitter) {
      window.open(`https://twitter.com/${authorProfile.twitter}`, '_blank');
    }
  };

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

    if (!authorProfile.user_id) {
      // Missing author identifier; cannot proceed
      toast.error(t('author.subscribeMissingId'));
      return;
    }

    try {
      setSubscribing(true);
      const token = await getValidAccessToken();
      if (!token) throw new Error('Missing access token');

      const res = await followAuthor(token, authorProfile.user_id);
      const successMsg = locale === 'zh' ? res.msg.zh : res.msg.en;
      toast.success(successMsg);
    } catch (error) {
      console.error('Subscribe failed:', error);
      toast.error(t('author.subscribeFailed'));
    } finally {
      setSubscribing(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="mb-8">
      {/* Author Header */}
      <div className="flex items-start justify-between mb-6">
        {/* Left: Avatar and Basic Info */}
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Image src={authorProfile.avatar_url || avatarPlaceholderUrl} fallbackSrc={avatarPlaceholderUrl} alt={authorProfile.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
          </div>

          {/* Author Details */}
          <div className="flex-1">
            {/* Author Name */}
            <h1 className="text-2xl font-bold text-foreground mb-2">{authorProfile.name}</h1>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 20H4v-2a3 3 0 015.196-2.121M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">{formatNumber(authorProfile.followers)}</span>
                <span>{t('author.followers')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">{formatNumber(authorProfile.articles_count)}</span>
                <span>{t('author.articles')}</span>
              </div>
            </div>

            {/* Bio */}
            {authorProfile.profile_bio && <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">{authorProfile.profile_bio}</p>}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-3 ml-4">
          {/* X (Twitter) Button */}
          {authorProfile.twitter && (
            <button onClick={handleXClick} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" aria-label={t('author.followOnX')}>
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
          )}

          {/* Subscribe Button */}
          <button onClick={handleSubscribeClick} disabled={subscribing} className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-2">
            {subscribing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t('author.subscribing')}</span>
              </>
            ) : (
              <>
                <span>+</span>
                <span>{t('author.subscribe')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthorProfileSection;
