import { useAuth } from '@/lib/useAuth';
import { useMemo } from 'react';
import Image from './Image';
import walletWhiteIcon from '@/assets/imgs/wallet-white.svg';
import { TRACKING_EVENTS } from '@/config/constants';

const ButtonAuthentication = () => {
  const { ready, authenticated, login, logout, user, isEffectivelyLoggedIn, walletAddress, storedWalletAddress } = useAuth();

  // Memoize computed values to prevent unnecessary re-renders
  const disableInteractions = useMemo(() => !ready, [ready]);
  const shouldShowLogin = useMemo(() => !storedWalletAddress, [storedWalletAddress]);

  // Early return with loading state when not ready
  if (!ready) {
    return (
      <button disabled className="w-full bg-primary text-primary-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  // Handle wallet login
  const handleWalletAction = async () => {
    try {
      // Track click intent with context
      if (typeof window !== 'undefined' && (window as any).detakeAnalytics) {
        (window as any).detakeAnalytics.trackEvent(TRACKING_EVENTS.LOGIN_ATTEMPT, {
          walletAddress: walletAddress || null,
          method: 'click_login',
        });
      }
      await login();
    } catch (err) {
      console.warn('[Analytics] Failed to track wallet button click:', err);
    }
  };

  // Button text based on login state
  const getButtonText = () => {
    return shouldShowLogin ? 'Continue with Wallet' : 'Disconnect Wallet';
  };

  return (
    <button disabled={disableInteractions} onClick={handleWalletAction} className={`w-full py-3 px-4 rounded flex items-center justify-center space-x-2 transition-all duration-200 ${disableInteractions ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
      <Image className="w-[1.25rem] mr-1" src={walletWhiteIcon.src} alt="Wallet" />
      {getButtonText()}
    </button>
  );
};

export const Wallet = () => {
  return <ButtonAuthentication />;
};
