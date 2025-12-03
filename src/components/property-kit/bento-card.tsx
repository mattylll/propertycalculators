import * as React from 'react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const bentoCardVariants = cva('rounded-2xl border-2 transition-all duration-300', {
    variants: {
        variant: {
            primary: 'bg-white border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300',
            secondary: 'bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-sm hover:shadow-lg',
            ai: 'bg-gradient-to-br from-emerald-50/50 to-white border-emerald-200 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-300',
            micro: 'bg-white border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md',
            glass: 'bg-white/90 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-xl',
            teal: 'bg-gradient-to-br from-teal-50/50 to-white border-teal-200 shadow-sm hover:shadow-lg hover:shadow-teal-500/10 hover:border-teal-300',
            blue: 'bg-gradient-to-br from-blue-50/50 to-white border-blue-200 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300',
            purple: 'bg-gradient-to-br from-purple-50/50 to-white border-purple-200 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-300',
            orange: 'bg-gradient-to-br from-orange-50/50 to-white border-orange-200 shadow-sm hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-300',
            green: 'bg-gradient-to-br from-green-50/50 to-white border-green-200 shadow-sm hover:shadow-lg hover:shadow-green-500/10 hover:border-green-300'
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
        title?: string;
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
                                {title ? (
                                    <CardTitle className='font-semibold text-xl text-gray-900 lg:text-2xl font-[family-name:var(--font-space-grotesk)]'>{title}</CardTitle>
                                ) : null}
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
