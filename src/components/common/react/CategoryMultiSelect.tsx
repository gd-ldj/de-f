import React, { useEffect, useState } from 'react'
import type { Locale } from '@/types'
import type { FilterSection } from './FilterDropdown'
import MultiSelectBase from './MultiSelectBase'
import { fetchArticleCategories } from '@/api/articles'
import { t } from '@/lib/i18n'

export interface CategoryMultiSelectProps {
  locale: Locale
  activeSubcategory?: string
  initialValues?: string | string[]
}

/**
 * CategoryMultiSelect
 * Loads category options from backend and renders a shared MultiSelectBase.
 * Falls back to a small set of defaults if the API fails.
 */
export default function CategoryMultiSelect({
  locale,
  initialValues,
}: CategoryMultiSelectProps) {
  const [sections, setSections] = useState<FilterSection[]>([
    {
      id: 'category',
      title: t(locale, 'common.category'),
      options: [],
    },
  ])

  /**
   * Map API category payload into UI filter options shape
   * @param cats - Category data from API
   * @param selectedValues - Array of initially selected category names
   */
  const mapCategoriesToOptions = (cats: { id: string; name: string }[], selectedValues: string[] = []) => {
    return cats.map((c) => ({ 
      id: c.id, 
      label: c.name, 
      checked: selectedValues.includes(c.name) 
    }))
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
          // Parse initial values into array format
          const selectedValues = initialValues 
            ? (Array.isArray(initialValues) ? initialValues : initialValues.split(locale, ',').map(v => v.trim()))
            : [];
          
          setSections([
            {
              id: 'category',
              title: t(locale, 'common.category'),
              options: mapCategoriesToOptions(cats, selectedValues),
            },
          ])
        } else {
          // Fallback defaults when API returns empty
          setSections([
            {
              id: 'category',
              title: t(locale, 'common.category'),
              options: [
                { id: 'markets', label: t(locale, 'common.markets'), checked: false },
                { id: 'news', label: t(locale, 'common.news'), checked: false },
                { id: 'research', label: t(locale, 'common.research'), checked: false },
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
            title: t(locale, 'common.category'),
            options: [
              { id: 'markets', label: t(locale, 'common.markets'), checked: false },
              { id: 'news', label: t(locale, 'common.news'), checked: false },
              { id: 'research', label: t(locale, 'common.research'), checked: false },
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