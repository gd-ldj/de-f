import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Header from '@/components/common/react/Header';
import Login from '@/components/home/react/Login';
import { IdentityProvider } from '@/components/common/react/IdentityProvider';
import type { Locale } from '@/types';
import { WalletPopover } from '@/components/common/react/WalletPopover';

interface AuthMountProps {
  locale: Locale;
  currentPath: string;
  headerTargetId?: string;
  loginTargetId?: string;
}

/**
 * AuthMount
 *
 * A single React island that hosts Privy's IdentityProvider and renders
 * all auth-aware UI (Header, Login, etc.) into specific DOM mount points
 * using React portals. By keeping everything under one React root, we ensure
 * Privy's context (usePrivy) is shared across components and "ready" can be true.
 */
const AuthMount: React.FC<AuthMountProps> = ({
  locale,
  currentPath,
  headerTargetId = 'header-root',
  loginTargetId = 'login-root',
}) => {
  const [headerEl, setHeaderEl] = useState<HTMLElement | null>(null);
  const [loginEl, setLoginEl] = useState<HTMLElement | null>(null);

  // Resolve DOM mount points on client and log for debugging in client only
  useEffect(() => {
    const header = document.getElementById(headerTargetId);
    console.log("🚀 ~ AuthMount ~ header:", header)
    const login = document.getElementById(loginTargetId);
    setHeaderEl(header);
    setLoginEl(login);

    // Debug: verify hydration ran in the browser and mount points were found
    // This runs only on the client after hydration
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      console.log('[AuthMount] hydrated. headerEl:', header, 'loginEl:', login);
    }
  }, [headerTargetId, loginTargetId]);

  return (
    <IdentityProvider>
      <>
        {/* Hidden marker ensures the island always renders some DOM so Astro hydrates on client */}
        <span style={{ display: 'none' }} data-auth-island="true" />

        {/* Header Portal */}
        {headerEl && createPortal(
          <Header 
            locale={locale} 
            currentPath={currentPath} 
            userComponent={(
              <WalletPopover>
                <button className="p-1 hover:bg-gray-100 rounded-md transition-colors" aria-label={locale === 'us' ? 'Settings' : '设置'}>
                  <img src="/me.svg" alt="logo" className="w-6" />
                </button>
              </WalletPopover>
            )}
          />, 
          headerEl
        )}

        {/* Login Portal */}
        {loginEl && createPortal(<Login locale={locale} />, loginEl)}
      </>
    </IdentityProvider>
  );
}

export default AuthMount;