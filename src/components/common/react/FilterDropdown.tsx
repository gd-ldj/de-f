import React, { useState, useRef, useEffect } from 'react';
import type { Locale } from '@/types';

export interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

export interface FilterSection {
  id: string;
  title: string;
  options: FilterOption[];
}

interface FilterDropdownProps {
  locale: Locale;
  isOpen: boolean;
  onToggle: () => void;
  sections: FilterSection[];
  onFiltersChange: (updatedSections: FilterSection[]) => void;
}

/**
 * Interactive multi-select filter dropdown component
 * Provides categorized filtering options with checkboxes
 */
export default function FilterDropdown({ locale, isOpen, onToggle, sections, onFiltersChange }: FilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  // Prevent all scrolling except dropdown content when open on mobile
  useEffect(() => {
    if (isOpen) {
      // Check if it's mobile viewport
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Prevent scrolling on html and body
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        // Prevent touch scrolling
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      }
    } else {
      // Restore scrolling
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  /**
   * Handle individual option toggle
   */
  const handleOptionToggle = (sectionId: string, optionId: string) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          options: section.options.map((option) => (option.id === optionId ? { ...option, checked: !option.checked } : option)),
        };
      }
      return section;
    });
    onFiltersChange(updatedSections);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 md:relative" ref={dropdownRef}>
      {/* Backdrop */}
      <div className="fixed top-[30%] md:top-0 inset-0 z-40 bg-black/80 md:bg-transparent " onClick={onToggle} />

      {/* Dropdown content */}
      <div className="absolute left-0 top-2 w-screen md:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        {/* Filter sections */}
        <div className="max-h-96 overflow-y-auto">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className={`p-4 ${sectionIndex !== sections.length - 1 ? 'border-b border-gray-100' : ''}`}>
              {/* Section options */}
              <div className="space-y-1">
                {section.options.map((option) => (
                  <button key={option.id} onClick={() => handleOptionToggle(section.id, option.id)} className={`flex items-center w-full text-left px-2 py-2 rounded-md transition-colors ${option.checked ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <span className="text-sm">{option.label}</span>
                    {option.checked && (
                      <svg className="w-4 h-4 ml-auto text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
