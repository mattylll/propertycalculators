import Link from 'next/link';
import { Calculator } from 'lucide-react';

const footerLinks = {
    product: [
        { label: 'PD Calculator', href: '/calculators/pd' },
        { label: 'GDV Calculator', href: '/calculators/gdv' },
        { label: 'Build Cost', href: '/calculators/build-cost' },
        { label: 'Finance', href: '/calculators/finance' },
    ],
    company: [
        { label: 'About', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
    ],
    social: [
        { label: 'Twitter', href: '#' },
        { label: 'LinkedIn', href: '#' },
        { label: 'GitHub', href: '#' },
    ],
};

export function Footer() {
    return (
        <footer className='border-t border-[var(--pc-grey-border)] bg-white pt-16 pb-8'>
            <div className='mx-auto max-w-7xl px-6 lg:px-8'>
                <div className='grid gap-8 xl:grid-cols-3 xl:gap-8'>
                    <div className='space-y-4'>
                        <Link href='/' className='flex items-center gap-3 no-underline'>
                            <div className='flex size-10 items-center justify-center rounded-xl bg-[var(--pc-navy)]'>
                                <Calculator className='size-5 text-white' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-lg font-semibold text-slate-900 font-[family-name:var(--font-space-grotesk)]'>PropertyCalculators</span>
                                <span className='text-[10px] uppercase tracking-[0.3em] text-[var(--pc-blue)] font-medium'>.ai</span>
                            </div>
                        </Link>
                        <p className='max-w-xs text-sm text-slate-600'>
                            AI-powered property finance tools for developers, brokers, and investors.
                        </p>
                    </div>
                    <div className='grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0'>
                        <div className='md:grid md:grid-cols-2 md:gap-8'>
                            <div>
                                <h3 className='text-sm font-semibold text-slate-900'>Product</h3>
                                <ul className='mt-4 space-y-4'>
                                    {footerLinks.product.map((item) => (
                                        <li key={item.label}>
                                            <Link href={item.href} className='text-sm text-slate-600 hover:text-[var(--pc-blue)] transition-colors no-underline'>
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className='mt-10 md:mt-0'>
                                <h3 className='text-sm font-semibold text-slate-900'>Company</h3>
                                <ul className='mt-4 space-y-4'>
                                    {footerLinks.company.map((item) => (
                                        <li key={item.label}>
                                            <Link href={item.href} className='text-sm text-slate-600 hover:text-[var(--pc-blue)] transition-colors no-underline'>
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className='md:grid md:grid-cols-2 md:gap-8'>
                            <div>
                                <h3 className='text-sm font-semibold text-slate-900'>Social</h3>
                                <ul className='mt-4 space-y-4'>
                                    {footerLinks.social.map((item) => (
                                        <li key={item.label}>
                                            <Link href={item.href} className='text-sm text-slate-600 hover:text-[var(--pc-blue)] transition-colors no-underline'>
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='mt-12 border-t border-[var(--pc-grey-border)] pt-8'>
                    <p className='text-xs text-slate-500'>
                        &copy; {new Date().getFullYear()} PropertyCalculators.ai. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
