import { ClerkProvider } from '@clerk/clerk-react';

export const IdentityProvider = (props: { children: React.ReactNode }) => {
  return (
    <ClerkProvider publishableKey={import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY}>
      {props.children}
    </ClerkProvider>
  );
};
