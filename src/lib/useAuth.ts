import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { persistedWalletAddressAtom, isAuthenticatedAtom } from '../stores';
import { useWalletAuth } from './useWalletAuth';
import { STORAGE_KEYS, AUTH_CONFIG } from '../config/constants';

/**
 * Custom hook for managing authentication state using Privy
 * Provides centralized auth state management, timeout handling, and localStorage persistence
 * Uses Jotai for cross-component state synchronization
 */
export const useAuth = () => {
  const { ready, authenticated, login, user, signMessage } = usePrivy();
  const [privyTimeout, setPrivyTimeout] = useState(false);
  const [isUserInitiatedLogin, setIsUserInitiatedLogin] = useState(false);
  const [storedWalletAddress, setStoredWalletAddress] = useAtom(persistedWalletAddressAtom);
  const [isWalletAuthenticated] = useAtom(isAuthenticatedAtom);
  const walletAuth = useWalletAuth();

  // Initialize stored wallet address from localStorage on first load
  // SSR-compatible with localStorage availability check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
      if (stored && !storedWalletAddress) {
        setStoredWalletAddress(stored);
      }
    }
  }, [storedWalletAddress, setStoredWalletAddress]);

  // Handle Privy initialization timeout
  useEffect(() => {
    if (!ready) {
      const timer = setTimeout(() => {
        setPrivyTimeout(true);
      }, AUTH_CONFIG.PRIVY_TIMEOUT_MS); // Configurable timeout

      return () => clearTimeout(timer);
    } else {
      setPrivyTimeout(false);
    }
  }, [ready]);

  // Monitor wallet address changes and sync with global state
  useEffect(() => {
    if (!ready) return;
    const currentWalletAddress = user?.wallet?.address;

    if (authenticated && currentWalletAddress) {
      // User is authenticated and has wallet address - store it globally
      setStoredWalletAddress(currentWalletAddress);

      // Only trigger login API if user actively clicked login button
      if (isUserInitiatedLogin) {
        handleWalletLoginWithSignature(currentWalletAddress);
        setIsUserInitiatedLogin(false); // Reset flag after login attempt
      }
    } else if (!authenticated || !currentWalletAddress) {
      // User is not authenticated or lost wallet address - clear global state
      setStoredWalletAddress(null);
      setIsUserInitiatedLogin(false); // Reset flag when disconnected
    }
  }, [user?.wallet?.address, isUserInitiatedLogin]);

  // 处理带真实签名的钱包登录
  const handleWalletLoginWithSignature = async (walletAddress: string) => {
    try {
      // 检查 Privy 是否准备就绪和用户是否已认证
      if (!ready || !authenticated || !signMessage) {
        console.log('Privy not ready or user not authenticated, using fallback signature');
        const fallbackSignature = `auto_login_${walletAddress}_${Date.now()}`;
        await handleWalletLogin(walletAddress, fallbackSignature);
        return;
      }

      // 创建用于签名的消息
      const message = `DeTake login verification\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;

      // 请求用户签名
      const signatureResult = await signMessage({ message });

      if (signatureResult && signatureResult.signature) {
        // 使用真实签名进行钱包登录
        await handleWalletLogin(walletAddress, signatureResult.signature);
      } else {
        // 签名结果无效，使用备用方式
        const fallbackSignature = `auto_login_${walletAddress}_${Date.now()}`;
        await handleWalletLogin(walletAddress, fallbackSignature);
      }
    } catch (error) {
      console.error('钱包签名登录失败:', error);
      // 如果签名失败，使用备用的自动登录方式
      const fallbackSignature = `auto_login_${walletAddress}_${Date.now()}`;
      await handleWalletLogin(walletAddress, fallbackSignature);
    }
  };

  // Monitor localStorage changes (for cross-tab synchronization)
  // SSR-compatible with window availability check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === STORAGE_KEYS.WALLET_ADDRESS) {
          setStoredWalletAddress(e.newValue);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [setStoredWalletAddress]);

  // Determine if auth section should be shown
  const showAuthSection = ready || privyTimeout;

  // Enhanced login function with error handling
  const handleLogin = async () => {
    try {
      setIsUserInitiatedLogin(true); // Mark as user-initiated login
      login();
    } catch (error) {
      console.error('Login failed:', error);
      setIsUserInitiatedLogin(false); // Reset flag on error
    }
  };

  // Handle wallet login with signature
  const handleWalletLogin = async (walletAddress: string, signature: string) => {
    try {
      const success = await walletAuth.login(walletAddress, signature);
      if (success) {
        setStoredWalletAddress(walletAddress);
      }
      return success;
    } catch (error) {
      console.error('Wallet login failed:', error);
      return false;
    }
  };

  return {
    // Privy states
    ready,
    authenticated,
    user,

    // Enhanced functions
    login: handleLogin,

    // Wallet authentication
    walletLogin: handleWalletLogin,
    isWalletAuthenticated,
    accessToken: walletAuth.accessToken,
    userId: walletAuth.userId,

    // Additional states
    privyTimeout,
    showAuthSection,
    storedWalletAddress,
    isEffectivelyLoggedIn: !!storedWalletAddress,

    // Combined authentication status
    // isFullyAuthenticated: isWalletAuthenticated && authenticated,

    // Utility functions
    isLoading: (!ready && !privyTimeout) || walletAuth.isLoading,
    hasError: (privyTimeout && !ready) || !!walletAuth.error,
    error: walletAuth.error,

    // Wallet address getter with fallback
    walletAddress: user?.wallet?.address || storedWalletAddress,

    // Wallet auth utility methods
    getValidAccessToken: walletAuth.getValidAccessToken,
    clearWalletAuthError: walletAuth.clearError,
  };
};
