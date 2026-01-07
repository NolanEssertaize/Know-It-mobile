/**
 * @file GlassView.tsx
 * @description Composant conteneur avec effet Glassmorphism
 */

import React, { memo, type ReactNode } from 'react';
import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassColors, BorderRadius, Shadows } from '@/theme';
import { styles, VARIANT_STYLES, INTENSITY_MAP } from './GlassView.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type GlassVariant = 'default' | 'light' | 'dark' | 'accent';
export type GlassIntensity = 'subtle' | 'medium' | 'strong';

export interface GlassViewProps extends ViewProps {
  children?: ReactNode;
  variant?: GlassVariant;
  intensity?: GlassIntensity;
  useBlur?: boolean;
  borderRadius?: keyof typeof BorderRadius | number;
  showBorder?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  glow?: boolean;
  glowColor?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const GlassView = memo(function GlassView({
  children,
  variant = 'default',
  intensity = 'medium',
  useBlur = false,
  borderRadius = 'lg',
  showBorder = true,
  containerStyle,
  glow = false,
  glowColor = GlassColors.accent.glow,
  style,
  ...props
}: GlassViewProps) {
  const resolvedBorderRadius =
    typeof borderRadius === 'number' ? borderRadius : BorderRadius[borderRadius];

  const glowStyle: ViewStyle | undefined = glow
    ? {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
      }
    : undefined;

  const borderStyle: ViewStyle | undefined = showBorder
    ? {
        borderWidth: 1,
        borderColor:
          variant === 'accent'
            ? 'rgba(0, 212, 255, 0.3)'
            : GlassColors.glass.border,
      }
    : undefined;

  if (useBlur) {
    return (
      <View
        style={[
          styles.outerContainer,
          { borderRadius: resolvedBorderRadius },
          glowStyle,
          containerStyle,
        ]}
      >
        <BlurView
          intensity={INTENSITY_MAP[intensity]}
          tint="dark"
          style={[
            styles.blurContainer,
            { borderRadius: resolvedBorderRadius },
            borderStyle,
            style,
          ]}
          {...props}
        >
          <View style={[styles.innerOverlay, VARIANT_STYLES[variant]]}>
            {children}
          </View>
        </BlurView>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        VARIANT_STYLES[variant],
        { borderRadius: resolvedBorderRadius },
        borderStyle,
        Shadows.glassLight,
        glowStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTES SPÉCIALISÉES
// ═══════════════════════════════════════════════════════════════════════════

export const GlassCard = memo(function GlassCard({
  children,
  style,
  ...props
}: Omit<GlassViewProps, 'borderRadius'>) {
  return (
    <GlassView borderRadius="lg" showBorder style={[styles.card, style]} {...props}>
      {children}
    </GlassView>
  );
});

export const GlassInputContainer = memo(function GlassInputContainer({
  children,
  focused = false,
  style,
  ...props
}: GlassViewProps & { focused?: boolean }) {
  return (
    <GlassView
      variant={focused ? 'light' : 'default'}
      borderRadius="md"
      showBorder
      style={[styles.inputContainer, focused && styles.inputFocused, style]}
      {...props}
    >
      {children}
    </GlassView>
  );
});
