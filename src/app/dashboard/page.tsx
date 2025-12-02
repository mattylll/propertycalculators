"use client";

import Link from 'next/link';
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { StatusPill } from '@/components/property-kit/status-pill';
import { PropertyButton, propertyButtonVariants } from '@/components/property-kit/property-button';
import { formatCurrencyCompact } from '@/lib/calculators/format';
import { cn } from '@/lib/utils';
import { api } from "../../../convex/_generated/api";
import { ArrowRight, Calculator, FileText, Plus, Sparkles } from 'lucide-react';

const DashboardPage = () => {
    const { isSignedIn } = useUser();
    const deals = useQuery(api.deals.listByUser);

    const totalGdv = deals?.reduce((sum, deal) => sum + (deal.gdvData?.totalGdv || 0), 0) || 0;
    const avgMargin = deals?.length
        ? deals.reduce((sum, deal) => sum + (deal.financeData?.profitOnCost || 0), 0) / deals.length
        : 0;
    const financeReady = deals?.filter(d => d.status === 'complete').length || 0;

    if (!isSignedIn) {
        return (
            <div className='bg-white min-h-screen'>
            <main className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-8'>
                <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm'>
                    <h1 className='text-3xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>Sign in to view your deals</h1>
                    <p className='text-gray-600'>
                        Create an account to save deals and track your property development projects.
                    </p>
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
                            Your saved deals, AI summaries, and finance application status.
                        </p>
                    </div>
                    <Link
                        href='/calculators/pd'
                        className={cn(propertyButtonVariants({ variant: 'primary' }), 'inline-flex items-center gap-2 no-underline')}>
                        <Plus className='size-4' />
                        New deal
                    </Link>
                </div>
                <div className='grid gap-4 sm:grid-cols-4'>
                    <DealMetric label='Active deals' value={String(deals?.length || 0)} helper='In progress' />
                    <DealMetric label='Total GDV' value={formatCurrencyCompact(totalGdv)} helper='Across all deals' />
                    <DealMetric label='Avg margin' value={`${avgMargin.toFixed(1)}%`} helper='Profit on cost' />
                    <DealMetric label='Finance ready' value={String(financeReady)} helper='Complete deals' />
                </div>
            </section>

            <section className='space-y-6'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-2xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>Your deals</h2>
                    {deals && deals.length > 0 && (
                        <StatusPill tone='success' label={`${deals.length} saved`} />
                    )}
                </div>
                {!deals || deals.length === 0 ? (
                    <BentoCard
                        variant='glass'
                        title='No deals yet'
                        description='Start by creating a new deal with the PD Calculator.'>
                        <Link href='/calculators/pd' className='no-underline'>
                            <PropertyButton variant='primary' icon={<Plus className='size-4' />}>
                                Create your first deal
                            </PropertyButton>
                        </Link>
                    </BentoCard>
                ) : (
                    <BentoGrid className='grid-cols-1 gap-6 md:grid-cols-2'>
                        {deals.map((deal) => (
                            <BentoCard
                                key={deal._id}
                                variant='glass'
                                title={deal.address}
                                description={`Step ${deal.currentStep} of 4`}
                                meta={
                                    <StatusPill
                                        tone={deal.status === 'complete' ? 'success' : 'warning'}
                                        label={deal.status === 'complete' ? 'Complete' : 'In progress'}
                                    />
                                }>
                                <div className='grid grid-cols-3 gap-4'>
                                    <div>
                                        <p className='text-xs uppercase tracking-wider text-gray-500'>GDV</p>
                                        <p className='mt-1 text-lg font-semibold text-gray-900'>
                                            {deal.gdvData?.totalGdv ? formatCurrencyCompact(deal.gdvData.totalGdv) : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-xs uppercase tracking-wider text-gray-500'>Build cost</p>
                                        <p className='mt-1 text-lg font-semibold text-gray-900'>
                                            {deal.buildCostData?.totalCost
                                                ? formatCurrencyCompact(deal.buildCostData.totalCost)
                                                : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-xs uppercase tracking-wider text-gray-500'>Margin</p>
                                        <p className='mt-1 text-lg font-semibold text-[#00C9A7]'>
                                            {deal.financeData?.profitOnCost
                                                ? `${deal.financeData.profitOnCost.toFixed(1)}%`
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex flex-wrap gap-3'>
                                    <Link href='/calculators/pd' className='no-underline'>
                                        <PropertyButton variant='ai' size='sm'>
                                            Continue deal
                                        </PropertyButton>
                                    </Link>
                                    <PropertyButton variant='ghost' size='sm' icon={<FileText className='size-3' />}>
                                        Export PDF
                                    </PropertyButton>
                                </div>
                            </BentoCard>
                        ))}
                    </BentoGrid>
                )}
            </section>

            <section className='space-y-6'>
                <h2 className='text-2xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>Quick actions</h2>
                <BentoGrid>
                    <BentoCard
                        variant='primary'
                        title='Start new deal'
                        description='Begin with PD assessment and flow through all calculators.'
                        action={
                            <Link href='/calculators/pd' className='no-underline'>
                                <PropertyButton variant='ghost' size='sm' icon={<ArrowRight className='size-3' />}>
                                    Start
                                </PropertyButton>
                            </Link>
                        }
                    />
                    <BentoCard
                        variant='secondary'
                        title='Apply for finance'
                        description='Submit a completed deal to Construction Capital for review.'
                        action={
                            <PropertyButton variant='ghost' size='sm' disabled>
                                Requires account
                            </PropertyButton>
                        }
                    />
                    <BentoCard
                        variant='ai'
                        title='AI insights'
                        description='Get AI-powered recommendations for your portfolio.'
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
