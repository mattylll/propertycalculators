"use client";

import * as React from 'react';

import { PropertyButton } from '@/components/property-kit/property-button';
import { StatusPill } from '@/components/property-kit/status-pill';
import { BentoCard } from '@/components/property-kit/bento-card';
import { Progress } from '@/registry/new-york-v4/ui/progress';
import { Sparkles } from 'lucide-react';

type Highlight = {
    label: string;
    value: string;
};

type AiOutputCardProps = {
    title?: string;
    status: 'thinking' | 'streaming' | 'ready';
    response: string;
    highlights?: Highlight[];
    confidence?: number;
};

const AiOutputCard = ({
    title = 'AI Development Summary',
    status,
    response,
    highlights = [],
    confidence = 0.92
}: AiOutputCardProps) => {
    const [displayedText, setDisplayedText] = React.useState(response);

    React.useEffect(() => {
        if (status !== 'streaming') {
            setDisplayedText(response);

            return;
        }

        setDisplayedText('');
        let index = 0;
        const interval = setInterval(() => {
            index += 3;
            setDisplayedText(response.slice(0, index));
            if (index >= response.length) {
                clearInterval(interval);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [response, status]);

    const statusCopy =
        status === 'thinking' ? 'Running zoning, PD & finance rules' : status === 'streaming' ? 'Streaming response' : 'Ready';


    return (
        <BentoCard
            variant='ai'
            eyebrow='AI RECOMMENDATION'
            title={title}
            description={statusCopy}
            meta={<StatusPill label='Live' tone='info' icon={<Sparkles className='size-3 text-[#00C9A7]' />} />}>
            <div className='space-y-4'>
                {/* Response container */}
                <div className={`relative rounded-xl border border-gray-200 bg-gray-50 p-5 ${status === 'thinking' ? 'animate-pulse bg-gray-100' : ''}`}>
                    <p className='text-base leading-relaxed text-gray-900'>
                        {displayedText}
                        {status === 'streaming' ? <span className='ml-1 animate-pulse text-[#00C9A7] font-bold'>|</span> : null}
                    </p>
                </div>

                {/* Highlights grid */}
                {highlights.length ? (
                    <div className='grid gap-3 md:grid-cols-2'>
                        {highlights.map((highlight, index) => {
                            const colors = ['#00C9A7', '#3B82F6', '#8B5CF6', '#F97316'];
                            const color = colors[index % colors.length];
                            return (
                                <div
                                    key={highlight.label}
                                    className='rounded-xl border border-gray-200 bg-white px-4 py-3'
                                    style={{ borderLeftWidth: '4px', borderLeftColor: color }}>
                                    <p className='uppercase text-[11px] tracking-widest text-gray-500 font-medium'>{highlight.label}</p>
                                    <p className='mt-1 text-lg font-semibold text-gray-900'>{highlight.value}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : null}

                {/* Confidence bar */}
                <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-between text-xs text-gray-500'>
                        <span>Confidence</span>
                        <span className='font-medium text-gray-900'>{Math.round(confidence * 100)}%</span>
                    </div>
                    <Progress value={confidence * 100} className='bg-gray-200 h-2' />
                </div>

                {/* Action buttons */}
                <div className='flex flex-wrap gap-3'>
                    <PropertyButton variant='primary' size='sm'>
                        Apply to deal
                    </PropertyButton>
                    <PropertyButton variant='outline' size='sm'>
                        Copy summary
                    </PropertyButton>
                </div>
            </div>
        </BentoCard>
    );
};

export { AiOutputCard };
