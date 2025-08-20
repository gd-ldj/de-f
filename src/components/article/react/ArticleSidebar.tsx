import React from 'react';
import type { Locale } from '@/types';
import TokenInfoCard from './TokenInfoCard';
import BonusDistribution from './BonusDistribution';
import BonusHunters from './BonusHunters';
import PoolInfo from './PoolInfo';
import RecentResearch from './RecentResearch';

interface ArticleSidebarProps {
  locale: Locale;
}

/**
 * Article sidebar component with token data, bonus distribution, and hunters info
 * This component displays real-time data that doesn't need SEO optimization
 */
const ArticleSidebar: React.FC<ArticleSidebarProps> = ({ locale }) => {
  // Mock data - in real app this would come from API
  const tokenData = {
    price: '$34.7M',
    change: '$1.9M',
    percentage: '60.00%',
    chartData: [
      { value: 30 },
      { value: 45 },
      { value: 60 },
      { value: 40 },
      { value: 70 },
      { value: 55 },
      { value: 80 }
    ]
  };

  const bonusDistribution = [
    { name: 'BTC', percentage: '87.5%', color: 'bg-orange-500' },
    { name: 'ETH', percentage: '10.0%', color: 'bg-blue-500' },
    { name: 'USDT', percentage: '2.5%', color: 'bg-green-500' }
  ];

  const bonusHunters = [
    { name: 'Risk', percentage: '0.20%', avatar: '/avatars/risk.jpg' },
    { name: 'Whyb_Ddd', percentage: '0.10%', avatar: '/avatars/whyb.jpg' },
    { name: '3rdFA_Hdg', percentage: '0.09%', avatar: '/avatars/3rdfa.jpg' },
    { name: 'qqmg_ddu', percentage: '0.09%', avatar: '/avatars/qqmg.jpg' },
    { name: 'AMDOL_Ag', percentage: '0.08%', avatar: '/avatars/amdol.jpg' }
  ];

  const recentResearch = {
    title: locale === 'us' ? 'Fusaka fork takes shape as Pectra enters final stretch' : 'Fusaka分叉成型，Pectra进入最后阶段',
    author: 'JACK KUBINEC',
    image: '/images/research-thumb.jpg'
  };

  return (
    <div className="space-y-6">
      {/* Share to Earn Passive Income Card */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">{locale === 'us' ? 'Table of Contents' : '目录'}</h3>
          <button className="text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Token Info Card */}
        <div className="mb-6">
          <TokenInfoCard marketCap="$24.71M" liquidity="$1.8M" volume24h="$24.71M" holders="19,861" price="$0.0041" priceChange="+$0.0008" percentage="+60%" isPositive={true} />
        </div>

        {/* Bonus Distribution */}
        <div className="mb-6">
          <BonusDistribution locale={locale} currentProgress={60} bonusRate="117.35" views="1K" />
        </div>

        {/* Bonus Hunters */}
        <div>
          <BonusHunters locale={locale} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="space-y-4">
        <PoolInfo locale={locale} />
      </div>

      {/* Recent Research */}
      <RecentResearch locale={locale} />
    </div>
  );
};

export default ArticleSidebar;