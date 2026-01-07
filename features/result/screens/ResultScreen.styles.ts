/**
 * @file ResultScreen.styles.ts
 * @description Styles pour l'écran de résultats
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, Shadows } from '@/theme';

export const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: GlassColors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: GlassColors.text.secondary,
  },
  sectionsContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
});
