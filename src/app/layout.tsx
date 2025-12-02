import type { ReactNode } from 'react';

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Space_Grotesk } from 'next/font/google';

import { ThemeProvider } from 'next-themes';

import { NavigationBar } from '@/components/property-kit/navigation-bar';
import { Footer } from '@/components/property-kit/footer';
import { ConvexClientProvider } from '@/components/providers/convex-client-provider';
import { DealProvider } from '@/lib/deal-context';
import '@/app/globals.css';
import { Toaster } from '@/registry/new-york-v4/ui/sonner';

const geistSans = localFont({
    src: './fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900'
});
const geistMono = localFont({
    src: './fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900'
});
const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
    weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
    title: 'PropertyCalculators.ai | AI-Powered Property Development Tools',
    description: 'AI-powered calculators for UK property developers. Assess permitted development, estimate GDV, calculate build costs, and structure finance instantly.'
};

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        // ? https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
        // ? https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors
        <html suppressHydrationWarning lang='en'>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} bg-background text-foreground overscroll-none antialiased`}>
                <ConvexClientProvider>
                    <ThemeProvider attribute='class' defaultTheme='light' forcedTheme='light' disableTransitionOnChange>
                        <DealProvider>
                            <div className='flex min-h-screen flex-col'>
                                <NavigationBar />
                                <main className='flex-1'>{children}</main>
                                {/* Footer component */}
                                <Footer />
                                <Toaster />
                            </div>
                        </DealProvider>
                    </ThemeProvider>
                </ConvexClientProvider>
            </body>
        </html>
    );
};

export default Layout;
