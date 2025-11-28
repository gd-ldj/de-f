import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect, useMemo } from 'react';
import { useAtom, atom } from 'jotai';

// Create a separate atom for email authentication state
const isEmailAuthenticatedAtom = atom<boolean>(false);

/**
 * Custom hook for managing email authentication state using Privy
 * Provides centralized email auth state management
 */
export const useEmailAuth = () => {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    getAccessToken
  } = usePrivy();

  const [emailAuthTimeout, setEmailAuthTimeout] = useState(false);
  const [isEmailAuthenticated, setIsEmailAuthenticated] = useAtom(isEmailAuthenticatedAtom);

  // Check if user is authenticated via email
  const isEmailUser = useMemo(() => {
    return authenticated && user?.email;
  }, [authenticated, user?.email]);

  // Handle Privy initialization timeout
  useEffect(() => {
    if (!ready) {
      const timer = setTimeout(() => {
        setEmailAuthTimeout(true);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timer);
    } else {
      setEmailAuthTimeout(false);
    }
  }, [ready]);

  // Sync Privy auth state with global state
  useEffect(() => {
    if (ready) {
      setIsEmailAuthenticated(!!isEmailUser);
    }
  }, [isEmailUser, ready, setIsEmailAuthenticated]);

  // Enhanced sign out function
  const handleSignOut = async () => {
    try {
      await logout();
      setIsEmailAuthenticated(false);
    } catch (error) {
      console.error('Email sign out failed:', error);
    }
  };

  // Get access token for API calls
  const getEmailAccessToken = async () => {
    try {
      return await getAccessToken();
    } catch (error) {
      console.error('Failed to get email access token:', error);
      return null;
    }
  };

  // Get user email
  const userEmail = useMemo(() => {
    if (user?.email) {
      return typeof user.email === 'string' ? user.email : user.email.address;
    }
    return null;
  }, [user?.email]);

  // Get user name
  const userName = useMemo(() => {
    if (user?.google?.name) return user.google.name;
    if (user?.twitter?.name) return user.twitter.name;
    if (userEmail) {
      // Extract name from email if available
      const emailPrefix = userEmail.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    return null;
  }, [user, userEmail]);

  return {
    // Privy states (mapped to maintain compatibility)
    isLoaded: ready,
    isSignedIn: isEmailUser,
    user,
    sessionId: user?.id || null,
    userId: user?.id || null,

    // Enhanced functions
    signOut: handleSignOut,
    getEmailAccessToken,
    login,

    // Additional states
    emailAuthTimeout,
    isEmailAuthenticated,
    showEmailAuthSection: ready || emailAuthTimeout,

    // Utility functions
    isLoading: !ready && !emailAuthTimeout,
    hasError: emailAuthTimeout && !ready,

    // User info getters
    userEmail,
    userName,

    // Privy specific
    ready,
    authenticated: isEmailUser,
  };
};