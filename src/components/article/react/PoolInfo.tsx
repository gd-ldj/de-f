import React from 'react';
import type { Locale } from '@/types';

interface PoolInfoItem {
  label: string;
  value: string;
  address?: string;
  showCopyIcon?: boolean;
}

interface PoolInfoProps {
  locale: Locale;
  data?: {
    pairCreated: string;
    pooledToken: string;
    pooledSol: string;
    pooledSolAddress: string;
    liquidity: string;
  };
}

/**
 * Pool Information component displaying key metrics about a liquidity pool
 * Shows pair creation time, pooled tokens, SOL address, and liquidity information
 */
const PoolInfo: React.FC<PoolInfoProps> = ({ 
  locale, 
  data = {
    pairCreated: "3m 4d ago",
    pooledToken: "120k",
    pooledSol: "120",
    pooledSolAddress: "0x3121...123141",
    liquidity: "$14k"
  }
}) => {
  const poolInfoItems: PoolInfoItem[] = [
    {
      label: locale === 'us' ? 'Pair created' : '交易对创建',
      value: data.pairCreated
    },
    {
      label: locale === 'us' ? 'Pooled Token' : '池化代币',
      value: data.pooledToken
    },
    {
      label: locale === 'us' ? 'Pooled $SOL' : '池化$SOL',
      value: data.pooledSol,
      address: data.pooledSolAddress,
      showCopyIcon: true
    },
    {
      label: locale === 'us' ? 'Liquidity' : '流动性',
      value: data.liquidity
    }
  ];

  /**
   * Handle copy address to clipboard
   */
  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      // You can add a toast notification here if needed
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div className="">
      <div className="divide-y divide-border">
        {poolInfoItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            {/* Left side - Label */}
            <span className="text-base text-muted-foreground">{item.label}</span>

            {/* Right side - Value and optional address */}
            <div className="flex items-center space-x-2">
              {item.address ? (
                <>
                  {/* SOL Icon */}
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Address */}
                  <span className="text-base font-medium text-foreground">{item.address}</span>

                  {/* Copy Icon */}
                  {item.showCopyIcon && (
                    <button onClick={() => handleCopyAddress(item.address!)} className="text-muted-foreground hover:text-foreground transition-colors" title="Copy address">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}

                  {/* Value */}
                  <span className="text-xl font-medium text-foreground">{item.value}</span>
                </>
              ) : (
                /* Regular value display */
                <span className="text-xl font-medium text-foreground">{item.value}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoolInfo;
export type { PoolInfoItem };