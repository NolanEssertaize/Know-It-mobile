/**
 * @file colors.ts
 * @description Theme colors with light and dark mode support
 */

export interface ThemeColors {
    // Shorthand colors for convenience
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    border: string;
    surface: string;

    background: {
        primary: string;
        secondary: string;
        tertiary: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        muted: string;
        inverse: string;
    };
    glass: {
        background: string;
        border: string;
        borderLight: string;
        fill: string;
        elevated: string;
        subtle: string;
    };
    gradient: {
        start: string;
        middle: string;
        end: string;
    };
    status: {
        success: string;
        error: string;
        warning: string;
        info: string;
    };
    accent: {
        primary: string;
        secondary: string;
    };
}

export const lightColors: ThemeColors = {
    // Shorthand colors
    primary: '#6366F1',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    border: 'rgba(148, 163, 184, 0.3)',
    surface: 'rgba(255, 255, 255, 0.7)',

    background: {
        primary: '#F8FAFC',
        secondary: '#F1F5F9',
        tertiary: '#E2E8F0',
    },
    text: {
        primary: '#0F172A',
        secondary: '#475569',
        tertiary: '#64748B',
        muted: '#94A3B8',
        inverse: '#FFFFFF',
    },
    glass: {
        background: 'rgba(255, 255, 255, 0.7)',
        border: 'rgba(148, 163, 184, 0.3)',
        borderLight: 'rgba(148, 163, 184, 0.15)',
        fill: 'rgba(255, 255, 255, 0.6)',
        elevated: 'rgba(255, 255, 255, 0.85)',
        subtle: 'rgba(255, 255, 255, 0.4)',
    },
    gradient: {
        start: '#E0F2FE',
        middle: '#F0F9FF',
        end: '#F8FAFC',
    },
    status: {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
    },
    accent: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
    },
};

export const darkColors: ThemeColors = {
    // Shorthand colors
    primary: '#818CF8',
    secondary: '#A78BFA',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    border: 'rgba(255, 255, 255, 0.1)',
    surface: 'rgba(255, 255, 255, 0.05)',

    background: {
        primary: '#0F0F1A',
        secondary: '#1A1A2E',
        tertiary: '#16213E',
    },
    text: {
        primary: '#F8FAFC',
        secondary: '#CBD5E1',
        tertiary: '#94A3B8',
        muted: '#64748B',
        inverse: '#0F172A',
    },
    glass: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        borderLight: 'rgba(255, 255, 255, 0.05)',
        fill: 'rgba(255, 255, 255, 0.03)',
        elevated: 'rgba(255, 255, 255, 0.08)',
        subtle: 'rgba(255, 255, 255, 0.02)',
    },
    gradient: {
        start: '#1A1A2E',
        middle: '#16213E',
        end: '#0F3460',
    },
    status: {
        success: '#34D399',
        error: '#F87171',
        warning: '#FBBF24',
        info: '#60A5FA',
    },
    accent: {
        primary: '#818CF8',
        secondary: '#A78BFA',
    },
};

// Spacing tokens
export const Spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

// Border radius tokens
export const BorderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
} as const;

// Typography
export const Typography = {
    heading: {
        h1: { fontSize: 32, fontWeight: '700' as const },
        h2: { fontSize: 24, fontWeight: '600' as const },
        h3: { fontSize: 20, fontWeight: '600' as const },
        h4: { fontSize: 18, fontWeight: '600' as const },
    },
    body: {
        large: { fontSize: 18, fontWeight: '400' as const },
        medium: { fontSize: 16, fontWeight: '400' as const },
        small: { fontSize: 14, fontWeight: '400' as const },
        tiny: { fontSize: 12, fontWeight: '400' as const },
    },
} as const;