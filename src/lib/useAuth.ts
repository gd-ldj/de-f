import { useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { useAtom } from 'jotai';
import { persistedAccessTokenAtom, userIdAtom, isAuthenticatedAtom } from '../stores';

/**
 * Custom hook for managing authentication state using Clerk
 * Provides centralized auth state management compatible with the previous Privy-based API
 */
export const useAuth = () => {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const clerk = useClerk();
  const [accessToken] = useAtom(persistedAccessTokenAtom);
  const [userId] = useAtom(userIdAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  // Open Clerk sign-in modal
  const handleLogin = async () => {
    try {
      clerk.openSignIn();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Sign out from Clerk (ClerkApiTokenSync will handle clearing Jotai state)
  const handleLogout = async () => {
    try {
      await clerk.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get valid access token
  const getValidAccessToken = async (): Promise<string | null> => {
    return accessToken;
  };

  return {
    // Clerk states (mapped for backward compatibility)
    ready: isLoaded,
    authenticated: isSignedIn ?? false,
    user: null,

    // Enhanced functions
    login: handleLogin,
    logout: handleLogout,

    // Auth state from backend
    isWalletAuthenticated: isAuthenticated,
    accessToken,
    userId,

    // Compatibility
    showAuthSection: isLoaded,
    isEffectivelyLoggedIn: isAuthenticated,

    // Utility functions
    isLoading: !isLoaded,
    hasError: false,
    error: null,

    // Wallet address (no longer relevant with Clerk, but kept for compatibility)
    walletAddress: null,
    storedWalletAddress: null,

    // Utility methods
    getValidAccessToken,
    clearWalletAuthError: () => {},
  };
};
