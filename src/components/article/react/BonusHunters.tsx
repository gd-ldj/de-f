import React from 'react';
import type { Locale } from '@/types';

interface BonusHunter {
  id: number;
  name: string;
  username: string;
  timeAgo: string;
  amount: string;
  avatar?: string;
}

interface BonusHuntersProps {
  locale: Locale;
  hunters?: BonusHunter[];
}

/**
 * Bonus Hunters component displaying a ranked list of users with their bonus earnings
 * Shows user avatars, rankings, usernames, time stamps, and reward amounts
 */
const BonusHunters: React.FC<BonusHuntersProps> = ({ 
  locale, 
  hunters = [
    {
      id: 1,
      name: "Risk",
      username: "Risk",
      timeAgo: "3d 2h",
      amount: "0.025",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      id: 2,
      name: "8Nty9...DaU",
      username: "8Nty9...DaU",
      timeAgo: "11d 1h",
      amount: "0.025",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      id: 3,
      name: "3TsRA...KSq",
      username: "3TsRA...KSq",
      timeAgo: "1d 2h",
      amount: "0.025",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      id: 4,
      name: "6EPdr...65u",
      username: "6EPdr...65u",
      timeAgo: "10d 14h",
      amount: "0.025",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      id: 5,
      name: "A4DCA...XgL",
      username: "A4DCA...XgL",
      timeAgo: "21h",
      amount: "0.025",
      avatar: "/placeholder-avatar.jpg"
    }
  ]
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        {locale === 'us' ? 'Bonus Hunters' : '奖励猎人'}
      </h3>
      
      {/* Hunters List */}
      <div className="space-y-4">
        {hunters.map((hunter) => (
          <div key={hunter.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            {/* Left side - Avatar, Rank, Name, Time */}
            <div className="flex items-center space-x-3">
              {/* Avatar with rank badge */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden">
                  <img 
                    src={hunter.avatar} 
                    alt={hunter.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-white text-sm font-medium">${hunter.name.charAt(0)}</span>`;
                      }
                    }}
                  />
                </div>
                {/* Rank badge */}
                <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{hunter.id}</span>
                </div>
              </div>
              
              {/* Name and time info */}
              <div className="flex flex-col">
                <span className="text-base font-medium text-gray-900">{hunter.username}</span>
                <span className="text-sm text-gray-500">{hunter.timeAgo}</span>
              </div>
            </div>
            
            {/* Right side - Reward amount */}
            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">{hunter.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BonusHunters;
export type { BonusHunter };