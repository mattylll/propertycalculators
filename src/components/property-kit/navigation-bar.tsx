"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calculator, LayoutDashboard, Menu, X, Sparkles, BookOpen } from 'lucide-react';

// Dynamically import the Clerk-dependent auth section
const ClerkAuthSection = dynamic(
  () => import('./clerk-auth-section').then((mod) => mod.ClerkAuthSection),
  {
    ssr: false,
    loading: () => (
      <Link href="/dashboard">
        <Button variant="default" size="sm" className="gap-1">
          <Sparkles className="size-3" />
          Get started
        </Button>
      </Link>
    ),
  }
);

const ClerkMobileAuthSection = dynamic(
  () => import('./clerk-auth-section').then((mod) => mod.ClerkMobileAuthSection),
  {
    ssr: false,
    loading: () => (
      <Link href="/dashboard">
        <Button variant="default" size="sm" className="w-full justify-center gap-1">
          <Sparkles className="size-3" />
          Get started
        </Button>
      </Link>
    ),
  }
);

// Fallback auth section when Clerk is not configured
function FallbackAuthSection() {
  return (
    <Link href="/dashboard">
      <Button variant="default" size="sm" className="gap-1">
        <Sparkles className="size-3" />
        Get started
      </Button>
    </Link>
  );
}

function FallbackMobileAuthSection({ onClose }: { onClose: () => void }) {
  return (
    <Link href="/dashboard" onClick={onClose}>
      <Button variant="default" size="sm" className="w-full justify-center gap-1">
        <Sparkles className="size-3" />
        Get started
      </Button>
    </Link>
  );
}

// Auth section that checks if Clerk is available
function AuthSection() {
  const [mounted, setMounted] = React.useState(false);
  const [clerkAvailable, setClerkAvailable] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    setClerkAvailable(!!publishableKey);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!clerkAvailable) {
    return <FallbackAuthSection />;
  }

  return <ClerkAuthSection />;
}

function MobileAuthSection({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = React.useState(false);
  const [clerkAvailable, setClerkAvailable] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    setClerkAvailable(!!publishableKey);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!clerkAvailable) {
    return <FallbackMobileAuthSection onClose={onClose} />;
  }

  return <ClerkMobileAuthSection onClose={onClose} />;
}

const navItems = [
  { href: '/calculators', label: 'Calculators', icon: Calculator },
  { href: '/blog', label: 'Blog', icon: BookOpen },
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
          <AuthSection />
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
              <MobileAuthSection onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export { NavigationBar };
