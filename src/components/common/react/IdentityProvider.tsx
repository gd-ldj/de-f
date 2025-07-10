import { PrivyProvider } from '@privy-io/react-auth'

export const IdentityProvider = (props: {children: React.ReactNode}) => {
  return (
    <PrivyProvider
      appId={`${import.meta.env.PUBLIC_PRIVY_APP_ID}`}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {props.children}
    </PrivyProvider>
  )
}
