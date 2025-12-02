import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { StatusPill } from '@/components/property-kit/status-pill';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { Building2, Coins, Home, MapPin } from 'lucide-react';

const KitShowcase = () => {
    return (
        <section className='relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-12 md:px-8 lg:gap-12'>
            <header className='space-y-5 text-center'>
                <p className='text-xs uppercase tracking-[0.6em] text-muted-foreground'>PropertyCalculators Kit</p>
                <h1 className='text-4xl font-semibold text-white md:text-5xl'>
                    Premium Bento Components for AI Property Workflows
                </h1>
                <p className='mx-auto max-w-3xl text-lg text-muted-foreground'>
                    A curated set of ShadCN-powered components inspired by Apple, Linear, and architectural systems.
                    Ready for PD, GDV, build cost, and finance calculators.
                </p>
                <div className='flex flex-wrap items-center justify-center gap-3'>
                    <StatusPill tone='info' label='AI Ready' />
                    <StatusPill tone='success' label='Finance-grade security' />
                    <StatusPill tone='neutral' label='Bento responsive grid' />
                </div>
            </header>

            <BentoGrid className='auto-rows-fr'>
                <div className='md:col-span-2'>
                    <BentoCard
                        variant='primary'
                        title='Permitted Development Calculator'
                        description='Layered AI + regulations to validate PD feasibility before planning spend.'
                        eyebrow='CALCULATOR'>
                        <Tabs defaultValue='inputs' className='w-full'>
                            <TabsList className='bg-white/5'>
                                <TabsTrigger value='inputs'>Inputs</TabsTrigger>
                                <TabsTrigger value='pd'>PD scope</TabsTrigger>
                                <TabsTrigger value='finance'>Finance</TabsTrigger>
                            </TabsList>
                            <TabsContent value='inputs' className='mt-5 space-y-4'>
                                <FloatingField
                                    label='Site address'
                                    helperText='Auto fetches planning class, Article 4, flood zone'
                                    prefix={<MapPin className='size-4 text-primary' />}
                                />
                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField label='Existing use class' defaultValue='E (commercial)' />
                                    <FloatingField label='Target use class' defaultValue='C3 (residential)' />
                                </div>
                                <div className='grid gap-4 md:grid-cols-3'>
                                    <FloatingField label='GIA (sqm)' defaultValue='820' unit='sqm' />
                                    <FloatingField label='Storeys' defaultValue='4' />
                                    <FloatingField label='Units target' defaultValue='18' />
                                </div>
                                <div className='flex flex-wrap gap-3 pt-2'>
                                    <PropertyButton variant='primary'>Run AI stack</PropertyButton>
                                    <PropertyButton variant='ghost'>Save as template</PropertyButton>
                                </div>
                            </TabsContent>
                            <TabsContent value='pd'>PD details area</TabsContent>
                            <TabsContent value='finance'>Finance copy area</TabsContent>
                        </Tabs>
                    </BentoCard>
                </div>

                <BentoCard
                    variant='secondary'
                    title='Deal status at a glance'
                    description='Every calculator feeds structured data into the finance pipeline.'
                    eyebrow='DEAL OVERVIEW'
                    meta={<StatusPill tone='success' label='Pipeline ready' />}>
                    <div className='grid gap-4'>
                        <DealMetric label='Gross development value' value='£6.4M' delta='+8.2%' helper='Based on 11 sales comps' />
                        <DealMetric label='Build cost' value='£2.1M' delta='-4.5%' trend='down' helper='AI QS baseline' />
                        <DealMetric label='Finance leverage' value='68%' helper='Debt/Cost with mezzanine suggestions' />
                    </div>
                </BentoCard>

                <AiOutputCard
                    status='streaming'
                    response='Convert the vacant Class E unit into 18 loft-style C3 apartments. The site sits outside Article 4 zones, has no flood risk, and qualifies for PD under MA with facade retention. Structure funding at 68% loan-to-cost with a £500k equity top-up.'
                    highlights={[
                        { label: 'PD RATIONALE', value: 'MA permitted. 56-day prior approval expected.' },
                        { label: 'FINANCE ROUTE', value: 'Hybrid development + mezzanine' }
                    ]}
                />

                <BentoCard
                    variant='glass'
                    title='AI deal types'
                    description='Micro tiles highlight AI shortcuts and state.'
                    eyebrow='SHORTCUTS'
                    className='space-y-4'>
                    <div className='grid gap-3 sm:grid-cols-2'>
                        {[
                            { icon: Building2, label: 'PD review', helper: 'Article 4, heritage, flood, parking' },
                            { icon: Home, label: 'GDV comps', helper: 'Land Registry + CMS data' },
                            { icon: Coins, label: 'Finance stack', helper: 'Debt, mezz, equity toggles' },
                            { icon: MapPin, label: 'Planning heat', helper: 'Local authority signals' }
                        ].map((item) => (
                            <div
                                key={item.label}
                                className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground'>
                                <div className='flex items-center gap-2 text-white'>
                                    <item.icon className='size-4 text-primary' />
                                    <span className='text-xs uppercase tracking-[0.3em]'>{item.label}</span>
                                </div>
                                <p className='mt-2 text-base text-white'>{item.helper}</p>
                            </div>
                        ))}
                    </div>
                </BentoCard>
            </BentoGrid>
        </section>
    );
};

export { KitShowcase };
