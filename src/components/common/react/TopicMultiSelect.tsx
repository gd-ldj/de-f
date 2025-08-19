import React, { useState } from 'react';
import type { Locale } from '@/types';
import MultiSelectBase from './MultiSelectBase';
import type { FilterSection } from './FilterDropdown';

export interface TopicMultiSelectProps {
  locale: Locale;
}

/**
 * TopicMultiSelect
 * A thin wrapper around MultiSelectBase specifically for filter options.
 * Maintains the same interface as before while leveraging the shared implementation.
 */
export default function TopicMultiSelect({ locale }: TopicMultiSelectProps) {
  // Initialize filter sections with example options (can be wired to real data later)
  const [sections, setSections] = useState<FilterSection[]>([
    {
      id: 'category',
      title: locale === 'us' ? 'Category' : '分类',
      options: [
        { id: 'markets', label: locale === 'us' ? 'Markets' : '市场', checked: true },
        { id: 'finance', label: locale === 'us' ? 'Finance' : '金融', checked: true },
        { id: 'policy', label: locale === 'us' ? 'Policy' : '政策', checked: true },
        { id: 'xxx1', label: 'XXX', checked: false },
        { id: 'xxx2', label: 'XXX', checked: false },
      ],
    },
  ]);

  return <MultiSelectBase locale={locale} sections={sections} onSectionsChange={setSections} changedEventName="filter:changed" clearEventNames={['filter:clear-all']} />;
}
