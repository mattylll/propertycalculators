"use client";

import Link from 'next/link';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { PropertyButton } from '@/components/property-kit/property-button';
import { StatusPill } from '@/components/property-kit/status-pill';
import {
  type CategoryConfig,
  type CalculatorConfig,
  getCalculatorsByCategory,
  categories as allCategories,
} from '@/lib/calculators/config';
import { ArrowLeft, ArrowRight, Calculator } from 'lucide-react';

type CategoryLandingProps = {
  category: CategoryConfig;
};

export function CategoryLanding({ category }: CategoryLandingProps) {
  const calculators = getCalculatorsByCategory(category.id);
  const liveCalculators = calculators.filter((c) => c.status === 'live');
  const comingSoonCalculators = calculators.filter((c) => c.status === 'coming-soon');

  // Get related categories (next and previous in the list)
  const categoryIndex = allCategories.findIndex((c) => c.id === category.id);
  const relatedCategories = allCategories
    .filter((c) => c.id !== category.id)
    .slice(0, 3);

  return (
    <div className='bg-white min-h-screen'>
      <main className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-8'>
        {/* Back Link */}
        <Link
          href='/calculators'
          className='inline-flex items-center gap-2 text-gray-600 hover:text-[#00C9A7] transition-colors text-sm font-medium'
        >
          <ArrowLeft className='size-4' />
          All Calculators
        </Link>

        {/* Hero Section */}
        <section
          className='space-y-6 rounded-2xl border p-8 shadow-sm'
          style={{ borderColor: `${category.color}30`, backgroundColor: `${category.color}05` }}
        >
          <div className='flex flex-wrap items-center gap-3'>
            <StatusPill tone='success' label={`${liveCalculators.length} Live`} />
            <StatusPill tone='warning' label={`${comingSoonCalculators.length} Coming Soon`} />
          </div>

          <div className='flex items-start gap-6'>
            <div
              className='hidden sm:flex size-16 items-center justify-center rounded-2xl'
              style={{ backgroundColor: `${category.color}20` }}
            >
              <Calculator className='size-8' style={{ color: category.color }} />
            </div>
            <div className='flex-1'>
              <h1 className='text-4xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
                {category.name}
              </h1>
              <p className='mt-4 text-lg text-gray-600 max-w-2xl'>
                {category.description}
              </p>
            </div>
          </div>
        </section>

        {/* Live Calculators */}
        {liveCalculators.length > 0 && (
          <section className='space-y-6'>
            <h2 className='text-2xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
              Available Now
            </h2>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {liveCalculators.map((calc) => (
                <CalculatorCard key={calc.id} calculator={calc} />
              ))}
            </div>
          </section>
        )}

        {/* Coming Soon Calculators */}
        {comingSoonCalculators.length > 0 && (
          <section className='space-y-6'>
            <h2 className='text-2xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
              Coming Soon
            </h2>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {comingSoonCalculators.map((calc) => (
                <CalculatorCard key={calc.id} calculator={calc} />
              ))}
            </div>
          </section>
        )}

        {/* Related Categories */}
        <section className='space-y-6'>
          <h2 className='text-2xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
            Explore Other Categories
          </h2>
          <div className='grid gap-4 sm:grid-cols-3'>
            {relatedCategories.map((cat) => {
              const count = getCalculatorsByCategory(cat.id).length;
              return (
                <Link key={cat.id} href={`/${cat.slug}`} className='no-underline group'>
                  <div
                    className='rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md'
                    style={{ borderColor: `${cat.color}20` }}
                  >
                    <div
                      className='flex size-10 items-center justify-center rounded-xl'
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <Calculator className='size-5' style={{ color: cat.color }} />
                    </div>
                    <h3 className='mt-4 font-semibold text-gray-900 group-hover:text-[#00C9A7] transition-colors'>
                      {cat.name}
                    </h3>
                    <p className='mt-1 text-sm text-gray-500'>
                      {count} calculators
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function CalculatorCard({ calculator }: { calculator: CalculatorConfig }) {
  const isLive = calculator.status === 'live';

  return (
    <Link href={calculator.href} className='no-underline group'>
      <div
        className='h-full rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md'
        style={{ borderColor: `${calculator.color}20` }}
      >
        <div className='flex items-start justify-between'>
          <div
            className='flex size-10 items-center justify-center rounded-xl'
            style={{ backgroundColor: `${calculator.color}15` }}
          >
            <Calculator className='size-5' style={{ color: calculator.color }} />
          </div>
          <StatusPill
            tone={isLive ? 'success' : 'warning'}
            label={isLive ? 'Live' : 'Soon'}
          />
        </div>

        <h3 className='mt-4 font-semibold text-gray-900 group-hover:text-[#00C9A7] transition-colors'>
          {calculator.name}
        </h3>
        <p className='mt-2 text-sm text-gray-600 line-clamp-2'>
          {calculator.description}
        </p>

        <div className='mt-4 flex items-center text-sm font-medium' style={{ color: calculator.color }}>
          {isLive ? 'Use calculator' : 'Get notified'}
          <ArrowRight className='ml-1 size-4 transition-transform group-hover:translate-x-1' />
        </div>
      </div>
    </Link>
  );
}
