import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from '@/components/common/react/ConnectWallet';
import { TurnstileVerification, useTurnstile } from '@/components/common/react/TurnstileVerification';
import { getAnalytics } from '@/lib/analytics';
import { TRACKING_EVENTS } from '@/config/constants';
import type { Locale } from '@/types';
import { useTranslation } from 'react-i18next';

interface LoginProps {
  locale: Locale;
}

export default function Login({ locale }: LoginProps) {
  const { t } = useTranslation();
  const { isVerified, token, error, handleVerify, handleError, handleExpire, reset } = useTurnstile();
  console.log('🚀 ~ Login ~ isVerified:', isVerified);

  // 处理 Turnstile 验证成功
  const handleTurnstileVerify = (verificationToken: string) => {
    handleVerify(verificationToken);
    // 记录分析事件
    try {
      const analytics = getAnalytics();
      analytics.trackEvent(TRACKING_EVENTS.TURNSTILE_VERIFY, {
        success: true,
        timestamp: Date.now(),
        locale,
      });
    } catch (error) {
      console.warn('Failed to track Turnstile verify event:', error);
    }
  };

  // 处理 Turnstile 验证错误
  const handleTurnstileError = (errorMessage: string) => {
    handleError(errorMessage);
    // 记录分析事件
    try {
      const analytics = getAnalytics();
      analytics.trackEvent(TRACKING_EVENTS.TURNSTILE_ERROR, {
        error: errorMessage,
        timestamp: Date.now(),
        locale,
      });
    } catch (error) {
      console.warn('Failed to track Turnstile error event:', error);
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
          {/* Turnstile 验证组件 */}
          <div className="mb-4">
            <TurnstileVerification onVerify={handleTurnstileVerify} onError={handleTurnstileError} onExpire={handleExpire} size="normal" theme="auto" action="login" className="flex justify-center" />
          </div>

          {/* 钱包连接按钮 - 只有验证通过后才能点击 */}
          <div>
            <Wallet turnstileToken={token} isVerified={isVerified} />
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
