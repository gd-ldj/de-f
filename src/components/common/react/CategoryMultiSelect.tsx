import React, { useState, useRef, useEffect } from 'react'
import type { Locale } from '@/types'

export interface CategoryOption {
  id: string
  label: string
  checked: boolean
  children?: CategoryOption[]
}

interface CategoryMultiSelectProps {
  locale: Locale
  categories: CategoryOption[]
  onCategoriesChange: (categories: CategoryOption[]) => void
  activeSubcategory?: string
}

/**
 * Multi-level category selector with dropdown
 * Supports nested subcategories with independent selection
 * - Listens for global 'category:clear-all' and 'filter:clear-all' events to reset
 */
export default function CategoryMultiSelect({
  locale,
  categories,
  onCategoriesChange,
  activeSubcategory
}: CategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  // Local state to ensure immediate UI updates on selection
  const [localCategories, setLocalCategories] = useState<CategoryOption[]>(categories)

  // Sync local state when parent props change (e.g., route/locale switch)
  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  const i18n = {
    category: locale === 'us' ? 'Category' : '分类',
    selectAll: locale === 'us' ? 'Select All' : '全选',
    clear: locale === 'us' ? 'Clear' : '清空',
    apply: locale === 'us' ? 'Apply' : '应用',
    cancel: locale === 'us' ? 'Cancel' : '取消',
  }

  // Clear helper
  const clearCategories = (cats: CategoryOption[]): CategoryOption[] => {
    return cats.map(cat => ({
      ...cat,
      checked: false,
      children: cat.children ? clearCategories(cat.children) : undefined
    }))
  }

  /**
   * Compute selected count in the tree
   */
  const countSelected = (cats: CategoryOption[]): number => {
    let count = 0
    cats.forEach(cat => {
      if (cat.checked) count += 1
      if (cat.children) count += countSelected(cat.children)
    })
    return count
  }

  /**
   * Announce selection changes globally so outer bars can react (e.g., CLEAR ALL button enable/disable)
   */
  useEffect(() => {
    const selectedCount = countSelected(localCategories)
    const hasSelection = selectedCount > 0
    document.dispatchEvent(new CustomEvent('category:changed', { detail: { selectedCount, hasSelection } }))
  }, [localCategories])

  /**
   * Listen for global clear-all events (from FilterBar)
   */
  useEffect(() => {
    const handleGlobalClear = () => {
      const cleared = clearCategories(localCategories)
      setLocalCategories(cleared)
      onCategoriesChange && onCategoriesChange(cleared)
      setIsOpen(false)
      console.debug('[CategoryMultiSelect] Received global clear event')
    }

    document.addEventListener('category:clear-all', handleGlobalClear)
    document.addEventListener('filter:clear-all', handleGlobalClear)

    return () => {
      document.removeEventListener('category:clear-all', handleGlobalClear)
      document.removeEventListener('filter:clear-all', handleGlobalClear)
    }
  }, [localCategories, onCategoriesChange])

  // Get selected categories for display
  const getSelectedCategories = () => {
    const selected: CategoryOption[] = []
    
    const collectSelected = (cats: CategoryOption[]) => {
      cats.forEach(cat => {
        if (cat.checked) {
          selected.push(cat)
        }
        if (cat.children) {
          collectSelected(cat.children)
        }
      })
    }
    
    collectSelected(localCategories)
    return selected
  }

  const selectedCategories = getSelectedCategories()

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  /**
   * Toggle category selection (and handle children)
   * This function updates local state to ensure UI responsiveness, and
   * also notifies parent via onCategoriesChange for external syncing.
   */
  const handleCategoryToggle = (categoryId: string, isParent: boolean = false) => {
    const updateCategories = (cats: CategoryOption[]): CategoryOption[] => {
      return cats.map(cat => {
        if (cat.id === categoryId) {
          const newChecked = !cat.checked
          return {
            ...cat,
            checked: newChecked,
            // If parent is toggled, toggle all children
            children: cat.children && isParent 
              ? cat.children.map(child => ({ ...child, checked: newChecked }))
              : cat.children
          }
        }
        
        if (cat.children) {
          const updatedChildren = updateCategories(cat.children)
          // Check if parent should be auto-selected based on children
          const allChildrenChecked = updatedChildren.every(child => child.checked)
          const someChildrenChecked = updatedChildren.some(child => child.checked)
          
          return {
            ...cat,
            children: updatedChildren,
            // Auto-check parent if all children are checked, uncheck if none
            checked: allChildrenChecked ? true : (someChildrenChecked ? cat.checked : false)
          }
        }
        
        return cat
      })
    }

    const updated = updateCategories(localCategories)
    setLocalCategories(updated)
    // Notify parent (optional usage)
    onCategoriesChange && onCategoriesChange(updated)
  }

  /**
   * Clear all selections
   */
  const handleClearAll = () => {
    const cleared = clearCategories(localCategories)
    setLocalCategories(cleared)
    onCategoriesChange && onCategoriesChange(cleared)
  }

  /**
   * Render category tree recursively
   */
  const renderCategoryTree = (cats: CategoryOption[], level: number = 0) => {
    return cats.map(cat => (
      <div key={cat.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors">
          <input
            type="checkbox"
            checked={cat.checked}
            onChange={() => handleCategoryToggle(cat.id, level === 0)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
          />
          <span className={`text-sm ${level === 0 ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
            {cat.label}
          </span>
          {cat.children && cat.children.length > 0 && (
            <span className="text-xs text-gray-400">
              ({cat.children.filter(c => c.checked).length}/{cat.children.length})
            </span>
          )}
        </label>
        
        {cat.children && cat.children.length > 0 && (
          <div className="mt-1">
            {renderCategoryTree(cat.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Category label and selected items display */}
      <div className="flex items-center space-x-3 pr-4">
        <span className="text-sm text-muted-foreground">{i18n.category}</span>
        
        {/* Selected categories display - show inline like the original design */}
        <div className="flex items-center space-x-3">
          {localCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryToggle(cat.id, true)}
              className={`text-sm transition-colors ${
                cat.checked || (activeSubcategory && cat.label.toLowerCase() === activeSubcategory.toLowerCase())
                  ? 'text-primary font-medium' 
                  : 'text-foreground hover:text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
          
          {/* Dropdown trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            aria-expanded={isOpen}
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{i18n.category}</span>
              {selectedCategories.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {selectedCategories.length}
                </span>
              )}
            </div>
            <button
              onClick={handleClearAll}
              className="text-xs uppercase tracking-wide text-gray-500 hover:text-gray-700 transition-colors"
            >
              {i18n.clear}
            </button>
          </div>

          {/* Category tree */}
          <div className="max-h-96 overflow-y-auto p-4">
            {renderCategoryTree(localCategories)}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {i18n.cancel}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              {i18n.apply}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}