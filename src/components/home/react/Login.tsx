import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from '@/components/common/react/ConnectWallet';
import { EmailLogin } from '@/components/common/react/EmailLogin';
import { getAnalytics } from '@/lib/analytics';
import { TRACKING_EVENTS } from '@/config/constants';
import type { Locale } from '@/types';
import { createTranslator } from '@/lib/i18n';

interface LoginProps {
  locale: Locale;
}

export default function Login({ locale }: LoginProps) {
  // Create a translation function bound to the current locale
  const t = createTranslator(locale);

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
          {/* Wallet connection button */}
          <div>
            <Wallet locale={locale} />
          </div>

          {/* Email login button */}
          <div>
            <EmailLogin locale={locale} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
