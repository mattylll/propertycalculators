"use client";

import * as React from 'react';

import { cn } from '@/lib/utils';

type FloatingFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> & {
    label: string;
    helperText?: string;
    error?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    unit?: string;
    compact?: boolean;
};

const FloatingField = React.forwardRef<HTMLInputElement, FloatingFieldProps>(
    (
        { label, helperText, error, prefix, suffix, unit, compact = false, className, onFocus, onBlur, onInput, onChange, value, defaultValue, ...props },
        ref
    ) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [filled, setFilled] = React.useState(Boolean(value ?? defaultValue));

        React.useEffect(() => {
            if (value !== undefined) {
                setFilled(value !== '');
            }
        }, [value]);

        const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            onFocus?.(event);
        };

        const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            setFilled(Boolean(event.currentTarget.value));
            onBlur?.(event);
        };

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            setFilled(Boolean(event.currentTarget.value));
            onChange?.(event);
        };

        const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
            setFilled(Boolean(event.currentTarget.value));
            onInput?.(event);
        };

        const floating = isFocused || filled;

        return (
            <label className={cn('group relative flex w-full flex-col gap-2 text-gray-900', className)}>
                <div
                    className={cn(
                        'relative flex items-center gap-3 rounded-xl border px-5 transition-all duration-200',
                        compact ? 'py-3' : 'py-4',
                        'border-gray-200 bg-white shadow-sm',
                        isFocused && 'border-[#00C9A7] ring-2 ring-[#00C9A7]/20 bg-[#E6FAF7]/30',
                        error && 'border-red-500 ring-2 ring-red-500/20'
                    )}>
                    {prefix ? <span className='text-gray-500'>{prefix}</span> : null}
                    <input
                        ref={ref}
                        {...props}
                        value={value}
                        defaultValue={defaultValue}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        onInput={handleInput}
                        className={cn(
                            'peer relative z-10 w-full cursor-text bg-transparent text-base text-gray-900 placeholder-transparent outline-none',
                            compact ? 'pt-2' : 'pt-3'
                        )}
                        placeholder={label}
                    />
                    <span
                        className={cn(
                            'pointer-events-none absolute left-5 z-0 text-sm text-gray-500 transition-all duration-200',
                            compact ? 'top-3' : 'top-5',
                            floating ? '-translate-y-3 text-xs text-[#00C9A7] font-medium' : 'translate-y-0'
                        )}>
                        {label}
                    </span>
                    {unit ? <span className='text-sm text-gray-500'>{unit}</span> : suffix}
                </div>
                <div className='flex justify-between text-xs'>
                    {helperText ? <p className='text-gray-500'>{helperText}</p> : <span />}
                    {error ? <p className='text-red-500'>{error}</p> : null}
                </div>
            </label>
        );
    }
);
FloatingField.displayName = 'FloatingField';

export { FloatingField };
