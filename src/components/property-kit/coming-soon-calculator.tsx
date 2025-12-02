"use client";

import { useState } from 'react';
import Link from 'next/link';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { PropertyButton } from '@/components/property-kit/property-button';
import { StatusPill } from '@/components/property-kit/status-pill';
import {
  type CalculatorConfig,
  type CategoryConfig,
  getCalculatorsByCategory,
  getCategoryById,
} from '@/lib/calculators/config';
import { Bell, ArrowLeft, Calculator, Clock } from 'lucide-react';

type ComingSoonCalculatorProps = {
  calculator: CalculatorConfig;
};

export function ComingSoonCalculator({ calculator }: ComingSoonCalculatorProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const category = getCategoryById(calculator.category);
  const relatedCalculators = getCalculatorsByCategory(calculator.category)
    .filter((calc) => calc.id !== calculator.id && calc.status === 'live')
    .slice(0, 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with email service
    setSubmitted(true);
  };

  return (
    <div className='bg-white min-h-screen'>
      <main className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-8'>
        {/* Back Link */}
        <Link
          href={`/${calculator.category}`}
          className='inline-flex items-center gap-2 text-gray-600 hover:text-[#00C9A7] transition-colors text-sm font-medium'
        >
          <ArrowLeft className='size-4' />
          Back to {category?.name || 'Calculators'}
        </Link>

        {/* Hero Section */}
        <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
          <div className='flex flex-wrap items-center gap-3'>
            <StatusPill
              tone='warning'
              label='Coming Soon'
              icon={<Clock className='size-3' />}
            />
            {category && (
              <StatusPill
                tone='neutral'
                label={category.name}
              />
            )}
          </div>

          <div className='max-w-2xl'>
            <h1 className='text-4xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
              {calculator.name}
            </h1>
            <p className='mt-4 text-lg text-gray-600'>
              {calculator.description}
            </p>
          </div>

          {/* Placeholder Calculator Visual */}
          <div
            className='rounded-2xl border-2 border-dashed p-12 text-center'
            style={{ borderColor: `${calculator.color}40`, backgroundColor: `${calculator.color}08` }}
          >
            <div
              className='mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl'
              style={{ backgroundColor: `${calculator.color}20` }}
            >
              <Calculator className='size-8' style={{ color: calculator.color }} />
            </div>
            <h2 className='text-xl font-semibold text-gray-900'>
              We're Building This Calculator
            </h2>
            <p className='mt-2 text-gray-600 max-w-md mx-auto'>
              Our team is working hard to bring you a best-in-class {calculator.name.toLowerCase()}.
              Sign up below to be notified when it's ready.
            </p>
          </div>
        </section>

        {/* Notify Me Form */}
        <section className='grid gap-8 lg:grid-cols-2'>
          <BentoCard
            variant='primary'
            title='Get Notified'
            description="Be the first to know when this calculator launches."
          >
            {submitted ? (
              <div className='rounded-xl border border-green-200 bg-green-50 p-6 text-center'>
                <div className='mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100'>
                  <Bell className='size-6 text-green-600' />
                </div>
                <p className='font-medium text-green-800'>You're on the list!</p>
                <p className='mt-1 text-sm text-green-600'>
                  We'll email you as soon as the {calculator.shortName} calculator is ready.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                    Email address
                  </label>
                  <input
                    type='email'
                    id='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder='you@example.com'
                    className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20 outline-none transition-all'
                  />
                </div>
                <PropertyButton type='submit' variant='primary' className='w-full'>
                  Notify me when it's ready
                </PropertyButton>
                <p className='text-xs text-gray-500 text-center'>
                  No spam, just a single email when this calculator launches.
                </p>
              </form>
            )}
          </BentoCard>

          <BentoCard
            variant='secondary'
            title='What to Expect'
            description='Features coming with this calculator'
          >
            <ul className='space-y-3'>
              <li className='flex items-start gap-3'>
                <div className='mt-0.5 flex size-5 items-center justify-center rounded-full bg-[#00C9A7]/10'>
                  <div className='size-2 rounded-full bg-[#00C9A7]' />
                </div>
                <span className='text-gray-600'>Interactive calculator with real-time results</span>
              </li>
              <li className='flex items-start gap-3'>
                <div className='mt-0.5 flex size-5 items-center justify-center rounded-full bg-[#00C9A7]/10'>
                  <div className='size-2 rounded-full bg-[#00C9A7]' />
                </div>
                <span className='text-gray-600'>Detailed worked examples and case studies</span>
              </li>
              <li className='flex items-start gap-3'>
                <div className='mt-0.5 flex size-5 items-center justify-center rounded-full bg-[#00C9A7]/10'>
                  <div className='size-2 rounded-full bg-[#00C9A7]' />
                </div>
                <span className='text-gray-600'>Comprehensive FAQ section for SEO</span>
              </li>
              <li className='flex items-start gap-3'>
                <div className='mt-0.5 flex size-5 items-center justify-center rounded-full bg-[#00C9A7]/10'>
                  <div className='size-2 rounded-full bg-[#00C9A7]' />
                </div>
                <span className='text-gray-600'>Save and export your calculations</span>
              </li>
            </ul>
          </BentoCard>
        </section>

        {/* Related Calculators */}
        {relatedCalculators.length > 0 && (
          <section className='space-y-6'>
            <h2 className='text-2xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
              Try These Calculators Now
            </h2>
            <BentoGrid className='grid-cols-1 gap-6 md:grid-cols-3'>
              {relatedCalculators.map((calc) => (
                <Link key={calc.id} href={calc.href} className='no-underline'>
                  <BentoCard
                    variant='glass'
                    title={calc.name}
                    description={calc.description}
                    meta={<StatusPill tone='success' label='Live' />}
                  >
                    <PropertyButton variant='ghost' size='sm'>
                      Use calculator
                    </PropertyButton>
                  </BentoCard>
                </Link>
              ))}
            </BentoGrid>
          </section>
        )}

        {/* SEO Content Placeholder */}
        <section className='space-y-6 rounded-2xl border border-gray-200 bg-gray-50 p-8'>
          <h2 className='text-2xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
            About the {calculator.name}
          </h2>
          <div className='prose prose-gray max-w-none'>
            <p className='text-gray-600'>
              The {calculator.name} is designed to help property investors, developers, and landlords
              make informed decisions. This tool will provide accurate calculations based on current
              UK market data and industry-standard formulas.
            </p>
            {calculator.keywords && calculator.keywords.length > 0 && (
              <div className='mt-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-3'>Related Topics</h3>
                <div className='flex flex-wrap gap-2'>
                  {calculator.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className='inline-block rounded-full bg-white px-3 py-1 text-sm text-gray-600 border border-gray-200'
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
