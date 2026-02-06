import React, { useEffect, useState } from 'react';
import type { Locale } from '@/types';
import MultiSelectBase from './MultiSelectBase';
import type { FilterSection } from './FilterDropdown';
import { fetchArticleTags } from '@/api/articles';
import { createTranslator } from '@/lib/i18n';

export interface TopicMultiSelectProps {
  locale: Locale;
  initialValues?: string | string[];
  placeholder?: string;
  /** Callback to notify parent when dropdown open state changes */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * TopicMultiSelect
 * Loads tag options from backend API and renders via shared MultiSelectBase.
 * Falls back to a small set of defaults if the API fails.
 */
export default function TopicMultiSelect({ locale, initialValues, placeholder, onOpenChange }: TopicMultiSelectProps) {
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
      id: 'topics',
      title: t('common.topics'),
      options: [],
    },
  ]);

  /**
   * Map API tag payload into UI filter options shape
   * @param tags - Tag data from API
   * @param selectedValues - Array of initially selected tag names
   */
  const mapTagsToOptions = (tags: { id: string; name: string }[], selectedValues: string[] = []) => {
    const mappedOptions = tags.map((t) => ({
      id: t.id,
      label: t.name,
      checked: selectedValues.includes(t.name),
    }));
    return mergeMissingOptions(mappedOptions, selectedValues);
  };

  /**
   * Fetch tags on mount and update sections state
   */
  useEffect(() => {
    let mounted = true;
    fetchArticleTags()
      .then((tags) => {
        if (!mounted) return;
        if (Array.isArray(tags) && tags.length > 0) {
          // Parse initial values into array format
          const selectedValues = normalizeSelectedValues(initialValues);

          setSections([
            {
              id: 'topics',
              title: t('common.topics'),
              options: mapTagsToOptions(tags, selectedValues),
            },
          ]);
        } else {
          // Fallback defaults when API returns empty
          const selectedValues = normalizeSelectedValues(initialValues);
          const fallbackOptions = [
            { id: 'blockchain', label: t('common.blockchain'), checked: false },
            { id: 'defi', label: t('common.defi'), checked: false },
            { id: 'nft', label: t('common.nft'), checked: false },
            { id: 'web3', label: t('common.web3'), checked: false },
          ];
          setSections([
            {
              id: 'topics',
              title: t('common.topics'),
              options: mergeMissingOptions(fallbackOptions, selectedValues),
            },
          ]);
        }
      })
      .catch(() => {
        // Network error -> fallback defaults
        const selectedValues = normalizeSelectedValues(initialValues);
        const fallbackOptions = [
          { id: 'blockchain', label: t('common.blockchain'), checked: false },
          { id: 'defi', label: t('common.defi'), checked: false },
          { id: 'nft', label: t('common.nft'), checked: false },
          { id: 'web3', label: t('common.web3'), checked: false },
        ];
        setSections([
          {
            id: 'topics',
            title: t('common.topics'),
            options: mergeMissingOptions(fallbackOptions, selectedValues),
          },
        ]);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <MultiSelectBase locale={locale} sections={sections} onSectionsChange={setSections} changedEventName="filter:changed" clearEventNames={['filter:clear-all']} placeholder={placeholder} onOpenChange={onOpenChange} />;
}
