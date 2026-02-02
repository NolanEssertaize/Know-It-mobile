/**
 * @file GlassView/index.tsx
 * @description Glassmorphism container component
 */

import React, { type ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme, BorderRadius, Spacing } from '@/theme';

interface GlassViewProps {
  children: ReactNode;
  /** Glass variant */
  variant?: 'default' | 'elevated' | 'subtle';
  /** Custom style */
  style?: ViewStyle;
  /** Padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Border radius preset */
  radius?: 'sm' | 'md' | 'lg' | 'xl';
}

export function GlassView({
  children,
  variant = 'default',
  style,
  padding = 'md',
  radius = 'lg',
}: GlassViewProps): JSX.Element {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'elevated':
        return colors.glass.elevated;
      case 'subtle':
        return colors.glass.subtle;
      default:
        return colors.glass.background;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'elevated':
        return colors.glass.border;
      case 'subtle':
        return colors.glass.borderLight;
      default:
        return colors.glass.border;
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return Spacing.sm;
      case 'lg':
        return Spacing.lg;
      default:
        return Spacing.md;
    }
  };

  const getBorderRadius = () => {
    switch (radius) {
      case 'sm':
        return BorderRadius.sm;
      case 'md':
        return BorderRadius.md;
      case 'xl':
        return BorderRadius.xl;
      default:
        return BorderRadius.lg;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderRadius: getBorderRadius(),
          padding: getPadding(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
