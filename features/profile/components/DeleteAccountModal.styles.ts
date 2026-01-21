/**
 * @file DeleteAccountModal.styles.ts
 * @description Styles pour le modal de suppression de compte avec vérification en deux étapes
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
        maxWidth: 360,
    },

    card: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP INDICATOR
    // ═══════════════════════════════════════════════════════════════════════════

    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },

    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: GlassColors.glass.background,
        borderWidth: 1,
        borderColor: GlassColors.glass.border,
    },

    stepDotActive: {
        backgroundColor: GlassColors.semantic.error,
        borderColor: GlassColors.semantic.error,
    },

    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: GlassColors.glass.border,
        marginHorizontal: Spacing.xs,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ICON
    // ═══════════════════════════════════════════════════════════════════════════

    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },

    iconContainerDanger: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TEXT
    // ═══════════════════════════════════════════════════════════════════════════

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
        marginBottom: Spacing.lg,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // INPUT
    // ═══════════════════════════════════════════════════════════════════════════

    inputSection: {
        width: '100%',
        marginBottom: Spacing.lg,
    },

    inputLabel: {
        fontSize: FontSize.sm,
        color: GlassColors.text.secondary,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },

    confirmationWord: {
        fontWeight: FontWeight.bold,
        color: GlassColors.semantic.error,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
    },

    input: {
        flex: 1,
        fontSize: FontSize.md,
        color: GlassColors.text.primary,
        paddingVertical: Spacing.md,
        textAlign: 'center',
    },

    eyeButton: {
        padding: Spacing.xs,
    },

    errorText: {
        fontSize: FontSize.sm,
        color: GlassColors.semantic.error,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // BUTTONS
    // ═══════════════════════════════════════════════════════════════════════════

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

    deleteButton: {
        flex: 1,
        backgroundColor: GlassColors.semantic.error,
    },

    buttonDisabled: {
        opacity: 0.5,
    },
});