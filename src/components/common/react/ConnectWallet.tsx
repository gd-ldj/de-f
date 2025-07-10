import { IdentityProvider } from '@/components/common/react/IdentityProvider';
import { useAuth } from '@/lib/useAuth'

const ButtonAuthentication = () => {
  const { 
    ready, 
    authenticated, 
    login, 
    logout, 
    user, 
    isEffectivelyLoggedIn,
    walletAddress,
    storedWalletAddress 
  } = useAuth();
  
  const disableInteractions = !ready;
  
  // Show login button if not effectively logged in (either not authenticated or no stored wallet address)
  const shouldShowLogin = !storedWalletAddress;
  
  return (
    <button 
      aria-disabled={disableInteractions} 
      onClick={shouldShowLogin ? login : logout}
    >
      {shouldShowLogin ? (
        <>Continue with Wallet</>
      ) : (
        <>Continued</>
      )}
    </button>
  );
}

export const Wallet = () => {
    return <IdentityProvider>
        <ButtonAuthentication />
    </IdentityProvider>
}
