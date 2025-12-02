// Formatting utilities for PropertyCalculators.ai

export const currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
});

export const currencyFormatterDecimals = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export const numberFormatter = new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 0
});

export const percentFormatter = new Intl.NumberFormat('en-GB', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
});

export const formatCurrency = (value: number): string => currencyFormatter.format(value);

export const formatCurrencyCompact = (value: number): string => {
    if (value >= 1_000_000) {
        return `£${(value / 1_000_000).toFixed(2)}m`;
    }
    if (value >= 100_000) {
        return `£${(value / 1_000).toFixed(0)}k`;
    }
    // Show full number with commas for values under £100k
    return formatCurrency(value);
};

export const formatNumber = (value: number): string => numberFormatter.format(value);

export const formatPercent = (value: number): string => percentFormatter.format(value / 100);

export const formatSqft = (sqm: number): number => Math.round(sqm * 10.764);

export const formatSqm = (sqft: number): number => Math.round(sqft / 10.764);

export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export const formatMonths = (months: number): string => {
    if (months === 1) return '1 month';
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
        return years === 1 ? '1 year' : `${years} years`;
    }
    return `${years}y ${remainingMonths}m`;
};
