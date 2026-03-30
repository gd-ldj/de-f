import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import Image from './Image';
import infoIcon from '@/assets/imgs/info.svg';
import type { Locale } from '@/types';

interface WalletPopoverProps {
  className?: string;
  children?: React.ReactNode;
  locale: Locale;
}

export const WalletPopover: React.FC<WalletPopoverProps> = ({ className = '', children, locale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { isEffectivelyLoggedIn, login, logout, accessToken, userId } = useAuth();

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
    if (!isEffectivelyLoggedIn) {
      login();
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={buttonRef} onClick={togglePopover}>
        {children}
      </div>

      {isOpen && isEffectivelyLoggedIn && (
        <div ref={popoverRef} className="w-[280px] absolute top-full border border-border mt-1 lg:mt-2 right-0 bg-white p-2 rounded z-50 text-sm shadow-lg">
          <div className="pb-2 border-b border-[#D3D3D5]">
            <div className="h-[2.25rem] flex items-center mb-[0.25rem] px-[0.5rem] hover:bg-[#F5F6F7] rounded-[0.38rem] transition-colors cursor-pointer">
              <span className={'text-sm text-[#4D5060]'}>
                {userId ? `ID: ${userId.slice(0, 8)}...` : 'Logged In'}
              </span>
            </div>
          </div>

          <button className="h-[2.25rem] mt-2 w-full px-[0.5rem] text-[#4D5060] hover:bg-[#F5F6F7] rounded-[0.38rem] text-sm flex items-center justify-start" onClick={() => window.open('https://caaaeee.vercel.app/' + locale, '_blank')}>
            <Image className="mr-1 w-[1rem]" src={infoIcon.src} alt="Admin" />
            Admin Panel
          </button>

          <button
            className="h-[2.25rem] mt-1 w-full px-[0.5rem] text-red-500 hover:bg-[#F5F6F7] rounded-[0.38rem] text-sm flex items-center justify-start"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
