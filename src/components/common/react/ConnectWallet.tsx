import { TRACKING_EVENTS } from '@/config/constants';
import { createTranslator } from '@/lib/i18n';
import { requestAuthClientOpen } from '@/lib/auth-client-events';
import type { Locale } from '@/types';

const ButtonAuthentication = ({ locale }: { locale: Locale }) => {
  const t = createTranslator(locale);

  const handleLoginAction = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).detakeAnalytics) {
        (window as any).detakeAnalytics.trackEvent(TRACKING_EVENTS.LOGIN_ATTEMPT, {
          method: 'clerk_login',
        });
      }
      requestAuthClientOpen('sign-in');
    } catch (err) {
      console.warn('[Analytics] Failed to track login button click:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLoginAction}
      className="w-full py-3 px-4 rounded flex items-center justify-center space-x-2 transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
    >
      {t('wallet.continueWithWallet') || 'Get Started'}
    </button>
  );
};

export const Wallet = ({ locale }: { locale: Locale }) => {
  return <ButtonAuthentication locale={locale} />;
};
