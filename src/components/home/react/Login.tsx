import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/useAuth';
import { TRACKING_EVENTS } from '@/config/constants';
import type { Locale } from '@/types';
import { createTranslator } from '@/lib/i18n';

interface LoginProps {
  locale: Locale;
}

export default function Login({ locale }: LoginProps) {
  const t = createTranslator(locale);
  const { login, ready } = useAuth();

  const handleLoginClick = () => {
    try {
      if (typeof window !== 'undefined' && (window as any).detakeAnalytics) {
        (window as any).detakeAnalytics.trackEvent(TRACKING_EVENTS.LOGIN_ATTEMPT, {
          method: 'clerk_login',
        });
      }
      login();
    } catch (err) {
      console.warn('[Analytics] Failed to track login click:', err);
    }
  };

  return (
    <motion.div className="space-y-6 px-6 border-b border-border mb-5" initial={{ opacity: 0, maxHeight: 0, overflow: 'hidden' }} animate={{ opacity: 1, maxHeight: '500px', overflow: 'visible' }} exit={{ opacity: 0, maxHeight: 0, overflow: 'hidden' }} transition={{ duration: 0.8, ease: 'easeInOut' }}>
      <div className="bg-white mb-6">
        <h3 className="text-[30px] font-medium text-primary mb-4">{t('home.decentralizedTakes')}</h3>

        <p className="text-[18px] text-muted-foreground mb-4">
          {t('home.loginFor')} <span className="font-medium text-foreground">{t('home.deTake')}</span>
          <br />
          {t('home.getStartedWith')}
          <span className="font-medium text-foreground"> {t('home.contentFi')}</span>
        </p>

        <div className="space-y-4">
          <div>
            <button
              disabled={!ready}
              onClick={handleLoginClick}
              className={`w-full py-3 px-4 rounded flex items-center justify-center space-x-2 transition-all duration-200 ${
                !ready
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {!ready ? 'Loading...' : t('wallet.continueWithWallet') || 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
