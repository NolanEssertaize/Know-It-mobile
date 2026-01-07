/**
 * @file SessionHistoryCard.styles.ts
 * @description Styles pour le composant SessionHistoryCard
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateBadge: {
    backgroundColor: GlassColors.glass.backgroundLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  dateText: {
    color: GlassColors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  transcription: {
    color: GlassColors.text.primary,
    fontSize: 14,
    lineHeight: 20,
  },
});
