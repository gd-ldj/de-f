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
      backgroundColor: '#052019',
      color: '#ffffff',
    },
    formButtonPrimary__hover: {
      backgroundColor: '#0a3d2f',
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
