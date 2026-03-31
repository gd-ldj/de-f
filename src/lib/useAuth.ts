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
  // Blur the trigger element when the modal closes to prevent unwanted focus ring
  const handleLogin = async () => {
    try {
      const trigger = document.activeElement as HTMLElement | null;
      clerk.openSignIn();

      // Watch for Clerk modal removal and blur the trigger to avoid focus ring
      if (trigger) {
        const observer = new MutationObserver(() => {
          const modal = document.querySelector('.cl-modalBackdrop, .cl-rootBox .cl-signIn-root');
          if (!modal) {
            observer.disconnect();
            // Use requestAnimationFrame to blur after Clerk restores focus
            requestAnimationFrame(() => {
              if (document.activeElement === trigger) {
                trigger.blur();
              }
            });
          }
        });
        // Start observing after a short delay to allow Clerk to mount
        setTimeout(() => {
          observer.observe(document.body, { childList: true, subtree: true });
        }, 500);
      }
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
