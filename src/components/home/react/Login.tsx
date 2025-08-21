import React from 'react';
import { Wallet } from '@/components/common/react/ConnectWallet';
import type { Locale } from '@/types';
import { t } from '@/lib/i18n';

interface LoginProps {
  locale: Locale;
}

export default function Login({ locale }: LoginProps) {
  console.log('🚀 ~ Login ~ locale:', locale);
  return (
    <div className="space-y-6 px-6 border-b border-border pb-5">
      <div className="bg-white mb-6">
        <h3 className="text-lg font-medium text-primary mb-4">{t(locale, 'home.decentralizedTakes')}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t(locale, 'home.loginFor')} <span className="font-medium text-foreground">{t(locale, 'home.deTake')}</span>
          <br />
          {t(locale, 'home.getStartedWith')}
          <span className="font-medium text-foreground"> {t(locale, 'home.contentFi')}</span>
        </p>

        <div className="space-y-3">
          <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 hover:bg-primary/90">
            <Wallet />
          </button>

          {/*
           * You can re-enable the email option when it's ready
           * <button className="w-full border border-border text-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 hover:bg-accent">
           *   <Mail className="w-4 h-4" />
           *   <span>Continue with Email</span>
           * </button>
           */}
        </div>
      </div>
    </div>
  );
}