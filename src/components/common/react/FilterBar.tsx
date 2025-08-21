import { useState, useEffect } from 'react'
import TopicMultiSelect from '@/components/common/react/TopicMultiSelect'
import CategoryMultiSelect from '@/components/common/react/CategoryMultiSelect'
import AuthorSearchInput from '@/components/common/react/AuthorSearchInput'
import { t } from '@/lib/i18n'
import type { Locale } from '@/types'

export interface FilterBarProps {
  locale: Locale
  authorName?: string
  viewMode?: 'list' | 'grid'
}

export default function FilterBar({
  locale,
  authorName = '',
  viewMode = 'grid',
}: FilterBarProps) {
  const [anyActive, setAnyActive] = useState(false)
  const [catActive, setCatActive] = useState(false)
  const [topicActive, setTopicActive] = useState(false)
  const [authorActive, setAuthorActive] = useState(false)

  const i18n = {
    filters: t(locale, 'common.filters'),
    clearAll: t(locale, 'common.clearAll'),
    category: t(locale, 'common.category'),
    author: t(locale, 'common.author'),
    topic: t(locale, 'common.topic'),
  }

  // Update the CLEAR ALL button disabled state
  const refreshButtonState = () => {
    const newAnyActive = catActive || topicActive || authorActive
    setAnyActive(newAnyActive)
  }

  // Click handler to broadcast global clearing events to all filter widgets
  const handleClearAllFilters = () => {
    if (!anyActive) return
    document.dispatchEvent(new CustomEvent('filter:clear-all'))
    document.dispatchEvent(new CustomEvent('category:clear-all'))
    document.dispatchEvent(new CustomEvent('author:clear'))
  }

  useEffect(() => {
    refreshButtonState()
  }, [catActive, topicActive, authorActive])

  useEffect(() => {
    // Listen to filter changes from children and recompute the button state
    const handleCategoryChange = (e: CustomEvent) => {
      const detail = (e && e.detail !== undefined) ? e.detail : {}
      setCatActive(Boolean(detail.hasSelection))
    }

    const handleTopicChange = (e: CustomEvent) => {
      const detail = (e && e.detail !== undefined) ? e.detail : {}
      setTopicActive(Boolean(detail.hasSelection))
    }

    const handleAuthorChange = (e: CustomEvent) => {
      const detail = (e && e.detail !== undefined) ? e.detail : {}
      setAuthorActive(Boolean(detail.hasText))
    }

    // Add event listeners
    document.addEventListener('category:changed', handleCategoryChange)
    document.addEventListener('filter:changed', handleTopicChange)
    document.addEventListener('author:changed', handleAuthorChange)

    return () => {
      // Cleanup event listeners
      document.removeEventListener('category:changed', handleCategoryChange)
      document.removeEventListener('filter:changed', handleTopicChange)
      document.removeEventListener('author:changed', handleAuthorChange)
    }
  }, [])

  return (
    <div className="flex items-center bg-white border border-border rounded-md px-4 py-3">
      <div className="flex items-center flex-1 min-w-0">
        {/* Static Filters label */}
        <div className="flex items-center justify-center space-x-2 pr-4">
          <svg 
            className="w-4 h-4 text-foreground/80" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            aria-hidden="true"
          >
            <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z"></path>
          </svg>
          <span className="text-sm font-medium">{i18n.filters}</span>
          <button
            className={`text-[11px] uppercase tracking-wide font-medium transition-colors ${
              anyActive 
                ? 'text-primary hover:text-primary/80' 
                : 'text-muted-foreground cursor-not-allowed'
            }`}
            aria-label={i18n.clearAll}
            disabled={!anyActive}
            onClick={handleClearAllFilters}
          >
            {i18n.clearAll}
          </button>
        </div>

        <div className="h-6 w-px bg-border mx-4"></div>

        {/* Category multi-level selector */}
        <div className="flex items-center justify-center space-x-2 pr-4">
          <span className="text-sm text-muted-foreground">{i18n.category}</span>
          <CategoryMultiSelect locale={locale} />
        </div>

        <div className="h-6 w-px bg-border mx-4"></div>

        <div className="flex items-center justify-center space-x-2 pr-4">
          <span className="text-sm text-muted-foreground">{i18n.author}</span>
          <AuthorSearchInput locale={locale} defaultValue={authorName} />
        </div>

        <div className="h-6 w-px bg-border mx-4"></div>

        {/* Topic section with TopicMultiSelect */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">{i18n.topic}</span>
          <TopicMultiSelect locale={locale} />
        </div>
      </div>

      {/* Right: view toggles */}
      <div className="flex items-center space-x-4">
        <div className="flex overflow-hidden rounded-md border border-border">
          <button 
            className={`p-2 ${viewMode === 'list' ? 'bg-secondary' : 'bg-white hover:bg-accent'}`} 
            aria-label="List view"
          >
            <svg 
              className="w-4 h-4 text-foreground" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <div className="w-px bg-border"></div>
          <button 
            className={`p-2 ${viewMode === 'grid' ? 'bg-secondary' : 'bg-white hover:bg-accent'}`} 
            aria-label="Grid view"
          >
            <svg 
              className="w-4 h-4 text-foreground" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              aria-hidden="true"
            >
              <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}