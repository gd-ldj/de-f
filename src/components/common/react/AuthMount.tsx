import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import ShareSection from '@/components/article/react/ShareSection';
import AuthorSection from '@/components/article/react/AuthorSection';
import Login from '@/components/home/react/Login';
import type { Locale } from '@/types';
import { MULTI_SOURCE_CONFIG, STORAGE_KEYS } from '@/config/constants';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '@/stores';
import { ToastContainer } from '@/components/common/react/Toast';
import { AUTH_CLIENT_OPEN_EVENT } from '@/lib/auth-client-events';
import type { AuthClientOpenMode } from '@/lib/auth-client-events';

export interface AuthMountProps {
  userButtonTargetId?: string;
  loginTargetId?: string;
  shareTargetId?: string;
  shareMobileTargetId?: string;
  shareSection?: {
    locale: Locale;
    title: string;
    url: string;
    articleId?: string;
  };
  authorTargetId?: string;
  authorSection?: {
    author: {
      id?: string;
      name: string;
      bio?: string;
      avatar?: string;
      twitter?: string;
      email?: string;
    };
    locale: Locale;
  };
}

export interface AuthMountClientProps extends AuthMountProps {
  autoOpenMode?: AuthClientOpenMode | null;
  onAutoOpenHandled?: () => void;
}

function getLocaleFromURL(): Locale {
  if (typeof window === 'undefined') return 'en';
  const hostname = window.location.hostname;
  const sourceLanguage = MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(hostname);
  return MULTI_SOURCE_CONFIG.languageToLocale(sourceLanguage);
}

const AuthMount: React.FC<AuthMountProps> = (props) => {
  const {
    userButtonTargetId = 'user-button-root',
    loginTargetId = 'login-root',
    shareTargetId = 'share-section-root',
    shareMobileTargetId,
    shareSection,
    authorTargetId = 'author-section-root',
    authorSection,
  } = props;

  const [userButtonEl, setUserButtonEl] = useState<HTMLElement | null>(null);
  const [loginEl, setLoginEl] = useState<HTMLElement | null>(null);
  const [shareEl, setShareEl] = useState<HTMLElement | null>(null);
  const [shareMobileEl, setShareMobileEl] = useState<HTMLElement | null>(null);
  const [authorEl, setAuthorEl] = useState<HTMLElement | null>(null);
  const [locale, setLocale] = useState<Locale>('en');
  const [clerkMounted, setClerkMounted] = useState(false);
  const [pendingAutoOpenMode, setPendingAutoOpenMode] = useState<AuthClientOpenMode | null>(null);
  const [AuthMountClientComponent, setAuthMountClientComponent] = useState<React.ComponentType<AuthMountClientProps> | null>(null);

  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  const domElements = useMemo(() => {
    if (typeof window === 'undefined') return null;

    return {
      userButton: document.getElementById(userButtonTargetId),
      login: document.getElementById(loginTargetId),
      share: document.getElementById(shareTargetId),
      shareMobile: document.getElementById(shareMobileTargetId || ''),
      author: document.getElementById(authorTargetId),
    };
  }, [userButtonTargetId, loginTargetId, shareTargetId, shareMobileTargetId, authorTargetId]);

  useEffect(() => {
    if (!domElements) return;

    setUserButtonEl(domElements.userButton);
    setLoginEl(domElements.login);
    setShareEl(domElements.share);
    setShareMobileEl(domElements.shareMobile);
    setAuthorEl(domElements.author);
    setLocale(getLocaleFromURL());

    if (import.meta.env.DEV) {
      console.log('[AuthMount] hydrated. Elements found:', domElements);
    }
  }, [domElements]);

  useEffect(() => {
    if (!shareMobileTargetId || typeof window === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type !== 'childList') return;

        const mobileContainer = document.getElementById(shareMobileTargetId);
        if (mobileContainer && !shareMobileEl) {
          setShareMobileEl(mobileContainer);
          return;
        }

        if (!mobileContainer && shareMobileEl) {
          setShareMobileEl(null);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const existingContainer = document.getElementById(shareMobileTargetId);
    if (existingContainer && !shareMobileEl) {
      setShareMobileEl(existingContainer);
    }

    return () => observer.disconnect();
  }, [shareMobileEl, shareMobileTargetId]);

  const shouldMountClerkEagerly = useMemo(() => {
    if (typeof window === 'undefined') return false;

    const hasStoredSession =
      Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) &&
      Boolean(localStorage.getItem(STORAGE_KEYS.USER_ID));

    // Also check for Clerk session cookies to detect cases where
    // localStorage was cleared but the Clerk session persists
    const hasClerkSession =
      document.cookie.includes('__session=') ||
      document.cookie.includes('__client_uat=');

    return hasStoredSession || hasClerkSession || isAuthenticated;
  }, [isAuthenticated]);

  const loadAuthMountClient = useCallback(async (): Promise<React.ComponentType<AuthMountClientProps>> => {
    if (AuthMountClientComponent) {
      return AuthMountClientComponent;
    }

    const module = await import('./AuthMountClient');
    setAuthMountClientComponent(() => module.default);
    return module.default;
  }, [AuthMountClientComponent]);

  const mountClerkClient = useCallback(
    async (autoOpenMode: AuthClientOpenMode | null) => {
      if (autoOpenMode) {
        setPendingAutoOpenMode(autoOpenMode);
      }

      try {
        await loadAuthMountClient();
        setClerkMounted(true);
      } catch (error) {
        console.error('[AuthMount] Failed to load Clerk client:', error);
        if (autoOpenMode) {
          setPendingAutoOpenMode(null);
        }
      }
    },
    [loadAuthMountClient],
  );

  useEffect(() => {
    if (!shouldMountClerkEagerly || clerkMounted) return;
    void mountClerkClient(null);
  }, [shouldMountClerkEagerly, clerkMounted, mountClerkClient]);

  const handleDeferredUserButtonActivation = useCallback(() => {
    if (pendingAutoOpenMode || clerkMounted) return;
    void mountClerkClient('user-button');
  }, [pendingAutoOpenMode, clerkMounted, mountClerkClient]);

  const handleAutoOpenHandled = useCallback(() => {
    setPendingAutoOpenMode(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOpenRequest = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: AuthClientOpenMode }>).detail;
      const requestedMode = detail?.mode ?? 'sign-in';

      if (clerkMounted) {
        setPendingAutoOpenMode(requestedMode);
        return;
      }

      if (pendingAutoOpenMode) return;
      void mountClerkClient(requestedMode);
    };

    window.addEventListener(AUTH_CLIENT_OPEN_EVENT, handleOpenRequest as EventListener);
    return () => {
      window.removeEventListener(AUTH_CLIENT_OPEN_EVENT, handleOpenRequest as EventListener);
    };
  }, [clerkMounted, pendingAutoOpenMode, mountClerkClient]);

  useEffect(() => {
    if (!userButtonEl || clerkMounted) return;

    const fallbackButton = userButtonEl.querySelector('button');
    if (!(fallbackButton instanceof HTMLButtonElement)) return;

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      handleDeferredUserButtonActivation();
    };

    fallbackButton.addEventListener('click', handleClick);
    return () => fallbackButton.removeEventListener('click', handleClick);
  }, [userButtonEl, clerkMounted, handleDeferredUserButtonActivation]);

  const publicLoginPortal = useMemo(() => {
    // Hide login block when Clerk is mounting or already mounted,
    // or when a stored/cookie session suggests the user is logged in,
    // to prevent layout shift during async Clerk load.
    if (!loginEl || isAuthenticated || clerkMounted || shouldMountClerkEagerly) return null;
    return createPortal(<Login locale={locale} />, loginEl);
  }, [loginEl, isAuthenticated, clerkMounted, shouldMountClerkEagerly, locale]);

  const sharePortal = useMemo(() => {
    if (!shareEl || !shareSection || clerkMounted) return null;
    return createPortal(
      <ShareSection
        locale={shareSection.locale}
        title={shareSection.title}
        url={shareSection.url}
        articleId={shareSection.articleId}
      />,
      shareEl,
    );
  }, [shareEl, shareSection, clerkMounted]);

  const shareMobilePortal = useMemo(() => {
    if (!shareMobileEl || !shareSection || clerkMounted) return null;
    return createPortal(
      <ShareSection
        locale={shareSection.locale}
        title={shareSection.title}
        url={shareSection.url}
        articleId={shareSection.articleId}
      />,
      shareMobileEl,
    );
  }, [shareMobileEl, shareSection, clerkMounted]);

  const authorPortal = useMemo(() => {
    if (!authorEl || !authorSection || clerkMounted) return null;
    return createPortal(
      <AuthorSection author={authorSection.author} locale={authorSection.locale} />,
      authorEl,
    );
  }, [authorEl, authorSection, clerkMounted]);

  return (
    <>
      <span style={{ display: 'none' }} data-auth-island="true" />

      {!clerkMounted && (
        <>
          {publicLoginPortal}
          {sharePortal}
          {shareMobilePortal}
          {authorPortal}
        </>
      )}

      {clerkMounted && AuthMountClientComponent && (
        <AuthMountClientComponent
          {...props}
          autoOpenMode={pendingAutoOpenMode}
          onAutoOpenHandled={handleAutoOpenHandled}
        />
      )}

      <ToastContainer />
    </>
  );
};

export default AuthMount;
