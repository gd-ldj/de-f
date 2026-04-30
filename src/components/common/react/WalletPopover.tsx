import React from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuth } from '@/lib/useAuth';
import { MULTI_SOURCE_CONFIG } from '@/config/constants';
import type { Locale } from '@/types';

interface WalletPopoverProps {
  className?: string;
  children?: React.ReactNode;
  locale: Locale;
  autoOpen?: boolean;
  onAutoOpenHandled?: () => void;
}

/**
 * Get the admin dashboard URL based on current environment.
 * - Production: https://{lang}-admin.detake.com
 * - Non-production: https://{lang}-dev-admin.detake.com
 */
export const getAdminDashboardUrl = (locale: Locale): string => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const lang = MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(hostname);

  // Detect if current site is in production environment
  const normalizedHostname = hostname.split(':')[0].toLowerCase();
  const isProduction =
    normalizedHostname === 'detake.com' ||
    (normalizedHostname.endsWith('.detake.com') &&
      !normalizedHostname.includes('dev') &&
      !normalizedHostname.includes('beta') &&
      !normalizedHostname.includes('preview'));

  const adminDomain = isProduction
    ? `${lang}-admin.detake.com`
    : `${lang}-dev-admin.detake.com`;

  return `https://${adminDomain}/${locale}`;
};

/**
 * Build the SSO bridge URL for auto-login on admin.
 * Falls back to direct admin URL if no Clerk token is available.
 */
export const buildAdminSsoUrl = (adminUrl: string, clerkToken: string, locale: Locale): string => {
  // Strip trailing locale segment (e.g. /en) to get the admin origin
  const adminOrigin = adminUrl.replace(/\/[a-z]{2}$/, '');
  return `${adminOrigin}/api/auth/sso?token=${encodeURIComponent(clerkToken)}&locale=${locale}`;
};

export const WalletPopover: React.FC<WalletPopoverProps> = ({
  className = '',
  children,
  locale,
  autoOpen = false,
  onAutoOpenHandled,
}) => {
  const { isEffectivelyLoggedIn, login } = useAuth();
  const { getToken } = useClerkAuth();
  const autoOpenHandledRef = React.useRef(false);

  const handleClick = React.useCallback(async () => {
    if (!isEffectivelyLoggedIn) {
      login();
      return;
    }

    const adminUrl = getAdminDashboardUrl(locale);

    try {
      const clerkToken = await getToken();
      if (clerkToken) {
        // SSO bridge: auto-login on admin via sign-in token
        window.open(buildAdminSsoUrl(adminUrl, clerkToken, locale), '_blank');
      } else {
        // Fallback: direct navigation (manual login required)
        window.open(adminUrl, '_blank');
      }
    } catch {
      // Fallback: direct navigation on error
      window.open(adminUrl, '_blank');
    }
  }, [getToken, isEffectivelyLoggedIn, locale, login]);

  React.useEffect(() => {
    if (!autoOpen || autoOpenHandledRef.current) {
      return;
    }

    autoOpenHandledRef.current = true;
    void handleClick().finally(() => {
      onAutoOpenHandled?.();
    });
  }, [autoOpen, handleClick, onAutoOpenHandled]);

  React.useEffect(() => {
    if (!autoOpen) {
      autoOpenHandledRef.current = false;
    }
  }, [autoOpen]);

  return (
    <div className={`relative ${className}`}>
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
    </div>
  );
};
