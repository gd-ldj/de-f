import { PrivyProvider } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

export const IdentityProvider = (props: {children: React.ReactNode}) => {
    const solanaConnectors = toSolanaWalletConnectors({
      shouldAutoConnect: false,
    });
  return (
    <PrivyProvider
      appId={`${import.meta.env.PUBLIC_PRIVY_APP_ID}`}
      config={{
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
      }}
    >
      {props.children}
    </PrivyProvider>
  );
}
