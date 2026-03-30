import React from 'react';
import { useAuth } from '@/lib/useAuth';
import { MULTI_SOURCE_CONFIG } from '@/config/constants';
import type { Locale } from '@/types';

interface WalletPopoverProps {
  className?: string;
  children?: React.ReactNode;
  locale: Locale;
}

/**
 * Get the admin dashboard URL based on current environment.
 * - Production: https://{lang}-admin.detake.com
 * - Non-production: https://{lang}-dev-admin.detake.com
 */
const getAdminDashboardUrl = (locale: Locale): string => {
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

export const WalletPopover: React.FC<WalletPopoverProps> = ({ className = '', children, locale }) => {
  const { isEffectivelyLoggedIn, login } = useAuth();

  const handleClick = () => {
    if (!isEffectivelyLoggedIn) {
      login();
      return;
    }
    // Logged in: navigate directly to Dashboard
    window.open(getAdminDashboardUrl(locale), '_blank');
  };

  return (
    <div className={`relative ${className}`}>
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
    </div>
  );
};
