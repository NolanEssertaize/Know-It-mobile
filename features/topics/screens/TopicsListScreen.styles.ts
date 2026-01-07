/**
 * @file TopicsListScreen.styles.ts
 * @description Styles pour l'écran de liste des topics
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, Shadows } from '@/theme';

export const styles = StyleSheet.create({
    // Fixed Header (en dehors de la FlatList)
    fixedHeader: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },

    // Greeting
    greetingSection: {
        marginBottom: Spacing.lg,
    },
    greetingLeft: {},
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
        gap: Spacing.sm,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '700',
        color: GlassColors.text.primary,
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
        fontSize: 20,
        fontWeight: '700',
        color: GlassColors.text.primary,
    },
    statLabel: {
        fontSize: 11,
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
        paddingVertical: Spacing.xs,
    },

    // List Content
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
        flexGrow: 1,
    },

    // List Header (dans la FlatList)
    listHeader: {
        marginBottom: Spacing.md,
    },

    // Section header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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

    // Swipe hint
    swipeHintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    swipeHint: {
        fontSize: 12,
        color: GlassColors.text.tertiary,
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
        marginBottom: Spacing.lg,
        opacity: 0.8,
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
        marginBottom: Spacing.lg,
    },
    resetButton: {
        marginTop: Spacing.md,
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