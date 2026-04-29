import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Login from '@/components/home/react/Login';
import { IdentityProvider } from '@/components/common/react/IdentityProvider';
import { ClerkApiTokenSync } from '@/components/common/react/ClerkApiTokenSync';
import type { Locale } from '@/types';
import { WalletPopover } from '@/components/common/react/WalletPopover';
import ShareSection from '@/components/article/react/ShareSection';
import AuthorSection from '@/components/article/react/AuthorSection';
import { accessTokenAtom, isAuthenticatedAtom } from '@/stores';
import { MULTI_SOURCE_CONFIG } from '@/config/constants';
import { UserHeaderIcon } from '@/components/common/react/header/HeaderIcons';
import { useAtom } from 'jotai';
import { useAuth, useClerk } from '@clerk/clerk-react';
import type { AuthMountClientProps } from './AuthMount';
import type { AuthClientOpenMode } from '@/lib/auth-client-events';

function getLocaleFromURL(): Locale {
  if (typeof window === 'undefined') return 'en';
  const hostname = window.location.hostname;
  const sourceLanguage = MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(hostname);
  return MULTI_SOURCE_CONFIG.languageToLocale(sourceLanguage);
}

const DeferredAuthAction: React.FC<{
  autoOpenMode: AuthClientOpenMode | null;
  ready: boolean;
  onHandled?: () => void;
}> = ({ autoOpenMode, ready, onHandled }) => {
  const clerk = useClerk();

  useEffect(() => {
    if (!ready || autoOpenMode !== 'sign-in') return;

    clerk.openSignIn();
    onHandled?.();
  }, [autoOpenMode, clerk, onHandled, ready]);

  return null;
};

const AuthMountClientContent: React.FC<AuthMountClientProps> = ({
  userButtonTargetId = 'user-button-root',
  loginTargetId = 'login-root',
  shareTargetId = 'share-section-root',
  shareMobileTargetId,
  shareSection,
  authorTargetId = 'author-section-root',
  authorSection,
  autoOpenMode = null,
  onAutoOpenHandled,
}) => {
  const [userButtonEl, setUserButtonEl] = useState<HTMLElement | null>(null);
  const [loginEl, setLoginEl] = useState<HTMLElement | null>(null);
  const [shareEl, setShareEl] = useState<HTMLElement | null>(null);
  const [shareMobileEl, setShareMobileEl] = useState<HTMLElement | null>(null);
  const [authorEl, setAuthorEl] = useState<HTMLElement | null>(null);
  const [locale, setLocale] = useState<Locale>('en');

  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [accessToken] = useAtom(accessTokenAtom);

  const { isLoaded: ready, isSignedIn } = useAuth();
  const isUserButtonActive = isAuthenticated || Boolean(accessToken) || Boolean(isSignedIn);

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
      console.log('[AuthMountClient] hydrated. Elements found:', domElements);
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
  }, [shareMobileTargetId, shareMobileEl]);

  const userButtonPortal = useMemo(() => {
    if (!userButtonEl || !ready) return null;
    return createPortal(
      <WalletPopover
        locale={locale}
        autoOpen={autoOpenMode === 'user-button'}
        onAutoOpenHandled={onAutoOpenHandled}
      >
        <button className="p-1 hover:bg-gray-100 rounded-md transition-colors outline-none" aria-label="User menu">
          <UserHeaderIcon className={`w-5 h-5 ${isUserButtonActive ? 'text-primary' : 'text-foreground'}`} />
        </button>
      </WalletPopover>,
      userButtonEl,
    );
  }, [userButtonEl, ready, locale, isUserButtonActive, autoOpenMode, onAutoOpenHandled]);

  const loginPortal = useMemo(() => {
    if (!loginEl || isAuthenticated || !ready || accessToken || isSignedIn) return null;
    return createPortal(<Login locale={locale} />, loginEl);
  }, [loginEl, isAuthenticated, locale, ready, accessToken, isSignedIn]);

  const sharePortal = useMemo(() => {
    if (!shareEl || !shareSection || !ready) return null;
    return createPortal(
      <ShareSection
        locale={shareSection.locale}
        title={shareSection.title}
        url={shareSection.url}
        articleId={shareSection.articleId}
      />,
      shareEl,
    );
  }, [shareEl, shareSection, ready]);

  const shareMobilePortal = useMemo(() => {
    if (!shareMobileEl || !shareSection || !ready) return null;
    return createPortal(
      <ShareSection
        locale={shareSection.locale}
        title={shareSection.title}
        url={shareSection.url}
        articleId={shareSection.articleId}
      />,
      shareMobileEl,
    );
  }, [shareMobileEl, shareSection, ready]);

  const authorPortal = useMemo(() => {
    if (!authorEl || !authorSection || !ready) return null;
    return createPortal(<AuthorSection author={authorSection.author} locale={authorSection.locale} />, authorEl);
  }, [authorEl, authorSection, ready]);

  return (
    <>
      <span style={{ display: 'none' }} data-auth-island="true" />
      <ClerkApiTokenSync />
      <DeferredAuthAction autoOpenMode={autoOpenMode} ready={ready} onHandled={onAutoOpenHandled} />
      {userButtonPortal}
      {loginPortal}
      {sharePortal}
      {shareMobilePortal}
      {authorPortal}
    </>
  );
};

const AuthMountClient: React.FC<AuthMountClientProps> = (props) => {
  return (
    <IdentityProvider>
      <AuthMountClientContent {...props} />
    </IdentityProvider>
  );
};

export default AuthMountClient;
