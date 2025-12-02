"use client";

import { useState } from 'react';
import Link from 'next/link';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { PropertyButton } from '@/components/property-kit/property-button';
import { StatusPill } from '@/components/property-kit/status-pill';
import {
  calculators,
  categories,
  workflows,
  type CalculatorCategory,
  type CalculatorConfig,
} from '@/lib/calculators/config';
import {
  Calculator,
  Search,
  Sparkles,
  ArrowRight,
  Building2,
  Home,
  FileText,
  Split,
  Wallet,
  Zap,
  BedDouble,
  Building,
  Hammer,
  HelpCircle,
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Home,
  FileText,
  Split,
  Wallet,
  Zap,
  BedDouble,
  Building,
  Hammer,
  Search: HelpCircle,
};

export default function CalculatorsIndexPage() {
  const [activeCategory, setActiveCategory] = useState<CalculatorCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalculators = calculators.filter((calc) => {
    const matchesCategory = activeCategory === 'all' || calc.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (calc.keywords?.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase())) ?? false);
    return matchesCategory && matchesSearch;
  });

  const liveCount = calculators.filter((c) => c.status === 'live').length;
  const comingSoonCount = calculators.filter((c) => c.status === 'coming-soon').length;

  return (
    <div className='bg-white min-h-screen'>
      <main className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-8'>
        {/* Hero Section */}
        <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
          <div className='flex flex-wrap items-center gap-3'>
            <StatusPill tone='success' label={`${liveCount} Live`} />
            <StatusPill tone='warning' label={`${comingSoonCount} Coming Soon`} />
          </div>

          <div className='max-w-3xl'>
            <h1 className='text-4xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
              Property Calculators
            </h1>
            <p className='mt-4 text-lg text-gray-600'>
              {calculators.length} professional calculators for property developers, investors, and landlords.
              From development finance to HMO viability, we've got the tools you need to make informed decisions.
            </p>
          </div>

          {/* Search */}
          <div className='relative max-w-xl'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400' />
            <input
              type='text'
              placeholder='Search calculators...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20 outline-none transition-all'
            />
          </div>

          {/* Category Tabs */}
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({calculators.length})
            </button>
            {categories.map((category) => {
              const count = calculators.filter((c) => c.category === category.id).length;
              const Icon = iconMap[category.icon] || Calculator;
              return (
                <button
                  key={category.id}
                  type='button'
                  onClick={() => setActiveCategory(category.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeCategory === category.id
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={
                    activeCategory === category.id
                      ? { backgroundColor: category.color }
                      : undefined
                  }
                >
                  <Icon className='size-4' />
                  {category.name.split(' ')[0]} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* Workflows Banner */}
        <section className='grid gap-4 md:grid-cols-3'>
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className='rounded-2xl border p-6'
              style={{ borderColor: `${workflow.color}30`, backgroundColor: `${workflow.color}08` }}
            >
              <div className='flex items-start gap-4'>
                <div
                  className='flex size-10 items-center justify-center rounded-xl'
                  style={{ backgroundColor: `${workflow.color}20` }}
                >
                  <Sparkles className='size-5' style={{ color: workflow.color }} />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-gray-900'>{workflow.name}</h3>
                  <p className='mt-1 text-sm text-gray-600'>{workflow.description}</p>
                  <p className='mt-2 text-xs text-gray-500'>
                    {workflow.steps.length} steps
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Calculator Grid */}
        {activeCategory === 'all' ? (
          // Show by category when "All" is selected
          <div className='space-y-12'>
            {categories.map((category) => {
              const categoryCalcs = filteredCalculators.filter(
                (c) => c.category === category.id
              );
              if (categoryCalcs.length === 0) return null;

              const Icon = iconMap[category.icon] || Calculator;

              return (
                <section key={category.id} className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div
                        className='flex size-10 items-center justify-center rounded-xl'
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <span style={{ color: category.color }}>
                          <Icon className='size-5' />
                        </span>
                      </div>
                      <div>
                        <h2 className='text-xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
                          {category.name}
                        </h2>
                        <p className='text-sm text-gray-500'>
                          {categoryCalcs.length} calculators
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/${category.slug}`}
                      className='text-sm font-medium hover:underline'
                      style={{ color: category.color }}
                    >
                      View all
                    </Link>
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {categoryCalcs.map((calc) => (
                      <CalculatorCard key={calc.id} calculator={calc} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          // Show flat grid when a category is selected
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {filteredCalculators.map((calc) => (
              <CalculatorCard key={calc.id} calculator={calc} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredCalculators.length === 0 && (
          <div className='rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center'>
            <Calculator className='mx-auto size-12 text-gray-400' />
            <h3 className='mt-4 text-lg font-medium text-gray-900'>No calculators found</h3>
            <p className='mt-2 text-gray-600'>
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              type='button'
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className='mt-4 text-[#00C9A7] font-medium hover:underline'
            >
              Clear filters
            </button>
          </div>
        )}
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
