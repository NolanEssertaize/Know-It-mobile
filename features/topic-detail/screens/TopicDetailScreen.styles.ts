/**
 * @file TopicDetailScreen.styles.ts
 * @description Styles pour l'écran de détail d'un topic
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius } from '@/theme';

export const styles = StyleSheet.create({
  listContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  topicBanner: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  topicTitle: {
    color: GlassColors.text.primary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  topicStats: {
    color: GlassColors.text.secondary,
    fontSize: 14,
  },
  startButton: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: GlassColors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  separator: {
    height: Spacing.md,
  },
  errorText: {
    color: GlassColors.text.secondary,
    fontSize: 16,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: GlassColors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: GlassColors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
