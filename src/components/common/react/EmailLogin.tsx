import { usePrivy } from '@privy-io/react-auth';
import { useMemo } from 'react';
import { TRACKING_EVENTS } from '@/config/constants';
import { createTranslator } from '@/lib/i18n';

const EmailLoginButton = ({ locale }: { locale: any }) => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const t = createTranslator(locale);

  // Check if user is authenticated via email
  const isEmailAuthenticated = useMemo(() => {
    return authenticated && user?.email;
  }, [authenticated, user?.email]);

  // Memoize computed values to prevent unnecessary re-renders
  const disableInteractions = useMemo(() => !ready, [ready]);

  // Early return with loading state when not ready
  if (!ready) {
    return (
      <button disabled className="w-full border border-border text-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  // Handle email login tracking and login action
  const handleEmailLoginClick = () => {
    try {
      // Track click intent with context
      if (typeof window !== 'undefined' && (window as any).detakeAnalytics) {
        (window as any).detakeAnalytics.trackEvent(TRACKING_EVENTS.LOGIN_ATTEMPT, {
          method: 'email_login',
        });
      }
      
      // Trigger Privy login with email-only modal
      login({
        loginMethods: ['email'],
        disableSignup: false
      });
    } catch (err) {
      console.warn('[Analytics] Failed to track email login click:', err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Get user email for display
  const userEmail = useMemo(() => {
    if (user?.email) {
      return typeof user.email === 'string' ? user.email : user.email.address;
    }
    return null;
  }, [user?.email]);

  return (
    <>
      {!isEmailAuthenticated ? (
        <button
          disabled={disableInteractions}
          onClick={handleEmailLoginClick}
          className={`w-full py-2 px-4 rounded flex items-center justify-center space-x-2 transition-all duration-200 ${
            disableInteractions
              ? 'border border-border text-muted-foreground cursor-not-allowed opacity-50'
              : 'border border-border text-foreground hover:bg-accent'
          }`}
        >
          <span>{t('auth.continueWithEmail') || 'Continue with Email'}</span>
        </button>
      ) : (
        <div className="w-full flex items-center justify-between py-2 px-4 border border-border rounded">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mr-2">
              <span className="text-sm font-medium">
                {userEmail?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-foreground truncate max-w-[120px]">
                {userEmail}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('auth.signedInWithEmail') || 'Signed in with Email'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('auth.logout') || 'Logout'}
          </button>
        </div>
      )}
    </>
  );
};

export const EmailLogin = ({ locale }: { locale: any }) => {
  return <EmailLoginButton locale={locale} />;
};