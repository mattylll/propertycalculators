'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

import { cn } from '@/lib/utils';

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    label?: string;
  }
>(
  (
    { className, orientation = 'horizontal', decorative = true, label, ...props },
    ref
  ) => {
    if (label) {
      return (
        <div className="flex items-center gap-4 my-4">
          <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation="horizontal"
            className={cn('shrink flex-1 bg-border h-[1px]', className)}
            {...props}
          />
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {label}
          </span>
          <SeparatorPrimitive.Root
            decorative={decorative}
            orientation="horizontal"
            className={cn('shrink flex-1 bg-border h-[1px]', className)}
          />
        </div>
      );
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          'shrink-0 bg-border',
          orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
          className
        )}
        {...props}
      />
    );
  }
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
