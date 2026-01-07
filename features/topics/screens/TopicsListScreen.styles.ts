/**
 * @file TopicsListScreen.styles.ts
 * @description Styles pour l'écran de liste des topics
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, Shadows } from '@/theme';

export const styles = StyleSheet.create({
  // Container
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },

  // Header
  header: {
    marginBottom: Spacing.lg,
  },
  greetingSection: {
    marginBottom: Spacing.lg,
  },
  greetingLeft: {},
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: GlassColors.text.primary,
    marginRight: Spacing.sm,
  },
  wave: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 16,
    color: GlassColors.text.secondary,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: GlassColors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: GlassColors.text.secondary,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    color: GlassColors.text.primary,
  },

  // Categories
  categoriesContainer: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  categoryLabel: {
    fontSize: 14,
    color: GlassColors.text.secondary,
  },
  categoryLabelActive: {
    fontSize: 14,
    color: GlassColors.text.primary,
    fontWeight: '600',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: GlassColors.text.primary,
  },
  sectionCount: {
    fontSize: 14,
    color: GlassColors.text.secondary,
  },
  swipeHint: {
    fontSize: 12,
    color: GlassColors.text.tertiary,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
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

  // FAB
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glass,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: GlassColors.gradient.middle,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: GlassColors.text.primary,
  },
  modalInputContainer: {
    marginBottom: Spacing.lg,
  },
  modalInput: {
    fontSize: 16,
    color: GlassColors.text.primary,
    padding: Spacing.md,
  },
});
