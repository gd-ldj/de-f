import React from 'react';
import type { Locale } from '@/types';
import Image from '@/components/common/react/Image';
import { createTranslator } from '@/lib/i18n';
import { avatarPlaceholderUrl } from '@/config/assets';

interface PodcastAuthor {
  id?: string;
  name: string;
  bio?: string;
  avatar?: string;
  twitter?: string;
  email?: string;
}

interface PodcastAuthorCardProps {
  author: PodcastAuthor;
  youtubeChannelUrl: string;
  locale: Locale;
}

/**
 * Author card variant for Podcast detail pages.
 * Visual layout mirrors AuthorSection (same spacing, font sizes, button styles)
 * but all primary interactions link out to the YouTube channel instead of the
 * internal follow system.
 */
const PodcastAuthorCard: React.FC<PodcastAuthorCardProps> = ({ author, youtubeChannelUrl, locale }) => {
  const t = createTranslator(locale);

  const handleXClick = () => {
    if (author.twitter) {
      window.open(`https://twitter.com/${author.twitter}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEmailClick = () => {
    if (author.email) {
      window.open(`mailto:${author.email}`, '_blank');
    }
  };

  const channelHref = youtubeChannelUrl || '#';
  const subscribeHref = youtubeChannelUrl ? `${youtubeChannelUrl}${youtubeChannelUrl.includes('?') ? '&' : '?'}sub_confirmation=1` : '#';

  return (
    <div className="my-6 md:my-12">
      {/* Author Info Container */}
      <div className="flex items-start justify-between">
        {/* Left: Avatar and Info (whole block links to YouTube channel) */}
        <a
          href={channelHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-4 group"
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Image
              src={author.avatar || avatarPlaceholderUrl}
              fallbackSrc={avatarPlaceholderUrl}
              alt={author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>

          {/* Author Details */}
          <div className="flex-1">
            <h4 className="text-lg font-medium text-primary group-hover:underline">{author.name}</h4>
            {author.bio && <p className="text-gray-600 text-sm leading-relaxed">{author.bio}</p>}
          </div>
        </a>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-5 ml-4">
          {author.twitter && (
            <button
              onClick={handleXClick}
              className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              aria-label={t('author.followOnX')}
            >
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
          )}

          {author.email && (
            <button
              onClick={handleEmailClick}
              className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              aria-label={t('author.sendEmail')}
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          )}

          {/* Subscribe Button — opens YouTube channel with subscribe confirmation */}
          <a
            href={subscribeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-teal-700 transition-colors inline-flex items-center"
          >
            + {t('podcast.subscribe')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PodcastAuthorCard;
