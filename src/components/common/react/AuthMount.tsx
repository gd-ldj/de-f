import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Header from '@/components/common/react/header/Index';
import Login from '@/components/home/react/Login';
import { IdentityProvider } from '@/components/common/react/IdentityProvider';
import type { Locale } from '@/types';
import { WalletPopover } from '@/components/common/react/WalletPopover';
import ShareSection from '@/components/article/react/ShareSection';
import AuthorSection from '@/components/article/react/AuthorSection';
import ToFollowList from '@/components/home/react/ToFollowList';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '@/stores';
import { ToastContainer } from '@/components/common/react/Toast';

interface AuthMountProps {
  headerTargetId?: string;
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
  // The DOM id where ToFollowList should be mounted, optional
  toFollowTargetId?: string;
  // Props used to render ToFollowList under PrivyProvider
  toFollowSection?: {
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
 * AuthMount
 *
 * A single React island that hosts Privy's IdentityProvider and renders
 * all auth-aware UI (Header, Login, ShareSection, etc.) into specific DOM mount points
 * using React portals. By keeping everything under one React root, we ensure
 * Privy's context (usePrivy) is shared across components and "ready" can be true.
 *
 * NOTE: Components that call useAuth/usePrivy MUST be rendered under this provider,
 * therefore we portal ShareSection from here so it inherits the context correctly.
 */
const AuthMount: React.FC<AuthMountProps> = ({ headerTargetId = 'header-root', loginTargetId = 'login-root', shareTargetId = 'share-section-root', shareSection, authorTargetId = 'author-section-root', authorSection, toFollowTargetId = 'to-follow-root', toFollowSection }) => {
  const [headerEl, setHeaderEl] = useState<HTMLElement | null>(null);
  const [loginEl, setLoginEl] = useState<HTMLElement | null>(null);
  const [shareEl, setShareEl] = useState<HTMLElement | null>(null);
  const [authorEl, setAuthorEl] = useState<HTMLElement | null>(null);
  const [toFollowEl, setToFollowEl] = useState<HTMLElement | null>(null);
  // Track locale for children that require it (Login, WalletPopover)
  const [locale, setLocale] = useState<Locale>('us');

  // Read global authentication state from jotai store
  // When isAuthenticated changes (login/logout), this component re-renders
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  // Memoize DOM element queries to avoid repeated lookups
  const domElements = useMemo(() => {
    if (typeof window === 'undefined') return null;

    return {
      header: document.getElementById(headerTargetId),
      login: document.getElementById(loginTargetId),
      share: document.getElementById(shareTargetId),
      author: document.getElementById(authorTargetId),
      toFollow: document.getElementById(toFollowTargetId),
    };
  }, [headerTargetId, loginTargetId, shareTargetId, authorTargetId, toFollowTargetId]);

  // Resolve DOM mount points on client
  useEffect(() => {
    if (!domElements) return;

    setHeaderEl(domElements.header);
    setLoginEl(domElements.login);
    setShareEl(domElements.share);
    setAuthorEl(domElements.author);
    setToFollowEl(domElements.toFollow);

    // Update locale from URL on mount
    setLocale(getLocaleFromURL());

    // Debug: verify hydration ran in the browser and mount points were found
    if (import.meta.env.DEV) {
      console.log('[AuthMount] hydrated. Elements found:', domElements);
    }
  }, [domElements]);

  // Memoize user component to prevent re-renders
  const userComponent = useMemo(
    () => (
      <WalletPopover locale={locale}>
        <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
          <img src="/me.svg" alt="logo" className="w-5" />
        </button>
      </WalletPopover>
    ),
    [locale]
  );

  // Memoize portals to prevent unnecessary re-renders
  const headerPortal = useMemo(() => {
    if (!headerEl) return null;
    return createPortal(<Header userComponent={userComponent} />, headerEl);
  }, [headerEl, userComponent]);

  const loginPortal = useMemo(() => {
    if (!loginEl || isAuthenticated) return null;
    return createPortal(<Login locale={locale} />, loginEl);
  }, [loginEl, isAuthenticated, locale]);

  const sharePortal = useMemo(() => {
    if (!shareEl || !shareSection) return null;
    return createPortal(<ShareSection locale={shareSection.locale} title={shareSection.title} url={shareSection.url} />, shareEl);
  }, [shareEl, shareSection]);

  const authorPortal = useMemo(() => {
    if (!authorEl || !authorSection) return null;
    return createPortal(<AuthorSection author={authorSection.author} locale={authorSection.locale} />, authorEl);
  }, [authorEl, authorSection]);

  const toFollowPortal = useMemo(() => {
    if (!toFollowEl || !toFollowSection) return null;
    return createPortal(<ToFollowList locale={toFollowSection.locale} />, toFollowEl);
  }, [toFollowEl, toFollowSection]);

  return (
    <IdentityProvider>
      <>
        {/* Hidden marker ensures the island always renders some DOM so Astro hydrates on client */}
        <span style={{ display: 'none' }} data-auth-island="true" />

        {/* Render memoized portals */}
        {headerPortal}
        {loginPortal}
        {sharePortal}
        {authorPortal}
        {toFollowPortal}

        {/* Global Toasts */}
        <ToastContainer />
      </>
    </IdentityProvider>
  );
};

export default AuthMount;
