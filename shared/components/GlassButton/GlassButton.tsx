/**
 * @file GlassButton.tsx
 * @description Bouton avec effet Glassmorphism et variantes
 */

import React, { memo, type ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassColors, Shadows, BorderRadius } from '@/theme';
import { styles, SIZE_STYLES, type ButtonSize } from './GlassButton.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'outline' | 'ghost';

export interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const GlassButton = memo(function GlassButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
}: GlassButtonProps) {
  const isDisabled = disabled || loading;

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? GlassColors.accent.primary
              : GlassColors.text.primary
          }
        />
      ) : (
        <>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              SIZE_STYLES[size].text,
              variant === 'outline' && styles.textOutline,
              variant === 'ghost' && styles.textGhost,
              variant === 'glass' && styles.textGlass,
              isDisabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </>
      )}
    </View>
  );

  // Primary Button
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={
            isDisabled
              ? ['#374151', '#1F2937']
              : [GlassColors.accent.primary, GlassColors.accent.secondary]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.container,
            SIZE_STYLES[size].container,
            !isDisabled && Shadows.glow(GlassColors.accent.primary),
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Secondary Button
  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={
            isDisabled
              ? ['#374151', '#1F2937']
              : [GlassColors.accent.tertiary, '#4F46E5']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.container,
            SIZE_STYLES[size].container,
            !isDisabled && Shadows.glow(GlassColors.accent.tertiary),
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Glass Button
  if (variant === 'glass') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[
          styles.container,
          styles.glassButton,
          SIZE_STYLES[size].container,
          isDisabled && styles.disabledGlass,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Outline Button
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[
          styles.container,
          styles.outlineButton,
          SIZE_STYLES[size].container,
          isDisabled && styles.disabledOutline,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Ghost Button
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.6}
      style={[
        styles.container,
        styles.ghostButton,
        SIZE_STYLES[size].container,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTES SPÉCIALISÉES
// ═══════════════════════════════════════════════════════════════════════════

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
}

export const RecordButton = memo(function RecordButton({
  isRecording,
  onPress,
  size = 120,
  style,
}: RecordButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={style}
    >
      <LinearGradient
        colors={
          isRecording
            ? [GlassColors.semantic.error, '#DC2626']
            : [GlassColors.accent.primary, GlassColors.accent.secondary]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.recordButton,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          Shadows.glow(
            isRecording
              ? GlassColors.semantic.error
              : GlassColors.accent.primary
          ),
        ]}
      >
        <Text style={styles.recordButtonText}>
          {isRecording ? 'STOP' : 'PARLER'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
});
