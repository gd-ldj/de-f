import React, { useEffect, useRef, useState } from 'react'
import { shortenAddress } from '@/lib/utils'
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '@/lib/useAuth'
import Image from './Image'
import disconnectIcon from '@/assets/imgs/disconnect.svg';
import walletBlackIcon from '@/assets/imgs/wallet-black.svg';
import type { Locale } from '@/types';
import { t } from '@/lib/i18n';


interface WalletPopoverProps {
  walletAddress?: string
  boostingBTCBalance?: number
  btcBalance?: number
  usd1Amount?: number
  onDisconnect?: () => void
  className?: string
  children?: React.ReactNode
  locale: Locale
}

export const WalletPopover: React.FC<WalletPopoverProps> = ({
  className = '',
  children,
  locale
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const {storedWalletAddress, walletAddress, login, logout, user} = useAuth();
  console.log("🚀 ~ ready----, authenticated, login, logout, user:", user, walletAddress, storedWalletAddress)
  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        popoverRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const togglePopover = () => {
    // Check if user is logged in
    if (!storedWalletAddress) {
      // User is not logged in, trigger login
      login();
      return;
    }
    // User is logged in, toggle popover
    setIsOpen(!isOpen)
  }

  const handleDisconnect = async () => {
    setIsOpen(false)
   await logout()
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress ?? '')
    setIsCopied(true)
    // revert after 3 seconds
    setTimeout(() => {
      setIsCopied(false)
    }, 3000)
  }

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
              <span className={`ml-auto cursor-pointer ${isCopied ? 'text-green-500' : 'text-primary'}`} onClick={handleCopyAddress}>
                {isCopied ? t(locale, 'common.copied') : t(locale, 'common.copy')}
              </span>
            </div>
          </div>

          <button className="h-[2.25rem] mt-2 w-full px-[0.5rem] text-[#FF6340] hover:bg-[#F5F6F7] rounded-[0.38rem] text-sm flex items-center justify-start" onClick={handleDisconnect}>
            <Image className="mr-1 mb-[0.1rem] w-[1rem]" src={disconnectIcon.src} alt="Disconnect" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}