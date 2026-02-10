import React from 'react';
import type { Locale } from '@/types';
import { createTranslator } from '@/lib/i18n';

interface BonusDistributionProps {
  locale: Locale;
  currentProgress?: number;
  bonusRate?: string;
  views?: string;
}

/**
 * Bonus Distribution component displaying progress bar and real-time bonus information
 * Shows ongoing progress with visual progress bar and real-time bonus rate statistics
 */
const BonusDistribution: React.FC<BonusDistributionProps> = ({ 
  locale, 
  currentProgress = 60, 
  bonusRate = "117.35",
  views = "1K"
}) => {
  const t = createTranslator(locale);
  // Generate progress bar segments (20 total segments)
  const totalSegments = 20;
  const filledSegments = Math.floor((currentProgress / 100) * totalSegments);
  
  return (
    <div className="">
      {/* Title */}
      <h3 className="text-lg font-medium text-foreground mb-6">{t('article.bonusDistribution')}</h3>

      <div className="flex items-center justify-between">
        {/* Left side - Progress section */}
        <div className="flex-1">
          {/* Ongoing status and percentage */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium text-primary">{t('article.ongoing')}</span>
            </div>
            <span className="text-sm font-medium text-foreground">{currentProgress}%</span>
          </div>

          {/* Progress bar */}
          <div className="flex space-x-1">
            {Array.from({ length: totalSegments }, (_, index) => (
              <div key={index} className={`h-4 w-1 rounded-sm ${index < filledSegments ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </div>

        {/* Right side - Bonus rate info */}
        <div className="ml-8 text-right">
          <div className="text-xs text-muted-foreground mb-1">{t('article.realtimeBonusRate')}</div>
          <div className="flex items-center justify-end space-x-1">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-foreground">
              {bonusRate} / {views} {t('article.views')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BonusDistribution;
