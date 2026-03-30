import { useAuth, useClerk } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  persistedAccessTokenAtom,
  userIdAtom,
  persistedPromoteCodeAtom,
  persistedWalletAddressAtom,
  isAuthenticatedAtom,
} from '@/stores';
import { loginWithClerk } from '@/api/auth';
import { fetchUserPersonalInfo } from '@/api/users';
import { DEFAULT_PROMOTE_CODE } from '@/config/constants';

/**
 * ClerkApiTokenSync - Syncs Clerk authentication with backend API
 * When Clerk is signed in but no backend token exists, exchanges Clerk token for backend access_token.
 * Clears all auth state on sign out.
 */
export function ClerkApiTokenSync() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { signOut } = useClerk();
  const [accessToken, setAccessToken] = useAtom(persistedAccessTokenAtom);
  const [, setUserId] = useAtom(userIdAtom);
  const [, setPromoteCode] = useAtom(persistedPromoteCodeAtom);
  const [, setWalletAddress] = useAtom(persistedWalletAddressAtom);

  useEffect(() => {
    let isCancelled = false;

    async function syncToken() {
      if (!isLoaded) return;

      try {
        // User signed out - clear all auth state
        if (!isSignedIn) {
          setAccessToken(null);
          setUserId(null);
          setWalletAddress(null);
          setPromoteCode(DEFAULT_PROMOTE_CODE);
          return;
        }

        // Already have a backend token, just verify user info
        if (accessToken) {
          try {
            const personal = await fetchUserPersonalInfo(accessToken);
            if (!isCancelled && personal?.promote_code) {
              setPromoteCode(personal.promote_code);
            }
          } catch {
            // Token may be invalid, clear and re-sync
            if (!isCancelled) {
              setAccessToken(null);
            }
          }
          return;
        }

        // Signed in but no backend token - exchange Clerk token
        const clerkToken = await getToken();
        if (!clerkToken) {
          setAccessToken(null);
          return;
        }

        const authData = await loginWithClerk(clerkToken);
        if (isCancelled) return;

        if (authData) {
          setAccessToken(authData.access_token);
          setUserId(authData.user_id);

          // Fetch user personal info for promote code
          try {
            const personal = await fetchUserPersonalInfo(authData.access_token);
            if (!isCancelled && personal?.promote_code) {
              setPromoteCode(personal.promote_code);
            }
          } catch (e) {
            console.warn('Failed to fetch user personal info after Clerk login:', e);
          }
        } else {
          setAccessToken(null);
        }
      } catch (error) {
        console.error('ClerkApiTokenSync error:', error);
        if (!isCancelled) {
          setAccessToken(null);
        }
      }
    }

    if (typeof window === 'undefined') return;
    syncToken();

    return () => {
      isCancelled = true;
    };
  }, [isSignedIn, isLoaded, getToken, accessToken, setAccessToken, setUserId, setPromoteCode, setWalletAddress]);

  return null;
}
