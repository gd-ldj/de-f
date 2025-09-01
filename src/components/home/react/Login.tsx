import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from '@/components/common/react/ConnectWallet';
import { getAnalytics } from '@/lib/analytics';
import { TRACKING_EVENTS } from '@/config/constants';
import type { Locale } from '@/types';
import { t } from '@/lib/i18n';

interface LoginProps {
  locale: Locale;
}

export default function Login({ locale }: LoginProps) {
  return (
    <motion.div className="space-y-6 px-6 border-b border-border mb-5" initial={{ opacity: 0, maxHeight: 0, overflow: 'hidden' }} animate={{ opacity: 1, maxHeight: '500px', overflow: 'visible' }} exit={{ opacity: 0, maxHeight: 0, overflow: 'hidden' }} transition={{ duration: 0.8, ease: 'easeInOut' }}>
      <div className="bg-white mb-6">
        <h3 className="text-[30px] font-medium text-primary mb-4">{t(locale, 'home.decentralizedTakes')}</h3>

        <p className="text-[18px] text-muted-foreground mb-4">
          {t(locale, 'home.loginFor')} <span className="font-medium text-foreground">{t(locale, 'home.deTake')}</span>
          <br />
          {t(locale, 'home.getStartedWith')}
          <span className="font-medium text-foreground"> {t(locale, 'home.contentFi')}</span>
        </p>

        <div className="space-y-4">
          {/* 钱包连接按钮 */}
          <div>
            <Wallet locale={locale} />
          </div>

          {/*
           * You can re-enable the email option when it's ready
           * <button
           *   className="w-full border border-border text-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 hover:bg-accent"
           * >
           *   <Mail className="w-4 h-4" />
           *   <span>Continue with Email</span>
           * </button>
           */}
        </div>
      </div>
    </motion.div>
  );
}
