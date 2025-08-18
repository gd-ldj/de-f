import React, { useMemo, useState, useEffect } from 'react'
import type { Locale } from '@/types'
import FilterDropdown, { type FilterSection } from './FilterDropdown'

export interface FilterMultiSelectProps {
  locale: Locale
}

/**
 * FilterMultiSelect
 * A small React island that renders the "Filters" trigger UI and a multi-select dropdown.
 * - Shows selected options as chips inside a bordered box to match the provided design
 * - Manages dropdown open/close state and selection state internally
 * - Emits no network requests; purely client-side presentation for now
 * - Listens for global 'filter:clear-all' events to reset all selections
 */
export default function FilterMultiSelect({ locale }: FilterMultiSelectProps) {
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
  ])

  const [open, setOpen] = useState(false)

  const i18n = {
    filters: locale === 'us' ? 'Filters' : '筛选',
    clearAll: locale === 'us' ? 'CLEAR ALL' : '清空',
  }

  /** Count selected options across all sections */
  const countSelected = (ss: FilterSection[]): number => {
    return ss.reduce((acc, s) => acc + s.options.filter(o => o.checked).length, 0)
  }

  /**
   * Clear all selections in every section
   */
  const handleClearAll = () => {
    setSections((prev) => prev.map((s) => ({ ...s, options: s.options.map((o) => ({ ...o, checked: false })) })))
  }

  /**
   * Listen for global clear-all events from FilterBar CLEAR ALL button
   */
  useEffect(() => {
    const handleGlobalClear = () => {
      handleClearAll()
      setOpen(false) // Also close dropdown if open
      console.debug('[FilterMultiSelect] Received global clear event')
    }

    document.addEventListener('filter:clear-all', handleGlobalClear)
    
    return () => {
      document.removeEventListener('filter:clear-all', handleGlobalClear)
    }
  }, [])

  /**
   * Dispatch global event when selection changes to inform outer UI (e.g., CLEAR ALL button)
   */
  useEffect(() => {
    const selectedCount = countSelected(sections)
    const hasSelection = selectedCount > 0
    document.dispatchEvent(new CustomEvent('filter:changed', { detail: { selectedCount, hasSelection } }))
  }, [sections])

  /**
   * Compute selected options across all sections for chips rendering
   */
  const selectedOptions = useMemo(() => {
    return sections.flatMap((s) => s.options.filter((o) => o.checked).map((o) => ({ ...o, sectionId: s.id })))
  }, [sections])

  /**
   * Toggle an individual chip (remove = uncheck)
   */
  const handleRemoveChip = (sectionId: string, optionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, options: s.options.map((o) => (o.id === optionId ? { ...o, checked: false } : o)) }
          : s
      )
    )
  }

  return (
    <div className="relative flex items-center space-x-3 pr-4">
      {/* Left: Icon + Filters label removed - now shown as static in FilterBar */}

      {/* Selected chips + chevron trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center flex-wrap gap-2 border rounded-md px-3 py-2 min-h-[36px] transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          open ? 'border-primary/60' : 'border-border hover:border-foreground/30'
        }`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {/* Chips */}
        {selectedOptions.length > 0 ? (
          selectedOptions.map((o) => (
            <span key={o.id} className="inline-flex items-center gap-1 bg-primary/5 text-primary border border-primary/40 rounded-sm px-2 py-1 text-xs">
              {o.label}
              <svg
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveChip(o.sectionId!, o.id)
                }}
                className="w-3 h-3 stroke-current/70 hover:stroke-current cursor-pointer"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">{locale === 'us' ? 'No filters' : '未选择筛选'}</span>
        )}

        {/* Chevron */}
        <svg className={`w-4 h-4 text-muted-foreground ml-2 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Dropdown */}
      <div className="absolute left-0 top-[110%] z-50">
        <FilterDropdown
          locale={locale}
          isOpen={open}
          onToggle={() => setOpen(false)}
          sections={sections}
          onFiltersChange={setSections}
          onClearAll={handleClearAll}
        />
      </div>
    </div>
  )
}