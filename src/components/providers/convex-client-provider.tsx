"use client";

import { ReactNode } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";

// Only initialize Convex if environment variables are set
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // If Clerk is configured, wrap with ClerkProvider
  if (clerkKey) {
    // If both Clerk and Convex are configured, use full setup
    if (convex) {
      return (
        <ClerkProvider
          publishableKey={clerkKey}
          appearance={{
            variables: {
              colorPrimary: "#4C84FF",
              colorBackground: "#FFFFFF",
              colorInputBackground: "#F8FAFC",
              colorInputText: "#0F172A",
            },
          }}
        >
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            {children}
          </ConvexProviderWithClerk>
        </ClerkProvider>
      );
    }

    // Clerk only (no Convex)
    return (
      <ClerkProvider
        publishableKey={clerkKey}
        appearance={{
          variables: {
            colorPrimary: "#4C84FF",
            colorBackground: "#FFFFFF",
            colorInputBackground: "#F8FAFC",
            colorInputText: "#0F172A",
          },
        }}
      >
        {children}
      </ClerkProvider>
    );
  }

  // No Clerk configured, just render children
  return <>{children}</>;
}
