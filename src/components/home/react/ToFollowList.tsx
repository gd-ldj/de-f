import React, { useState, useEffect } from 'react'
import { Plus } from "lucide-react"
import Image from '@/components/common/react/Image'
import { fetchHomePageData } from '@/api/articles'
import type { HomeWhoToFollow, Locale } from '@/types'
import { t } from '@/lib/i18n'

interface ToFollowListProps {
  locale: Locale;
}

export default function ToFollowList({ locale }: ToFollowListProps) {
  const [followUsers, setFollowUsers] = useState<HomeWhoToFollow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFollowUsers = async () => {
      try {
        const homeData = await fetchHomePageData()
        setFollowUsers(homeData.who_to_follow)
      } catch (error) {
        console.error('Failed to load follow users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFollowUsers()
  }, [])

  const handleFollow = (userId: string) => {
    // In a real app, this would make an API call
    console.log(`Following user ${userId}`)
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
              <div className="flex items-start justify-between py-3">
                <div className="flex items-start space-x-3">
                  <Image src={user.avatar_url} alt={user.name} className="w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm leading-tight">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{user.profile_bio}</p>
                  </div>
                </div>
                <div className="group relative flex-shrink-0">
                  <button className="p-1.5 hover:bg-accent rounded transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-95">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button 
                    onClick={() => handleFollow(user.user_id)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded text-sm font-medium transition-all duration-300 ease-in-out items-center space-x-1 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 absolute right-0 top-0 flex"
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
