import React from 'react';
import { useAuth } from '@/lib/useAuth';
import type { Locale } from '@/types';

interface WalletPopoverProps {
  className?: string;
  children?: React.ReactNode;
  locale: Locale;
}

export const WalletPopover: React.FC<WalletPopoverProps> = ({ className = '', children, locale }) => {
  const { isEffectivelyLoggedIn, login } = useAuth();

  const handleClick = () => {
    if (!isEffectivelyLoggedIn) {
      login();
      return;
    }
    // Logged in: navigate directly to Dashboard
    window.open('https://caaaeee.vercel.app/' + locale, '_blank');
  };

  return (
    <div className={`relative ${className}`}>
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
    </div>
  );
};
