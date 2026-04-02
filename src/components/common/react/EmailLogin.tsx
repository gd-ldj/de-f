import { useAuth } from '@/lib/useAuth';
import { TRACKING_EVENTS } from '@/config/constants';
import { createTranslator } from '@/lib/i18n';

const EmailLoginButton = ({ locale }: { locale: any }) => {
  const { ready, login } = useAuth();
  const t = createTranslator(locale);

  if (!ready) {
    return (
      <button disabled className="w-full border border-border text-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  const handleEmailLoginClick = () => {
    try {
      if (typeof window !== 'undefined' && (window as any).detakeAnalytics) {
        (window as any).detakeAnalytics.trackEvent(TRACKING_EVENTS.LOGIN_ATTEMPT, {
          method: 'email_login',
        });
      }
      login();
    } catch (err) {
      console.warn('[Analytics] Failed to track email login click:', err);
    }
  };

  return (
    <button
      onClick={handleEmailLoginClick}
      className="w-full py-2 px-4 rounded flex items-center justify-center space-x-2 transition-all duration-200 border border-border text-foreground hover:bg-accent"
    >
      <span>{t('auth.continueWithEmail') || 'Continue with Email'}</span>
    </button>
  );
};

export const EmailLogin = ({ locale }: { locale: any }) => {
  return <EmailLoginButton locale={locale} />;
};
