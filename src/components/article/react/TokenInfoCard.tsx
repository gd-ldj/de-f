import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { Locale } from '@/types';
import { createTranslator } from '@/lib/i18n';

interface TokenInfoCardProps {
  marketCap: string;
  liquidity: string;
  volume24h: string;
  holders: string;
  price: string;
  priceChange: string;
  percentage: string;
  isPositive?: boolean;
  locale: Locale;
}

/**
 * Token information card component displaying market data and price chart
 * Shows key metrics like market cap, liquidity, volume, holders count with price trend
 */
const TokenInfoCard: React.FC<TokenInfoCardProps> = ({
  marketCap,
  liquidity,
  volume24h,
  holders,
  price,
  priceChange,
  percentage,
  isPositive = true,
  locale
}) => {
  const t = createTranslator(locale);
  // Mock chart data for the price trend line
  const chartData = [
    { value: 0.0020 },
    { value: 0.0018 },
    { value: 0.0025 },
    { value: 0.0030 },
    { value: 0.0028 },
    { value: 0.0035 },
    { value: 0.0038 },
    { value: 0.0041 }
  ];

  return (
    <div className="">
      <div className="grid grid-cols-2 gap-6">
        {/* Left side - Token metrics */}
        <div className="grid grid-cols-1 gap-y-4">
          {/* First row */}
          <div className="grid grid-cols-2 gap-x-6">
            {/* Market Cap */}
            <div>
              <div className="text-xs text-muted-foreground mb-1">{t('article.marketCap')}</div>
              <div className="text-lg font-medium text-foreground">{marketCap}</div>
            </div>

            {/* Liquidity */}
            <div>
              <div className="text-xs text-muted-foreground mb-1">{t('article.liquidity')}</div>
              <div className="text-lg font-medium text-foreground">{liquidity}</div>
            </div>
          </div>

          {/* Second row */}
          <div className="grid grid-cols-2 gap-x-6">
            {/* Volume 24h */}
            <div>
              <div className="text-xs text-muted-foreground mb-1 flex items-center">
                {t('article.volume24h')}
                <svg className="w-3 h-3 ml-1 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-lg font-medium text-foreground">{volume24h}</div>
            </div>

            {/* Holders */}
            <div>
              <div className="text-xs text-muted-foreground mb-1">{t('article.holders')}</div>
              <div className="text-lg font-medium text-foreground">{holders}</div>
            </div>
          </div>
        </div>

        {/* Right side - Price and chart */}
        <div className="flex flex-col justify-between">
          {/* Price section */}
          <div className="text-right">
            <div className={`text-xs font-medium mb-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}
              {percentage}
            </div>
            <div className="text-xl font-medium text-foreground mb-1">{price}</div>
          </div>

          {/* Chart section */}
          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="value" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={2} dot={false} activeDot={{ r: 3, fill: isPositive ? '#10b981' : '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenInfoCard;