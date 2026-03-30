import { useAuth } from '@/lib/useAuth';
import { useMemo } from 'react';
import { TRACKING_EVENTS } from '@/config/constants';
import { createTranslator } from '@/lib/i18n';

const ButtonAuthentication = ({ locale }: { locale: any }) => {
  const { ready, login } = useAuth();
  const t = createTranslator(locale);

  const disableInteractions = useMemo(() => !ready, [ready]);

  if (!ready) {
    return (
      <button disabled className="w-full bg-primary text-primary-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  const handleLoginAction = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).detakeAnalytics) {
        (window as any).detakeAnalytics.trackEvent(TRACKING_EVENTS.LOGIN_ATTEMPT, {
          method: 'clerk_login',
        });
      }
      await login();
    } catch (err) {
      console.warn('[Analytics] Failed to track login button click:', err);
    }
  };

  return (
    <button disabled={disableInteractions} onClick={handleLoginAction} className={`w-full py-3 px-4 rounded flex items-center justify-center space-x-2 transition-all duration-200 ${disableInteractions ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
      {t('wallet.continueWithWallet') || 'Get Started'}
    </button>
  );
};

export const Wallet = ({ locale }: { locale: any }) => {
  return <ButtonAuthentication locale={locale} />;
};
