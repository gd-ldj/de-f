import { useSyncExternalStore } from 'react';
import { DEFAULT_PROMOTE_CODE, STORAGE_KEYS } from '@/config/constants';

const PROMOTE_CODE_CHANGED_EVENT = 'promoteCodeChanged';
const ANONYMOUS_PROMOTE_CODE_KEY = 'anonymous_promote_code';

function readPromoteCodeFromBrowser() {
  if (typeof window === 'undefined') {
    return DEFAULT_PROMOTE_CODE;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.PROMOTE_CODE);
    if (stored) return stored;

    // Fallback: read from cookie and sync to localStorage
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${STORAGE_KEYS.PROMOTE_CODE}=`))
      ?.split('=')[1];
    if (cookieValue) {
      window.localStorage.setItem(STORAGE_KEYS.PROMOTE_CODE, cookieValue);
      return cookieValue;
    }

    // Fallback: anonymous fingerprint-based promote code
    const anonCode = window.localStorage.getItem(ANONYMOUS_PROMOTE_CODE_KEY);
    if (anonCode) {
      window.localStorage.setItem(STORAGE_KEYS.PROMOTE_CODE, anonCode);
      document.cookie = `${STORAGE_KEYS.PROMOTE_CODE}=${anonCode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      return anonCode;
    }

    return DEFAULT_PROMOTE_CODE;
  } catch {
    return DEFAULT_PROMOTE_CODE;
  }
}

function subscribeToPromoteCodeChanges(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === STORAGE_KEYS.PROMOTE_CODE ||
      event.key === ANONYMOUS_PROMOTE_CODE_KEY ||
      event.key === null
    ) {
      onStoreChange();
    }
  };

  window.addEventListener(PROMOTE_CODE_CHANGED_EVENT, onStoreChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(PROMOTE_CODE_CHANGED_EVENT, onStoreChange);
    window.removeEventListener('storage', handleStorage);
  };
}

export function useStablePromoteCode(initialPromoteCode: string = DEFAULT_PROMOTE_CODE) {
  return useSyncExternalStore(
    subscribeToPromoteCodeChanges,
    readPromoteCodeFromBrowser,
    () => initialPromoteCode,
  );
}
