import React, { useState, useRef, useEffect } from 'react'
import type { Locale } from '@/types'

export interface FilterOption {
  id: string
  label: string
  checked: boolean
}

export interface FilterSection {
  id: string
  title: string
  options: FilterOption[]
}

interface FilterDropdownProps {
  locale: Locale
  isOpen: boolean
  onToggle: () => void
  sections: FilterSection[]
  onFiltersChange: (updatedSections: FilterSection[]) => void
  onClearAll: () => void
}

/**
 * Interactive multi-select filter dropdown component
 * Provides categorized filtering options with checkboxes
 */
export default function FilterDropdown({
  locale,
  isOpen,
  onToggle,
  sections,
  onFiltersChange,
  onClearAll
}: FilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  const i18n = {
    filters: locale === 'us' ? 'Filters' : '筛选',
    clearAll: locale === 'us' ? 'CLEAR ALL' : '清空',
    apply: locale === 'us' ? 'Apply' : '应用',
    cancel: locale === 'us' ? 'Cancel' : '取消',
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onToggle])

  /**
   * Handle individual option toggle
   */
  const handleOptionToggle = (sectionId: string, optionId: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          options: section.options.map(option => 
            option.id === optionId 
              ? { ...option, checked: !option.checked }
              : option
          )
        }
      }
      return section
    })
    onFiltersChange(updatedSections)
  }

  /**
   * Handle section select all/none toggle
   */
  const handleSectionToggle = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const hasChecked = section.options.some(option => option.checked)
    const newCheckedState = !hasChecked

    const updatedSections = sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          options: s.options.map(option => ({ ...option, checked: newCheckedState }))
        }
      }
      return s
    })
    onFiltersChange(updatedSections)
  }

  /**
   * Get count of active filters
   */
  const getActiveFiltersCount = () => {
    return sections.reduce((total, section) => {
      return total + section.options.filter(option => option.checked).length
    }, 0)
  }

  if (!isOpen) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onToggle} />
      
      {/* Dropdown content */}
      <div className="absolute left-0 top-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">{i18n.filters}</span>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <button
            onClick={onClearAll}
            className="text-xs uppercase tracking-wide text-gray-500 hover:text-gray-700 transition-colors"
          >
            {i18n.clearAll}
          </button>
        </div>

        {/* Filter sections */}
        <div className="max-h-96 overflow-y-auto">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className={`p-4 ${sectionIndex !== sections.length - 1 ? 'border-b border-gray-100' : ''}`}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">{section.title}</span>
                <button
                  onClick={() => handleSectionToggle(section.id)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {section.options.some(opt => opt.checked) ? 
                    (locale === 'us' ? 'Clear' : '清空') : 
                    (locale === 'us' ? 'Select All' : '全选')
                  }
                </button>
              </div>

              {/* Section options */}
              <div className="space-y-2">
                {section.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-md p-1 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={option.checked}
                      onChange={() => handleOptionToggle(section.id, option.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onToggle}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {i18n.cancel}
          </button>
          <button
            onClick={onToggle}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            {i18n.apply}
          </button>
        </div>
      </div>
    </div>
  )
}