import { ClerkProvider } from '@clerk/clerk-react';

const clerkAppearance = {
  variables: {
    colorPrimary: '#06A17E',
    colorText: '#052019',
    colorTextOnPrimaryBackground: '#ffffff',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#052019',
    borderRadius: '2px',
    fontFamily:
      '"Sequel Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  elements: {
    formButtonPrimary: {
      backgroundColor: '#6b7280',
      color: '#ffffff',
      border: 'none !important',
      boxShadow: 'none !important',
      outline: 'none !important',
    },
    formButtonPrimary__hover: {
      backgroundColor: '#052019',
    },
  },
};

export const IdentityProvider = (props: { children: React.ReactNode }) => {
  return (
    <ClerkProvider
      publishableKey={import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={clerkAppearance}
    >
      {props.children}
    </ClerkProvider>
  );
};
