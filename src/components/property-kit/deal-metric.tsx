import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

type DealMetricProps = {
    label: string;
    value: string;
    delta?: string;
    trend?: 'up' | 'down';
    helper?: string;
    icon?: ReactNode;
    accent?: 'teal' | 'blue' | 'purple' | 'orange' | 'green';
    className?: string;
};

const accentStyles = {
    teal: 'border-l-[#00C9A7]',
    blue: 'border-l-[#3B82F6]',
    purple: 'border-l-[#8B5CF6]',
    orange: 'border-l-[#F97316]',
    green: 'border-l-[#22C55E]'
};

const DealMetric = ({
    label,
    value,
    delta,
    trend = 'up',
    helper,
    icon,
    accent = 'teal',
    className
}: DealMetricProps) => {
    const TrendIcon = trend === 'down' ? TrendingDown : TrendingUp;
    const trendStyles =
        trend === 'down'
            ? 'text-red-600 bg-red-50 border border-red-100'
            : 'text-green-600 bg-green-50 border border-green-100';

    return (
        <div
            className={cn(
                'rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-all hover:shadow-md border-l-4',
                accentStyles[accent],
                className
            )}>
            <div className='flex items-center justify-between text-xs uppercase tracking-widest text-gray-500'>
                <span>{label}</span>
                {icon && <span className='text-gray-400'>{icon}</span>}
            </div>
            <div className='mt-3 flex items-end gap-3'>
                <p className='text-3xl font-semibold text-gray-900'>{value}</p>
                {delta ? (
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            trendStyles
                        )}>
                        <TrendIcon className='size-3' />
                        {delta}
                    </span>
                ) : null}
            </div>
            {helper ? <p className='mt-2 text-sm text-gray-500'>{helper}</p> : null}
        </div>
    );
};

export { DealMetric };
