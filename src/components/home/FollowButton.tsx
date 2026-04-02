import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/useAuth';
import { followAuthor } from '../../api/users';
import { toast } from '../common/react/Toast';
import { STORAGE_KEYS } from '../../config/constants';
import { createTranslator } from '@/lib/i18n';
import type { Locale } from '../../types';

interface FollowButtonProps {
  userId: string;
  locale: Locale;
  className?: string;
  text?: string;
}

/**
 * Follow Button Component - Handles user follow/unfollow functionality
 * Includes authentication check, API calls, and user feedback
 */
const FollowButton: React.FC<FollowButtonProps> = ({ userId, locale, className = '', text }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { authenticated } = useAuth();
  const t = createTranslator(locale);

  /**
   * Check if user is already following this user on component mount
   */
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        if (authenticated) {
          // Check follow status from API
          const response = await fetch(`/api/users/${userId}/follow-status`, {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            setIsFollowing(data.isFollowing);
          }
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [userId, authenticated]);

  /**
   * Display toast message to user
   */
  const displayToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  /**
   * Handle follow/unfollow action
   */
  const handleFollowAction = async () => {
    try {
      setIsLoading(true);

      // Check authentication status
      if (!authenticated) {
        displayToast('Please login to follow users', 'error');
        return;
      }

      // Get access token from localStorage
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!accessToken) {
        displayToast('Please login to follow users', 'error');
        return;
      }

      // Execute follow/unfollow request
      const result = await followAuthor(accessToken, userId);

      if (result.code === 2000) {
        setIsFollowing(!isFollowing);
        const action = !isFollowing ? 'followed' : 'unfollowed';
        displayToast(`Successfully ${action} user`, 'success');
      } else {
        displayToast(result.msg?.en || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Follow action error:', error);
      displayToast('Network error, please try again', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText = isFollowing ? 'Unfollow' : 'Follow';
  const buttonIcon = isFollowing ? (
    // Unfollow icon (minus)
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
    </svg>
  ) : (
    // Follow icon (plus)
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
    </svg>
  );

  const baseClasses = 'follow-btn-enhanced transition-all duration-300 ease-in-out flex items-center text-black bg-gray-300 p-2 rounded text-sm font-medium';
  const disabledClasses = isLoading ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <>
      <button className={`${baseClasses} ${disabledClasses} ${className}`} onClick={handleFollowAction} disabled={isLoading} data-user-id={userId} data-locale={locale}>
        {buttonIcon}
        {text && <span className="ml-1">{text}</span>}
      </button>
    </>
  );
};

export default FollowButton;
