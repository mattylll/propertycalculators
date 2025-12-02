"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { StatusPill } from '@/components/property-kit/status-pill';
import { PropertyButton, propertyButtonVariants } from '@/components/property-kit/property-button';
import { formatCurrencyCompact } from '@/lib/calculators/format';
import { cn } from '@/lib/utils';
import { ArrowRight, FileText, Plus, Sparkles } from 'lucide-react';

const DashboardPage = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Show loading state during hydration
    if (!mounted) {
        return (
            <div className='bg-white min-h-screen'>
                <main className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-8'>
                    <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm'>
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className='bg-white min-h-screen'>
        <main className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-8'>
            <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                <div className='flex flex-wrap items-center justify-between gap-4'>
                    <div>
                        <h1 className='text-3xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>Deal Dashboard</h1>
                        <p className='mt-2 text-gray-600'>
                            Track your property deals, AI summaries, and finance application status.
                        </p>
                    </div>
                    <Link
                        href='/development'
                        className={cn(propertyButtonVariants({ variant: 'primary' }), 'inline-flex items-center gap-2 no-underline')}>
                        <Plus className='size-4' />
                        New deal
                    </Link>
                </div>
                <div className='grid gap-4 sm:grid-cols-4'>
                    <DealMetric label='Active deals' value='0' helper='In progress' />
                    <DealMetric label='Total GDV' value='£0' helper='Across all deals' />
                    <DealMetric label='Avg margin' value='0%' helper='Profit on cost' />
                    <DealMetric label='Finance ready' value='0' helper='Complete deals' />
                </div>
            </section>

            <section className='space-y-6'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-2xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>Your deals</h2>
                </div>
                <BentoCard
                    variant='glass'
                    title='No deals yet'
                    description='Start by creating a new deal with a development appraisal.'>
                    <Link href='/development' className='no-underline'>
                        <PropertyButton variant='primary' icon={<Plus className='size-4' />}>
                            Create your first deal
                        </PropertyButton>
                    </Link>
                </BentoCard>
            </section>

            <section className='space-y-6'>
                <h2 className='text-2xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>Quick actions</h2>
                <BentoGrid>
                    <BentoCard
                        variant='primary'
                        title='Start new deal'
                        description='Begin with development type selection and flow through all calculators.'
                        action={
                            <Link href='/development' className='no-underline'>
                                <PropertyButton variant='ghost' size='sm' icon={<ArrowRight className='size-3' />}>
                                    Start
                                </PropertyButton>
                            </Link>
                        }
                    />
                    <BentoCard
                        variant='secondary'
                        title='Browse calculators'
                        description='Access 300+ property calculators for any analysis you need.'
                        action={
                            <Link href='/calculators' className='no-underline'>
                                <PropertyButton variant='ghost' size='sm' icon={<ArrowRight className='size-3' />}>
                                    Browse
                                </PropertyButton>
                            </Link>
                        }
                    />
                    <BentoCard
                        variant='ai'
                        title='AI insights'
                        description='Get AI-powered recommendations for your deals.'
                        action={
                            <PropertyButton variant='ghost' size='sm' icon={<Sparkles className='size-3' />}>
                                Coming soon
                            </PropertyButton>
                        }
                    />
                </BentoGrid>
            </section>
        </main>
        </div>
    );
};

export default DashboardPage;
