import * as React from 'react';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

import { cva, type VariantProps } from 'class-variance-authority';

const propertyButtonVariants = cva(
    [
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full text-sm font-medium tracking-tight transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:scale-[0.98]'
    ].join(' '),
    {
        variants: {
            variant: {
                primary:
                    'bg-[#00C9A7] text-white shadow-md hover:bg-[#00A389] hover:shadow-lg hover:-translate-y-0.5',
                secondary:
                    'bg-white text-[#00C9A7] border-2 border-[#00C9A7] hover:bg-[#E6FAF7] hover:-translate-y-0.5 shadow-sm',
                ghost:
                    'bg-transparent text-muted-foreground hover:text-[#00C9A7] hover:bg-[#E6FAF7] border border-transparent',
                outline:
                    'border-2 border-border text-foreground hover:border-[#00C9A7] hover:text-[#00C9A7] hover:bg-[#E6FAF7]/50',
                ai:
                    'bg-gradient-to-r from-[#00C9A7] via-[#3B82F6] to-[#8B5CF6] text-white shadow-[0_0_20px_rgba(0,201,167,0.3)] hover:shadow-[0_0_30px_rgba(0,201,167,0.4)] hover:-translate-y-0.5',
                muted:
                    'bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary border border-border'
            },
            size: {
                sm: 'h-9 px-5 text-xs',
                md: 'h-11 px-7 text-sm',
                lg: 'h-12 px-9 text-base',
                icon: 'h-11 w-11 rounded-2xl px-0',
                wide: 'h-12 px-12 text-base'
            }
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md'
        }
    }
);

type PropertyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof propertyButtonVariants> & {
        loading?: boolean;
        icon?: React.ReactNode;
    };

const PropertyButton = React.forwardRef<HTMLButtonElement, PropertyButtonProps>(
    ({ className, variant, size, loading, icon, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    propertyButtonVariants({ variant, size }),
                    loading && 'cursor-wait opacity-80',
                    icon && size !== 'icon' && 'pl-5',
                    className
                )}
                {...props}>
                {loading ? <Loader2 className='size-4 animate-spin' /> : icon}
                <span className='relative z-10'>{children}</span>
            </button>
        );
    }
);
PropertyButton.displayName = 'PropertyButton';

export { PropertyButton, propertyButtonVariants };
