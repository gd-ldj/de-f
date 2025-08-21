import { PrivyProvider } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { useMemo } from 'react';

export const IdentityProvider = (props: {children: React.ReactNode}) => {
  // Memoize Solana connectors to prevent recreation on every render
  const solanaConnectors = useMemo(
    () =>
      toSolanaWalletConnectors({
        shouldAutoConnect: false,
      }),
    []
  );

  // Memoize PrivyProvider config to prevent recreation
  const privyConfig = useMemo(
    () => ({
      externalWallets: {
        solana: {
          connectors: solanaConnectors as any,
        },
      },
      embeddedWallets: {
        createOnLogin: 'users-without-wallets',
        requireUserPasswordOnCreate: false,
      },
      loginMethods: ['wallet'],
    }),
    [solanaConnectors]
  );

  return (
    <PrivyProvider appId={import.meta.env.PUBLIC_PRIVY_APP_ID} config={privyConfig}>
      {props.children}
    </PrivyProvider>
  );
}
