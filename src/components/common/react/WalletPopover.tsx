import React, { useEffect, useRef, useState } from 'react';
import { shortenAddress } from '@/lib/utils';
import { useAuth } from '@/lib/useAuth';
import Image from './Image';
import infoIcon from '@/assets/imgs/info.svg';
import walletBlackIcon from '@/assets/imgs/wallet-black.svg';
import type { Locale } from '@/types';

interface WalletPopoverProps {
  walletAddress?: string;
  boostingBTCBalance?: number;
  btcBalance?: number;
  usd1Amount?: number;
  onDisconnect?: () => void;
  className?: string;
  children?: React.ReactNode;
  locale: Locale;
}

export const WalletPopover: React.FC<WalletPopoverProps> = ({ className = '', children, locale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { storedWalletAddress, walletAddress, login, user } = useAuth();
  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && popoverRef.current && !buttonRef.current.contains(event.target as Node) && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const togglePopover = () => {
    // Check if user is logged in
    if (!storedWalletAddress) {
      // User is not logged in, trigger login
      login();
      return;
    }
    // User is logged in, toggle popover
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={buttonRef} onClick={togglePopover}>
        {children}
      </div>

      {isOpen && storedWalletAddress && (
        <div ref={popoverRef} className="w-[280px] absolute top-full border border-border mt-1 lg:mt-2 right-0 bg-white p-2 rounded z-50 text-sm shadow-lg">
          <div className="pb-2 border-b border-[#D3D3D5]">
            <div className="h-[2.25rem] flex items-center mb-[0.25rem] px-[0.5rem] hover:bg-[#F5F6F7] rounded-[0.38rem] transition-colors cursor-pointer">
              <Image className="w-[1rem] mr-1" src={walletBlackIcon.src} alt="Wallet" />
              <span className={'text-sm text-[#4D5060]'}>{shortenAddress(walletAddress ?? '')}</span>
            </div>
          </div>

          <button className="h-[2.25rem] mt-2 w-full px-[0.5rem] text-[#4D5060] hover:bg-[#F5F6F7] rounded-[0.38rem] text-sm flex items-center justify-start" onClick={() => window.open('https://caaaeee.vercel.app/' + locale, '_blank')}>
            <Image className="mr-1 w-[1rem]" src={infoIcon.src} alt="Admin" />
            Admin Panel
          </button>
        </div>
      )}
    </div>
  );
};
