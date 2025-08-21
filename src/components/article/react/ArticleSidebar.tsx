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
    <div className="">
      {/* Share to Earn Passive Income Card */}
      <div className="">
        {/* Token Info Card */}
        <div className="px-6 p-5 border-b border-border">
          <TokenInfoCard marketCap="$24.71M" liquidity="$1.8M" volume24h="$24.71M" holders="19,861" price="$0.0041" priceChange="+$0.0008" percentage="+60%" isPositive={true} />
        </div>

        {/* Bonus Distribution */}
        <div className="px-6 p-5 border-b border-border">
          <BonusDistribution locale={locale} currentProgress={60} bonusRate="117.35" views="1K" />
        </div>

        {/* Bonus Hunters */}
        <div className="px-6 p-5 border-b border-border">
          <BonusHunters locale={locale} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="space-y-4 px-6 p-5 border-b border-border">
        <PoolInfo locale={locale} />
      </div>

      {/* Recent Research */}
      <div className="px-6 p-5 border-b border-border">
        <RecentResearch locale={locale} />
      </div>
    </div>
  );
};

export default ArticleSidebar;