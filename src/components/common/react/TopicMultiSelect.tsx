import React, { useEffect, useState } from 'react';
import type { Locale, ArticleSubcategory, ArticleTag } from '@/types';
import MultiSelectBase from './MultiSelectBase';
import type { FilterSection } from './FilterDropdown';
import { fetchArticleSubcategories, fetchArticleTags } from '@/api/articles';
import { createTranslator } from '@/lib/i18n';

export interface TopicMultiSelectProps {
  locale: Locale;
  initialValues?: string | string[];
  placeholder?: string;
  parentCategoryName?: string | string[];
  mode?: 'subcategory' | 'tag';
  /** Callback to notify parent when dropdown open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  onOptionsChange?: (info: { optionsCount: number; selectedCount: number }) => void;
}

/**
 * TopicMultiSelect
 * Loads tag options from backend API and renders via shared MultiSelectBase.
 * Falls back to a small set of defaults if the API fails.
 */
export default function TopicMultiSelect({ locale, initialValues, placeholder, parentCategoryName, mode = 'subcategory', onOpenChange, onOptionsChange }: TopicMultiSelectProps) {
  const t = createTranslator(locale);
  const normalizeSelectedValues = (values?: string | string[]) => {
    if (!values) return [];
    const rawValues = Array.isArray(values) ? values : values.split(',').map((v) => v.trim());
    return Array.from(new Set(rawValues.filter((value) => value)));
  };
  const mergeMissingOptions = (options: { id: string; label: string; checked: boolean }[], selectedValues: string[]) => {
    const existingLabels = new Set(options.map((option) => option.label));
    const missingOptions = selectedValues.filter((value) => !existingLabels.has(value)).map((value) => ({ id: `custom-${value}`, label: value, checked: true }));
    return missingOptions.length > 0 ? [...options, ...missingOptions] : options;
  };
  const [sections, setSections] = useState<FilterSection[]>([
    {
      id: mode === 'tag' ? 'tags' : 'subcategories',
      title: mode === 'tag' ? t('common.topics') : t('common.subcategories'),
      options: [],
    },
  ]);
  const [allSubcategories, setAllSubcategories] = useState<ArticleSubcategory[]>([]);
  const [allTags, setAllTags] = useState<ArticleTag[]>([]);

  const normalizeParentCategories = (value?: string | string[]) => {
    if (!value) return [];
    const rawValues = Array.isArray(value) ? value : value.split(',').map((v) => v.trim());
    return rawValues.filter((item) => item);
  };
  const mapTagsToOptions = (tags: ArticleTag[], selectedValues: string[] = []) => {
    const mappedOptions = tags.map((item) => ({
      id: item.id,
      label: item.name,
      checked: selectedValues.includes(item.name),
    }));
    return mergeMissingOptions(mappedOptions, selectedValues);
  };
  const mapSubcategoriesToOptions = (subcategories: ArticleSubcategory[], selectedValues: string[] = [], allowMissing: boolean = true) => {
    const mappedOptions = subcategories.map((item) => ({
      id: item.id,
      label: item.name,
      checked: selectedValues.includes(item.name),
    }));
    return allowMissing ? mergeMissingOptions(mappedOptions, selectedValues) : mappedOptions;
  };

  useEffect(() => {
    let mounted = true;
    if (mode === 'tag') {
      fetchArticleTags()
        .then((tags) => {
          if (!mounted) return;
          if (Array.isArray(tags) && tags.length > 0) {
            setAllTags(tags);
          }
        })
        .catch(() => {
          setAllTags([]);
        });
    } else {
      fetchArticleSubcategories()
        .then((subcategories) => {
          if (!mounted) return;
          if (Array.isArray(subcategories) && subcategories.length > 0) {
            setAllSubcategories(subcategories);
          }
        })
        .catch(() => {
          setAllSubcategories([]);
        });
    }
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    const selectedValues = normalizeSelectedValues(initialValues);
    if (mode === 'tag') {
      const options = mapTagsToOptions(allTags, selectedValues);
      setSections([
        {
          id: 'tags',
          title: t('common.topics'),
          options,
        },
      ]);
      onOptionsChange?.({ optionsCount: options.length, selectedCount: selectedValues.length });
    } else {
      const parentCategories = normalizeParentCategories(parentCategoryName);
      const filteredSubcategories = parentCategories.length > 0 ? allSubcategories.filter((item) => parentCategories.includes(item.parent_category_name)) : allSubcategories;
      const allowMissing = parentCategories.length === 0;
      const options = mapSubcategoriesToOptions(filteredSubcategories, selectedValues, allowMissing);
      setSections([
        {
          id: 'subcategories',
          title: t('common.subcategories'),
          options,
        },
      ]);
      onOptionsChange?.({ optionsCount: options.length, selectedCount: selectedValues.length });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSubcategories, allTags, parentCategoryName, mode]);

  const changedEventName = mode === 'tag' ? 'tag:changed' : 'subcategory:changed';
  return <MultiSelectBase locale={locale} sections={sections} onSectionsChange={setSections} changedEventName={changedEventName} clearEventNames={['filter:clear-all']} placeholder={placeholder} onOpenChange={onOpenChange} />;
}
