import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { useMemo } from 'react';
import type { PrivyClientConfig } from '@privy-io/react-auth';

export const IdentityProvider = (props: { children: React.ReactNode }) => {
  // Memoize Solana connectors to prevent recreation on every render
  const solanaConnectors = useMemo(
    () =>
      toSolanaWalletConnectors({
        shouldAutoConnect: false,
      }),
    []
  );

  // Memoize PrivyProvider config to prevent recreation
  const privyConfig: PrivyClientConfig = useMemo(
    () => ({
      externalWallets: {
        solana: {
          connectors: solanaConnectors as any,
        },
      },
      embeddedWallets: {
        createOnLogin: 'users-without-wallets' as const,
        requireUserPasswordOnCreate: false,
      },
      loginMethods: ['email', 'wallet'] as const,
    }),
    [solanaConnectors]
  );

  return (
    <PrivyProvider appId={import.meta.env.PUBLIC_PRIVY_APP_ID} config={privyConfig}>
      {props.children}
    </PrivyProvider>
  );
};
