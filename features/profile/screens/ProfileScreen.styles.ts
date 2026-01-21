/**
 * @file ProfileScreen.styles.ts
 * @description Styles pour l'écran de profil avec style iOS Glassmorphism
 *
 * Changements:
 * - Suppression des styles profileHeader (avatar, userName, userEmail)
 * - Nouveau style iOS glassmorphism pour les tabs
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '@/theme';

export const styles = StyleSheet.create({
    // ═══════════════════════════════════════════════════════════════════════════
    // LOADING STATE
    // ═══════════════════════════════════════════════════════════════════════════

    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
    },

    loadingText: {
        fontSize: FontSize.md,
        color: GlassColors.text.secondary,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════════════════════════════════════════

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: GlassColors.glass.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    headerTitle: {
        flex: 1,
        fontSize: FontSize['2xl'],
        fontWeight: FontWeight.bold,
        color: GlassColors.text.primary,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // IOS GLASSMORPHISM TABS
    // ═══════════════════════════════════════════════════════════════════════════

    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xs,
        backgroundColor: GlassColors.glass.background,
        borderWidth: 1,
        borderColor: GlassColors.glass.border,
        ...Shadows.glassLight,
    },

    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
    },

    tabActive: {
        backgroundColor: GlassColors.glass.backgroundLight,
        borderWidth: 1,
        borderColor: GlassColors.glass.borderLight,
        ...Shadows.glassLight,
    },

    tabText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: GlassColors.text.tertiary,
    },

    tabTextActive: {
        color: GlassColors.text.primary,
        fontWeight: FontWeight.semibold,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CONTENT
    // ═══════════════════════════════════════════════════════════════════════════

    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
    },

    scrollContent: {
        paddingBottom: Spacing.xxl + 100, // Extra space for logout button
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION
    // ═══════════════════════════════════════════════════════════════════════════

    section: {
        marginBottom: Spacing.xl,
    },

    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: GlassColors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.md,
        marginLeft: Spacing.xs,
    },

    sectionCard: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LIST ITEM
    // ═══════════════════════════════════════════════════════════════════════════

    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: GlassColors.glass.border,
    },

    listItemLast: {
        borderBottomWidth: 0,
    },

    listItemIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: GlassColors.glass.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    listItemContent: {
        flex: 1,
    },

    listItemLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: GlassColors.text.primary,
        marginBottom: 2,
    },

    listItemValue: {
        fontSize: FontSize.sm,
        color: GlassColors.text.secondary,
    },

    listItemChevron: {
        marginLeft: Spacing.sm,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // INPUT ITEM
    // ═══════════════════════════════════════════════════════════════════════════

    inputItem: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: GlassColors.glass.border,
    },

    inputLabel: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: GlassColors.text.secondary,
        marginBottom: Spacing.xs,
    },

    input: {
        fontSize: FontSize.md,
        color: GlassColors.text.primary,
        paddingVertical: Spacing.xs,
    },

    inputReadOnly: {
        fontSize: FontSize.md,
        color: GlassColors.text.tertiary,
        paddingVertical: Spacing.xs,
    },

    saveButton: {
        marginTop: Spacing.md,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SWITCH ITEM
    // ═══════════════════════════════════════════════════════════════════════════

    switchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: GlassColors.glass.border,
    },

    switchLabel: {
        flex: 1,
        marginRight: Spacing.md,
    },

    switchTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: GlassColors.text.primary,
        marginBottom: 2,
    },

    switchDescription: {
        fontSize: FontSize.sm,
        color: GlassColors.text.secondary,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LANGUAGE SELECTOR
    // ═══════════════════════════════════════════════════════════════════════════

    languageSelector: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },

    languageOption: {
        flex: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: GlassColors.glass.background,
        borderWidth: 1,
        borderColor: GlassColors.glass.border,
        alignItems: 'center',
    },

    languageOptionActive: {
        backgroundColor: GlassColors.accent.primary,
        borderColor: GlassColors.accent.primary,
    },

    languageText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: GlassColors.text.secondary,
    },

    languageTextActive: {
        color: GlassColors.text.primary,
        fontWeight: FontWeight.semibold,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // DANGER ITEM
    // ═══════════════════════════════════════════════════════════════════════════

    dangerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: GlassColors.glass.border,
    },

    dangerIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    dangerText: {
        flex: 1,
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: GlassColors.semantic.error,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // COPYRIGHT
    // ═══════════════════════════════════════════════════════════════════════════

    copyright: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        marginTop: Spacing.lg,
    },

    copyrightText: {
        fontSize: FontSize.sm,
        color: GlassColors.text.tertiary,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LOGOUT BUTTON
    // ═══════════════════════════════════════════════════════════════════════════

    logoutButton: {
        marginTop: Spacing.lg,
        marginBottom: Spacing.xl,
    },
});