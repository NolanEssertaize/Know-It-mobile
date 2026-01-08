/**
 * @file ResultScreen.styles.ts
 * @description Styles pour l'écran de résultats
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius } from '@/theme';

export const styles = StyleSheet.create({
    // ═══════════════════════════════════════════════════════════════════════
    // LAYOUT PRINCIPAL
    // ═══════════════════════════════════════════════════════════════════════

    gradient: {
        flex: 1,
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════════════════════════════════════

    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },

    closeButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: GlassColors.glass.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    headerTextContainer: {
        flex: 1,
        paddingTop: Spacing.xs,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: GlassColors.text.primary,
        marginBottom: Spacing.xs,
    },

    subtitle: {
        fontSize: 16,
        color: GlassColors.text.secondary,
        lineHeight: 22,
    },

    divider: {
        height: 1,
        backgroundColor: GlassColors.glass.border,
        marginBottom: Spacing.xl,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // QUICK SUMMARY
    // ═══════════════════════════════════════════════════════════════════════

    summaryContainer: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.xl,
    },

    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: GlassColors.text.primary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
    },

    statBadge: {
        alignItems: 'center',
        flex: 1,
    },

    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },

    statCount: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },

    statLabel: {
        fontSize: 12,
        color: GlassColors.text.secondary,
        textAlign: 'center',
    },

    summaryDivider: {
        height: 1,
        backgroundColor: GlassColors.glass.border,
        marginVertical: Spacing.lg,
    },

    summaryText: {
        fontSize: 14,
        color: GlassColors.text.secondary,
        textAlign: 'center',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SECTIONS D'ANALYSE
    // ═══════════════════════════════════════════════════════════════════════

    sectionsContainer: {
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },

    sectionHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: GlassColors.text.primary,
        marginBottom: Spacing.md,
        paddingLeft: Spacing.xs,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════════════

    actionsContainer: {
        marginTop: Spacing.md,
    },

    actionSpacer: {
        height: Spacing.md,
    },
});