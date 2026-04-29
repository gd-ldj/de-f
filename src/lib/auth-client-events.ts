export const AUTH_CLIENT_OPEN_EVENT = 'detake:auth:open';

export type AuthClientOpenMode = 'sign-in' | 'user-button';

interface AuthClientOpenDetail {
  mode: AuthClientOpenMode;
}

export const requestAuthClientOpen = (mode: AuthClientOpenMode) => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<AuthClientOpenDetail>(AUTH_CLIENT_OPEN_EVENT, {
      detail: { mode },
    }),
  );
};
