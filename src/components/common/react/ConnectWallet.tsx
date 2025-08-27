import { useAuth } from '@/lib/useAuth'
import { useMemo } from 'react';
import Image from './Image';
import walletWhiteIcon from '@/assets/imgs/wallet-white.svg';

interface ButtonAuthenticationProps {
  turnstileToken?: string | null;
  isVerified?: boolean;
}

const ButtonAuthentication = ({ turnstileToken, isVerified = true }: ButtonAuthenticationProps) => {
  const { ready, authenticated, login, logout, user, isEffectivelyLoggedIn, walletAddress, storedWalletAddress } = useAuth();

  // Memoize computed values to prevent unnecessary re-renders
  const disableInteractions = useMemo(() => !ready || !isVerified, [ready, isVerified]);
  const shouldShowLogin = useMemo(() => !storedWalletAddress, [storedWalletAddress]);
  
  console.log('🚀 ~ ButtonAuthentication ~ ready:', ready);
  console.log('🚀 ~ ButtonAuthentication ~ isVerified:', isVerified);
  console.log('🚀 ~ ButtonAuthentication ~ turnstileToken:', turnstileToken);
  
  // Early return with loading state when not ready
  if (!ready) {
    return (
      <button disabled className="w-full bg-primary text-primary-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  // Handle wallet login with Turnstile token
  const handleWalletAction = async () => {
    if (shouldShowLogin) {
      // 传递 Turnstile 令牌到登录流程
      await login(turnstileToken);
    } else {
      await logout();
    }
  };

  // Button text and state based on verification
  const getButtonText = () => {
    if (!isVerified) return 'Complete verification first';
    return shouldShowLogin ? 'Continue with Wallet' : 'Disconnect Wallet';
  };

  return (
    <button 
      disabled={disableInteractions} 
      onClick={handleWalletAction} 
      className={`w-full py-3 px-4 rounded flex items-center justify-center space-x-2 transition-all duration-200 ${
        disableInteractions 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      }`}
    >
      <Image className="w-[1.25rem] mr-1" src={walletWhiteIcon.src} alt="Wallet" />
      {getButtonText()}
    </button>
  );
};

interface WalletProps {
  turnstileToken?: string | null;
  isVerified?: boolean;
}

export const Wallet = ({ turnstileToken, isVerified }: WalletProps) => {
    return <ButtonAuthentication turnstileToken={turnstileToken} isVerified={isVerified} />
}
