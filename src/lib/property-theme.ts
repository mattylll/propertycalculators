export const propertyPalette = {
    background: '#0A0A0A',
    surface: '#1A1F24',
    surfaceMuted: '#2A3035',
    card: '#1C2126',
    cardAlt: '#242A30',
    textPrimary: '#F4F5F7',
    textMuted: '#A6AFB8',
    accentElectric: '#4C84FF',
    accentEmerald: '#00C896',
    accentPurple: '#8A71FF',
    accentSand: '#E9E6DF',
    border: '#23282F',
    borderLighter: '#2F353D',
    shadow: 'rgba(8, 12, 20, 0.45)'
};

export const propertyTypography = {
    primary: 'var(--font-geist-sans, "Geist Sans", "Inter", system-ui, -apple-system, sans-serif)',
    heading: '"Space Grotesk", "Satoshi", var(--font-geist-sans, "Geist Sans", sans-serif)',
    weights: {
        regular: 400,
        medium: 500,
        semibold: 600
    }
};

export const propertyGradients = {
    aiEdge: 'linear-gradient(120deg, rgba(76, 132, 255, 0.5), rgba(138, 113, 255, 0.35))',
    finance: 'linear-gradient(135deg, rgba(0, 200, 150, 0.4), rgba(8, 12, 20, 0.8))',
    chrome: 'linear-gradient(135deg, rgba(248, 248, 248, 0.08), rgba(255, 255, 255, 0))'
};

export const propertyRadii = {
    card: '1.5rem',
    pill: '999px',
    subtle: '0.75rem'
};

export const propertyShadows = {
    bento: `0 25px 80px rgba(5, 8, 15, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.04)`,
    glow: `0 0 35px rgba(76, 132, 255, 0.35)`
};

export const propertyBorderStyles = {
    glass: `1px solid rgba(255, 255, 255, 0.08)`,
    chrome: `1px solid rgba(233, 230, 223, 0.18)`
};

export const propertyComponentBlueprints = {
    card: {
        description:
            'Used for all bento tiles. Emphasises soft gradients, chrome borders, subtle glow when active, and layered depth.'
    },
    button: {
        description:
            'Primary buttons are pill shaped, high-contrast with electric blue gradient; calculator actions use sharper angles.'
    },
    input: {
        description:
            'Floating labels with bottom border focus glow, muted surfaces, and integrated units for finance data capture.'
    },
    aiStatus: {
        description:
            'Mini tiles communicating AI state — features animated gradient borders, lucid icons, and streaming text placeholders.'
    }
};
