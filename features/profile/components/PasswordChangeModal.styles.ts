/**
 * @file PasswordChangeModal.styles.ts
 * @description Styles pour le modal de changement de mot de passe
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, FontSize, FontWeight } from '@/theme';

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },

    content: {
        backgroundColor: GlassColors.gradient.middle,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: GlassColors.glass.border,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },

    title: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: GlassColors.text.primary,
    },

    closeButton: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        backgroundColor: GlassColors.glass.background,
        alignItems: 'center',
        justifyContent: 'center',
    },

    inputGroup: {
        marginBottom: Spacing.lg,
    },

    label: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: GlassColors.text.secondary,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },

    input: {
        flex: 1,
        fontSize: FontSize.md,
        color: GlassColors.text.primary,
        paddingVertical: Spacing.xs,
    },

    errorText: {
        fontSize: FontSize.sm,
        color: GlassColors.semantic.error,
        marginTop: Spacing.xs,
        marginLeft: Spacing.xs,
    },
});