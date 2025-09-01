import { useAuth } from '@/lib/useAuth';
import { useMemo } from 'react';
import Image from './Image';
import walletWhiteIcon from '@/assets/imgs/wallet-white.svg';
import { TRACKING_EVENTS } from '@/config/constants';
import { createTranslator } from '@/lib/i18n';

const ButtonAuthentication = ({ locale }: { locale: any }) => {
  const { ready, login, walletAddress } = useAuth();
  const t = createTranslator(locale);

  // Memoize computed values to prevent unnecessary re-renders
  const disableInteractions = useMemo(() => !ready, [ready]);

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

  return (
    <button disabled={disableInteractions} onClick={handleWalletAction} className={`w-full py-3 px-4 rounded flex items-center justify-center space-x-2 transition-all duration-200 ${disableInteractions ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
      <Image className="w-[1.25rem] mr-1" src={walletWhiteIcon.src} alt="Wallet" />
      {t('wallet.continueWithWallet')}
    </button>
  );
};

export const Wallet = ({ locale }: { locale: any }) => {
  return <ButtonAuthentication locale={locale} />;
};
