import React, { useEffect, useState } from 'react'
import type { Locale } from '@/types'
import type { FilterSection } from './FilterDropdown'
import MultiSelectBase from './MultiSelectBase'
import { fetchArticleCategories } from '@/api/articles'

export interface CategoryMultiSelectProps {
  locale: Locale
  activeSubcategory?: string
}

/**
 * CategoryMultiSelect
 * Loads category options from backend and renders a shared MultiSelectBase.
 * Falls back to a small set of defaults if the API fails.
 */
export default function CategoryMultiSelect({
  locale,
}: CategoryMultiSelectProps) {
  const [sections, setSections] = useState<FilterSection[]>([
    {
      id: 'category',
      title: locale === 'us' ? 'Category' : '分类',
      options: [],
    },
  ])

  /**
   * Map API category payload into UI filter options shape
   */
  const mapCategoriesToOptions = (cats: { id: string; name: string }[]) => {
    return cats.map((c) => ({ id: c.id, label: c.name, checked: false }))
  }

  /**
   * Fetch categories on mount and update sections state
   */
  useEffect(() => {
    let mounted = true
    fetchArticleCategories()
      .then((cats) => {
        if (!mounted) return
        if (Array.isArray(cats) && cats.length > 0) {
          setSections([
            {
              id: 'category',
              title: locale === 'us' ? 'Category' : '分类',
              options: mapCategoriesToOptions(cats),
            },
          ])
        } else {
          // Fallback defaults when API returns empty
          setSections([
            {
              id: 'category',
              title: locale === 'us' ? 'Category' : '分类',
              options: [
                { id: 'markets', label: locale === 'us' ? 'Markets' : '市场', checked: false },
                { id: 'news', label: locale === 'us' ? 'News' : '新闻', checked: false },
                { id: 'research', label: locale === 'us' ? 'Research' : '研究', checked: false },
              ],
            },
          ])
        }
      })
      .catch(() => {
        // Network error -> fallback defaults
        setSections([
          {
            id: 'category',
            title: locale === 'us' ? 'Category' : '分类',
            options: [
              { id: 'markets', label: locale === 'us' ? 'Markets' : '市场', checked: false },
              { id: 'news', label: locale === 'us' ? 'News' : '新闻', checked: false },
              { id: 'research', label: locale === 'us' ? 'Research' : '研究', checked: false },
            ],
          },
        ])
      })
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <MultiSelectBase
      locale={locale}
      sections={sections}
      onSectionsChange={setSections}
      changedEventName="category:changed"
      clearEventNames={["category:clear-all", "filter:clear-all"]}
    />
  )
}