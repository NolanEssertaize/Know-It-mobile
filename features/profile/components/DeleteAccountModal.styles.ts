/**
 * @file DeleteAccountModal.styles.ts
 * @description Styles pour le modal de suppression de compte
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, FontSize, FontWeight } from '@/theme';

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },

    content: {
        backgroundColor: GlassColors.gradient.middle,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },

    iconContainer: {
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },

    title: {
        fontSize: FontSize['2xl'],
        fontWeight: FontWeight.bold,
        color: GlassColors.text.primary,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },

    description: {
        fontSize: FontSize.md,
        color: GlassColors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },

    dataList: {
        backgroundColor: GlassColors.glass.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.xl,
        gap: Spacing.sm,
    },

    dataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },

    dataItemText: {
        fontSize: FontSize.sm,
        color: GlassColors.text.secondary,
    },

    confirmSection: {
        marginBottom: Spacing.lg,
    },

    confirmLabel: {
        fontSize: FontSize.sm,
        color: GlassColors.text.secondary,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },

    confirmHighlight: {
        color: GlassColors.semantic.error,
        fontWeight: FontWeight.bold,
    },

    inputContainer: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },

    input: {
        fontSize: FontSize.md,
        color: GlassColors.text.primary,
        textAlign: 'center',
        letterSpacing: 2,
    },

    buttonContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
    },

    cancelButton: {
        flex: 1,
    },

    deleteButton: {
        flex: 1,
        backgroundColor: GlassColors.semantic.error,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },

    deleteButtonDisabled: {
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
    },

    deleteButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: GlassColors.text.primary,
    },
});