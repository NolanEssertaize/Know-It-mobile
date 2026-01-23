/**
 * @file colors.ts
 * @description Design tokens - Monochrome "AI Driver" Palette
 *
 * UPDATED: Full Light/Dark theme support with system preference
 * - Light Mode: #FFFFFF Background, #000000 Text/Icons (Clean white theme)
 * - Dark Mode: #000000 Background, #FFFFFF Text/Icons (Deep black theme)
 * - System Mode: Follows device preference
 */

import { useColorScheme } from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// MONOCHROME COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════

export const MonochromeColors = {
  // ─────────────────────────────────────────────────────────────────────────
  // LIGHT MODE (White Theme - like ChatGPT light)
  // ─────────────────────────────────────────────────────────────────────────
  light: {
    background: {
      primary: '#FFFFFF',      // Pure white
      secondary: '#FAFAFA',    // Very light gray
      tertiary: '#F5F5F5',     // Light gray
      elevated: '#FFFFFF',     // Cards and elevated surfaces
      chat: '#F7F7F8',         // Chat background (like ChatGPT)
    },
    foreground: {
      primary: '#000000',      // Pure black text
      secondary: '#1A1A1A',    // Near black
      tertiary: '#404040',     // Dark gray
      muted: '#737373',        // Medium gray
      subtle: '#A3A3A3',       // Light gray text
      inverse: '#FFFFFF',      // White (for dark backgrounds)
    },
    border: {
      default: 'rgba(0, 0, 0, 0.12)',   // More visible border
      strong: 'rgba(0, 0, 0, 0.20)',    // More visible
      focus: 'rgba(0, 0, 0, 0.30)',     // Focus state
      divider: 'rgba(0, 0, 0, 0.08)',   // Thin dividers
    },
    surface: {
      glass: 'rgba(245, 245, 245, 0.95)',     // Light gray glass - VISIBLE!
      glassLight: 'rgba(250, 250, 250, 0.98)', // Lighter glass
      glassDark: 'rgba(0, 0, 0, 0.05)',        // Subtle dark overlay
      elevated: 'rgba(255, 255, 255, 0.98)',   // Elevated cards
      pressed: 'rgba(0, 0, 0, 0.08)',          // Pressed state
      disabled: 'rgba(0, 0, 0, 0.04)',         // Disabled state
      hover: 'rgba(0, 0, 0, 0.06)',            // Hover state
      input: '#FFFFFF',                         // Input background
      inputHover: '#FAFAFA',                    // Input hover
    },
    // Semantic colors (still monochrome but with subtle variations)
    semantic: {
      success: '#1A1A1A',       // Dark for emphasis
      warning: '#404040',       // Medium
      error: '#000000',         // Strong
      info: '#737373',          // Muted
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DARK MODE (Black Theme - like ChatGPT dark)
  // ─────────────────────────────────────────────────────────────────────────
  dark: {
    background: {
      primary: '#000000',      // Pure black (OLED friendly)
      secondary: '#0A0A0A',    // Near black
      tertiary: '#141414',     // Very dark gray
      elevated: '#1A1A1A',     // Slightly elevated surfaces
      chat: '#0D0D0D',         // Chat background
    },
    foreground: {
      primary: '#FFFFFF',      // Pure white text
      secondary: '#E5E5E5',    // Near white
      tertiary: '#A3A3A3',     // Medium gray
      muted: '#737373',        // Darker gray
      subtle: '#525252',       // Very dark gray text
      inverse: '#000000',      // Black (for light backgrounds)
    },
    border: {
      default: 'rgba(255, 255, 255, 0.08)',   // Subtle white
      strong: 'rgba(255, 255, 255, 0.15)',    // More visible
      focus: 'rgba(255, 255, 255, 0.25)',     // Focus state
      divider: 'rgba(255, 255, 255, 0.06)',   // Thin dividers
    },
    surface: {
      glass: 'rgba(255, 255, 255, 0.06)',      // Glass effect (dark)
      glassLight: 'rgba(255, 255, 255, 0.10)', // Lighter glass
      glassDark: 'rgba(0, 0, 0, 0.4)',         // Dark overlay
      elevated: 'rgba(255, 255, 255, 0.04)',   // Elevated cards
      pressed: 'rgba(255, 255, 255, 0.08)',    // Pressed state
      disabled: 'rgba(255, 255, 255, 0.02)',   // Disabled state
      hover: 'rgba(255, 255, 255, 0.06)',      // Hover state
      input: '#1A1A1A',                         // Input background
      inputHover: '#262626',                    // Input hover
    },
    // Semantic colors (monochrome)
    semantic: {
      success: '#E5E5E5',      // Light for emphasis
      warning: '#A3A3A3',      // Medium
      error: '#FFFFFF',        // Strong
      info: '#737373',         // Muted
    },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// GLASS COLORS FACTORY
// Creates theme-aware color object
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates theme-aware GlassColors
 * @param isDark - Whether dark mode is active
 * @returns Complete color palette for current theme
 */
export function createGlassColors(isDark: boolean) {
  const colors = isDark ? MonochromeColors.dark : MonochromeColors.light;

  return {
    // Gradient (now solid backgrounds)
    gradient: {
      start: colors.background.primary,
      middle: colors.background.secondary,
      end: colors.background.tertiary,
    },

    // Glass surfaces
    glass: {
      background: colors.surface.glass,
      backgroundLight: colors.surface.glassLight,
      backgroundDark: colors.surface.glassDark,
      border: colors.border.default,
      borderLight: colors.border.strong,
      borderFocus: colors.border.focus,
      borderDivider: colors.border.divider,
    },

    // Accent colors (monochrome - use foreground for emphasis)
    accent: {
      primary: colors.foreground.primary,
      secondary: colors.foreground.secondary,
      tertiary: colors.foreground.tertiary,
      glow: 'transparent', // No colored glows
    },

    // Semantic colors
    semantic: {
      success: colors.semantic.success,
      successGlow: 'transparent',
      warning: colors.semantic.warning,
      warningGlow: 'transparent',
      error: colors.semantic.error,
      errorGlow: 'transparent',
      info: colors.semantic.info,
    },

    // Text hierarchy
    text: {
      primary: colors.foreground.primary,
      secondary: colors.foreground.secondary,
      tertiary: colors.foreground.tertiary,
      muted: colors.foreground.muted,
      subtle: colors.foreground.subtle,
      inverse: colors.foreground.inverse,
      accent: colors.foreground.primary, // No colored accent text
    },

    // Surface states
    surface: {
      elevated: colors.surface.elevated,
      pressed: colors.surface.pressed,
      disabled: colors.surface.disabled,
      hover: colors.surface.hover,
      input: colors.surface.input,
      inputHover: colors.surface.inputHover,
    },

    // Background shortcuts
    background: {
      primary: colors.background.primary,
      secondary: colors.background.secondary,
      tertiary: colors.background.tertiary,
      elevated: colors.background.elevated,
      chat: colors.background.chat,
    },

    // Raw color access
    raw: colors,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT (for backward compatibility)
// Note: Use useTheme() hook for dynamic theme support
// ═══════════════════════════════════════════════════════════════════════════

// Default to dark mode for backward compatibility
export const GlassColors = createGlassColors(true);

// ═══════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export type GlassColorsType = ReturnType<typeof createGlassColors>;
export type MonochromeColorsType = typeof MonochromeColors;
export type ThemeColors = typeof MonochromeColors.light | typeof MonochromeColors.dark;
