/**
 * @file GlassView.tsx
 * @description Composant conteneur avec effet Glassmorphism - Theme Aware
 * 
 * UPDATED: Now uses useTheme() for dynamic colors
 */

import React, { memo, type ReactNode } from 'react';
import { View, Pressable, type ViewProps, type StyleProp, type ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, BorderRadius, Shadows } from '@/theme';

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
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const INTENSITY_MAP = {
  subtle: 20,
  medium: 40,
  strong: 60,
};

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
  glowColor,
  style,
  ...props
}: GlassViewProps) {
  // Get theme colors dynamically
  const { colors, isDark } = useTheme();

  const resolvedBorderRadius =
    typeof borderRadius === 'number' ? borderRadius : BorderRadius[borderRadius];

  // Get variant-specific background
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'light':
        return { backgroundColor: colors.glass.backgroundLight };
      case 'dark':
        return { backgroundColor: colors.glass.backgroundDark };
      case 'accent':
        return { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' };
      default:
        return { backgroundColor: colors.glass.background };
    }
  };

  const glowStyle: ViewStyle | undefined = glow
    ? {
        shadowColor: glowColor || colors.text.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
      }
    : undefined;

  const borderStyle: ViewStyle | undefined = showBorder
    ? {
        borderWidth: 1,
        borderColor: variant === 'accent'
          ? (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)')
          : colors.glass.border,
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
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.blurContainer,
            { borderRadius: resolvedBorderRadius },
            borderStyle,
            style,
          ]}
          {...props}
        >
          <View style={[styles.innerOverlay, getVariantStyle()]}>
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
        getVariantStyle(),
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

export interface GlassCardProps extends Omit<GlassViewProps, 'borderRadius'> {
  onPress?: () => void;
}

export const GlassCard = memo(function GlassCard({
  children,
  style,
  onPress,
  ...props
}: GlassCardProps) {
  const content = (
    <GlassView borderRadius="lg" showBorder style={[styles.card, style]} {...props}>
      {children}
    </GlassView>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.cardPressed}>
        {content}
      </Pressable>
    );
  }

  return content;
});

export const GlassInputContainer = memo(function GlassInputContainer({
  children,
  focused = false,
  style,
  ...props
}: GlassViewProps & { focused?: boolean }) {
  const { colors } = useTheme();
  
  return (
    <GlassView
      variant={focused ? 'light' : 'default'}
      borderRadius="md"
      showBorder
      style={[
        styles.inputContainer, 
        focused && { borderColor: colors.glass.borderLight },
        style
      ]}
      {...props}
    >
      {children}
    </GlassView>
  );
});

export const GlassButton = memo(function GlassButton({
  children,
  variant = 'default',
  style,
  ...props
}: GlassViewProps) {
  return (
    <GlassView
      variant={variant}
      borderRadius="md"
      showBorder
      style={[styles.button, style]}
      {...props}
    >
      {children}
    </GlassView>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  outerContainer: {
    overflow: 'hidden',
  },
  blurContainer: {
    overflow: 'hidden',
  },
  innerOverlay: {
    flex: 1,
  },
  container: {
    overflow: 'hidden',
  },
  card: {
    padding: 16,
  },
  cardPressed: {
    opacity: 0.8,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GlassView;
