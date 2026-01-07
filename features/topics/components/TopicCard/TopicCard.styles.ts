/**
 * @file TopicCard.styles.ts
 * @description Styles pour le composant TopicCard
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, Shadows } from '@/theme';

export const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: GlassColors.glass.background,
    borderWidth: 1,
    borderColor: GlassColors.glass.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: GlassColors.text.primary,
    marginBottom: Spacing.xs,
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: GlassColors.text.secondary,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GlassColors.text.tertiary,
    marginHorizontal: Spacing.sm,
  },
  chevronContainer: {
    padding: Spacing.xs,
  },

  // Swipe actions
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.sm,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  editButton: {
    backgroundColor: GlassColors.semantic.info,
  },
  shareButton: {
    backgroundColor: GlassColors.semantic.success,
  },
  deleteButton: {
    backgroundColor: GlassColors.semantic.error,
  },
});
