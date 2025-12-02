import * as React from 'react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const bentoCardVariants = cva('rounded-2xl border transition-all duration-200', {
    variants: {
        variant: {
            primary: 'bg-white border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
            secondary: 'bg-gray-50 border-gray-200 shadow-sm hover:shadow-md',
            ai: 'bg-white border-gray-200 border-l-4 border-l-[#00C9A7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,201,167,0.12)]',
            micro: 'bg-white border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md',
            glass: 'bg-white border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
            teal: 'bg-white border-gray-200 border-l-4 border-l-[#00C9A7] shadow-sm hover:shadow-lg',
            blue: 'bg-white border-gray-200 border-l-4 border-l-[#3B82F6] shadow-sm hover:shadow-lg',
            purple: 'bg-white border-gray-200 border-l-4 border-l-[#8B5CF6] shadow-sm hover:shadow-lg',
            orange: 'bg-white border-gray-200 border-l-4 border-l-[#F97316] shadow-sm hover:shadow-lg',
            green: 'bg-white border-gray-200 border-l-4 border-l-[#22C55E] shadow-sm hover:shadow-lg'
        },
        emphasis: {
            default: '',
            raised: 'hover:-translate-y-1'
        }
    },
    defaultVariants: {
        variant: 'primary',
        emphasis: 'raised'
    }
});

type BentoCardProps = React.ComponentProps<typeof Card> &
    VariantProps<typeof bentoCardVariants> & {
        eyebrow?: string;
        title: string;
        description?: string;
        metric?: string;
        meta?: React.ReactNode;
        action?: React.ReactNode;
    };

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
    ({ className, variant, emphasis, eyebrow, title, description, metric, meta, action, children, ...props }, ref) => {
        return (
            <Card ref={ref} className={cn(bentoCardVariants({ variant, emphasis }), className)} {...props}>
                <CardHeader className='gap-6'>
                    <div className='flex flex-col gap-2'>
                        {eyebrow ? (
                            <span className='text-xs uppercase tracking-widest text-gray-500 font-medium'>{eyebrow}</span>
                        ) : null}
                        <div className='flex items-start justify-between gap-3'>
                            <div>
                                <CardTitle className='font-semibold text-xl text-gray-900 lg:text-2xl font-[family-name:var(--font-space-grotesk)]'>{title}</CardTitle>
                                {description ? (
                                    <CardDescription className='mt-2 text-sm text-gray-600'>
                                        {description}
                                    </CardDescription>
                                ) : null}
                            </div>
                            {action}
                        </div>
                    </div>
                    {metric ? (
                        <p className='text-4xl font-bold text-gray-900 sm:text-5xl font-[family-name:var(--font-space-grotesk)]'>{metric}</p>
                    ) : null}
                    {meta}
                </CardHeader>
                {children ? <CardContent className='mt-2 flex flex-col gap-4'>{children}</CardContent> : null}
            </Card>
        );
    }
);
BentoCard.displayName = 'BentoCard';

const BentoGrid = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('grid gap-6 md:grid-cols-2 xl:grid-cols-3', className)} {...props} />
);

export { BentoCard, BentoGrid };
