import React from 'react';
import type { Locale } from '@/types';

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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {locale === 'us' ? 'Share to Earn Passive Income' : '分享赚取被动收入'}
          </h3>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Token Price Display */}
        <div className="mb-6">
          <div className="flex items-baseline space-x-2 mb-2">
            <span className="text-3xl font-bold text-gray-900">{tokenData.price}</span>
            <span className="text-lg text-green-600">+{tokenData.change}</span>
          </div>
          <div className="text-2xl font-semibold text-green-600">{tokenData.percentage}</div>
        </div>

        {/* Mini Chart */}
        <div className="mb-6">
          <div className="flex items-end space-x-1 h-16">
            {tokenData.chartData.map((point, index) => (
              <div
                key={index}
                className="bg-teal-500 rounded-t flex-1"
                style={{ height: `${point.value}%` }}
              />
            ))}
          </div>
        </div>

        {/* Bonus Distribution */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {locale === 'us' ? 'Bonus Distribution' : '奖励分布'}
          </h4>
          <div className="space-y-2">
            {bonusDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.percentage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bonus Hunters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {locale === 'us' ? 'Bonus Hunters' : '奖励猎人'}
          </h4>
          <div className="space-y-3">
            {bonusHunters.map((hunter, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {hunter.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">{hunter.name}</span>
                </div>
                <span className="text-sm font-medium text-teal-600">{hunter.percentage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">
              {locale === 'us' ? 'Star Created' : '创建星标'}
            </div>
            <div className="text-lg font-semibold text-gray-900">3m 4d ago</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">
              {locale === 'us' ? 'Pooled Token' : '池化代币'}
            </div>
            <div className="text-lg font-semibold text-gray-900">120k</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">
              {locale === 'us' ? 'Pooled USDC' : '池化USDC'}
            </div>
            <div className="text-lg font-semibold text-gray-900">$20</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">
              {locale === 'us' ? 'Liquidity' : '流动性'}
            </div>
            <div className="text-lg font-semibold text-gray-900">$14k</div>
          </div>
        </div>
      </div>

      {/* Recent Research */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {locale === 'us' ? 'Recent Research' : '最新研究'}
          </h4>
        </div>
        <div className="relative">
          <img
            src={recentResearch.image}
            alt={recentResearch.title}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h5 className="text-white font-medium text-sm mb-1 line-clamp-2">
              {recentResearch.title}
            </h5>
            <p className="text-white/80 text-xs">
              {locale === 'us' ? 'by' : '作者'} {recentResearch.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleSidebar;