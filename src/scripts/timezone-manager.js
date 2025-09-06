/**
 * Timezone Manager
 * Global timezone management for SSR to client-side conversion
 * Automatically updates all date displays to user's local timezone
 */

// Configuration constants
const TIMEZONE_CONFIG = {
  DEFAULT_TIMEZONE: 'America/New_York',
  SELECTOR: '[data-date]',
  LOCALE_MAPPING: {
    'asia': 'zh-CN',
    'us': 'en-US'
  },
  DEFAULT_LOCALE: 'us'
};

/**
 * Get user's timezone from browser
 * @returns {string} User's timezone string
 */
function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('[Timezone] Failed to get user timezone:', error);
    return TIMEZONE_CONFIG.DEFAULT_TIMEZONE;
  }
}

/**
 * Check if user's timezone is different from default
 * @param {string} userTimezone - User's timezone
 * @returns {boolean} True if different from default timezone
 */
function isTimezoneDifferent(userTimezone) {
  return userTimezone !== TIMEZONE_CONFIG.DEFAULT_TIMEZONE;
}

/**
 * Format date with user's timezone
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale for formatting ('asia' or 'us')
 * @param {string} timezone - Target timezone
 * @returns {string} Formatted date string
 */
function formatDateWithUserTimezone(dateString, locale, timezone) {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn('[Timezone] Invalid date:', dateString);
      return dateString;
    }

    // Determine locale string based on region
    const localeString = TIMEZONE_CONFIG.LOCALE_MAPPING[locale] || 
                        TIMEZONE_CONFIG.LOCALE_MAPPING[TIMEZONE_CONFIG.DEFAULT_LOCALE];
    
    // Format options
    const options = {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric'
      // Uncomment if you need time display
      // hour: '2-digit',
      // minute: '2-digit',
      // hour12: locale === 'us'
    };

    return new Intl.DateTimeFormat(localeString, options).format(date);
  } catch (error) {
    console.warn('[Timezone] Format error:', error);
    return dateString;
  }
}

/**
 * Update all timezone-aware elements on the page
 * This function runs on the client side to convert dates to user's timezone
 */
function updatePageTimezones() {
  const userTimezone = getUserTimezone();
  
  // Only update if user's timezone is different from default
  if (!isTimezoneDifferent(userTimezone)) {
    console.log('[Timezone] User timezone matches default, no update needed');
    return;
  }
  
  console.log('[Timezone] Updating page dates to user timezone:', userTimezone);

  // Find all elements with data-date attribute
  const dateElements = document.querySelectorAll(TIMEZONE_CONFIG.SELECTOR);
  
  console.log('[Timezone] Found', dateElements.length, 'date elements to update');

  dateElements.forEach((element, index) => {
    const dateString = element.getAttribute('data-date');
    const locale = element.getAttribute('data-locale') || TIMEZONE_CONFIG.DEFAULT_LOCALE;
    
    if (dateString) {
      try {
        const formattedDate = formatDateWithUserTimezone(dateString, locale, userTimezone);
        const oldText = element.textContent;
        element.textContent = formattedDate;
        
        console.log('[Timezone] Updated element', index + 1, ':', {
          dateString,
          locale,
          oldText,
          newText: formattedDate
        });
      } catch (error) {
        console.warn('[Timezone] Failed to update element date:', dateString, error);
      }
    }
  });
}

/**
 * Initialize timezone management on page load
 */
function initializeTimezoneManagement() {
  console.log('[Timezone] Initializing timezone management');
  
  // Run timezone update
  updatePageTimezones();
  
  // Listen for dynamic content changes
  if (window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
      let hasNewDateElements = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node or its children have data-date attributes
              if (node.matches && node.matches(TIMEZONE_CONFIG.SELECTOR)) {
                hasNewDateElements = true;
              } else if (node.querySelectorAll) {
                const dateElements = node.querySelectorAll(TIMEZONE_CONFIG.SELECTOR);
                if (dateElements.length > 0) {
                  hasNewDateElements = true;
                }
              }
            }
          });
        }
      });
      
      if (hasNewDateElements) {
        console.log('[Timezone] New date elements detected, updating...');
        updatePageTimezones();
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      observer.disconnect();
    });
  }
}

/**
 * Manually update timezone for specific elements
 * @param {NodeList|Element[]} elements - Elements to update
 */
function updateElementsTimezone(elements) {
  const userTimezone = getUserTimezone();
  
  if (!isTimezoneDifferent(userTimezone)) {
    return;
  }
  
  elements.forEach((element) => {
    const dateString = element.getAttribute('data-date');
    const locale = element.getAttribute('data-locale') || TIMEZONE_CONFIG.DEFAULT_LOCALE;
    
    if (dateString) {
      try {
        const formattedDate = formatDateWithUserTimezone(dateString, locale, userTimezone);
        element.textContent = formattedDate;
      } catch (error) {
        console.warn('[Timezone] Failed to update element:', error);
      }
    }
  });
}

// Export functions for use in other modules
window.TimezoneManager = {
  initialize: initializeTimezoneManagement,
  updatePageTimezones,
  updateElementsTimezone,
  formatDateWithUserTimezone,
  getUserTimezone,
  CONFIG: TIMEZONE_CONFIG
};

// Auto-initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTimezoneManagement);
} else {
  initializeTimezoneManagement();
}