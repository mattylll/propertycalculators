import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const toneStyles: Record<
    'info' | 'success' | 'warning' | 'neutral',
    { wrapper: string; dot: string }
> = {
    info: {
        wrapper: 'bg-[#E6FAF7] text-[#00A389] border border-[#00C9A7]/20',
        dot: 'bg-[#00C9A7]'
    },
    success: {
        wrapper: 'bg-[#DCFCE7] text-[#16A34A] border border-[#22C55E]/20',
        dot: 'bg-[#22C55E]'
    },
    warning: {
        wrapper: 'bg-[#FEF3C7] text-[#D97706] border border-[#F97316]/20',
        dot: 'bg-[#F97316]'
    },
    neutral: {
        wrapper: 'bg-gray-100 text-gray-600 border border-gray-200',
        dot: 'bg-gray-400'
    }
};

type StatusPillProps = {
    tone?: keyof typeof toneStyles;
    label: string;
    icon?: ReactNode;
    className?: string;
};

const StatusPill = ({ tone = 'neutral', label, icon, className }: StatusPillProps) => {
    const toneClass = toneStyles[tone];

    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
                toneClass.wrapper,
                className
            )}>
            {icon ? (
                icon
            ) : (
                <span className={cn('size-2 rounded-full', toneClass.dot)} aria-hidden='true' />
            )}
            {label}
        </span>
    );
};

export { StatusPill };
