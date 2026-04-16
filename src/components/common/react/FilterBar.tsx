import { useState, useEffect, useRef } from 'react';
import TopicMultiSelect from '@/components/common/react/TopicMultiSelect';
import CategoryMultiSelect from '@/components/common/react/CategoryMultiSelect';
import AuthorSearchInput from '@/components/common/react/AuthorSearchInput';
import { createTranslator } from '@/lib/i18n';
import { addBusinessBreadcrumb } from '@/lib/sentry';
import type { Locale } from '@/types';

export interface FilterBarProps {
  locale: Locale;
  authorName?: string;
  viewMode?: 'list' | 'grid';
  initialCategoryName?: string | string[];
  initialSubcategoryName?: string | string[];
  initialTag?: string | string[];
  businessTypeName?: string;
}

export default function FilterBar({ locale, authorName = '', viewMode = 'grid', initialCategoryName, initialSubcategoryName, initialTag, businessTypeName }: FilterBarProps) {
  const [categoryActive, setCategoryActive] = useState(false);
  const [subcategoryActive, setSubcategoryActive] = useState(false);
  const [topicActive, setTopicActive] = useState(false);
  const [authorActive, setAuthorActive] = useState(false);
  const [anyActive, setAnyActive] = useState(false);
  const [anyDropdownOpen, setAnyDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const subcategoryFilterRef = useRef<HTMLDivElement | null>(null);
  const topicFilterRef = useRef<HTMLDivElement | null>(null);
  const [selectedCategoryValues, setSelectedCategoryValues] = useState<string | string[] | undefined>(initialCategoryName);
  const normalizeValues = (values?: string | string[]) => {
    if (!values) return [];
    const rawValues = Array.isArray(values) ? values : values.split(',').map((v) => v.trim());
    return rawValues.filter((value) => value);
  };
  const [subcategoryVisible, setSubcategoryVisible] = useState(() => normalizeValues(initialSubcategoryName).length > 0);

  // Create a translation function bound to the current locale
  const t = createTranslator(locale);

  const i18n = {
    filters: t('common.filters'),
    clearAll: t('common.clearAll'),
    category: t('common.category'),
    subcategory: t('common.subcategory'),
    topic: t('common.topic'),
    author: t('common.author'),
  };

  // Update the CLEAR ALL button disabled state
  const refreshButtonState = () => {
    const newAnyActive = categoryActive || subcategoryActive || topicActive || authorActive;
    setAnyActive(newAnyActive);
  };

  // Click handler to broadcast global clearing events to all filter widgets
  const handleClearAllFilters = () => {
    if (!anyActive) return;
    addBusinessBreadcrumb('filter.clear_all', { locale });
    // Send clear events to all filter components
    document.dispatchEvent(new CustomEvent('filter:clear-all'));
    document.dispatchEvent(new CustomEvent('category:clear-all'));
    document.dispatchEvent(new CustomEvent('author:clear'));
  };

  // Track individual dropdown states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  // Handle dropdown open state changes
  const handleCategoryOpenChange = (isOpen: boolean) => {
    setCategoryDropdownOpen(isOpen);
  };

  const handleTopicOpenChange = (isOpen: boolean) => {
    setTopicDropdownOpen(isOpen);
  };

  const handleTagOpenChange = (isOpen: boolean) => {
    setTagDropdownOpen(isOpen);
  };
  const handleSubcategoryOptionsChange = (info: { optionsCount: number; selectedCount: number }) => {
    setSubcategoryVisible(info.optionsCount > 0 || info.selectedCount > 0);
  };

  // Update anyDropdownOpen when individual states change
  useEffect(() => {
    setAnyDropdownOpen(categoryDropdownOpen || topicDropdownOpen || tagDropdownOpen);
  }, [categoryDropdownOpen, topicDropdownOpen, tagDropdownOpen]);

  useEffect(() => {
    if (topicDropdownOpen && subcategoryFilterRef.current) {
      subcategoryFilterRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest',
      });
    }
  }, [topicDropdownOpen]);

  useEffect(() => {
    if (tagDropdownOpen && topicFilterRef.current) {
      topicFilterRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest',
      });
    }
  }, [tagDropdownOpen]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    refreshButtonState();
  }, [categoryActive, subcategoryActive, topicActive, authorActive]);

  useEffect(() => {
    // Listen to filter changes from children and recompute the button state
    const handleCategoryChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent && customEvent.detail !== undefined ? customEvent.detail : {};
      setCategoryActive(Boolean(detail.hasSelection));
      const selectedValues = detail.selectedValues;
      if (Array.isArray(selectedValues) && selectedValues.length > 0) {
        setSelectedCategoryValues(selectedValues);
      } else {
        setSelectedCategoryValues('');
      }
    };

    const handleTopicChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent && customEvent.detail !== undefined ? customEvent.detail : {};
      setSubcategoryActive(Boolean(detail.hasSelection));
    };

    const handleTagChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent && customEvent.detail !== undefined ? customEvent.detail : {};
      setTopicActive(Boolean(detail.hasSelection));
    };

    const handleAuthorChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent && customEvent.detail !== undefined ? customEvent.detail : {};
      setAuthorActive(Boolean(detail.hasText));
    };

    // Add event listeners
    document.addEventListener('category:changed', handleCategoryChange as EventListener);
    document.addEventListener('subcategory:changed', handleTopicChange as EventListener);
    document.addEventListener('tag:changed', handleTagChange as EventListener);
    document.addEventListener('author:changed', handleAuthorChange as EventListener);

    return () => {
      // Cleanup event listeners
      document.removeEventListener('category:changed', handleCategoryChange as EventListener);
      document.removeEventListener('subcategory:changed', handleTopicChange as EventListener);
      document.removeEventListener('tag:changed', handleTagChange as EventListener);
      document.removeEventListener('author:changed', handleAuthorChange as EventListener);
    };
  }, []);

  return (
    <div className="bg-white px-4 md:px-0 pb-2 md:pb-0 border-b md:border border-border">
      {/* Mobile Layout */}
      {isMobile && (
        <div className="md:hidden">
          {/* Mobile Filter Header */}
          <div className="flex items-center justify-between md:px-4 py-3 md:border-b border-border">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-foreground/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z"></path>
              </svg>
              <span className="text-sm font-medium">{i18n.filters}</span>
            </div>
            <button className={`pr-4 md:pr-0 text-xs uppercase tracking-wide font-medium transition-colors ${anyActive ? 'text-primary hover:text-primary/80' : 'text-muted-foreground cursor-not-allowed'}`} aria-label={i18n.clearAll} disabled={!anyActive} onClick={handleClearAllFilters}>
              {i18n.clearAll}
            </button>
          </div>

          {/* Mobile Filter Content - Horizontal Scrollable Layout */}
          <div className="md:px-4 py-3 overflow-visible">
            <div ref={mobileScrollRef} className={`flex space-x-4 scrollbar-hide overflow-x-auto overflow-y-visible ${anyDropdownOpen ? '' : ''}`}>
              {/* Category Filter */}
              <div className="flex-shrink-0">
                <CategoryMultiSelect locale={locale} initialValues={initialCategoryName} placeholder={i18n.category} onOpenChange={handleCategoryOpenChange} businessTypeName={businessTypeName} />
              </div>

              {/* Topic Filter */}
              <div className={`flex-shrink-0 ${subcategoryVisible ? '' : 'hidden'}`} ref={subcategoryFilterRef}>
                <TopicMultiSelect locale={locale} initialValues={initialSubcategoryName} placeholder={i18n.subcategory} parentCategoryName={selectedCategoryValues} onOpenChange={handleTopicOpenChange} mode="subcategory" onOptionsChange={handleSubcategoryOptionsChange} />
              </div>

              <div className="flex-shrink-0" ref={topicFilterRef}>
                <TopicMultiSelect locale={locale} initialValues={initialTag} placeholder={i18n.topic} onOpenChange={handleTagOpenChange} mode="tag" />
              </div>

              {/* Author Filter */}
              <div className="flex-shrink-0 ">
                <AuthorSearchInput locale={locale} defaultValue={authorName} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="hidden md:flex items-center px-4 py-3">
          <div className="flex items-center flex-1 min-w-0">
            {/* Static Filters label */}
            <div className="flex items-center justify-center space-x-3 ">
              <div className="flex items-center justify-center space-x-1">
                <svg className="w-4 h-4 text-foreground/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z"></path>
                </svg>
                <span className="text-sm font-medium">{i18n.filters}</span>
              </div>
              <button className={`text-[12px] uppercase tracking-wide font-medium transition-colors ${anyActive ? 'text-primary hover:text-primary/80' : 'text-muted-foreground cursor-not-allowed'}`} aria-label={i18n.clearAll} disabled={!anyActive} onClick={handleClearAllFilters}>
                {i18n.clearAll}
              </button>
            </div>

            <div className="h-6 w-px bg-border mx-4"></div>

            {/* Category multi-level selector */}
            <div className="flex items-center justify-center space-x-2 pr-4">
              <span className="text-sm text-muted-foreground">{i18n.category}</span>
              <CategoryMultiSelect locale={locale} initialValues={initialCategoryName} businessTypeName={businessTypeName} />
            </div>

            <div className={subcategoryVisible ? 'h-6 w-px bg-border mx-4' : 'hidden'}></div>

            <div className={subcategoryVisible ? 'flex items-center justify-center space-x-2 pr-4' : 'hidden'}>
              <span className="text-sm text-muted-foreground">{i18n.subcategory}</span>
              <TopicMultiSelect locale={locale} initialValues={initialSubcategoryName} parentCategoryName={selectedCategoryValues} mode="subcategory" onOptionsChange={handleSubcategoryOptionsChange} />
            </div>

            <div className={subcategoryVisible ? 'h-6 w-px bg-border mx-4' : 'hidden'}></div>

            <div className="flex items-center justify-center space-x-2 pr-4">
              <span className="text-sm text-muted-foreground">{i18n.topic}</span>
              <TopicMultiSelect locale={locale} initialValues={initialTag} mode="tag" />
            </div>

            <div className="h-6 w-px bg-border mx-4"></div>

            <div className="flex items-center justify-center space-x-2 pr-4">
              <span className="text-sm text-muted-foreground">{i18n.author}</span>
              <AuthorSearchInput locale={locale} defaultValue={authorName} />
            </div>

            <div className="h-6 w-px bg-border mx-4"></div>
          </div>

          {/* Right: view toggles */}
          <div className="flex items-center space-x-4">
            {/* <div className="flex overflow-hidden rounded-md border border-border">
            <button className={`p-2 ${viewMode === 'list' ? 'bg-secondary' : 'bg-white hover:bg-accent'}`} aria-label="List view">
              <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <div className="w-px bg-border"></div>
            <button className={`p-2 ${viewMode === 'grid' ? 'bg-secondary' : 'bg-white hover:bg-accent'}`} aria-label="Grid view">
              <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"></path>
              </svg>
            </button>
          </div> */}
          </div>
        </div>
      )}
    </div>
  );
}
