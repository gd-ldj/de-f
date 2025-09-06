/**
 * Article Link Manager
 * Manages dynamic article link updates based on promote code changes
 * Provides real-time updates while maintaining SSR compatibility
 */

// Configuration constants
const ARTICLE_LINK_CONFIG = {
  STORAGE_KEY_PROMOTE_CODE: 'promote_code',
  DEFAULT_PROMOTE_CODE: 'detake',
  UPDATE_THROTTLE: 100, // ms
  SELECTOR: '[data-article-link="true"]'
};

// Cache for performance optimization
let cachedPromoteCode = null;
let lastUpdateTime = 0;

/**
 * Get current promote code with error handling
 * @returns {string} Current promote code from localStorage or default
 */
function getCurrentPromoteCode() {
  try {
    return localStorage.getItem(ARTICLE_LINK_CONFIG.STORAGE_KEY_PROMOTE_CODE) || 
           ARTICLE_LINK_CONFIG.DEFAULT_PROMOTE_CODE;
  } catch (error) {
    console.warn('[ArticleLink] Failed to access localStorage:', error);
    return ARTICLE_LINK_CONFIG.DEFAULT_PROMOTE_CODE;
  }
}

/**
 * Update all article links when promoteCode changes
 * This provides real-time updates while maintaining SSR compatibility
 * Includes throttling and error handling for better performance
 */
function updateAllArticleLinks() {
  const now = Date.now();
  if (now - lastUpdateTime < ARTICLE_LINK_CONFIG.UPDATE_THROTTLE) {
    return; // Throttle updates
  }
  lastUpdateTime = now;
  
  try {
    const currentPromoteCode = getCurrentPromoteCode();
    
    // Skip update if promoteCode hasn't changed
    if (cachedPromoteCode === currentPromoteCode) {
      return;
    }
    cachedPromoteCode = currentPromoteCode;
    
    console.log('[ArticleLink] Updating all links with promoteCode:', currentPromoteCode);
    
    const links = document.querySelectorAll(ARTICLE_LINK_CONFIG.SELECTOR);
    
    links.forEach(link => {
      const slug = link.dataset.slug;
      const locale = link.dataset.locale;
      
      if (slug && locale) {
        const oldHref = link.href;
        const newUrl = `/${locale}/news/${slug}-${currentPromoteCode}`;
        link.href = newUrl;
        
        // Uncomment for debugging
        // console.log('[ArticleLink] Updated link:', {
        //   slug,
        //   locale,
        //   oldHref,
        //   newHref: newUrl,
        //   promoteCode: currentPromoteCode
        // });
      }
    });
  } catch (error) {
    console.error('[ArticleLink] Error updating links:', error);
  }
}

/**
 * Initialize article link management
 */
function initializeArticleLinkManager() {
  console.log('[ArticleLink] Initializing article link manager');
  
  // Initial update
  updateAllArticleLinks();
  
  // Listen for manual updates (when promoteCode is changed programmatically)
  window.addEventListener('promoteCodeChanged', () => {
    console.log('[ArticleLink] Manual promoteCode change detected');
    cachedPromoteCode = null; // Invalidate cache
    updateAllArticleLinks();
  });
  
  // Listen for storage changes (when promoteCode is changed in another tab)
  window.addEventListener('storage', (event) => {
    if (event.key === ARTICLE_LINK_CONFIG.STORAGE_KEY_PROMOTE_CODE) {
      console.log('[ArticleLink] Storage promoteCode change detected');
      cachedPromoteCode = null; // Invalidate cache
      updateAllArticleLinks();
    }
  });
  
  // Cleanup function for better memory management
  window.addEventListener('beforeunload', () => {
    cachedPromoteCode = null;
  });
}

/**
 * Manually trigger promote code update
 * @param {string} newPromoteCode - New promote code to set
 */
function updatePromoteCode(newPromoteCode) {
  try {
    localStorage.setItem(ARTICLE_LINK_CONFIG.STORAGE_KEY_PROMOTE_CODE, newPromoteCode);
    
    // Trigger update event
    window.dispatchEvent(new CustomEvent('promoteCodeChanged', {
      detail: { newPromoteCode }
    }));
    
    console.log('[ArticleLink] Promote code updated to:', newPromoteCode);
  } catch (error) {
    console.error('[ArticleLink] Failed to update promote code:', error);
  }
}

/**
 * Get current promote code
 * @returns {string} Current promote code
 */
function getPromoteCode() {
  return getCurrentPromoteCode();
}

// Export functions for use in other modules
window.ArticleLinkManager = {
  initialize: initializeArticleLinkManager,
  updateAllLinks: updateAllArticleLinks,
  updatePromoteCode,
  getPromoteCode,
  CONFIG: ARTICLE_LINK_CONFIG
};

// Auto-initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeArticleLinkManager);
} else {
  initializeArticleLinkManager();
}