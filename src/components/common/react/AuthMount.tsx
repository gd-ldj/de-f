import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Login from '@/components/home/react/Login';
import { IdentityProvider } from '@/components/common/react/IdentityProvider';
import type { Locale } from '@/types';
import { WalletPopover } from '@/components/common/react/WalletPopover';
import { Wallet } from '@/components/common/react/ConnectWallet';
import ShareSection from '@/components/article/react/ShareSection';
import AuthorSection from '@/components/article/react/AuthorSection';
import { accessTokenAtom } from '@/stores';

import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '@/stores';
import { ToastContainer } from '@/components/common/react/Toast';
import { usePrivy } from '@privy-io/react-auth';

interface AuthMountProps {
  // 用户按钮挂载点 (Header 中的用户头像按钮)
  userButtonTargetId?: string;
  loginTargetId?: string;
  // The DOM id where ShareSection should be mounted, optional
  shareTargetId?: string;
  // Props used to render ShareSection under PrivyProvider
  shareSection?: {
    locale: Locale;
    title: string;
    url: string;
  };
  // The DOM id where AuthorSection should be mounted, optional
  authorTargetId?: string;
  // Props used to render AuthorSection under PrivyProvider
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
 * Fallback to 'us' when running on server or unexpected path
 */
function getLocaleFromURL(): Locale {
  if (typeof window === 'undefined') return 'us';
  const segments = window.location.pathname.split('/');
  const seg = segments[1];
  return seg === 'asia' || seg === 'us' ? (seg as Locale) : 'us';
}

/**
 * 占位用户按钮 - 在钱包未就绪时显示
 */
const PlaceholderUserButton: React.FC = () => (
  <button className="p-1 hover:bg-gray-100 rounded-md transition-colors opacity-50 cursor-not-allowed" disabled>
    <img src="/me.svg" alt="logo" className="w-5 h-5" />
  </button>
);

/**
 * Placeholder Login Component
 * Shows a static login interface during wallet initialization
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
 * Shows a static share interface during wallet initialization
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
 * Shows a static author interface during wallet initialization
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
 * AuthMountContent - Inner component that uses Privy hooks
 * This component is rendered inside IdentityProvider to access Privy context
 */
const AuthMountContent: React.FC<AuthMountProps> = ({ userButtonTargetId = 'user-button-root', loginTargetId = 'login-root', shareTargetId = 'share-section-root', shareSection, authorTargetId = 'author-section-root', authorSection }) => {
  const [userButtonEl, setUserButtonEl] = useState<HTMLElement | null>(null);
  const [loginEl, setLoginEl] = useState<HTMLElement | null>(null);
  const [shareEl, setShareEl] = useState<HTMLElement | null>(null);
  const [authorEl, setAuthorEl] = useState<HTMLElement | null>(null);
  // Track locale for children that require it (Login, WalletPopover)
  const [locale, setLocale] = useState<Locale>('us');

  // Read global authentication state from jotai store
  // When isAuthenticated changes (login/logout), this component re-renders
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);

  // Get Privy ready state to determine when to show real components
  const { ready } = usePrivy();

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

    // Handle logout from URL parameter (ac=q)
    // handleLogoutFromURL();

    // Debug: verify hydration ran in the browser and mount points were found
    if (import.meta.env.DEV) {
      console.log('[AuthMount] hydrated. Elements found:', domElements);
    }
  }, [domElements]);

  // Memoize portals to prevent unnecessary re-renders
  // Only show real components when Privy is ready
  const userButtonPortal = useMemo(() => {
    if (!userButtonEl || !ready) return null;
    return createPortal(
      <WalletPopover locale={locale}>
        <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
          <img src="/me.svg" alt="logo" className="w-5 h-5" />
        </button>
      </WalletPopover>,
      userButtonEl
    );
  }, [userButtonEl, ready, locale]);

  const loginPortal = useMemo(() => {
    if (!loginEl || isAuthenticated || !ready || accessToken) return null;
    return createPortal(<Login locale={locale} />, loginEl);
  }, [loginEl, isAuthenticated, locale, ready, accessToken]);

  const sharePortal = useMemo(() => {
    if (!shareEl || !shareSection || !ready) return null;
    return createPortal(<ShareSection locale={shareSection.locale} title={shareSection.title} url={shareSection.url} />, shareEl);
  }, [shareEl, shareSection, ready]);

  const authorPortal = useMemo(() => {
    if (!authorEl || !authorSection || !ready) return null;
    return createPortal(<AuthorSection author={authorSection.author} locale={authorSection.locale} />, authorEl);
  }, [authorEl, authorSection, ready]);

  return (
    <>
      {/* Hidden marker ensures the island always renders some DOM so Astro hydrates on client */}
      <span style={{ display: 'none' }} data-auth-island="true" />

      {/* Render memoized portals */}
      {userButtonPortal}
      {loginPortal}
      {sharePortal}
      {authorPortal}

      {/* Global Toasts */}
      {/* Removed duplicate ToastContainer to avoid multiple portal mounts */}
      {/* <ToastContainer /> */}
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
  const [locale, setLocale] = useState<Locale>('us');
  const [privyMounted, setPrivyMounted] = useState(false);

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

  // Track when Privy provider is mounted to switch from placeholder to real components
  useEffect(() => {
    setPrivyMounted(true);
  }, []);

  // Memoize placeholder portals
  const placeholderUserButtonPortal = useMemo(() => {
    if (!userButtonEl || privyMounted) return null;
    return createPortal(<PlaceholderUserButton />, userButtonEl);
  }, [userButtonEl, privyMounted]);

  const placeholderLoginPortal = useMemo(() => {
    if (!loginEl || isAuthenticated || privyMounted) return null;
    return createPortal(<PlaceholderLogin locale={locale} />, loginEl);
  }, [loginEl, isAuthenticated, locale, privyMounted]);

  const placeholderSharePortal = useMemo(() => {
    if (!shareEl || !shareSection || privyMounted) return null;
    return createPortal(<PlaceholderShareSection locale={shareSection.locale} title={shareSection.title} url={shareSection.url} />, shareEl);
  }, [shareEl, shareSection, privyMounted]);

  const placeholderAuthorPortal = useMemo(() => {
    if (!authorEl || !authorSection || privyMounted) return null;
    return createPortal(<PlaceholderAuthorSection author={authorSection.author} locale={authorSection.locale} />, authorEl);
  }, [authorEl, authorSection, privyMounted]);

  return (
    <>
      {/* Hidden marker ensures the island always renders some DOM so Astro hydrates on client */}
      <span style={{ display: 'none' }} data-auth-island="true" />

      {/* Show placeholder components immediately while Privy is loading */}
      {!privyMounted && (
        <>
          {placeholderUserButtonPortal}
          {placeholderLoginPortal}
          {placeholderSharePortal}
          {placeholderAuthorPortal}
        </>
      )}

      {/* Mount Privy provider and real components */}
      {privyMounted && (
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
