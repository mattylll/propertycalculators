"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function ClerkAuthSection() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </SignInButton>
        <SignInButton mode="modal">
          <Button variant="default" size="sm" className="gap-1">
            <Sparkles className="size-3" />
            Get started
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-9 rounded-lg",
            },
          }}
        />
      </SignedIn>
    </>
  );
}

export function ClerkMobileAuthSection({ onClose }: { onClose: () => void }) {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline" size="sm" className="w-full justify-center">
            Sign in
          </Button>
        </SignInButton>
        <SignInButton mode="modal">
          <Button variant="default" size="sm" className="w-full justify-center gap-1">
            <Sparkles className="size-3" />
            Get started
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center justify-center gap-3 p-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-9 rounded-lg",
              },
            }}
          />
          <span className="text-sm text-slate-900">Account</span>
        </div>
      </SignedIn>
    </>
  );
}
