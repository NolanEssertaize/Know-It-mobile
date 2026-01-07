/**
 * @file GlassButton.styles.ts
 * @description Styles pour le composant GlassButton
 */

import { StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { GlassColors, BorderRadius, Shadows } from '@/theme';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export const SIZE_STYLES: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingHorizontal: 12, paddingVertical: 8 },
    text: { fontSize: 14 },
  },
  md: {
    container: { paddingHorizontal: 20, paddingVertical: 14 },
    text: { fontSize: 16 },
  },
  lg: {
    container: { paddingHorizontal: 28, paddingVertical: 18 },
    text: { fontSize: 18 },
  },
  xl: {
    container: { paddingHorizontal: 36, paddingVertical: 22 },
    text: { fontSize: 20 },
  },
};

export const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: GlassColors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  textOutline: {
    color: GlassColors.accent.primary,
  },
  textGhost: {
    color: GlassColors.accent.primary,
  },
  textGlass: {
    color: GlassColors.text.primary,
  },
  textDisabled: {
    color: GlassColors.text.tertiary,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  fullWidth: {
    width: '100%',
  },
  glassButton: {
    backgroundColor: GlassColors.glass.backgroundLight,
    borderWidth: 1,
    borderColor: GlassColors.glass.border,
    ...Shadows.glassLight,
  },
  disabledGlass: {
    backgroundColor: GlassColors.surface.disabled,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: GlassColors.accent.primary,
  },
  disabledOutline: {
    borderColor: GlassColors.text.tertiary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  recordButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonText: {
    color: GlassColors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
