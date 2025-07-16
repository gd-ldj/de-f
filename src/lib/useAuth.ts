import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { persistedWalletAddressAtom, isAuthenticatedAtom } from '../stores';
import { useWalletAuth } from './useWalletAuth';

const WALLET_ADDRESS_KEY = 'wallet_address';

/**
 * Custom hook for managing authentication state using Privy
 * Provides centralized auth state management, timeout handling, and localStorage persistence
 * Uses Jotai for cross-component state synchronization
 */
export const useAuth = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const [privyTimeout, setPrivyTimeout] = useState(false);
  const [storedWalletAddress, setStoredWalletAddress] = useAtom(persistedWalletAddressAtom);
  const [isWalletAuthenticated] = useAtom(isAuthenticatedAtom);
  const walletAuth = useWalletAuth();
  // console.log("🚀 ~ useAuth ~ walletAuth:", walletAuth)

  console.log("🚀 ~ useAuth ~ storedWalletAddress:", storedWalletAddress);
  console.log("🚀 ~ useAuth ~ isWalletAuthenticated:", isWalletAuthenticated);

  // Initialize stored wallet address from localStorage on first load
  useEffect(() => {
    const stored = localStorage.getItem(WALLET_ADDRESS_KEY);
    if (stored && !storedWalletAddress) {
      setStoredWalletAddress(stored);
    }
  }, [storedWalletAddress, setStoredWalletAddress]);

  // Handle Privy initialization timeout
  useEffect(() => {
    if (!ready) {
      const timer = setTimeout(() => {
        setPrivyTimeout(true);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timer);
    } else {
      setPrivyTimeout(false);
    }
  }, [ready]);

  // Monitor wallet address changes and sync with global state
  useEffect(() => {
    const currentWalletAddress = user?.wallet?.address;
    
    if (authenticated && currentWalletAddress) {
      // User is authenticated and has wallet address - store it globally
      setStoredWalletAddress(currentWalletAddress);
    } else if (!authenticated || !currentWalletAddress) {
      // User is not authenticated or lost wallet address - clear global state
      setStoredWalletAddress(null);
    }
  }, [authenticated, user?.wallet?.address, setStoredWalletAddress]);

  // Monitor localStorage changes (for cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WALLET_ADDRESS_KEY) {
        setStoredWalletAddress(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setStoredWalletAddress]);

  // Determine if auth section should be shown
  const showAuthSection = ready || privyTimeout;
  
  // Check if user should be considered "logged in" based on both Privy state and global state
  const isEffectivelyLoggedIn = authenticated && !!user?.wallet?.address && !!storedWalletAddress;
  
  // Enhanced login function with error handling
  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Enhanced logout function with error handling and global state cleanup
  const handleLogout = async () => {
    try {
      // Clear wallet auth state first
      // await walletAuth.logout();
      // Clear global state before logout
      setStoredWalletAddress(null);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle wallet login with signature
  const handleWalletLogin = async (walletAddress: string, signature: string) => {
    console.log("🚀 ~ handleWalletLogin ~ walletAddress:", walletAddress)
    try {
      // const success = await walletAuth.login(walletAddress, signature);
      // if (success) {
      //   setStoredWalletAddress(walletAddress);
      // }
      // return success;
    } catch (error) {
      console.error('Wallet login failed:', error);
      return false;
    }
  };

  // Force logout if wallet address is missing from global state
  const handleForceLogout = () => {
    setStoredWalletAddress(null);
    if (authenticated) {
      handleLogout();
    }
  };

  return {
    // Privy states
    ready,
    authenticated,
    user,
    
    // Enhanced functions
    login: handleLogin,
    logout: handleLogout,
    forceLogout: handleForceLogout,
    
    // Wallet authentication
    // walletLogin: handleWalletLogin,
    // isWalletAuthenticated,
    // walletAuthData: walletAuth.walletAuthData,
    // accessToken: walletAuth.accessToken,
    // refreshToken: walletAuth.refreshToken,
    // userId: walletAuth.userId,
    
    // Additional states
    privyTimeout,
    showAuthSection,
    storedWalletAddress,
    // isEffectivelyLoggedIn: authenticated && !!user?.wallet?.address && !!storedWalletAddress,
    
    // Combined authentication status
    // isFullyAuthenticated: isWalletAuthenticated && authenticated,
    
    // Utility functions
    // isLoading: (!ready && !privyTimeout) || walletAuth.isLoading,
    // hasError: (privyTimeout && !ready) || !!walletAuth.error,
    // error: walletAuth.error,
    
    // Wallet address getter with fallback
    walletAddress: user?.wallet?.address || storedWalletAddress,
    
    // Wallet auth utility methods
    // getValidAccessToken: walletAuth.getValidAccessToken,
    // refreshWalletTokens: walletAuth.refreshTokens,
    // clearWalletAuthError: walletAuth.clearError,
  };
};