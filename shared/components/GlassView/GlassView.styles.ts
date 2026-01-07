/**
 * @file GlassView.styles.ts
 * @description Styles pour le composant GlassView
 */

import { StyleSheet } from 'react-native';
import { GlassColors } from '@/theme';

export const styles = StyleSheet.create({
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
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputFocused: {
    borderColor: GlassColors.glass.borderLight,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const VARIANT_STYLES = {
  default: {
    backgroundColor: GlassColors.glass.background,
  },
  light: {
    backgroundColor: GlassColors.glass.backgroundLight,
  },
  dark: {
    backgroundColor: GlassColors.glass.backgroundDark,
  },
  accent: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
} as const;

export const INTENSITY_MAP = {
  subtle: 20,
  medium: 40,
  strong: 60,
} as const;
