import { useAuth } from '@/lib/useAuth'
import { useMemo } from 'react';
import Image from './Image';
import walletWhiteIcon from '@/assets/imgs/wallet-white.svg';

const ButtonAuthentication = () => {
  const { ready, authenticated, login, logout, user, isEffectivelyLoggedIn, walletAddress, storedWalletAddress } = useAuth();

  // Memoize computed values to prevent unnecessary re-renders
  const disableInteractions = useMemo(() => !ready, [ready]);
  const shouldShowLogin = useMemo(() => !storedWalletAddress, [storedWalletAddress]);
  console.log('🚀 ~ ButtonAuthentication ~ ready:', ready);
  // Early return with loading state when not ready
  if (!ready) {
    return (
      <button disabled className="w-full bg-primary text-primary-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  return (
    <button disabled={disableInteractions} onClick={shouldShowLogin ? login : logout} className="w-full bg-primary text-primary-foreground py-3 px-4 rounded flex items-center justify-center space-x-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
      <Image className="w-[1.25rem] mr-1" src={walletWhiteIcon.src} alt="Wallet" />
      Continue with Wallet
    </button>
  );
};

export const Wallet = () => {
    return <ButtonAuthentication />
}
