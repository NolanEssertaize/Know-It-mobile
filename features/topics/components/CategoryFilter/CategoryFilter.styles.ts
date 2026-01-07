/**
 * @file CategoryFilter.styles.ts
 * @description Styles pour le composant CategoryFilter
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  contentContainer: {
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    color: GlassColors.text.secondary,
  },
  labelActive: {
    fontSize: 14,
    color: GlassColors.text.primary,
    fontWeight: '600',
  },
});
