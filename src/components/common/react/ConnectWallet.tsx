import { useAuth } from '@/lib/useAuth'
import { useMemo } from 'react';

const ButtonAuthentication = () => {
  const { ready, authenticated, login, logout, user, isEffectivelyLoggedIn, walletAddress, storedWalletAddress } = useAuth();

  // Memoize computed values to prevent unnecessary re-renders
  const disableInteractions = useMemo(() => !ready, [ready]);
  const shouldShowLogin = useMemo(() => !storedWalletAddress, [storedWalletAddress]);
  console.log('🚀 ~ ButtonAuthentication ~ ready:', ready);
  // Early return with loading state when not ready
  if (!ready) {
    return (
      <button disabled className="opacity-50 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  return (
    <button disabled={disableInteractions} onClick={shouldShowLogin ? login : logout}>
      {shouldShowLogin ? <>Continue with Wallet</> : <>Continued</>}
    </button>
  );
}

export const Wallet = () => {
    return <ButtonAuthentication />
}
