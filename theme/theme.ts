/**
 * KnowIt Design System - Glassmorphism Theme
 * Palette: Deep Blue/Grey with Electric Cyan accents
 */

import { Platform } from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// GLASSMORPHISM COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════

export const GlassColors = {
    gradient: {
        start: '#1a1f2e',      // Dark Slate Grey
        middle: '#151a28',     // Deep Navy
        end: '#0d1117',        // Deep Midnight Blue
    },

    glass: {
        background: 'rgba(255, 255, 255, 0.08)',      // 8% white - subtle glass
        backgroundLight: 'rgba(255, 255, 255, 0.12)', // 12% white - lighter glass
        backgroundDark: 'rgba(0, 0, 0, 0.3)',         // Dark overlay
        border: 'rgba(255, 255, 255, 0.15)',          // 15% white border
        borderLight: 'rgba(255, 255, 255, 0.25)',     // Lighter border for focus
    },

    accent: {
        primary: '#00D4FF',      // Electric Cyan - Main CTA
        secondary: '#0EA5E9',    // Sky Blue - Secondary actions
        tertiary: '#6366F1',     // Indigo - Tertiary
        glow: 'rgba(0, 212, 255, 0.3)', // Glow effect
    },

    semantic: {
        success: '#10B981',      // Emerald Green
        successGlow: 'rgba(16, 185, 129, 0.3)',
        warning: '#F59E0B',      // Amber
        warningGlow: 'rgba(245, 158, 11, 0.3)',
        error: '#EF4444',        // Red
        errorGlow: 'rgba(239, 68, 68, 0.3)',
        info: '#3B82F6',         // Blue
    },

    text: {
        primary: '#FFFFFF',        // Pure white for titles
        secondary: '#A1A1AA',      // Grey for body text
        tertiary: '#71717A',       // Darker grey for hints
        muted: '#52525B',          // Very muted text
        accent: '#00D4FF',         // Cyan for links/highlights
    },

    surface: {
        elevated: 'rgba(255, 255, 255, 0.05)',
        pressed: 'rgba(255, 255, 255, 0.15)',
        disabled: 'rgba(255, 255, 255, 0.03)',
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BorderRadius = {
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    full: 9999,
};

export const Shadows = {
    glass: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    glassLight: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    }),
};

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY COLORS (Compatibility)
// ═══════════════════════════════════════════════════════════════════════════

const tintColorLight = '#0a7ea4';
const tintColorDark = GlassColors.accent.primary;

export const Colors = {
    light: {
        text: '#11181C',
        background: '#fff',
        tint: tintColorLight,
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: tintColorLight,
    },
    dark: {
        text: GlassColors.text.primary,
        background: GlassColors.gradient.end,
        tint: tintColorDark,
        icon: GlassColors.text.secondary,
        tabIconDefault: GlassColors.text.tertiary,
        tabIconSelected: tintColorDark,
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// FONTS
// ═══════════════════════════════════════════════════════════════════════════

export const Fonts = Platform.select({
    ios: {
        sans: 'system-ui',
        serif: 'ui-serif',
        rounded: 'ui-rounded',
        mono: 'ui-monospace',
    },
    default: {
        sans: 'normal',
        serif: 'serif',
        rounded: 'normal',
        mono: 'monospace',
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});