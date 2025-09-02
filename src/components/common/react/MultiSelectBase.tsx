import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Locale } from '@/types';
import FilterDropdown, { type FilterSection } from './FilterDropdown';
import { createTranslator } from '@/lib/i18n';

export interface MultiSelectBaseProps {
  locale: Locale;
  sections: FilterSection[];
  onSectionsChange: (sections: FilterSection[]) => void;
  /** Optional label shown before the trigger button (e.g., "Category") */
  leadingLabel?: string;
  /** Placeholder text shown when no options are selected */
  placeholder?: string;
  /** Custom DOM event name to dispatch on selection changes (e.g., 'filter:changed', 'category:changed') */
  changedEventName?: string;
  /** List of DOM event names to listen for clearing (e.g., ['filter:clear-all']) */
  clearEventNames?: string[];
  /** Callback to notify parent when dropdown open state changes */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * MultiSelectBase
 * A generic, reusable multi-select trigger + dropdown component that powers both
 * TopicMultiSelect and CategoryMultiSelect. This component is presentation + UI state only;
 * data is fully controlled by the parent via `sections` and `onSectionsChange`.
 *
 * Behavior:
 * - Displays selected options inline as plain text (no chips/borders), or "None/无" when empty
 * - Opens a dropdown (FilterDropdown) where clicking an option toggles its checked state
 * - Dispatches a custom DOM event on each selection change for outer UI sync
 * - Listens to one or more global clear-all events and resets selections accordingly
 * - Handles click-outside to close the dropdown
 */
export default function MultiSelectBase({ locale, sections, onSectionsChange, leadingLabel, placeholder, changedEventName = 'filter:changed', clearEventNames = ['filter:clear-all'], onOpenChange }: MultiSelectBaseProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * Count selected options across all sections
   */
  const countSelected = (ss: FilterSection[]): number => {
    return ss.reduce((acc, s) => acc + s.options.filter((o) => o.checked).length, 0);
  };

  /**
   * Handle global clear-all events by unchecking all options and notifying parent
   */
  const clearAll = () => {
    const cleared = sections.map((s) => ({
      ...s,
      options: s.options.map((o) => ({ ...o, checked: false })),
    }));
    onSectionsChange(cleared);
  };

  // Listen for external clear-all events
  useEffect(() => {
    const handler = () => {
      clearAll();
      setOpen(false);
      console.debug('[MultiSelectBase] Received global clear event');
    };

    clearEventNames.forEach((evt) => document.addEventListener(evt, handler));
    return () => {
      clearEventNames.forEach((evt) => document.removeEventListener(evt, handler));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, onSectionsChange, clearEventNames]);

  /**
   * Dispatch custom event when selection changes to inform outer UI (e.g., CLEAR ALL button)
   */
  useEffect(() => {
    const selectedCount = countSelected(sections);
    const hasSelection = selectedCount > 0;
    const selectedValues = sections.flatMap((s) => s.options.filter((o) => o.checked).map((o) => o.label));
    document.dispatchEvent(new CustomEvent(changedEventName, { detail: { selectedCount, hasSelection, selectedValues } }));
  }, [sections, changedEventName]);

  /**
   * Compute selected options across all sections for inline rendering
   */
  const selectedOptions = useMemo(() => {
    return sections.flatMap((s) => s.options.filter((o) => o.checked).map((o) => ({ ...o, sectionId: s.id })));
  }, [sections]);

  /**
   * Notify parent when dropdown open state changes
   */
  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  /**
   * Handle click outside to close the dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative flex items-center space-x-3 pr-4 border border-border md:border-0 rounded md:rounded-none px-3 py-2 md:px-0 md:py-0" ref={rootRef}>
      {leadingLabel ? <span className="text-sm text-muted-foreground">{leadingLabel}</span> : null}

      {/* Trigger as plain text list, mobile has border, desktop no border */}
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 px-0 py-1 text-foreground hover:text-primary transition-colors focus:outline-none flex-1" aria-expanded={open} aria-haspopup="dialog">
        {/* Selected labels inline or placeholder */}
        {selectedOptions.length > 0 ? (
          <div className="flex items-center gap-4">
            {selectedOptions.map((o) => (
              <span key={o.id} className="text-sm text-primary font-medium">
                {o.label}
              </span>
            ))}
          </div>
        ) : (
          placeholder && <span className="text-sm text-muted-foreground">{placeholder}</span>
        )}

        {/* Chevron */}
        <svg className={`w-4 h-4 text-muted-foreground ml-2 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Dropdown */}
      <div className="absolute left-0 top-[110%] z-50">
        <FilterDropdown locale={locale} isOpen={open} onToggle={() => setOpen(false)} sections={sections} onFiltersChange={onSectionsChange} />
      </div>
    </div>
  );
}
