import React from 'react'
import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth'

interface PrivyProviderProps {
  children: React.ReactNode
}

/**
 * Privy authentication provider wrapper
 */
export default function PrivyProvider({ children }: PrivyProviderProps) {
  return (
    <BasePrivyProvider
      appId={import.meta.env.PUBLIC_PRIVY_APP_ID || 'your-privy-app-id'}
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: '/favicon.svg',
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        loginMethods: ['email', 'wallet'],
      }}
    >
      {children}
    </BasePrivyProvider>
  )
}