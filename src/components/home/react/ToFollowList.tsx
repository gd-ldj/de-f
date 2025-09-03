import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Image from '@/components/common/react/Image';
import type { HomeWhoToFollow, Locale } from '@/types';
import { createTranslator } from '@/lib/i18n';
import { getLocaleFromPath } from '@/lib/utils';
import { useAuth } from '@/lib/useAuth';
import { followAuthor } from '@/api/users';
import { toast } from '@/components/common/react/Toast';
import { AvatarSkeleton, TextSkeleton } from '@/components/common/react/Skeleton';

interface ToFollowListProps {
  locale?: Locale;
  whoToFollow?: HomeWhoToFollow[];
}

/**
 * Get locale from props or extract from current URL
 * @param propsLocale - Locale from props (optional)
 * @returns Current locale
 */
function getLocale(propsLocale?: Locale): Locale {
  if (propsLocale) return propsLocale;
  if (typeof window !== 'undefined') {
    return getLocaleFromPath(window.location.pathname) as Locale;
  }
  return 'us'; // fallback
}

export default function ToFollowList({ locale: propsLocale, whoToFollow = [] }: ToFollowListProps) {
  console.log('🚀 ~ ToFollowList ~ locale:', propsLocale);
  const locale = useMemo(() => getLocale(propsLocale), [propsLocale]);
  const t = createTranslator(locale);
  const [followUsers, setFollowUsers] = useState<HomeWhoToFollow[]>([]);
  const [loading, setLoading] = useState(false); // Set to false since data is passed from parent
  const [error, setError] = useState<string | null>(null);
  // Authentication utilities
  const { isEffectivelyLoggedIn, login, getValidAccessToken } = useAuth();
  // Track follow request loading state per user
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  // Track hover state for each user item
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  // Initialize follow users from whoToFollow prop
  useEffect(() => {
    if (whoToFollow.length > 0) {
      console.log('🚀 ~ ToFollowList ~ whoToFollow:', whoToFollow);
      setFollowUsers(whoToFollow);
      setLoading(false);
    } else {
      setError('No data available');
      setLoading(false);
    }
  }, [whoToFollow]);

  // Data is now passed from parent component, no need for separate data fetching

  /**
   * Handle follow (subscribe) action for a specific user
   * 1) Check if user is logged in (show login prompt if not)
   * 2) Retrieve valid access token from auth hook
   * 3) Call real backend API: POST /api/v1/users/follow with { author_id }
   * 4) Show success message based on current locale using server-provided text
   */
  const handleFollow = useCallback(
    async (userId: string) => {
      try {
        // Show login prompt if not authenticated
        if (!isEffectivelyLoggedIn) {
          toast.info(locale === 'us' ? 'Please login first to follow authors' : '请先登录以关注作者');
          return;
        }

        setFollowingMap((prev) => ({ ...prev, [userId]: true }));

        const token = await getValidAccessToken();
        if (!token) throw new Error('Missing access token');

        const res = await followAuthor(token, userId);
        const successMsg = locale === 'us' ? res.msg.en : res.msg.zh;

        // Show success toast message using global Toast container
        toast.success(successMsg);
      } catch (err) {
        console.error('Follow failed:', err);
        toast.error(locale === 'us' ? 'Failed to follow author. Please try again.' : '关注失败，请稍后重试');
      } finally {
        setFollowingMap((prev) => ({ ...prev, [userId]: false }));
      }
    },
    [isEffectivelyLoggedIn, login, getValidAccessToken, locale]
  );

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6 pl-4 md:px-6 border-t border-border pt-[18px]">
        <div>
          <h3 className="font-medium text-foreground mb-[10px] md:mb-4">{t('common.whoToFollow')}</h3>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-xs text-muted-foreground">Please refresh the page to try again</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 pl-4 md:px-6 border-t border-border pt-[18px]">
        <div>
          <h3 className="font-medium text-foreground mb-[10px] md:mb-4">{t('common.whoToFollow')}</h3>

          {/* Mobile: Horizontal scrollable skeleton */}
          <div className="md:hidden overflow-x-auto">
            <div className="flex space-x-3 pb-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64">
                  <div className="border border-gray-200 rounded-lg p-3 h-full">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <AvatarSkeleton size={48} />
                        <div className="flex-1 min-w-0">
                          <TextSkeleton className="mb-1 h-4" />
                          <TextSkeleton className="w-2/3 h-3" />
                        </div>
                      </div>
                      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse flex-shrink-0 ml-2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Vertical skeleton layout */}
          <div className="hidden md:block space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="flex items-start space-x-3 py-3">
                  <AvatarSkeleton size={48} />
                  <div className="flex-1">
                    <TextSkeleton className="mb-1" />
                    <TextSkeleton className="w-2/3" />
                  </div>
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                {i < 2 && <div className="border-b border-border"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="space-y-6 pl-4 md:px-6 border-t border-border pt-[18px]">
        <div>
          <h3 className="font-medium text-foreground mb-[10px] md:mb-4">{t('common.whoToFollow')}</h3>

          {/* Mobile: Horizontal scrollable container */}
          <div className="md:hidden overflow-x-auto">
            <div className="flex space-x-3 pb-2">
              {followUsers.map((user, index) => (
                <div key={index} className="flex-shrink-0 w-64">
                  <div className="border border-gray-200 rounded-lg p-3 h-full" onMouseEnter={() => setHoveredUserId(user.user_id)} onMouseLeave={() => setHoveredUserId(null)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <Image src={user.avatar_url} alt={user.name} className="w-12 h-12 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm leading-tight truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{user.profile_bio}</p>
                        </div>
                      </div>
                      <div className="relative flex-shrink-0 ml-2">
                        {/* <button onClick={() => handleFollow(user.user_id)} disabled={!!followingMap[user.user_id]} className="p-1.5 hover:bg-accent rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                          <Plus className="w-5 h-5 text-muted-foreground" />
                        </button> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Vertical layout */}
          <div className="hidden md:block space-y-4">
            {followUsers.map((user, index) => (
              <div key={index}>
                <div className="flex items-start justify-between py-3" onMouseEnter={() => setHoveredUserId(user.user_id)} onMouseLeave={() => setHoveredUserId(null)}>
                  <div className="flex items-start space-x-3">
                    <Image src={user.avatar_url} alt={user.name} className="w-12 h-12 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm leading-tight">{user.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{user.profile_bio}</p>
                    </div>
                  </div>
                  {/* <div className="relative flex-shrink-0">
                    <button className={`p-1.5 hover:bg-accent rounded transition-all duration-300 ease-in-out ${hoveredUserId === user.user_id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleFollow(user.user_id)} disabled={!!followingMap[user.user_id]} className={`bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground px-4 py-1.5 rounded text-sm font-medium transition-all duration-300 ease-in-out items-center space-x-1 absolute right-0 top-0 flex ${hoveredUserId === user.user_id ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                      <Plus className="w-4 h-4" />
                      <span>{t('common.subscribe')}</span>
                    </button>
                  </div> */}
                </div>
                {index < followUsers.length - 1 && <div className="border-b border-border"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ToastContainer is provided globally in AuthMount; no local container here */}
    </>
  );
}
