import React, { useState } from 'react'
import type { Locale } from '@/types'
import type { FilterSection } from './FilterDropdown'
import MultiSelectBase from './MultiSelectBase'

export interface CategoryMultiSelectProps {
  locale: Locale
  activeSubcategory?: string
}

/**
 * CategoryMultiSelect
 * A thin wrapper around MultiSelectBase specifically for category options.
 * Maintains the same interface as before while leveraging the shared implementation.
 * Data is managed internally, similar to TopicMultiSelect.
 */
export default function CategoryMultiSelect({
  locale,
}: CategoryMultiSelectProps) {
  // Initialize category sections with default options managed internally
  const [sections, setSections] = useState<FilterSection[]>([
    {
      id: 'category',
      title: locale === 'us' ? 'Category' : '分类',
      options: [
        { id: 'markets', label: locale === 'us' ? 'Markets' : '市场', checked: true },
        { id: 'finance', label: locale === 'us' ? 'Finance' : '金融', checked: true },
        { id: 'policy', label: locale === 'us' ? 'Policy' : '政策', checked: true },
      ],
    },
  ])

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