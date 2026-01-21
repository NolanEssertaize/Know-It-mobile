/**
 * @file LogoutConfirmationModal.styles.ts
 * @description Styles pour le modal de confirmation de déconnexion
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
        width: '100%',
        maxWidth: 340,
    },

    card: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
    },

    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.full,
        backgroundColor: GlassColors.glass.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },

    title: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: GlassColors.text.primary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },

    description: {
        fontSize: FontSize.md,
        color: GlassColors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },

    buttonsContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
        width: '100%',
    },

    cancelButton: {
        flex: 1,
    },

    confirmButton: {
        flex: 1,
    },
});