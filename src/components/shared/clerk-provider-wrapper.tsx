'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

/**
 * Wraps children with ClerkProvider only when a valid publishable key is set.
 * This prevents build failures when using placeholder keys during development.
 * Once real Clerk keys are added to .env.local, Clerk activates automatically.
 */
export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isValidKey = key && key.startsWith('pk_') && !key.includes('REPLACE_ME');

  if (!isValidKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={key}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#7c3aed',
          colorBackground: '#1a1a1a',
          colorInputBackground: '#111',
          colorInputText: '#f1f1f1',
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
