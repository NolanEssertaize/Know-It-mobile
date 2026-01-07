/**
 * @file AnalysisSection.styles.ts
 * @description Styles pour le composant AnalysisSection
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  icon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },

  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    minWidth: 28,
    alignItems: 'center',
  },

  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  itemsList: {
    gap: Spacing.sm,
  },

  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: Spacing.xs,
  },

  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: Spacing.sm,
  },

  itemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: GlassColors.text.primary,
  },
});
