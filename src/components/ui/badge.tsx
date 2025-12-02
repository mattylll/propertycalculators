import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow',
        outline: 'text-foreground',
        // PropertyCalculators status variants
        success:
          'border-transparent bg-[var(--pc-success-light)] text-[var(--pc-success)]',
        warning:
          'border-transparent bg-[var(--pc-warning-light)] text-[var(--pc-warning)]',
        danger:
          'border-transparent bg-[var(--pc-danger-light)] text-[var(--pc-danger)]',
        info:
          'border-transparent bg-[var(--pc-info-light)] text-[var(--pc-info)]',
        ai:
          'border-transparent bg-[var(--pc-blue-light)] text-[var(--pc-blue)]',
        neutral:
          'border-transparent bg-muted text-muted-foreground',
        // Category badges
        development: 'border-transparent bg-[var(--pc-cat-development)]/10 text-[var(--pc-cat-development)]',
        hmo: 'border-transparent bg-[var(--pc-cat-hmo)]/10 text-[var(--pc-cat-hmo)]',
        leasehold: 'border-transparent bg-[var(--pc-cat-leasehold)]/10 text-[var(--pc-cat-leasehold)]',
        titlesplit: 'border-transparent bg-[var(--pc-cat-titlesplit)]/10 text-[var(--pc-cat-titlesplit)]',
        landlord: 'border-transparent bg-[var(--pc-cat-landlord)]/10 text-[var(--pc-cat-landlord)]',
        bridging: 'border-transparent bg-[var(--pc-cat-bridging)]/10 text-[var(--pc-cat-bridging)]',
        sa: 'border-transparent bg-[var(--pc-cat-sa)]/10 text-[var(--pc-cat-sa)]',
        commercial: 'border-transparent bg-[var(--pc-cat-commercial)]/10 text-[var(--pc-cat-commercial)]',
        refurb: 'border-transparent bg-[var(--pc-cat-refurb)]/10 text-[var(--pc-cat-refurb)]',
        niche: 'border-transparent bg-[var(--pc-cat-niche)]/10 text-[var(--pc-cat-niche)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="mr-1 -ml-0.5">{icon}</span>}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
