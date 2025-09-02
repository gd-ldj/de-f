import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { Locale } from '@/types'
import { createTranslator } from '@/lib/i18n'

interface AuthorSearchInputProps {
  locale: Locale
  defaultValue?: string
  delayMs?: number
  onSearch?: (query: string) => void
  className?: string
}

/**
 * AuthorSearchInput
 * A small React island that renders a styled input for author searching with throttling.
 * - Throttles input changes to avoid excessive queries
 * - Dispatches a DOM CustomEvent("author:search", { detail: { query } }) for non-React consumers
 * - Also supports an optional onSearch callback for React consumers
 */
export default function AuthorSearchInput({
  locale,
  defaultValue = '',
  delayMs = 400,
  onSearch,
  className = ''
}: AuthorSearchInputProps) {
  const t = createTranslator(locale);
  const [value, setValue] = useState<string>(defaultValue)

  // Store throttle metadata in refs to preserve values across renders without re-creating timers
  const lastRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Trigger the search side-effects (CustomEvent + optional callback)
   * This isolates side-effects from the throttle machinery for clarity and testability.
   */
  const fireSearch = (query: string) => {
    // Dispatch a DOM event so Astro or vanilla scripts can listen easily
    document.dispatchEvent(new CustomEvent('author:search', { detail: { query } }))
    // Optional React consumer callback
    onSearch?.(query)
  }

  /**
   * Throttled executor: schedules or invokes fireSearch at most once per delay window.
   * - Leading suppression with trailing execution ensures we get the latest value while typing
   */
  const throttledFire = useMemo(() => {
    return (query: string) => {
      const now = Date.now()
      const remaining = delayMs - (now - lastRef.current)

      if (remaining <= 0) {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
        lastRef.current = now
        fireSearch(query)
      } else if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          lastRef.current = Date.now()
          timerRef.current = null
          fireSearch(query)
        }, remaining)
      }
    }
  }, [delayMs])

  useEffect(() => {
    // Sync external default value changes (e.g. when coming from server-rendered prop)
    setValue(defaultValue)
  }, [defaultValue])

  /**
   * Handle input change and route through the throttle executor.
   */
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const q = e.target.value
    setValue(q)
    throttledFire(q.trim())
    // Announce author input present/empty for outer CLEAR ALL enable/disable
    const hasText = q.trim().length > 0
    document.dispatchEvent(new CustomEvent('author:changed', { detail: { hasText } }))
  }

  /**
   * Listen global clear events to reset the input immediately.
   * - author:clear: explicit author-only clearing (from FilterBar CLEAR ALL or specific action)
   * - filter:clear-all: global clearing should also reset this input
   */
  useEffect(() => {
    const clearAuthorInput = () => {
      // Cancel pending trailing throttle to avoid firing stale queries
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      lastRef.current = 0
      setValue('')
      // Fire an empty query so consumers can reload data accordingly
      fireSearch('')
      // Also announce no text for outer UI state
      document.dispatchEvent(new CustomEvent('author:changed', { detail: { hasText: false } }))
    }

    document.addEventListener('author:clear', clearAuthorInput)
    document.addEventListener('filter:clear-all', clearAuthorInput)

    return () => {
      document.removeEventListener('author:clear', clearAuthorInput)
      document.removeEventListener('filter:clear-all', clearAuthorInput)
    }
  }, [])

  const placeholder = t('common.inputAuthor');

  return (
    <div className={`relative ${className}`}>
      <input type="text" value={value} onChange={handleChange} className="text-sm text-foreground bg-transparent border border-border md:border-0 md:border-b placeholder:text-muted-foreground/70 focus:outline-none focus:border-2 focus:border-primary md:focus:border-b-2 md:focus:border-primary p-3" placeholder={placeholder} aria-label={placeholder} />
    </div>
  );
}