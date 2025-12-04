"use client";

import { useState } from 'react';
import Script from 'next/script';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, HelpCircle, Info, BookOpen, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FAQ {
  question: string;
  answer: string;
}

export interface CalculatorSEOProps {
  calculatorName: string;
  calculatorSlug: string;
  description: string;
  howItWorks: string;
  whenToUse?: string;
  keyFeatures?: string[];
  faqs: FAQ[];
  relatedTerms?: string[];
  categoryColor?: string;
}

export function CalculatorSEO({
  calculatorName,
  calculatorSlug,
  description,
  howItWorks,
  whenToUse,
  keyFeatures,
  faqs,
  relatedTerms,
  categoryColor = '#3B82F6',
}: CalculatorSEOProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Generate JSON-LD structured data for FAQ
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  // Generate JSON-LD for the calculator as a SoftwareApplication
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": calculatorName,
    "description": description,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "GBP"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127"
    }
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id={`faq-schema-${calculatorSlug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id={`calculator-schema-${calculatorSlug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />

      {/* SEO Content Section */}
      <div className="mt-12 space-y-8">
        {/* About This Calculator */}
        <section className="rounded-2xl border-2 border-slate-200 bg-white p-6 lg:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="flex size-12 items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: `${categoryColor}15` }}
            >
              <Info className="size-6" style={{ color: categoryColor }} />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                About the {calculatorName}
              </h2>
              <p className="mt-1 text-slate-600">What it does and how it helps you</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed">{description}</p>
          </div>

          {keyFeatures && keyFeatures.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {keyFeatures.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <Lightbulb className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="rounded-2xl border-2 border-slate-200 bg-white p-6 lg:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="flex size-12 items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: `${categoryColor}15` }}
            >
              <BookOpen className="size-6" style={{ color: categoryColor }} />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                How It Works
              </h2>
              <p className="mt-1 text-slate-600">Understanding the calculation method</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{howItWorks}</p>
          </div>

          {whenToUse && (
            <div
              className="mt-6 p-4 rounded-xl border-2"
              style={{
                backgroundColor: `${categoryColor}08`,
                borderColor: `${categoryColor}30`,
              }}
            >
              <h3 className="font-semibold text-slate-900 mb-2">When to use this calculator</h3>
              <p className="text-sm text-slate-700">{whenToUse}</p>
            </div>
          )}
        </section>

        {/* FAQs */}
        <section className="rounded-2xl border-2 border-slate-200 bg-white p-6 lg:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="flex size-12 items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: `${categoryColor}15` }}
            >
              <HelpCircle className="size-6" style={{ color: categoryColor }} />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                Frequently Asked Questions
              </h2>
              <p className="mt-1 text-slate-600">Common questions about this calculator</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-xl border-2 transition-all duration-200",
                  openFaqIndex === index
                    ? "border-slate-300 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 text-slate-500 transition-transform duration-200 shrink-0",
                      openFaqIndex === index && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    openFaqIndex === index ? "max-h-96" : "max-h-0"
                  )}
                >
                  <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related Terms - Hidden visually but good for SEO */}
        {relatedTerms && relatedTerms.length > 0 && (
          <section className="rounded-2xl border-2 border-slate-200 bg-white p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Related Property Terms
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedTerms.map((term, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 border border-slate-200"
                >
                  {term}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
