import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Login from '@/components/home/react/Login';
import { IdentityProvider } from '@/components/common/react/IdentityProvider';
import { ClerkApiTokenSync } from '@/components/common/react/ClerkApiTokenSync';
import type { Locale } from '@/types';
import { WalletPopover } from '@/components/common/react/WalletPopover';
import ShareSection from '@/components/article/react/ShareSection';
import AuthorSection from '@/components/article/react/AuthorSection';
import { accessTokenAtom } from '@/stores';
import { MULTI_SOURCE_CONFIG } from '@/config/constants';

import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '@/stores';
import { ToastContainer } from '@/components/common/react/Toast';
import { useAuth } from '@clerk/clerk-react';

interface AuthMountProps {
  // User button mount point (User avatar button in Header)
  userButtonTargetId?: string;
  loginTargetId?: string;
  // The DOM id where ShareSection should be mounted, optional
  shareTargetId?: string;
  shareMobileTargetId?: string;
  // Props used to render ShareSection under ClerkProvider
  shareSection?: {
    locale: Locale;
    title: string;
    url: string;
    articleId?: string;
  };
  // The DOM id where AuthorSection should be mounted, optional
  authorTargetId?: string;
  // Props used to render AuthorSection under ClerkProvider
  authorSection?: {
    author: {
      id?: string; // optional author id for follow/subscribe API
      name: string;
      bio?: string;
      avatar?: string;
      twitter?: string;
      email?: string;
    };
    locale: Locale;
  };
}

/**
 * Extract locale from current URL pathname
 * Fallback to 'en' when running on server or unexpected path
 */
function getLocaleFromURL(): Locale {
  if (typeof window === 'undefined') return 'en';
  const hostname = window.location.hostname;
  const sourceLanguage = MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(hostname);
  return MULTI_SOURCE_CONFIG.languageToLocale(sourceLanguage);
}

/**
 * Placeholder user button - shown while Clerk is loading
 */
const PlaceholderUserButton: React.FC = () => (
  <button className="p-1 hover:bg-gray-100 rounded-md transition-colors outline-none opacity-50 cursor-not-allowed" disabled>
    <img src="/me.svg" alt="logo" className="w-5 h-5" />
  </button>
);

/**
 * Placeholder Login Component
 * Shows a static login interface during Clerk initialization
 */
const PlaceholderLogin: React.FC<{ locale: Locale }> = ({ locale }) => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-pulse">
        <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );
};

/**
 * Placeholder ShareSection Component
 */
const PlaceholderShareSection: React.FC<{ title: string; url: string; locale: Locale }> = ({ title, url, locale }) => {
  return (
    <div className="flex items-center space-x-2 opacity-50">
      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
};

/**
 * Placeholder AuthorSection Component
 */
const PlaceholderAuthorSection: React.FC<{ author: any; locale: Locale }> = ({ author, locale }) => {
  return (
    <div className="flex items-center space-x-3 p-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

/**
 * AuthMountContent - Inner component that uses Clerk hooks
 * This component is rendered inside IdentityProvider to access Clerk context
 */
const AuthMountContent: React.FC<AuthMountProps> = ({ userButtonTargetId = 'user-button-root', loginTargetId = 'login-root', shareTargetId = 'share-section-root', shareMobileTargetId, shareSection, authorTargetId = 'author-section-root', authorSection }) => {
  const [userButtonEl, setUserButtonEl] = useState<HTMLElement | null>(null);
  const [loginEl, setLoginEl] = useState<HTMLElement | null>(null);
  const [shareEl, setShareEl] = useState<HTMLElement | null>(null);
  const [shareMobileEl, setShareMobileEl] = useState<HTMLElement | null>(null);
  const [authorEl, setAuthorEl] = useState<HTMLElement | null>(null);
  // Track locale for children that require it (Login, WalletPopover)
  const [locale, setLocale] = useState<Locale>('en');

  // Read global authentication state from jotai store
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);

  // Get Clerk ready state and sign-in status to determine when to show real components
  const { isLoaded: ready, isSignedIn } = useAuth();

  // Memoize DOM element queries to avoid repeated lookups
  const domElements = useMemo(() => {
    if (typeof window === 'undefined') return null;

    return {
      userButton: document.getElementById(userButtonTargetId),
      login: document.getElementById(loginTargetId),
      share: document.getElementById(shareTargetId),
      shareMobile: document.getElementById(shareMobileTargetId || ''),
      author: document.getElementById(authorTargetId),
    };
  }, [userButtonTargetId, loginTargetId, shareTargetId, authorTargetId]);

  // Resolve DOM mount points on client
  useEffect(() => {
    if (!domElements) return;

    setUserButtonEl(domElements.userButton);
    setLoginEl(domElements.login);
    setShareEl(domElements.share);
    setShareMobileEl(domElements.shareMobile);
    setAuthorEl(domElements.author);

    // Update locale from URL on mount
    setLocale(getLocaleFromURL());

    // Debug: verify hydration ran in the browser and mount points were found
    if (import.meta.env.DEV) {
      console.log('[AuthMount] hydrated. Elements found:', domElements);
    }
  }, [domElements]);

  // Monitor for mobile share container appearance and disappearance using MutationObserver
  useEffect(() => {
    if (!shareMobileTargetId || typeof window === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const mobileContainer = document.getElementById(shareMobileTargetId);

          if (mobileContainer && !shareMobileEl) {
            setShareMobileEl(mobileContainer);
            if (import.meta.env.DEV) {
              console.log('[AuthMount] Mobile share container found via MutationObserver');
            }
          } else if (!mobileContainer && shareMobileEl) {
            setShareMobileEl(null);
            if (import.meta.env.DEV) {
              console.log('[AuthMount] Mobile share container removed');
            }
          }
        }
      });
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial check in case container already exists
    const existingContainer = document.getElementById(shareMobileTargetId);
    if (existingContainer && !shareMobileEl) {
      setShareMobileEl(existingContainer);
      if (import.meta.env.DEV) {
        console.log('[AuthMount] Mobile share container found on initial check');
      }
    }

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, [shareMobileTargetId, shareMobileEl]);

  // Memoize portals to prevent unnecessary re-renders
  // Only show real components when Clerk is ready
  const userButtonPortal = useMemo(() => {
    if (!userButtonEl || !ready) return null;
    return createPortal(
      <WalletPopover locale={locale}>
        <button className="p-1 hover:bg-gray-100 rounded-md transition-colors outline-none">
          <img src="/me.svg" alt="logo" className="w-5 h-5" />
        </button>
      </WalletPopover>,
      userButtonEl
    );
  }, [userButtonEl, ready, locale]);

  const loginPortal = useMemo(() => {
    if (!loginEl || isAuthenticated || !ready || accessToken || isSignedIn) return null;
    return createPortal(<Login locale={locale} />, loginEl);
  }, [loginEl, isAuthenticated, locale, ready, accessToken, isSignedIn]);

  const sharePortal = useMemo(() => {
    if (!shareEl || !shareSection || !ready) return null;
    return createPortal(<ShareSection locale={shareSection.locale} title={shareSection.title} url={shareSection.url} articleId={shareSection.articleId} />, shareEl);
  }, [shareEl, shareSection, ready]);

  // Mobile share portal - renders ShareSection to mobile container
  const shareMobilePortal = useMemo(() => {

    if (!shareMobileEl || !shareSection || !ready) return null;
    return createPortal(<ShareSection locale={shareSection.locale} title={shareSection.title} url={shareSection.url} articleId={shareSection.articleId} />, shareMobileEl);
  }, [shareMobileEl, shareSection, ready]);

  const authorPortal = useMemo(() => {
    if (!authorEl || !authorSection || !ready) return null;
    return createPortal(<AuthorSection author={authorSection.author} locale={authorSection.locale} />, authorEl);
  }, [authorEl, authorSection, ready]);

  return (
    <>
      {/* Hidden marker ensures the island always renders some DOM so Astro hydrates on client */}
      <span style={{ display: 'none' }} data-auth-island="true" />

      {/* Clerk API Token Sync - exchanges Clerk token for backend token */}
      <ClerkApiTokenSync />

      {/* Render memoized portals */}
      {userButtonPortal}
      {loginPortal}
      {sharePortal}
      {shareMobilePortal}
      {authorPortal}
    </>
  );
};

/**
 * Main AuthMount component that handles placeholder rendering and IdentityProvider
 */
const AuthMount: React.FC<AuthMountProps> = (props) => {
  const { userButtonTargetId = 'user-button-root', loginTargetId = 'login-root', shareTargetId = 'share-section-root', shareSection, authorTargetId = 'author-section-root', authorSection } = props;

  const [userButtonEl, setUserButtonEl] = useState<HTMLElement | null>(null);
  const [loginEl, setLoginEl] = useState<HTMLElement | null>(null);
  const [shareEl, setShareEl] = useState<HTMLElement | null>(null);
  const [authorEl, setAuthorEl] = useState<HTMLElement | null>(null);
  const [locale, setLocale] = useState<Locale>('en');
  const [clerkMounted, setClerkMounted] = useState(false);

  // Read global authentication state from jotai store
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  // Memoize DOM element queries to avoid repeated lookups
  const domElements = useMemo(() => {
    if (typeof window === 'undefined') return null;

    return {
      userButton: document.getElementById(userButtonTargetId),
      login: document.getElementById(loginTargetId),
      share: document.getElementById(shareTargetId),
      author: document.getElementById(authorTargetId),
    };
  }, [userButtonTargetId, loginTargetId, shareTargetId, authorTargetId]);

  // Resolve DOM mount points on client
  useEffect(() => {
    if (!domElements) return;

    setUserButtonEl(domElements.userButton);
    setLoginEl(domElements.login);
    setShareEl(domElements.share);
    setAuthorEl(domElements.author);

    // Update locale from URL on mount
    setLocale(getLocaleFromURL());

    // Debug: verify hydration ran in the browser and mount points were found
    if (import.meta.env.DEV) {
      console.log('[AuthMount] hydrated. Elements found:', domElements);
    }
  }, [domElements]);

  // Track when Clerk provider is mounted to switch from placeholder to real components
  useEffect(() => {
    setClerkMounted(true);
  }, []);

  // Memoize placeholder portals
  const placeholderUserButtonPortal = useMemo(() => {
    if (!userButtonEl || clerkMounted) return null;
    return createPortal(<PlaceholderUserButton />, userButtonEl);
  }, [userButtonEl, clerkMounted]);

  const placeholderLoginPortal = useMemo(() => {
    if (!loginEl || isAuthenticated || clerkMounted) return null;
    return createPortal(<PlaceholderLogin locale={locale} />, loginEl);
  }, [loginEl, isAuthenticated, locale, clerkMounted]);

  const placeholderSharePortal = useMemo(() => {
    if (!shareEl || !shareSection || clerkMounted) return null;
    return createPortal(<PlaceholderShareSection locale={shareSection.locale} title={shareSection.title} url={shareSection.url} />, shareEl);
  }, [shareEl, shareSection, clerkMounted]);

  const placeholderAuthorPortal = useMemo(() => {
    if (!authorEl || !authorSection || clerkMounted) return null;
    return createPortal(<PlaceholderAuthorSection author={authorSection.author} locale={authorSection.locale} />, authorEl);
  }, [authorEl, authorSection, clerkMounted]);

  return (
    <>
      {/* Hidden marker ensures the island always renders some DOM so Astro hydrates on client */}
      <span style={{ display: 'none' }} data-auth-island="true" />

      {/* Show placeholder components immediately while Clerk is loading */}
      {!clerkMounted && (
        <>
          {placeholderUserButtonPortal}
          {placeholderLoginPortal}
          {placeholderSharePortal}
          {placeholderAuthorPortal}
        </>
      )}

      {/* Mount Clerk provider and real components */}
      {clerkMounted && (
        <IdentityProvider>
          <AuthMountContent {...props} />
        </IdentityProvider>
      )}

      {/* Global Toasts - always available */}
      <ToastContainer />
    </>
  );
};

export default AuthMount;
