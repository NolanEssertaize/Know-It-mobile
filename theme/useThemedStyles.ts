/**
 * @file useThemedStyles.ts
 * @description Hook for creating theme-aware StyleSheets
 *
 * Provides a way to create styles that automatically update
 * when the theme changes, without manual re-renders.
 */

import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useTheme } from './ThemeContext';
import type { GlassColorsType } from './colors';
import { Spacing, BorderRadius, FontSize, FontWeight, createShadows } from './theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

interface ThemeTokens {
  colors: GlassColorsType;
  isDark: boolean;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  fontSize: typeof FontSize;
  fontWeight: typeof FontWeight;
  shadows: ReturnType<typeof createShadows>;
}

type StyleFactory<T extends NamedStyles<T>> = (theme: ThemeTokens) => T;

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create theme-aware styles that update automatically
 *
 * @example
 * const styles = useThemedStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.colors.background.primary,
 *     padding: theme.spacing.md,
 *   },
 *   text: {
 *     color: theme.colors.text.primary,
 *     fontSize: theme.fontSize.md,
 *   },
 * }));
 */
export function useThemedStyles<T extends NamedStyles<T>>(
  factory: StyleFactory<T>
): T {
  const { colors, isDark } = useTheme();

  const styles = useMemo(() => {
    const theme: ThemeTokens = {
      colors,
      isDark,
      spacing: Spacing,
      borderRadius: BorderRadius,
      fontSize: FontSize,
      fontWeight: FontWeight,
      shadows: createShadows(isDark),
    };

    return StyleSheet.create(factory(theme));
  }, [colors, isDark, factory]);

  return styles;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATIC HELPER (for components that don't need reactivity)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create themed styles without the hook
 * Useful for creating style factories outside of components
 *
 * @example
 * const createStyles = createThemedStyleFactory((theme) => ({
 *   button: {
 *     backgroundColor: theme.colors.text.primary,
 *   },
 * }));
 *
 * // In component:
 * const { colors, isDark } = useTheme();
 * const styles = createStyles(colors, isDark);
 */
export function createThemedStyleFactory<T extends NamedStyles<T>>(
  factory: StyleFactory<T>
) {
  return (colors: GlassColorsType, isDark: boolean): T => {
    const theme: ThemeTokens = {
      colors,
      isDark,
      spacing: Spacing,
      borderRadius: BorderRadius,
      fontSize: FontSize,
      fontWeight: FontWeight,
      shadows: createShadows(isDark),
    };

    return StyleSheet.create(factory(theme));
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMON THEMED STYLES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pre-built common themed styles
 */
export function useCommonThemedStyles() {
  return useThemedStyles((theme) => ({
    // Containers
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },

    safeArea: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },

    // Cards
    card: {
      backgroundColor: theme.colors.surface.elevated,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.glass.border,
      padding: theme.spacing.md,
      ...theme.shadows.subtle,
    },

    glassCard: {
      backgroundColor: theme.colors.glass.background,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.glass.border,
      padding: theme.spacing.md,
      ...theme.shadows.glassLight,
    },

    // Typography
    title: {
      fontSize: theme.fontSize['2xl'],
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text.primary,
    },

    subtitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text.secondary,
    },

    body: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.normal,
      color: theme.colors.text.primary,
      lineHeight: 22,
    },

    caption: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.normal,
      color: theme.colors.text.muted,
    },

    // Buttons
    primaryButton: {
      backgroundColor: theme.colors.text.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },

    primaryButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text.inverse,
    },

    secondaryButton: {
      backgroundColor: theme.colors.glass.background,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.glass.border,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },

    secondaryButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.text.primary,
    },

    // Inputs
    input: {
      backgroundColor: theme.colors.surface.input,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.glass.border,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.fontSize.md,
      color: theme.colors.text.primary,
    },

    inputFocused: {
      borderColor: theme.colors.glass.borderFocus,
    },

    inputLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },

    // Dividers
    divider: {
      height: 1,
      backgroundColor: theme.colors.glass.borderDivider,
      marginVertical: theme.spacing.md,
    },

    // Lists
    listItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.glass.borderDivider,
    },

    listItemLast: {
      borderBottomWidth: 0,
    },

    // Sections
    section: {
      marginBottom: theme.spacing.lg,
    },

    sectionTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text.muted,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
  }));
}

export default useThemedStyles;
