import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { persistedWalletAddressAtom } from '../stores';

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

  console.log("🚀 ~ useAuth ~ storedWalletAddress:", storedWalletAddress);

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
      // Clear global state before logout
      setStoredWalletAddress(null);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
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
    
    // Additional states
    privyTimeout,
    showAuthSection,
    storedWalletAddress,
    isEffectivelyLoggedIn,
    
    // Utility functions
    isLoading: !ready && !privyTimeout,
    hasError: privyTimeout && !ready,
    
    // Wallet address getter with fallback
    walletAddress: user?.wallet?.address || storedWalletAddress,
  };
};