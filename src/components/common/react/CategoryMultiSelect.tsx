import React, { useEffect, useState } from 'react'
import type { Locale } from '@/types'
import type { FilterSection } from './FilterDropdown'
import MultiSelectBase from './MultiSelectBase'
import { fetchArticleCategories } from '@/api/articles'
import { createTranslator } from '@/lib/i18n'

export interface CategoryMultiSelectProps {
  locale: Locale
  activeSubcategory?: string
  initialValues?: string | string[]
  placeholder?: string
  /** Callback to notify parent when dropdown open state changes */
  onOpenChange?: (isOpen: boolean) => void
}

/**
 * CategoryMultiSelect
 * Loads category options from backend and renders a shared MultiSelectBase.
 * Falls back to a small set of defaults if the API fails.
 */
export default function CategoryMultiSelect({
  locale,
  initialValues,
  placeholder,
  onOpenChange,
}: CategoryMultiSelectProps) {
  const t = createTranslator(locale);
  const normalizeSelectedValues = (values?: string | string[]) => {
    if (!values) return [];
    const rawValues = Array.isArray(values) ? values : values.split(',').map((v) => v.trim());
    return Array.from(new Set(rawValues.filter((value) => value)));
  };
  const mergeMissingOptions = (options: { id: string; label: string; checked: boolean }[], selectedValues: string[]) => {
    const existingLabels = new Set(options.map((option) => option.label));
    const missingOptions = selectedValues
      .filter((value) => !existingLabels.has(value))
      .map((value) => ({ id: `custom-${value}`, label: value, checked: true }));
    return missingOptions.length > 0 ? [...options, ...missingOptions] : options;
  };
  const [sections, setSections] = useState<FilterSection[]>([
    {
      id: 'category',
      title: t('common.category'),
      options: [],
    },
  ])

  /**
   * Map API category payload into UI filter options shape
   * @param cats - Category data from API
   * @param selectedValues - Array of initially selected category names
   */
  const mapCategoriesToOptions = (cats: { id: string; name: string }[], selectedValues: string[] = []) => {
    const mappedOptions = cats.map((c) => ({
      id: c.id,
      label: c.name,
      checked: selectedValues.includes(c.name),
    }));
    return mergeMissingOptions(mappedOptions, selectedValues);
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
          const selectedValues = normalizeSelectedValues(initialValues);
          
          setSections([
            {
              id: 'category',
              title: t('common.category'),
              options: mapCategoriesToOptions(cats, selectedValues),
            },
          ])
        } else {
          // Fallback defaults when API returns empty
          const selectedValues = normalizeSelectedValues(initialValues);
          const fallbackOptions = [
            { id: 'markets', label: t('common.markets'), checked: false },
            { id: 'news', label: t('common.news'), checked: false },
            { id: 'research', label: t('common.research'), checked: false },
          ];
          setSections([
            {
              id: 'category',
              title: t('common.category'),
              options: mergeMissingOptions(fallbackOptions, selectedValues),
            },
          ])
        }
      })
      .catch(() => {
        const selectedValues = normalizeSelectedValues(initialValues);
        const fallbackOptions = [
          { id: 'markets', label: t('common.markets'), checked: false },
          { id: 'news', label: t('common.news'), checked: false },
          { id: 'research', label: t('common.research'), checked: false },
        ];
        setSections([
          {
            id: 'category',
            title: t('common.category'),
            options: mergeMissingOptions(fallbackOptions, selectedValues),
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
      placeholder={placeholder}
      changedEventName="category:changed"
      clearEventNames={["category:clear-all", "filter:clear-all"]}
      onOpenChange={onOpenChange}
    />
  )
}
