"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calculator, LayoutDashboard, Menu, X, Sparkles } from 'lucide-react';

const navItems = [
  { href: '/calculators', label: 'Calculators', icon: Calculator },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

const NavigationBar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--pc-grey-border)] bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--pc-navy)]">
            <Calculator className="size-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              PropertyCalculators
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--pc-blue)] font-medium">
              .ai
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors no-underline',
                  isActive
                    ? 'bg-[var(--pc-blue-light)] text-[var(--pc-blue)]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
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
                  avatarBox: 'size-9 rounded-lg',
                },
              }}
            />
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-[var(--pc-grey-border)] bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium no-underline',
                    isActive
                      ? 'bg-[var(--pc-blue-light)] text-[var(--pc-blue)]'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-4 flex flex-col gap-2 border-t border-[var(--pc-grey-border)] pt-4">
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
                        avatarBox: 'size-9 rounded-lg',
                      },
                    }}
                  />
                  <span className="text-sm text-slate-900">Account</span>
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export { NavigationBar };
