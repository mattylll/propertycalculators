import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-[var(--radius-lg)] border bg-card text-card-foreground transition-all',
  {
    variants: {
      variant: {
        default: 'border-border shadow-[var(--pc-shadow-card)]',
        elevated: 'border-border shadow-[var(--pc-shadow-md)]',
        outline: 'border-border',
        ghost: 'border-transparent bg-transparent',
        ai: 'border-[var(--pc-ai-border)] bg-gradient-to-br from-[var(--pc-blue-light)] to-white',
        glass: 'border-white/20 bg-white/80 backdrop-blur-xl',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-[var(--pc-shadow-lg)] hover:border-accent',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  accent?: 'development' | 'hmo' | 'leasehold' | 'titlesplit' | 'landlord' | 'bridging' | 'sa' | 'commercial' | 'refurb' | 'niche';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, accent, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, interactive }),
        accent && `border-l-[3px] border-l-[var(--pc-cat-${accent})]`,
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
