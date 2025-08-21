import React, { useEffect, useState } from 'react';
import type { Locale } from '@/types';
import MultiSelectBase from './MultiSelectBase';
import type { FilterSection } from './FilterDropdown';
import { fetchArticleTags } from '@/api/articles';
import { t } from '@/lib/i18n';

export interface TopicMultiSelectProps {
  locale: Locale;
}

/**
 * TopicMultiSelect
 * Loads tag options from backend API and renders via shared MultiSelectBase.
 * Falls back to a small set of defaults if the API fails.
 */
export default function TopicMultiSelect({ locale }: TopicMultiSelectProps) {
  const [sections, setSections] = useState<FilterSection[]>([
    {
      id: 'topics',
      title: t(locale, 'common.topics'),
      options: [],
    },
  ]);

  /**
   * Map API tag payload into UI filter options shape
   */
  const mapTagsToOptions = (tags: { id: string; name: string }[]) => {
    return tags.map((t) => ({ id: t.id, label: t.name, checked: false }))
  }

  /**
   * Fetch tags on mount and update sections state
   */
  useEffect(() => {
    let mounted = true
    fetchArticleTags()
      .then((tags) => {
        if (!mounted) return
        if (Array.isArray(tags) && tags.length > 0) {
          setSections([
            {
              id: 'topics',
              title: t(locale, 'common.topics'),
              options: mapTagsToOptions(tags),
            },
          ])
        } else {
          // Fallback defaults when API returns empty
          setSections([
            {
              id: 'topics',
              title: t(locale, 'common.topics'),
              options: [
                { id: 'blockchain', label: 'Blockchain', checked: false },
                { id: 'defi', label: 'DeFi', checked: false },
                { id: 'nft', label: 'NFT', checked: false },
                { id: 'web3', label: 'Web3', checked: false },
              ],
            },
          ])
        }
      })
      .catch(() => {
        // Network error -> fallback defaults
        setSections([
          {
            id: 'topics',
            title: t(locale, 'common.topics'),
            options: [
              { id: 'blockchain', label: 'Blockchain', checked: false },
              { id: 'defi', label: 'DeFi', checked: false },
              { id: 'nft', label: 'NFT', checked: false },
              { id: 'web3', label: 'Web3', checked: false },
            ],
          },
        ])
      })
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <MultiSelectBase locale={locale} sections={sections} onSectionsChange={setSections} changedEventName="filter:changed" clearEventNames={['filter:clear-all']} />;
}
