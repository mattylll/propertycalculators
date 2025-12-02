'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    showValue?: boolean;
    formatValue?: (value: number) => string;
  }
>(({ className, showValue, formatValue, ...props }, ref) => (
  <div className="relative">
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-accent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-accent bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
    {showValue && props.value !== undefined && (
      <div className="mt-2 text-right text-sm text-muted-foreground">
        {formatValue
          ? formatValue(Array.isArray(props.value) ? props.value[0] : props.value)
          : Array.isArray(props.value)
          ? props.value[0]
          : props.value}
      </div>
    )}
  </div>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
