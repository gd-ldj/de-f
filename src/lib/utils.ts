import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to readable string
 * @param date - Date to format
 * @param locale - Locale for formatting
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Generate article URL with locale
 * @param locale - Current locale
 * @param slug - Article slug
 * @returns Formatted URL
 */
export function getArticleUrl(locale: string, slug: string): string {
  return `/${locale}/news/${slug}`
}

/**
 * Get locale from URL path
 * @param pathname - Current pathname
 * @returns Extracted locale
 */
export function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/')
  return segments[1] || 'us'
}

export const shortenAddress = (
  address: string,
  start?: number,
  end?: number
) => {
  if (address?.length <= 11) {
    return address
  }
  return `${address.slice(0, start || 6)}...${address.slice(-(end || 4))}`
}

export function shortenEmail(email: string, startLength: number): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return email
  }

  if (startLength < 0) {
    startLength = 0
  }

  const [username, domain] = email.split('@')

  if (username.length <= startLength) {
    return email
  }

  const shortenedUsername = username.slice(0, startLength || 5) + '...'

  return `${shortenedUsername}@${domain}`
}