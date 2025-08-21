import React, { useState, useEffect } from 'react'
import { Plus } from "lucide-react"
import Image from '@/components/common/react/Image'
import { fetchHomePageData } from '@/api/articles'
import type { HomeWhoToFollow, Locale } from '@/types'
import { t } from '@/lib/i18n'
import { getLocaleFromPath } from '@/lib/utils'
import { useAuth } from '@/lib/useAuth'
import { followAuthor } from '@/api/users'
import { toast } from '@/components/common/react/Toast'

interface ToFollowListProps {
  locale?: Locale;
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

export default function ToFollowList({ locale: propsLocale }: ToFollowListProps) {
  const locale = getLocale(propsLocale);
  const [followUsers, setFollowUsers] = useState<HomeWhoToFollow[]>([])
  const [loading, setLoading] = useState(true)
  // Authentication utilities
  const { isEffectivelyLoggedIn, login, getValidAccessToken } = useAuth()
  // Track follow request loading state per user
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})
  // Track hover state for each user item
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadFollowUsers = async () => {
      try {
        const homeData = await fetchHomePageData()
        setFollowUsers(homeData?.who_to_follow || [])
      } catch (error) {
        console.error('Failed to load follow users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFollowUsers()
  }, [])

  /**
   * Handle follow (subscribe) action for a specific user
   * 1) Ensure user is logged in (trigger login modal if not)
   * 2) Retrieve valid access token from auth hook
   * 3) Call real backend API: POST /api/v1/users/follow with { author_id }
   * 4) Show success message based on current locale using server-provided text
   */
  const handleFollow = async (userId: string) => {
    try {
      // Request login if not authenticated
      if (!isEffectivelyLoggedIn) {
        login()
        return
      }

      setFollowingMap(prev => ({ ...prev, [userId]: true }))

      const token = await getValidAccessToken()
      if (!token) throw new Error('Missing access token')

      const res = await followAuthor(token, userId)
      const successMsg = locale === 'us' ? res.msg.en : res.msg.zh

      // Show success toast message using global Toast container
      toast.success(successMsg)

    } catch (err) {
      console.error('Follow failed:', err)
      toast.error(locale === 'us' ? 'Failed to follow author. Please try again.' : '关注失败，请稍后重试')
    } finally {
      setFollowingMap(prev => ({ ...prev, [userId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-foreground mb-4">{t(locale, 'common.whoToFollow')}</h3>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3 py-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-foreground mb-4">Who To Follow</h3>
        <div className="space-y-4">
          {followUsers.map((user, index) => (
            <div key={index}>
              <div 
                className="flex items-start justify-between py-3"
                onMouseEnter={() => setHoveredUserId(user.user_id)}
                onMouseLeave={() => setHoveredUserId(null)}
              >
                <div className="flex items-start space-x-3">
                  <Image src={user.avatar_url} alt={user.name} className="w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm leading-tight">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{user.profile_bio}</p>
                  </div>
                </div>
                <div className="relative flex-shrink-0">
                  <button 
                    className={`p-1.5 hover:bg-accent rounded transition-all duration-300 ease-in-out ${
                      hoveredUserId === user.user_id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
                  >
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button 
                    onClick={() => handleFollow(user.user_id)}
                    disabled={!!followingMap[user.user_id]}
                    className={`bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground px-4 py-1.5 rounded text-sm font-medium transition-all duration-300 ease-in-out items-center space-x-1 absolute right-0 top-0 flex ${
                      hoveredUserId === user.user_id ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t(locale, 'common.subscribe')}</span>
                  </button>
                </div>
              </div>
              {index < followUsers.length - 1 && <div className="border-b border-border"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
