import React, { useEffect, useState } from 'react';
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
const AuthMount: React.FC<AuthMountProps> = ({
  headerTargetId = 'header-root',
  loginTargetId = 'login-root',
  shareTargetId = 'share-section-root',
  shareSection,
  authorTargetId = 'author-section-root',
  authorSection,
  toFollowTargetId = 'to-follow-root',
  toFollowSection,
}) => {
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

  // Resolve DOM mount points on client and log for debugging in client only
  useEffect(() => {
    const header = document.getElementById(headerTargetId);
    const login = document.getElementById(loginTargetId);
    const share = document.getElementById(shareTargetId);
    const author = document.getElementById(authorTargetId);
    const toFollow = document.getElementById(toFollowTargetId);
    setHeaderEl(header);
    setLoginEl(login);
    setShareEl(share);
    setAuthorEl(author);
    setToFollowEl(toFollow);

    // Update locale from URL on mount
    setLocale(getLocaleFromURL());

    // Debug: verify hydration ran in the browser and mount points were found
    // This runs only on the client after hydration
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      console.log('[AuthMount] hydrated. headerEl:', header, 'loginEl:', login, 'shareEl:', share, 'authorEl:', author, 'toFollowEl:', toFollow);
    }
  }, [headerTargetId, loginTargetId, shareTargetId, authorTargetId, toFollowTargetId]);

  return (
    <IdentityProvider>
      <>
        {/* Hidden marker ensures the island always renders some DOM so Astro hydrates on client */}
        <span style={{ display: 'none' }} data-auth-island="true" />

        {/* Header Portal */}
        {headerEl && createPortal(
          <Header 
            userComponent={(
              <WalletPopover locale={locale}>
                <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                  <img src="/me.svg" alt="logo" className="w-5" />
                </button>
              </WalletPopover>
            )}
          />, 
          headerEl
        )}

        {/* Login Portal - only render when NOT authenticated */}
        {loginEl && !isAuthenticated && createPortal(<Login locale={locale} />, loginEl)}
 
        {/* ShareSection Portal (under PrivyProvider) */}
        {/**
         * Render ShareSection only when we both have mount point and props.
         * This guarantees ShareSection has access to Privy context, fixing
         * "You need to wrap your application with the <PrivyProvider>" error.
         */}
        {shareEl && shareSection && createPortal(
          <ShareSection 
            locale={shareSection.locale}
            title={shareSection.title}
            url={shareSection.url}
          />,
          shareEl
        )}

        {/* AuthorSection Portal (under PrivyProvider) */}
        {/**
         * Render AuthorSection only when we both have mount point and props.
         * This guarantees AuthorSection has access to Privy context if needed.
         */}
        {authorEl && authorSection && createPortal(
          <AuthorSection 
            author={authorSection.author}
            locale={authorSection.locale}
          />,
          authorEl
        )}

        {/* ToFollowList Portal (under PrivyProvider) */}
        {/**
         * Render ToFollowList only when we both have mount point and props.
         * This guarantees ToFollowList has access to Privy context for useAuth hook.
         */}
        {toFollowEl && toFollowSection && createPortal(
          <ToFollowList 
            locale={toFollowSection.locale}
          />,
          toFollowEl
        )}

        {/* Global Toasts */}
        <ToastContainer />
      </>
    </IdentityProvider>
  );
}

export default AuthMount;